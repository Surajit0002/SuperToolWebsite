import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileDown, X, FileText, TrendingDown } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
  originalSize: number;
}

export default function PdfCompressor() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [qualityLevel, setQualityLevel] = useState([75]);
  const [optimizeImages, setOptimizeImages] = useState(true);
  const [removeDuplicateObjects, setRemoveDuplicateObjects] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultFiles, setResultFiles] = useState<{
    name: string;
    url: string;
    size: string;
    originalSize: string;
    compressionRatio: number;
  }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    const pdfFiles = selectedFiles.filter(file => 
      file.type === "application/pdf" || file.name.endsWith('.pdf')
    );
    
    if (pdfFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid files",
        description: "Only PDF files are allowed",
        variant: "destructive",
      });
      return;
    }

    const newFiles: PDFFile[] = pdfFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      originalSize: file.size,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const compressPdfs = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setResultFiles([]);

    try {
      const formData = new FormData();
      files.forEach((pdfFile, index) => {
        formData.append(`pdf_${index}`, pdfFile.file);
      });
      formData.append('compressionLevel', compressionLevel);
      formData.append('qualityLevel', qualityLevel[0].toString());
      formData.append('optimizeImages', optimizeImages.toString());
      formData.append('removeDuplicateObjects', removeDuplicateObjects.toString());

      setProgress(30);

      const response = await fetch('/api/document/pdf-compress', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to compress PDFs');
      }

      const result = await response.json();
      
      // Create download URLs for each compressed PDF
      const compressedFiles = await Promise.all(
        result.files.map(async (fileInfo: any, index: number) => {
          const fileResponse = await fetch(`/api/document/download/${fileInfo.id}`);
          const blob = await fileResponse.blob();
          const url = URL.createObjectURL(blob);
          
          const originalFile = files[index];
          const compressionRatio = Math.round(((originalFile.originalSize - blob.size) / originalFile.originalSize) * 100);
          
          return {
            name: fileInfo.name,
            url,
            size: formatFileSize(blob.size),
            originalSize: originalFile.size,
            compressionRatio: Math.max(0, compressionRatio)
          };
        })
      );

      setResultFiles(compressedFiles);
      setProgress(100);

      const totalSaved = compressedFiles.reduce((acc, file) => acc + file.compressionRatio, 0) / compressedFiles.length;

      toast({
        title: "Success!",
        description: `PDFs compressed successfully. Average size reduction: ${Math.round(totalSaved)}%`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to compress PDFs",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (file: {name: string, url: string}) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllFiles = () => {
    resultFiles.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 100);
    });
  };

  const resetTool = () => {
    setFiles([]);
    setCompressionLevel("medium");
    setQualityLevel([75]);
    setIsProcessing(false);
    setProgress(0);
    setResultFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">PDF Compressor</h1>
        </div>
        <p className="text-muted-foreground">Reduce PDF file size while maintaining quality</p>
      </div>

      {resultFiles.length === 0 && (
        <>
          {/* File Upload Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Select PDF Files</Label>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2"
                    data-testid="select-files-button"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Files</span>
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="file-input"
                />

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        data-testid={`file-item-${file.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-orange-600" />
                          <div>
                            <div className="font-medium">{file.name}</div>
                            <div className="text-sm text-muted-foreground">{file.size}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`remove-file-${file.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Options Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <Label className="text-base font-semibold">Compression Options</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="compression-level">Compression Level</Label>
                    <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                      <SelectTrigger data-testid="compression-level-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Larger file, better quality)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="high">High (Smaller file, lower quality)</SelectItem>
                        <SelectItem value="maximum">Maximum (Smallest file)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {compressionLevel === "low" && "Minimal compression with highest quality preservation"}
                      {compressionLevel === "medium" && "Good balance between file size and quality"}
                      {compressionLevel === "high" && "Strong compression with noticeable quality reduction"}
                      {compressionLevel === "maximum" && "Maximum compression may significantly affect quality"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Image Quality: {qualityLevel[0]}%</Label>
                    <Slider
                      value={qualityLevel}
                      onValueChange={setQualityLevel}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                      data-testid="quality-slider"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values preserve image quality but result in larger files
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Optimize Images</Label>
                      <p className="text-xs text-muted-foreground">
                        Compress and optimize images within the PDF
                      </p>
                    </div>
                    <button
                      onClick={() => setOptimizeImages(!optimizeImages)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        optimizeImages ? 'bg-primary' : 'bg-muted'
                      }`}
                      data-testid="optimize-images-switch"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          optimizeImages ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Remove Duplicate Objects</Label>
                      <p className="text-xs text-muted-foreground">
                        Remove duplicate fonts, images, and other objects
                      </p>
                    </div>
                    <button
                      onClick={() => setRemoveDuplicateObjects(!removeDuplicateObjects)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        removeDuplicateObjects ? 'bg-primary' : 'bg-muted'
                      }`}
                      data-testid="remove-duplicates-switch"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          removeDuplicateObjects ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compress Button */}
          <div className="flex justify-center">
            <Button
              onClick={compressPdfs}
              disabled={files.length === 0 || isProcessing}
              className="px-8 py-3 text-lg"
              data-testid="compress-button"
            >
              {isProcessing ? "Compressing..." : "Compress PDFs"}
            </Button>
          </div>
        </>
      )}

      {/* Progress Section */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Compressing PDFs...</Label>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Section */}
      {resultFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingDown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">PDFs Compressed!</h3>
                    <p className="text-muted-foreground">{resultFiles.length} file{resultFiles.length > 1 ? 's' : ''} processed</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <Button
                    onClick={downloadAllFiles}
                    className="flex items-center space-x-2"
                    data-testid="download-all-button"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download All Files</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetTool}
                    data-testid="compress-another-button"
                  >
                    Compress More Files
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {resultFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    data-testid={`result-file-${index}`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {file.originalSize} → {file.size} ({file.compressionRatio}% smaller)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          -{file.compressionRatio}%
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(file)}
                        className="flex items-center space-x-2"
                        data-testid={`download-file-${index}`}
                      >
                        <FileDown className="w-4 h-4" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}