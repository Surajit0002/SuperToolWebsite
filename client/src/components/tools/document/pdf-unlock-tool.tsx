import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileDown, X, FileText, Unlock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
  password: string;
  isLocked?: boolean;
}

export default function PdfUnlockTool() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultFiles, setResultFiles] = useState<{
    name: string;
    url: string;
    size: string;
    status: 'success' | 'failed';
    error?: string;
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
      password: "",
      isLocked: true,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const updatePassword = (id: string, password: string) => {
    setFiles(files.map(file => 
      file.id === id ? { ...file, password } : file
    ));
  };

  const unlockPdfs = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one PDF file",
        variant: "destructive",
      });
      return;
    }

    const filesWithoutPasswords = files.filter(file => !file.password.trim());
    if (filesWithoutPasswords.length > 0) {
      toast({
        title: "Missing passwords",
        description: `Please enter passwords for ${filesWithoutPasswords.length} file${filesWithoutPasswords.length > 1 ? 's' : ''}`,
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
        formData.append(`password_${index}`, pdfFile.password);
      });

      setProgress(30);

      const response = await fetch('/api/document/pdf-unlock', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to unlock PDFs');
      }

      const result = await response.json();
      
      // Create download URLs for successfully unlocked PDFs
      const unlockedFiles = await Promise.all(
        result.files.map(async (fileInfo: any) => {
          if (fileInfo.status === 'success') {
            const fileResponse = await fetch(`/api/document/download/${fileInfo.id}`);
            const blob = await fileResponse.blob();
            const url = URL.createObjectURL(blob);
            
            return {
              name: fileInfo.name,
              url,
              size: formatFileSize(blob.size),
              status: 'success' as const
            };
          } else {
            return {
              name: fileInfo.name,
              url: '',
              size: '',
              status: 'failed' as const,
              error: fileInfo.error
            };
          }
        })
      );

      setResultFiles(unlockedFiles);
      setProgress(100);

      const successCount = unlockedFiles.filter(f => f.status === 'success').length;
      const failedCount = unlockedFiles.filter(f => f.status === 'failed').length;

      if (successCount > 0) {
        toast({
          title: "Success!",
          description: `${successCount} PDF file${successCount > 1 ? 's' : ''} unlocked successfully${failedCount > 0 ? `. ${failedCount} file${failedCount > 1 ? 's' : ''} failed` : ''}`,
        });
      } else {
        toast({
          title: "Failed",
          description: "No files could be unlocked. Please check your passwords",
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unlock PDFs",
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

  const downloadSuccessfulFiles = () => {
    const successfulFiles = resultFiles.filter(f => f.status === 'success');
    successfulFiles.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 100);
    });
  };

  const resetTool = () => {
    setFiles([]);
    setShowPasswords(false);
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
            <Unlock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">PDF Unlock Tool</h1>
        </div>
        <p className="text-muted-foreground">Remove password protection from PDF files</p>
      </div>

      {resultFiles.length === 0 && (
        <>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This tool helps you remove password protection from PDFs you own. Make sure you have the right to unlock these files.
            </AlertDescription>
          </Alert>

          {/* File Upload Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Select Password-Protected PDF Files</Label>
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Enter passwords for each file:</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="flex items-center space-x-2"
                        data-testid="toggle-passwords-visibility"
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span>{showPasswords ? "Hide" : "Show"} Passwords</span>
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="border border-border rounded-lg p-4"
                          data-testid={`file-item-${file.id}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="relative">
                                <FileText className="w-5 h-5 text-orange-600" />
                                <Unlock className="w-3 h-3 text-orange-600 absolute -bottom-1 -right-1" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{file.name}</div>
                                <div className="text-sm text-muted-foreground">{file.size} • Password Protected</div>
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

                          <div className="space-y-2">
                            <Label htmlFor={`password-${file.id}`} className="text-sm">Password</Label>
                            <Input
                              id={`password-${file.id}`}
                              type={showPasswords ? "text" : "password"}
                              value={file.password}
                              onChange={(e) => updatePassword(file.id, e.target.value)}
                              placeholder="Enter PDF password"
                              data-testid={`password-input-${file.id}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Unlock Button */}
          <div className="flex justify-center">
            <Button
              onClick={unlockPdfs}
              disabled={files.length === 0 || files.some(f => !f.password.trim()) || isProcessing}
              className="px-8 py-3 text-lg"
              data-testid="unlock-button"
            >
              {isProcessing ? "Unlocking..." : "Unlock PDFs"}
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
                <Label>Unlocking PDFs...</Label>
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
                    <Unlock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Processing Complete!</h3>
                    <p className="text-muted-foreground">
                      {resultFiles.filter(f => f.status === 'success').length} successful, {resultFiles.filter(f => f.status === 'failed').length} failed
                    </p>
                  </div>
                </div>

                {resultFiles.some(f => f.status === 'success') && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <Button
                      onClick={downloadSuccessfulFiles}
                      className="flex items-center space-x-2"
                      data-testid="download-successful-button"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Download Unlocked Files</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetTool}
                      data-testid="unlock-another-button"
                    >
                      Unlock More Files
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {resultFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      file.status === 'success' ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'
                    }`}
                    data-testid={`result-file-${index}`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="relative">
                        <FileText className={`w-5 h-5 ${file.status === 'success' ? 'text-green-600' : 'text-red-600'}`} />
                        {file.status === 'success' && <Unlock className="w-3 h-3 text-green-600 absolute -bottom-1 -right-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{file.name}</div>
                        <div className={`text-sm ${file.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {file.status === 'success' ? `${file.size} • Unlocked Successfully` : `Failed: ${file.error}`}
                        </div>
                      </div>
                    </div>
                    {file.status === 'success' && (
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
                    )}
                  </div>
                ))}
              </div>

              {!resultFiles.some(f => f.status === 'success') && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={resetTool}
                    data-testid="try-again-button"
                  >
                    Try Again with Different Files
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}