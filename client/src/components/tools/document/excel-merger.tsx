import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileDown, X, FileSpreadsheet, GripVertical } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface ExcelFile {
  id: string;
  file: File;
  name: string;
  size: string;
  sheets?: string[];
}

export default function ExcelMerger() {
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [mergeMode, setMergeMode] = useState<"workbook" | "sheets">("workbook");
  const [outputName, setOutputName] = useState("merged-workbook.xlsx");
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    const excelFiles = selectedFiles.filter(file => 
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
      file.type === "application/vnd.ms-excel" ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );
    
    if (excelFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid files",
        description: "Only Excel files (.xlsx, .xls) are allowed",
        variant: "destructive",
      });
      return;
    }

    const newFiles: ExcelFile[] = excelFiles.map(file => ({
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

  const moveFile = (id: string, direction: 'up' | 'down') => {
    const currentIndex = files.findIndex(file => file.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= files.length) return;

    const newFiles = [...files];
    [newFiles[currentIndex], newFiles[newIndex]] = [newFiles[newIndex], newFiles[currentIndex]];
    setFiles(newFiles);
  };

  const mergeFiles = async () => {
    if (files.length < 2) {
      toast({
        title: "Error",
        description: "Please select at least 2 Excel files to merge",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setResultUrl(null);

    try {
      const formData = new FormData();
      files.forEach((excelFile, index) => {
        formData.append(`excel_${index}`, excelFile.file);
      });
      formData.append('mergeMode', mergeMode);
      formData.append('outputName', outputName);
      formData.append('preserveFormatting', preserveFormatting.toString());
      formData.append('includeHeaders', includeHeaders.toString());
      formData.append('fileOrder', JSON.stringify(files.map(f => f.id)));

      setProgress(30);

      const response = await fetch('/api/document/excel-merge', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to merge Excel files');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setResultUrl(url);
      setResultSize(formatFileSize(blob.size));
      setProgress(100);

      toast({
        title: "Success!",
        description: "Excel files merged successfully",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to merge Excel files",
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
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const resetTool = () => {
    setFiles([]);
    setMergeMode("workbook");
    setOutputName("merged-workbook.xlsx");
    setPreserveFormatting(true);
    setIncludeHeaders(true);
    setIsProcessing(false);
    setProgress(0);
    setResultUrl(null);
    setResultSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Excel Merger</h1>
        </div>
        <p className="text-muted-foreground">Merge multiple Excel files into one workbook</p>
      </div>

      {!resultUrl && (
        <>
          {/* File Upload Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Select Excel Files</Label>
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
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="file-input"
                />

                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Files will be merged in this order:</Label>
                    {files.map((file, index) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        data-testid={`file-item-${file.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveFile(file.id, 'up')}
                              disabled={index === 0}
                              className="h-4 w-4 p-0"
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveFile(file.id, 'down')}
                              disabled={index === files.length - 1}
                              className="h-4 w-4 p-0"
                            >
                              ↓
                            </Button>
                          </div>
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <FileSpreadsheet className="w-5 h-5 text-orange-600" />
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
                <Label className="text-base font-semibold">Merge Options</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="output-name">Output File Name</Label>
                    <Input
                      id="output-name"
                      value={outputName}
                      onChange={(e) => setOutputName(e.target.value)}
                      placeholder="merged-workbook.xlsx"
                      data-testid="output-name-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="merge-mode">Merge Mode</Label>
                    <Select value={mergeMode} onValueChange={(value: "workbook" | "sheets") => setMergeMode(value)}>
                      <SelectTrigger data-testid="merge-mode-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workbook">Separate Workbooks (each file as separate sheet)</SelectItem>
                        <SelectItem value="sheets">Combine All Sheets (all sheets from all files)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="preserve-formatting"
                      checked={preserveFormatting}
                      onCheckedChange={setPreserveFormatting}
                      data-testid="preserve-formatting-switch"
                    />
                    <Label htmlFor="preserve-formatting">Preserve original formatting and styles</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-headers"
                      checked={includeHeaders}
                      onCheckedChange={setIncludeHeaders}
                      data-testid="include-headers-switch"
                    />
                    <Label htmlFor="include-headers">Include headers when combining sheets</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Merge Button */}
          <div className="flex justify-center">
            <Button
              onClick={mergeFiles}
              disabled={files.length < 2 || isProcessing}
              className="px-8 py-3 text-lg"
              data-testid="merge-button"
            >
              {isProcessing ? "Merging..." : "Merge Excel Files"}
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
                <Label>Merging Excel files...</Label>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Section */}
      {resultUrl && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileSpreadsheet className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Excel Files Merged!</h3>
                  <p className="text-muted-foreground">
                    Size: {resultSize} • {files.length} files merged
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={downloadResult}
                  className="flex items-center space-x-2"
                  data-testid="download-button"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Merged File</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={resetTool}
                  data-testid="merge-another-button"
                >
                  Merge Another Set
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}