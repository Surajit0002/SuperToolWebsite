import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileDown, Copy, ScanText, FileImage, FileText } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  preview?: string;
}

export default function OcrTool() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [language, setLanguage] = useState("eng");
  const [outputFormat, setOutputFormat] = useState("text");
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [enhanceImage, setEnhanceImage] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [resultFiles, setResultFiles] = useState<{name: string, url: string, size: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    const validFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/') || 
      file.type === 'application/pdf' ||
      file.name.match(/\.(jpg|jpeg|png|gif|bmp|tiff|tif|pdf)$/i)
    );
    
    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid files",
        description: "Only image files (JPG, PNG, GIF, BMP, TIFF) and PDF files are allowed",
        variant: "destructive",
      });
      return;
    }

    const newFiles: UploadedFile[] = validFiles.map(file => {
      const fileData: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: formatFileSize(file.size),
      };

      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileData.preview = e.target?.result as string;
          setFiles(prev => prev.map(f => f.id === fileData.id ? fileData : f));
        };
        reader.readAsDataURL(file);
      }

      return fileData;
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const extractText = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setExtractedText("");
    setResultFiles([]);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file.file);
      });
      formData.append('language', language);
      formData.append('outputFormat', outputFormat);
      formData.append('preserveLayout', preserveLayout.toString());
      formData.append('enhanceImage', enhanceImage.toString());

      setProgress(30);

      const response = await fetch('/api/document/ocr', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to extract text');
      }

      const result = await response.json();
      
      if (outputFormat === "text") {
        setExtractedText(result.text);
      } else {
        // Handle file downloads for structured formats
        const outputFiles = await Promise.all(
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
        setResultFiles(outputFiles);
      }

      setProgress(100);

      toast({
        title: "Success!",
        description: `Text extracted from ${files.length} file${files.length > 1 ? 's' : ''}`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to extract text",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadFile = (file: {name: string, url: string, size: string}) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetTool = () => {
    setFiles([]);
    setLanguage("eng");
    setOutputFormat("text");
    setPreserveLayout(true);
    setEnhanceImage(true);
    setIsProcessing(false);
    setProgress(0);
    setExtractedText("");
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
            <ScanText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">OCR Text Extraction Tool</h1>
        </div>
        <p className="text-muted-foreground">Extract text from images and PDF files using optical character recognition</p>
      </div>

      {!extractedText && resultFiles.length === 0 && (
        <>
          {/* File Upload Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Select Files</Label>
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
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="file-input"
                />

                {files.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="relative border border-border rounded-lg p-4 space-y-3"
                        data-testid={`file-item-${file.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="absolute top-2 right-2 text-destructive hover:text-destructive"
                          data-testid={`remove-file-${file.id}`}
                        >
                          ×
                        </Button>

                        {file.preview && (
                          <div className="w-full h-32 bg-muted rounded overflow-hidden">
                            <img 
                              src={file.preview} 
                              alt={file.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}

                        <div className="flex items-center space-x-3">
                          {file.file.type === 'application/pdf' ? (
                            <FileText className="w-5 h-5 text-orange-600" />
                          ) : (
                            <FileImage className="w-5 h-5 text-orange-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{file.name}</div>
                            <div className="text-sm text-muted-foreground">{file.size}</div>
                          </div>
                        </div>
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
                <Label className="text-base font-semibold">OCR Options</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Recognition Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger data-testid="language-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eng">English</SelectItem>
                        <SelectItem value="fra">French</SelectItem>
                        <SelectItem value="deu">German</SelectItem>
                        <SelectItem value="spa">Spanish</SelectItem>
                        <SelectItem value="ita">Italian</SelectItem>
                        <SelectItem value="por">Portuguese</SelectItem>
                        <SelectItem value="rus">Russian</SelectItem>
                        <SelectItem value="chi_sim">Chinese (Simplified)</SelectItem>
                        <SelectItem value="chi_tra">Chinese (Traditional)</SelectItem>
                        <SelectItem value="jpn">Japanese</SelectItem>
                        <SelectItem value="kor">Korean</SelectItem>
                        <SelectItem value="ara">Arabic</SelectItem>
                        <SelectItem value="hin">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="output-format">Output Format</Label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger data-testid="output-format-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Plain Text</SelectItem>
                        <SelectItem value="pdf">Searchable PDF</SelectItem>
                        <SelectItem value="docx">Word Document</SelectItem>
                        <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="preserve-layout"
                      checked={preserveLayout}
                      onCheckedChange={setPreserveLayout}
                      data-testid="preserve-layout-switch"
                    />
                    <Label htmlFor="preserve-layout">Preserve original layout and formatting</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enhance-image"
                      checked={enhanceImage}
                      onCheckedChange={setEnhanceImage}
                      data-testid="enhance-image-switch"
                    />
                    <Label htmlFor="enhance-image">Auto-enhance image quality for better recognition</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extract Button */}
          <div className="flex justify-center">
            <Button
              onClick={extractText}
              disabled={files.length === 0 || isProcessing}
              className="px-8 py-3 text-lg"
              data-testid="extract-button"
            >
              {isProcessing ? "Extracting..." : "Extract Text"}
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
                <Label>Extracting text using OCR...</Label>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text Result Section */}
      {extractedText && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Extracted Text</Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2"
                    data-testid="copy-button"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadText}
                    className="flex items-center space-x-2"
                    data-testid="download-text-button"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>

              <Textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="min-h-[400px] text-sm"
                placeholder="Extracted text will appear here..."
                data-testid="extracted-text-textarea"
              />

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={resetTool}
                  data-testid="extract-another-button"
                >
                  Extract from New Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Result Section */}
      {resultFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ScanText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Text Extraction Complete!</h3>
                    <p className="text-muted-foreground">{resultFiles.length} file{resultFiles.length > 1 ? 's' : ''} processed</p>
                  </div>
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

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={resetTool}
                  data-testid="extract-another-button"
                >
                  Extract from New Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}