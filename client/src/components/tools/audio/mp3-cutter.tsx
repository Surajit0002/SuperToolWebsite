import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Play, Pause, Scissors, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MP3Cutter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeDuration, setFadeDuration] = useState([1]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Error",
        description: "Please select an audio file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "Error",
        description: "File size must be less than 100MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create audio URL
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    // Reset values
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setResultUrl(null);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setEndTime(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.currentTime = startTime;
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);
  };

  const setStartAtCurrent = () => {
    setStartTime(currentTime);
    if (currentTime >= endTime) {
      setEndTime(Math.min(currentTime + 10, duration));
    }
  };

  const setEndAtCurrent = () => {
    setEndTime(currentTime);
    if (currentTime <= startTime) {
      setStartTime(Math.max(currentTime - 10, 0));
    }
  };

  const cutAudio = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an audio file",
        variant: "destructive",
      });
      return;
    }

    if (startTime >= endTime) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    if (endTime - startTime < 0.1) {
      toast({
        title: "Error",
        description: "Clip must be at least 0.1 seconds long",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);
      formData.append('startTime', startTime.toString());
      formData.append('endTime', endTime.toString());
      formData.append('fadeIn', fadeIn.toString());
      formData.append('fadeOut', fadeOut.toString());
      formData.append('fadeDuration', fadeDuration[0].toString());

      setProgress(30);

      const response = await fetch('/api/audio/cut', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to cut audio');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setResultUrl(url);
      setResultSize(formatFileSize(blob.size));
      setProgress(100);

      toast({
        title: "Success!",
        description: "Audio cut successfully",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cut audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = `cut-${selectedFile?.name?.split('.')[0] || 'audio'}.mp3`;
      a.click();

      toast({
        title: "Downloaded!",
        description: "Cut audio downloaded successfully",
      });
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setAudioUrl(null);
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setResultUrl(null);
    setResultSize(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label className="block text-sm font-medium mb-2">Upload Audio File</Label>
            <div 
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-audio transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-testid="audio-upload-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="audio-file-input"
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto text-audio">🎵</div>
                  <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Size: {formatFileSize(selectedFile.size)}
                    {duration > 0 && ` • Duration: ${formatTime(duration)}`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop audio
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports: MP3, WAV, OGG, M4A (max 100MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Audio Player & Controls */}
          {audioUrl && (
            <>
              <div>
                <Label className="block text-sm font-medium mb-2">Audio Player</Label>
                <Card className="p-4 bg-audio-background border border-audio/20 rounded-xl">
                  <audio ref={audioRef} src={audioUrl} className="hidden" />
                  
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePlayPause}
                      data-testid="play-pause-button"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <div className="text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  {/* Waveform Visualization (simplified) */}
                  <div className="relative h-16 bg-muted/30 rounded-lg mb-4 overflow-hidden">
                    {/* Progress indicator */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-audio/30 transition-all duration-100"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    
                    {/* Start time marker */}
                    <div 
                      className="absolute top-0 w-1 h-full bg-green-500 cursor-pointer"
                      style={{ left: `${(startTime / duration) * 100}%` }}
                      onClick={() => seekTo(startTime)}
                    />
                    
                    {/* End time marker */}
                    <div 
                      className="absolute top-0 w-1 h-full bg-red-500 cursor-pointer"
                      style={{ left: `${(endTime / duration) * 100}%` }}
                      onClick={() => seekTo(endTime)}
                    />
                    
                    {/* Selection area */}
                    <div 
                      className="absolute top-0 h-full bg-audio/20 border-l-2 border-r-2 border-audio"
                      style={{ 
                        left: `${(startTime / duration) * 100}%`,
                        width: `${((endTime - startTime) / duration) * 100}%`
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={setStartAtCurrent}
                      data-testid="set-start-button"
                    >
                      Set Start
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={setEndAtCurrent}
                      data-testid="set-end-button"
                    >
                      Set End
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Time Selection */}
              <div>
                <Label className="block text-sm font-medium mb-2">Cut Selection</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime" className="text-sm">Start Time (seconds)</Label>
                    <Input
                      id="startTime"
                      type="number"
                      step="0.1"
                      min="0"
                      max={duration}
                      value={startTime.toFixed(1)}
                      onChange={(e) => setStartTime(Math.max(0, Math.min(parseFloat(e.target.value) || 0, duration)))}
                      data-testid="start-time-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime" className="text-sm">End Time (seconds)</Label>
                    <Input
                      id="endTime"
                      type="number"
                      step="0.1"
                      min="0"
                      max={duration}
                      value={endTime.toFixed(1)}
                      onChange={(e) => setEndTime(Math.max(0, Math.min(parseFloat(e.target.value) || 0, duration)))}
                      data-testid="end-time-input"
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Selected duration: {formatTime(Math.max(0, endTime - startTime))}
                </div>
              </div>

              {/* Fade Effects */}
              <div>
                <Label className="block text-sm font-medium mb-2">Fade Effects</Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fadeIn"
                      checked={fadeIn}
                      onCheckedChange={setFadeIn}
                      data-testid="fade-in-checkbox"
                    />
                    <Label htmlFor="fadeIn" className="text-sm">
                      Fade in at start
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fadeOut"
                      checked={fadeOut}
                      onCheckedChange={setFadeOut}
                      data-testid="fade-out-checkbox"
                    />
                    <Label htmlFor="fadeOut" className="text-sm">
                      Fade out at end
                    </Label>
                  </div>

                  {(fadeIn || fadeOut) && (
                    <div>
                      <Label className="block text-sm font-medium mb-2">
                        Fade Duration: {fadeDuration[0]}s
                      </Label>
                      <Slider
                        value={fadeDuration}
                        onValueChange={setFadeDuration}
                        min={0.1}
                        max={5}
                        step={0.1}
                        className="w-full"
                        data-testid="fade-duration-slider"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={cutAudio}
                disabled={isProcessing || startTime >= endTime}
                className="w-full bg-audio hover:bg-audio/90 text-white py-3 text-lg font-medium"
                data-testid="cut-audio-button"
              >
                <Scissors className="w-5 h-5 mr-2" />
                {isProcessing ? "Processing..." : "Cut Audio"}
              </Button>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    Processing... {progress}%
                  </p>
                </div>
              )}
            </>
          )}

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
            <h3 className="font-medium text-rose-800 mb-2">Audio Cutting Tips</h3>
            <div className="text-sm text-rose-700 space-y-1">
              <div>• Use the player to find exact cut points</div>
              <div>• Click "Set Start/End" buttons while playing</div>
              <div>• Add fade effects for smooth transitions</div>
              <div>• Preview your selection before cutting</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Cut Audio</Label>
            <Card className="bg-audio-background border border-audio/20 rounded-xl p-6 text-center min-h-[300px] flex items-center justify-center">
              {resultUrl ? (
                <div className="space-y-4 w-full">
                  <div className="w-16 h-16 bg-audio rounded-xl mx-auto flex items-center justify-center">
                    <div className="text-2xl">🎵</div>
                  </div>
                  <div className="text-audio-foreground">
                    <div className="font-medium">Audio Cut Complete</div>
                    <div className="text-sm text-audio-foreground/70 mt-1">
                      Duration: {formatTime(endTime - startTime)}
                    </div>
                    <div className="text-sm text-audio-foreground/70">
                      Size: {resultSize}
                    </div>
                  </div>
                  
                  {/* Preview Player */}
                  <div className="mt-4">
                    <audio controls className="w-full" data-testid="result-audio-player">
                      <source src={resultUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              ) : (
                <div className="text-audio-foreground/70">
                  Cut audio will appear here
                </div>
              )}
            </Card>
          </div>

          {resultUrl && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={downloadResult}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-audio hover:bg-audio/90 text-white rounded-xl font-medium"
                  data-testid="download-cut-audio"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={resetTool}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
                  data-testid="reset-cutter"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </Button>
              </div>

              <div>
                <h3 className="font-medium mb-3">Cut Details</h3>
                <div className="space-y-3">
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Original Duration</div>
                    <div className="text-sm text-muted-foreground">{formatTime(duration)}</div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Cut Duration</div>
                    <div className="text-sm text-muted-foreground">{formatTime(endTime - startTime)}</div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Time Range</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(startTime)} - {formatTime(endTime)}
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Effects Applied</div>
                    <div className="text-sm text-muted-foreground">
                      {fadeIn || fadeOut ? (
                        <>
                          {fadeIn && `Fade in: ${fadeDuration[0]}s`}
                          {fadeIn && fadeOut && ', '}
                          {fadeOut && `Fade out: ${fadeDuration[0]}s`}
                        </>
                      ) : 'None'}
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">File Size</div>
                    <div className="text-sm text-muted-foreground">
                      Original: {formatFileSize(selectedFile?.size || 0)}
                      <br />
                      Cut: {resultSize}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Privacy Notice</h3>
            <p className="text-sm text-blue-700">
              Your audio files are processed securely and automatically deleted after cutting. 
              We never store or access your audio content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
