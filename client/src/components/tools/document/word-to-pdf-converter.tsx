import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, FileText, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ConversionResult {
  processedFile: string;
  originalSize: number;
  processedSize: number;
  processingTime: number;
  fileName: string;
}

export default function WordToPdfConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const acceptedTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
  ];

  const handleFileSelect = (file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please select a Word document (.doc or .docx)",
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
    setResult(null);
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

  const convertWordToPdf = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a Word document first",
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

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 10, 85));
      }, 600);

      const response = await apiRequest('/api/document/word-to-pdf', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Word to PDF conversion failed');
      }

      const blob = await response.blob();
      const processedFile = URL.createObjectURL(blob);
      const processingTime = Date.now() - startTime;

      setResult({
        processedFile,
        originalSize: selectedFile.size,
        processedSize: blob.size,
        processingTime,
        fileName: selectedFile.name.replace(/\.(docx?|doc)$/, '.pdf'),
      });

      setProgress(100);

      toast({
        title: "Success!",
        description: "Word document converted to PDF successfully",
      });

    } catch (error) {
      console.error("Word to PDF conversion error:", error);
      toast({
        title: "Error",
        description: "Failed to convert Word to PDF. This feature requires server processing.",
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
        description: "PDF document downloaded successfully",
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
            <Label className="block text-sm font-medium mb-2">Upload Word Document</Label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 
                'border-border hover:border-orange-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-testid="word-upload-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleInputChange}
                className="hidden"
                data-testid="word-file-input"
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg mb-2">
                {isDragging ? 'Drop Word document here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports: DOC, DOCX files (max 100MB)
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

          {/* Conversion Controls */}
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={convertWordToPdf}
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
                      <FileText className="w-4 h-4 mr-2" />
                      Convert to PDF
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
                    Converting... {Math.round(progress)}%
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
                          <span className="text-muted-foreground">PDF size:</span>
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
                        Download PDF
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
                <li>• Preserves all formatting and layout</li>
                <li>• Maintains fonts, colors, and styles</li>
                <li>• Converts images and tables accurately</li>
                <li>• Supports headers, footers, and page numbers</li>
                <li>• High-quality PDF output</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <Label className="block text-sm font-medium">Document Preview</Label>

          {selectedFile ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-20 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{selectedFile.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Word Document • {formatFileSize(selectedFile.size)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ready for conversion to PDF format
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {result && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-20 bg-red-100 dark:bg-red-950/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{result.fileName}</h3>
                        <p className="text-sm text-muted-foreground">
                          PDF Document • {formatFileSize(result.processedSize)}
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
                <p className="text-muted-foreground">Upload a Word document to get started</p>
              </div>
            </div>
          )}

          {/* Tips */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• All formatting will be preserved in the PDF</li>
                <li>• Images and embedded objects are maintained</li>
                <li>• Use standard fonts for better compatibility</li>
                <li>• Review the PDF after conversion for accuracy</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}