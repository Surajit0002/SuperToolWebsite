import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileDown, X, BookOpen, FileText } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface EpubFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

export default function EpubToPdfConverter() {
  const [files, setFiles] = useState<EpubFile[]>([]);
  const [preserveImages, setPreserveImages] = useState(true);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [pageSize, setPageSize] = useState("A4");
  const [margin, setMargin] = useState([20]);
  const [fontSize, setFontSize] = useState([12]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultFiles, setResultFiles] = useState<{name: string, url: string, size: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    const epubFiles = selectedFiles.filter(file => 
      file.type === "application/epub+zip" || file.name.endsWith('.epub')
    );
    
    if (epubFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid files",
        description: "Only ePub files (.epub) are allowed",
        variant: "destructive",
      });
      return;
    }

    const newFiles: EpubFile[] = epubFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: formatFileSize(file.size),
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const convertToPdf = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one ePub file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setResultFiles([]);

    try {
      const formData = new FormData();
      files.forEach((epubFile, index) => {
        formData.append(`epub_${index}`, epubFile.file);
      });
      formData.append('preserveImages', preserveImages.toString());
      formData.append('preserveFormatting', preserveFormatting.toString());
      formData.append('pageSize', pageSize);
      formData.append('margin', margin[0].toString());
      formData.append('fontSize', fontSize[0].toString());

      setProgress(30);

      const response = await fetch('/api/document/epub-to-pdf', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to convert ePub to PDF');
      }

      const result = await response.json();
      
      // Create download URLs for each PDF file
      const pdfFiles = await Promise.all(
        result.files.map(async (fileInfo: any) => {
          const fileResponse = await fetch(`/api/document/download/${fileInfo.id}`);
          const blob = await fileResponse.blob();
          const url = URL.createObjectURL(blob);
          
          return {
            name: fileInfo.name,
            url,
            size: formatFileSize(blob.size)
          };
        })
      );

      setResultFiles(pdfFiles);
      setProgress(100);

      toast({
        title: "Success!",
        description: `ePub files converted to ${pdfFiles.length} PDF file${pdfFiles.length > 1 ? 's' : ''}`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert ePub to PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (file: {name: string, url: string, size: string}) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllFiles = () => {
    resultFiles.forEach(file => {
      setTimeout(() => downloadFile(file), 100);
    });
  };

  const resetTool = () => {
    setFiles([]);
    setPreserveImages(true);
    setPreserveFormatting(true);
    setPageSize("A4");
    setMargin([20]);
    setFontSize([12]);
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
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ePub to PDF Converter</h1>
        </div>
        <p className="text-muted-foreground">Convert ePub ebooks to PDF format with customizable layout options</p>
      </div>

      {resultFiles.length === 0 && (
        <>
          {/* File Upload Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Select ePub Files</Label>
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
                  accept=".epub,application/epub+zip"
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
                          <BookOpen className="w-5 h-5 text-orange-600" />
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
                <Label className="text-base font-semibold">Conversion Options</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="page-size">Page Size</Label>
                    <Select value={pageSize} onValueChange={setPageSize}>
                      <SelectTrigger data-testid="page-size-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4 (210x297mm)</SelectItem>
                        <SelectItem value="A3">A3 (297x420mm)</SelectItem>
                        <SelectItem value="A5">A5 (148x210mm)</SelectItem>
                        <SelectItem value="Letter">Letter (8.5x11in)</SelectItem>
                        <SelectItem value="Legal">Legal (8.5x14in)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size: {fontSize[0]}pt</Label>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      min={8}
                      max={24}
                      step={1}
                      className="w-full"
                      data-testid="font-size-slider"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Margin: {margin[0]}mm</Label>
                    <Slider
                      value={margin}
                      onValueChange={setMargin}
                      min={10}
                      max={50}
                      step={5}
                      className="w-full"
                      data-testid="margin-slider"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="preserve-images"
                      checked={preserveImages}
                      onCheckedChange={setPreserveImages}
                      data-testid="preserve-images-switch"
                    />
                    <Label htmlFor="preserve-images">Preserve images and illustrations</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="preserve-formatting"
                      checked={preserveFormatting}
                      onCheckedChange={setPreserveFormatting}
                      data-testid="preserve-formatting-switch"
                    />
                    <Label htmlFor="preserve-formatting">Preserve text formatting and styles</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Convert Button */}
          <div className="flex justify-center">
            <Button
              onClick={convertToPdf}
              disabled={files.length === 0 || isProcessing}
              className="px-8 py-3 text-lg"
              data-testid="convert-button"
            >
              {isProcessing ? "Converting..." : "Convert to PDF"}
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
                <Label>Converting ePub to PDF...</Label>
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
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">PDF Files Ready!</h3>
                    <p className="text-muted-foreground">{resultFiles.length} file{resultFiles.length > 1 ? 's' : ''} converted</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
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
                    data-testid="convert-another-button"
                  >
                    Convert Another
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {resultFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    data-testid={`result-file-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">{file.size}</div>
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
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}