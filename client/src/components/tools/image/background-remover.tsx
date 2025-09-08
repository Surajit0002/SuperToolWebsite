import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BackgroundRemovalResult {
  processedImage: string;
  originalSize: number;
  processedSize: number;
  processingTime: number;
}

export default function BackgroundRemover() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BackgroundRemovalResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "Error",
        description: "File size must be less than 50MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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

  const removeBackground = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const startTime = Date.now();
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 500);

      const response = await apiRequest('/api/image/remove-background', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Background removal failed');
      }

      const blob = await response.blob();
      const processedImage = URL.createObjectURL(blob);
      const processingTime = Date.now() - startTime;

      setResult({
        processedImage,
        originalSize: selectedFile.size,
        processedSize: blob.size,
        processingTime,
      });

      setProgress(100);

      toast({
        title: "Success!",
        description: "Background removed successfully",
      });

    } catch (error) {
      console.error("Background removal error:", error);
      toast({
        title: "Error",
        description: "Failed to remove background. This feature requires server processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (result?.processedImage) {
      const a = document.createElement('a');
      a.href = result.processedImage;
      a.download = `background-removed-${selectedFile?.name?.split('.')[0] || 'image'}.png`;
      a.click();

      toast({
        title: "Downloaded!",
        description: "Image with removed background downloaded successfully",
      });
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            <Label className="block text-sm font-medium mb-2">Upload Image</Label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : 
                'border-border hover:border-purple-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-testid="image-upload-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
                data-testid="image-file-input"
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg mb-2">
                {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports: JPG, PNG, WebP (max 50MB)
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

          {/* Processing Controls */}
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={removeBackground}
                  disabled={isProcessing}
                  className="flex-1"
                  data-testid="button-remove-background"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Background
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
                    Processing... {Math.round(progress)}%
                  </p>
                </div>
              )}

              {/* Processing Stats */}
              {result && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold mb-3">Processing Complete</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Original size:</span>
                          <br />
                          <span className="font-medium">{formatFileSize(result.originalSize)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Processed size:</span>
                          <br />
                          <span className="font-medium">{formatFileSize(result.processedSize)}</span>
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
                        Download Result
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Tips */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use images with clear contrast between subject and background</li>
                <li>• Avoid busy or complex backgrounds for better accuracy</li>
                <li>• Higher resolution images generally produce better results</li>
                <li>• Works best with portraits, products, and objects</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Original Preview */}
          {preview && (
            <div>
              <Label className="block text-sm font-medium mb-2">Original</Label>
              <div className="border rounded-xl p-4 bg-muted/50">
                <img
                  src={preview}
                  alt="Original"
                  className="max-w-full h-auto rounded-lg mx-auto"
                  data-testid="original-preview"
                />
              </div>
            </div>
          )}

          {/* Result Preview */}
          {result && (
            <div>
              <Label className="block text-sm font-medium mb-2">Background Removed</Label>
              <div className="border rounded-xl p-4 bg-muted/50">
                <div 
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 inline-block"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='a' patternUnits='userSpaceOnUse' width='10' height='10'%3e%3cpath d='m0 0h5v5h5v5h-5v-5h-5z' fill='%23f3f4f6'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23a)'/%3e%3c/svg%3e")`,
                    backgroundSize: '20px 20px'
                  }}
                >
                  <img
                    src={result.processedImage}
                    alt="Background Removed"
                    className="max-w-full h-auto rounded-lg mx-auto"
                    data-testid="result-preview"
                  />
                </div>
              </div>
            </div>
          )}

          {!preview && (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-xl">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Upload an image to see preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}