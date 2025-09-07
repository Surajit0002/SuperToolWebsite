import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileDown, X, FileSpreadsheet, Table } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface ExcelFile {
  id: string;
  file: File;
  name: string;
  size: string;
  sheets?: string[];
}

export default function ExcelToCsvConverter() {
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [delimiter, setDelimiter] = useState(",");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [selectedSheet, setSelectedSheet] = useState("all");
  const [encoding, setEncoding] = useState("UTF-8");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultFiles, setResultFiles] = useState<{name: string, url: string, size: string}[]>([]);
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

  const convertToCsv = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one Excel file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setResultFiles([]);

    try {
      const formData = new FormData();
      files.forEach((excelFile, index) => {
        formData.append(`excel_${index}`, excelFile.file);
      });
      formData.append('includeHeaders', includeHeaders.toString());
      formData.append('delimiter', delimiter === "custom" ? customDelimiter : delimiter);
      formData.append('selectedSheet', selectedSheet);
      formData.append('encoding', encoding);

      setProgress(30);

      const response = await fetch('/api/document/excel-to-csv', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to convert Excel to CSV');
      }

      const result = await response.json();
      
      // Create download URLs for each CSV file
      const csvFiles = await Promise.all(
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

      setResultFiles(csvFiles);
      setProgress(100);

      toast({
        title: "Success!",
        description: `Excel files converted to ${csvFiles.length} CSV file${csvFiles.length > 1 ? 's' : ''}`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert Excel to CSV",
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
    setIncludeHeaders(true);
    setDelimiter(",");
    setCustomDelimiter("");
    setSelectedSheet("all");
    setEncoding("UTF-8");
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
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Excel to CSV Converter</h1>
        </div>
        <p className="text-muted-foreground">Convert Excel files to CSV format with customizable options</p>
      </div>

      {resultFiles.length === 0 && (
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
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        data-testid={`file-item-${file.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
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
                    <Label htmlFor="sheet-selection">Sheet Selection</Label>
                    <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                      <SelectTrigger data-testid="sheet-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sheets</SelectItem>
                        <SelectItem value="first">First Sheet Only</SelectItem>
                        <SelectItem value="active">Active Sheet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="encoding">File Encoding</Label>
                    <Select value={encoding} onValueChange={setEncoding}>
                      <SelectTrigger data-testid="encoding-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTF-8">UTF-8</SelectItem>
                        <SelectItem value="UTF-16">UTF-16</SelectItem>
                        <SelectItem value="ASCII">ASCII</SelectItem>
                        <SelectItem value="ISO-8859-1">ISO-8859-1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delimiter">CSV Delimiter</Label>
                    <Select value={delimiter} onValueChange={setDelimiter}>
                      <SelectTrigger data-testid="delimiter-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=",">Comma (,)</SelectItem>
                        <SelectItem value=";">Semicolon (;)</SelectItem>
                        <SelectItem value="\t">Tab</SelectItem>
                        <SelectItem value="|">Pipe (|)</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {delimiter === "custom" && (
                      <Input
                        value={customDelimiter}
                        onChange={(e) => setCustomDelimiter(e.target.value)}
                        placeholder="Enter custom delimiter"
                        maxLength={1}
                        data-testid="custom-delimiter-input"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-headers"
                    checked={includeHeaders}
                    onCheckedChange={setIncludeHeaders}
                    data-testid="include-headers-switch"
                  />
                  <Label htmlFor="include-headers">Include column headers</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Convert Button */}
          <div className="flex justify-center">
            <Button
              onClick={convertToCsv}
              disabled={files.length === 0 || isProcessing}
              className="px-8 py-3 text-lg"
              data-testid="convert-button"
            >
              {isProcessing ? "Converting..." : "Convert to CSV"}
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
                <Label>Converting Excel to CSV...</Label>
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
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Table className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">CSV Files Ready!</h3>
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
                      <Table className="w-5 h-5 text-emerald-600" />
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