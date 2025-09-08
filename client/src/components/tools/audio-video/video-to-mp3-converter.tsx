import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Music, RefreshCw, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ConversionResult {
  processedFile: string;
  originalSize: number;
  processedSize: number;
  processingTime: number;
  fileName: string;
  duration?: string;
  bitrate?: string;
}

export default function VideoToMp3Converter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [quality, setQuality] = useState("192");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const qualityOptions = [
    { value: "128", label: "128 kbps - Good quality" },
    { value: "192", label: "192 kbps - High quality" },
    { value: "256", label: "256 kbps - Very high quality" },
    { value: "320", label: "320 kbps - Maximum quality" },
  ];

  const acceptedTypes = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/mkv',
    'video/webm',
    'video/3gp',
    'video/m4v',
  ];

  const handleFileSelect = (file: File) => {
    if (!acceptedTypes.includes(file.type) && !file.name.match(/\.(mp4|avi|mov|wmv|flv|mkv|webm|3gp|m4v)$/i)) {
      toast({
        title: "Error",
        description: "Please select a supported video file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      toast({
        title: "Error",
        description: "File size must be less than 500MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setResult(null);

    // Create video preview
    if (videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const convertVideoToMp3 = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a video file first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const startTime = Date.now();
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('quality', quality);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 8, 85));
      }, 800);

      const response = await apiRequest('/api/audio-video/video-to-mp3', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Video to MP3 conversion failed');
      }

      const blob = await response.blob();
      const processedFile = URL.createObjectURL(blob);
      const processingTime = Date.now() - startTime;

      // Get video duration if available
      let duration = "Unknown";
      if (videoRef.current && videoRef.current.duration) {
        const mins = Math.floor(videoRef.current.duration / 60);
        const secs = Math.floor(videoRef.current.duration % 60);
        duration = `${mins}:${secs.toString().padStart(2, '0')}`;
      }

      setResult({
        processedFile,
        originalSize: selectedFile.size,
        processedSize: blob.size,
        processingTime,
        fileName: selectedFile.name.replace(/\.(mp4|avi|mov|wmv|flv|mkv|webm|3gp|m4v)$/i, '.mp3'),
        duration,
        bitrate: `${quality} kbps`,
      });

      setProgress(100);

      toast({
        title: "Success!",
        description: "Video converted to MP3 successfully",
      });

    } catch (error) {
      console.error("Video to MP3 conversion error:", error);
      toast({
        title: "Error",
        description: "Failed to convert video to MP3. This feature requires server processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (result?.processedFile) {
      const a = document.createElement('a');
      a.href = result.processedFile;
      a.download = result.fileName;
      a.click();

      toast({
        title: "Downloaded!",
        description: "MP3 file downloaded successfully",
      });
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (videoRef.current) {
      videoRef.current.src = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Controls */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label className="block text-sm font-medium mb-2">Upload Video File</Label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20' : 
                'border-border hover:border-rose-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-testid="video-upload-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleInputChange}
                className="hidden"
                data-testid="video-file-input"
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg mb-2">
                {isDragging ? 'Drop video file here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports: MP4, AVI, MOV, WMV, FLV, MKV, WebM (max 500MB)
              </p>
              {selectedFile && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quality Settings */}
          {selectedFile && (
            <div>
              <Label className="block text-sm font-medium mb-2">Audio Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger data-testid="quality-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Conversion Controls */}
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={convertVideoToMp3}
                  disabled={isProcessing}
                  className="flex-1"
                  data-testid="button-convert"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4 mr-2" />
                      Convert to MP3
                    </>
                  )}
                </Button>
                <Button
                  onClick={reset}
                  variant="outline"
                  data-testid="button-reset"
                >
                  Reset
                </Button>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    Extracting audio... {Math.round(progress)}%
                  </p>
                </div>
              )}

              {/* Conversion Stats */}
              {result && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold mb-3">Conversion Complete</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Original size:</span>
                          <br />
                          <span className="font-medium">{formatFileSize(result.originalSize)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">MP3 size:</span>
                          <br />
                          <span className="font-medium">{formatFileSize(result.processedSize)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <br />
                          <span className="font-medium">{result.duration}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bitrate:</span>
                          <br />
                          <span className="font-medium">{result.bitrate}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Processing time:</span>
                          <br />
                          <span className="font-medium">{(result.processingTime / 1000).toFixed(1)}s</span>
                        </div>
                      </div>
                      <Button
                        onClick={downloadResult}
                        className="w-full mt-4"
                        data-testid="button-download"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download MP3
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Features */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Extracts high-quality audio from video</li>
                <li>• Multiple bitrate options (128-320 kbps)</li>
                <li>• Preserves original audio quality</li>
                <li>• Supports all popular video formats</li>
                <li>• Fast processing with progress tracking</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <Label className="block text-sm font-medium">Video Preview</Label>

          {selectedFile ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <video
                    ref={videoRef}
                    controls
                    className="w-full rounded-lg max-h-64"
                    data-testid="video-preview"
                  >
                    Your browser does not support the video tag.
                  </video>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-20 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                      <Play className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{selectedFile.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Video File • {formatFileSize(selectedFile.size)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ready for audio extraction
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {result && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-20 bg-green-100 dark:bg-green-950/20 rounded-lg flex items-center justify-center">
                        <Music className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{result.fileName}</h3>
                        <p className="text-sm text-muted-foreground">
                          MP3 Audio • {formatFileSize(result.processedSize)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Conversion completed successfully
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-xl">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Upload a video file to get started</p>
              </div>
            </div>
          )}

          {/* Tips */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Higher bitrates produce better quality but larger files</li>
                <li>• 192 kbps is ideal for most music and spoken content</li>
                <li>• Use 320 kbps for maximum quality archival</li>
                <li>• Processing time depends on video length and quality</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}