import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, FileText, FileMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PDFSplitter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [splitMode, setSplitMode] = useState<"ranges" | "pages" | "every">("ranges");
  const [pageRanges, setPageRanges] = useState("");
  const [everyNPages, setEveryNPages] = useState("1");
  const [preserveMetadata, setPreserveMetadata] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultFiles, setResultFiles] = useState<Array<{name: string, url: string, size: string}>>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Please select a PDF file",
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
    
    // Try to get page count (this would need server-side PDF analysis)
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await fetch('/api/pdf/info', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const info = await response.json();
        setTotalPages(info.pages);
      }
    } catch (error) {
      console.warn("Could not get PDF info:", error);
    }
  };

  const validatePageRanges = (ranges: string, totalPages: number): boolean => {
    if (!ranges.trim()) return false;
    
    const parts = ranges.split(',').map(part => part.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(p => p.trim());
        const startNum = start === '' ? 1 : parseInt(start);
        const endNum = end === 'end' ? totalPages : parseInt(end);
        
        if (isNaN(startNum) || (end !== 'end' && isNaN(endNum))) return false;
        if (startNum < 1 || startNum > totalPages) return false;
        if (endNum < 1 || endNum > totalPages) return false;
        if (startNum > endNum) return false;
      } else {
        const pageNum = parseInt(part);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) return false;
      }
    }
    
    return true;
  };

  const splitPDF = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate inputs based on split mode
    if (splitMode === "ranges") {
      if (!pageRanges.trim()) {
        toast({
          title: "Error",
          description: "Please enter page ranges to split",
          variant: "destructive",
        });
        return;
      }
      
      if (totalPages && !validatePageRanges(pageRanges, totalPages)) {
        toast({
          title: "Error",
          description: "Invalid page ranges. Use format like: 1-3,5,7-end",
          variant: "destructive",
        });
        return;
      }
    } else if (splitMode === "every") {
      const n = parseInt(everyNPages);
      if (isNaN(n) || n < 1) {
        toast({
          title: "Error",
          description: "Please enter a valid number of pages",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('splitMode', splitMode);
      formData.append('preserveMetadata', preserveMetadata.toString());
      
      if (splitMode === "ranges") {
        formData.append('pageRanges', pageRanges);
      } else if (splitMode === "every") {
        formData.append('everyNPages', everyNPages);
      }

      setProgress(30);

      const response = await fetch('/api/pdf/split', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to split PDF');
      }

      const result = await response.json();
      
      // Create download URLs for each split file
      const files = await Promise.all(
        result.files.map(async (fileInfo: any) => {
          const fileResponse = await fetch(`/api/pdf/download/${fileInfo.id}`);
          const blob = await fileResponse.blob();
          const url = URL.createObjectURL(blob);
          
          return {
            name: fileInfo.name,
            url,
            size: formatFileSize(blob.size)
          };
        })
      );

      setResultFiles(files);
      setProgress(100);

      toast({
        title: "Success!",
        description: `PDF split into ${files.length} files`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to split PDF",
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
    a.click();

    toast({
      title: "Downloaded!",
      description: `${file.name} downloaded successfully`,
    });
  };

  const downloadAllAsZip = async () => {
    try {
      const response = await fetch('/api/pdf/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          files: resultFiles.map(f => f.name)
        })
      });

      if (!response.ok) throw new Error('Failed to create ZIP');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile?.name?.replace('.pdf', '')}-split.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Downloaded!",
        description: "All files downloaded as ZIP",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ZIP file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label className="block text-sm font-medium mb-2">Upload PDF File</Label>
            <div 
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-document transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-testid="pdf-upload-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="pdf-file-input"
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-document" />
                  <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Size: {formatFileSize(selectedFile.size)}
                    {totalPages && ` • ${totalPages} pages`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop PDF
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max file size: 100MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Split Settings */}
          {selectedFile && (
            <>
              <div>
                <Label className="block text-sm font-medium mb-2">Split Mode</Label>
                <Select value={splitMode} onValueChange={(value: any) => setSplitMode(value)}>
                  <SelectTrigger data-testid="split-mode-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ranges">Page Ranges</SelectItem>
                    <SelectItem value="pages">Individual Pages</SelectItem>
                    <SelectItem value="every">Every N Pages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {splitMode === "ranges" && (
                <div>
                  <Label htmlFor="pageRanges" className="block text-sm font-medium mb-2">
                    Page Ranges
                  </Label>
                  <Textarea
                    id="pageRanges"
                    value={pageRanges}
                    onChange={(e) => setPageRanges(e.target.value)}
                    placeholder="e.g., 1-3,5,7-end"
                    className="w-full px-4 py-3"
                    rows={3}
                    data-testid="page-ranges-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Examples: "1-3,5,7-end" or "1-10,15-20,25-end"
                    {totalPages && ` (Total pages: ${totalPages})`}
                  </p>
                </div>
              )}

              {splitMode === "every" && (
                <div>
                  <Label htmlFor="everyNPages" className="block text-sm font-medium mb-2">
                    Split Every N Pages
                  </Label>
                  <Input
                    id="everyNPages"
                    type="number"
                    value={everyNPages}
                    onChange={(e) => setEveryNPages(e.target.value)}
                    min="1"
                    max={totalPages || 1000}
                    placeholder="1"
                    data-testid="every-n-pages-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Each file will contain this many pages
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preserveMetadata"
                  checked={preserveMetadata}
                  onCheckedChange={setPreserveMetadata}
                  data-testid="preserve-metadata-checkbox"
                />
                <Label htmlFor="preserveMetadata" className="text-sm">
                  Preserve document metadata
                </Label>
              </div>

              <Button
                onClick={splitPDF}
                disabled={isProcessing}
                className="w-full bg-document hover:bg-document/90 text-white py-3 text-lg font-medium"
                data-testid="split-pdf-button"
              >
                <FileMinus className="w-5 h-5 mr-2" />
                {isProcessing ? "Splitting..." : "Split PDF"}
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

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-medium text-orange-800 mb-2">Split Examples</h3>
            <div className="text-sm text-orange-700 space-y-1">
              <div><strong>Ranges:</strong> "1-3,5,7-end" → 3 files</div>
              <div><strong>Every 2 pages:</strong> 10-page PDF → 5 files</div>
              <div><strong>Individual pages:</strong> Each page as separate file</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Split Results</Label>
            <Card className="bg-document-background border border-document/20 rounded-xl p-6 text-center min-h-[300px] flex items-center justify-center">
              {resultFiles.length > 0 ? (
                <div className="space-y-4 w-full">
                  <div className="w-16 h-16 bg-document rounded-xl mx-auto flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-document-foreground">
                    <div className="font-medium">{resultFiles.length} Files Created</div>
                    <div className="text-sm text-document-foreground/70 mt-1">
                      Ready for download
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-document-foreground/70">
                  Split PDF files will appear here
                </div>
              )}
            </Card>
          </div>

          {resultFiles.length > 0 && (
            <>
              <div>
                <Label className="block text-sm font-medium mb-2">Individual Files</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {resultFiles.map((file, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <FileText className="w-5 h-5 text-document" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(file)}
                          data-testid={`download-file-${index}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={downloadAllAsZip}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-document hover:bg-document/90 text-white rounded-xl font-medium"
                  data-testid="download-all-zip"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </Button>
              </div>

              <div>
                <h3 className="font-medium mb-3">Split Summary</h3>
                <div className="space-y-3">
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Original File</div>
                    <div className="text-sm text-muted-foreground">{selectedFile.name}</div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Files Created</div>
                    <div className="text-sm text-muted-foreground">{resultFiles.length} PDF files</div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Split Method</div>
                    <div className="text-sm text-muted-foreground">
                      {splitMode === "ranges" && `Page ranges: ${pageRanges}`}
                      {splitMode === "pages" && "Individual pages"}
                      {splitMode === "every" && `Every ${everyNPages} pages`}
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Settings</div>
                    <div className="text-sm text-muted-foreground">
                      Metadata: {preserveMetadata ? 'Preserved' : 'Removed'}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Privacy Notice</h3>
            <p className="text-sm text-blue-700">
              Your PDF is processed securely and all files are automatically deleted after download. 
              We never store or access your document content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
