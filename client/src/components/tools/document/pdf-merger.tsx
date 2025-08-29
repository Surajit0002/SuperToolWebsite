import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, X, GripVertical, FileText, FilePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
  pages?: number;
}

export default function PDFMerger() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [keepBookmarks, setKeepBookmarks] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    const validFiles = selectedFiles.filter(file => {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Error",
          description: `${file.name} is not a PDF file`,
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit per file
        toast({
          title: "Error",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    const newFiles: PDFFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: formatFileSize(file.size),
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setFiles(prev => {
      const index = prev.findIndex(file => file.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newFiles = [...prev];
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      return newFiles;
    });
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast({
        title: "Error",
        description: "Please select at least 2 PDF files to merge",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      const formData = new FormData();
      files.forEach((pdfFile, index) => {
        formData.append(`pdf_${index}`, pdfFile.file);
      });
      formData.append('keepBookmarks', keepBookmarks.toString());
      formData.append('fileOrder', JSON.stringify(files.map(f => f.id)));

      setProgress(30);

      const response = await fetch('/api/pdf/merge', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to merge PDFs');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setResultUrl(url);
      setResultSize(formatFileSize(blob.size));
      setProgress(100);

      toast({
        title: "Success!",
        description: "PDFs merged successfully",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to merge PDFs",
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
      a.download = `merged-${files.length}-pdfs.pdf`;
      a.click();

      toast({
        title: "Downloaded!",
        description: "Merged PDF downloaded successfully",
      });
    }
  };

  const resetTool = () => {
    setFiles([]);
    setResultUrl(null);
    setResultSize(null);
    setProgress(0);
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label className="block text-sm font-medium mb-2">Upload PDF Files</Label>
            <div 
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-document transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-testid="pdf-upload-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                data-testid="pdf-file-input"
              />
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop PDF files
                </p>
                <p className="text-xs text-muted-foreground">
                  Multiple files supported (max 50MB each)
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div>
              <Label className="block text-sm font-medium mb-2">
                Files to Merge ({files.length})
              </Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((file, index) => (
                  <Card key={file.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        <FileText className="w-5 h-5 text-document" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveFile(file.id, 'up')}
                          disabled={index === 0}
                          data-testid={`move-up-${file.id}`}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveFile(file.id, 'down')}
                          disabled={index === files.length - 1}
                          data-testid={`move-down-${file.id}`}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          data-testid={`remove-${file.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="keepBookmarks"
              checked={keepBookmarks}
              onCheckedChange={setKeepBookmarks}
              data-testid="keep-bookmarks-checkbox"
            />
            <Label htmlFor="keepBookmarks" className="text-sm">
              Keep bookmarks and table of contents
            </Label>
          </div>

          <Button
            onClick={mergePDFs}
            disabled={files.length < 2 || isProcessing}
            className="w-full bg-document hover:bg-document/90 text-white py-3 text-lg font-medium"
            data-testid="merge-pdfs-button"
          >
            <FilePlus className="w-5 h-5 mr-2" />
            {isProcessing ? "Merging..." : `Merge ${files.length} PDFs`}
          </Button>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Processing... {progress}%
              </p>
            </div>
          )}

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-medium text-orange-800 mb-2">Merge Tips</h3>
            <div className="text-sm text-orange-700 space-y-1">
              <div>• Drag files up/down to reorder</div>
              <div>• Files are merged in the order shown</div>
              <div>• Bookmarks help navigate large documents</div>
              <div>• Password-protected PDFs not supported</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Merged PDF</Label>
            <Card className="bg-document-background border border-document/20 rounded-xl p-6 text-center min-h-[300px] flex items-center justify-center">
              {resultUrl ? (
                <div className="space-y-4 w-full">
                  <div className="w-16 h-16 bg-document rounded-xl mx-auto flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-document-foreground">
                    <div className="font-medium">Merged PDF Ready</div>
                    <div className="text-sm text-document-foreground/70 mt-1">
                      Size: {resultSize}
                    </div>
                    <div className="text-sm text-document-foreground/70">
                      Combined {files.length} files
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-document-foreground/70">
                  Merged PDF will appear here
                </div>
              )}
            </Card>
          </div>

          {resultUrl && (
            <>
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={downloadResult}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-document hover:bg-document/90 text-white rounded-xl font-medium"
                  data-testid="download-merged-pdf"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Merged PDF</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={resetTool}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
                  data-testid="reset-merger"
                >
                  <X className="w-4 h-4" />
                  <span>Start Over</span>
                </Button>
              </div>

              <div>
                <h3 className="font-medium mb-3">Merge Details</h3>
                <div className="space-y-3">
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Files Merged</div>
                    <div className="text-sm text-muted-foreground">{files.length} PDF files</div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Total Size</div>
                    <div className="text-sm text-muted-foreground">
                      {files.reduce((total, file) => total + file.file.size, 0) > 0 ? 
                        formatFileSize(files.reduce((total, file) => total + file.file.size, 0)) : 'N/A'}
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Compressed Size</div>
                    <div className="text-sm text-muted-foreground">{resultSize}</div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Settings</div>
                    <div className="text-sm text-muted-foreground">
                      Bookmarks: {keepBookmarks ? 'Preserved' : 'Removed'}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Privacy Notice</h3>
            <p className="text-sm text-blue-700">
              Your PDF files are processed securely and automatically deleted after merging. 
              We never store or access your document content.
            </p>
          </div>

          {files.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Ready to Merge</h3>
              <div className="text-sm text-green-700 space-y-1">
                {files.map((file, index) => (
                  <div key={file.id}>
                    {index + 1}. {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
