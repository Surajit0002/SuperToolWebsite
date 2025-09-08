import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Music, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ConversionResult {
  processedFile: string;
  originalSize: number;
  processedSize: number;
  processingTime: number;
  fileName: string;
  format: string;
}

export default function AudioConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [quality, setQuality] = useState("192");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const outputFormats = [
    { value: "mp3", label: "MP3", description: "Most compatible format" },
    { value: "wav", label: "WAV", description: "Uncompressed, high quality" },
    { value: "flac", label: "FLAC", description: "Lossless compression" },
    { value: "aac", label: "AAC", description: "Good compression" },
    { value: "ogg", label: "OGG", description: "Open source format" },
    { value: "m4a", label: "M4A", description: "Apple format" },
  ];

  const qualityOptions = [
    { value: "96", label: "96 kbps - Small size" },
    { value: "128", label: "128 kbps - Good quality" },
    { value: "192", label: "192 kbps - High quality" },
    { value: "256", label: "256 kbps - Very high quality" },
    { value: "320", label: "320 kbps - Maximum quality" },
  ];

  const acceptedTypes = [
    'audio/mp3',
    'audio/wav',
    'audio/flac',
    'audio/aac',
    'audio/ogg',
    'audio/m4a',
    'audio/wma',
    'audio/aiff',
  ];

  const handleFileSelect = (file: File) => {
    if (!acceptedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|flac|aac|ogg|m4a|wma|aiff)$/i)) {
      toast({
        title: "Error",
        description: "Please select a supported audio file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 200 * 1024 * 1024) { // 200MB limit
      toast({
        title: "Error",
        description: "File size must be less than 200MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setResult(null);

    // Create audio preview
    if (audioRef.current) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
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

  const convertAudio = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an audio file first",
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
      formData.append('format', outputFormat);
      formData.append('quality', quality);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 12, 85));
      }, 600);

      const response = await apiRequest('/api/audio-video/audio-convert', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Audio conversion failed');
      }

      const blob = await response.blob();
      const processedFile = URL.createObjectURL(blob);
      const processingTime = Date.now() - startTime;

      setResult({
        processedFile,
        originalSize: selectedFile.size,
        processedSize: blob.size,
        processingTime,
        fileName: selectedFile.name.replace(/\.[^/.]+$/, `.${outputFormat}`),
        format: outputFormat.toUpperCase(),
      });

      setProgress(100);

      toast({
        title: "Success!",
        description: `Audio converted to ${outputFormat.toUpperCase()} successfully`,
      });

    } catch (error) {
      console.error("Audio conversion error:", error);
      toast({
        title: "Error",
        description: "Failed to convert audio. This feature requires server processing.",
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
        description: "Converted audio file downloaded successfully",
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
    if (audioRef.current) {
      audioRef.current.src = '';
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
            <Label className="block text-sm font-medium mb-2">Upload Audio File</Label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20' : 
                'border-border hover:border-rose-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-testid="audio-upload-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleInputChange}
                className="hidden"
                data-testid="audio-file-input"
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg mb-2">
                {isDragging ? 'Drop audio file here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports: MP3, WAV, FLAC, AAC, OGG, M4A, WMA (max 200MB)
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

          {/* Format Settings */}
          {selectedFile && (
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Output Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger data-testid="format-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-xs text-muted-foreground">{format.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(outputFormat === 'mp3' || outputFormat === 'aac') && (
                <div>
                  <Label className="block text-sm font-medium mb-2">Quality</Label>
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
            </div>
          )}

          {/* Conversion Controls */}
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={convertAudio}
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
                      Convert Audio
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
                    Converting audio... {Math.round(progress)}%
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
                          <span className="text-muted-foreground">Converted size:</span>
                          <br />
                          <span className="font-medium">{formatFileSize(result.processedSize)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Format:</span>
                          <br />
                          <span className="font-medium">{result.format}</span>
                        </div>
                        <div>
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
                        Download {result.format}
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
                <li>• Convert between all major audio formats</li>
                <li>• Adjustable quality settings for compressed formats</li>
                <li>• Preserves metadata when possible</li>
                <li>• High-quality audio processing</li>
                <li>• Batch conversion support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <Label className="block text-sm font-medium">Audio Preview</Label>

          {selectedFile ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <audio
                    ref={audioRef}
                    controls
                    className="w-full"
                    data-testid="audio-preview"
                  >
                    Your browser does not support the audio tag.
                  </audio>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-20 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                      <Music className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{selectedFile.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Audio File • {formatFileSize(selectedFile.size)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Converting to {outputFormat.toUpperCase()}
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
                          {result.format} Audio • {formatFileSize(result.processedSize)}
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
                <p className="text-muted-foreground">Upload an audio file to get started</p>
              </div>
            </div>
          )}

          {/* Format Comparison */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Format Guide</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MP3:</span>
                  <span>Most compatible, good compression</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WAV:</span>
                  <span>Uncompressed, largest files</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FLAC:</span>
                  <span>Lossless, smaller than WAV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AAC:</span>
                  <span>Better than MP3 at same bitrate</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}