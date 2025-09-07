import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileDown, X, FileText, Table } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface CSVFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

export default function CsvToExcelConverter() {
  const [files, setFiles] = useState<CSVFile[]>([]);
  const [hasHeaders, setHasHeaders] = useState(true);
  const [delimiter, setDelimiter] = useState(",");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [sheetName, setSheetName] = useState("Sheet1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    const csvFiles = selectedFiles.filter(file => 
      file.type === "text/csv" || file.name.endsWith('.csv')
    );
    
    if (csvFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid files",
        description: "Only CSV files are allowed",
        variant: "destructive",
      });
      return;
    }

    const newFiles: CSVFile[] = csvFiles.map(file => ({
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

  const convertToExcel = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setResultUrl(null);

    try {
      const formData = new FormData();
      files.forEach((csvFile, index) => {
        formData.append(`csv_${index}`, csvFile.file);
      });
      formData.append('hasHeaders', hasHeaders.toString());
      formData.append('delimiter', delimiter === "custom" ? customDelimiter : delimiter);
      formData.append('sheetName', sheetName);

      setProgress(30);

      const response = await fetch('/api/document/csv-to-excel', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to convert CSV to Excel');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setResultUrl(url);
      setResultSize(formatFileSize(blob.size));
      setProgress(100);

      toast({
        title: "Success!",
        description: "CSV files converted to Excel successfully",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert CSV to Excel",
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
      a.download = files.length === 1 
        ? files[0].name.replace('.csv', '.xlsx')
        : 'converted-data.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const resetTool = () => {
    setFiles([]);
    setHasHeaders(true);
    setDelimiter(",");
    setCustomDelimiter("");
    setSheetName("Sheet1");
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
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Table className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">CSV to Excel Converter</h1>
        </div>
        <p className="text-muted-foreground">Convert CSV files to Excel format with customizable options</p>
      </div>

      {!resultUrl && (
        <>
          {/* File Upload Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Select CSV Files</Label>
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
                  accept=".csv,text/csv"
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
                          <FileText className="w-5 h-5 text-emerald-600" />
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
                    <Label htmlFor="sheet-name">Sheet Name</Label>
                    <Input
                      id="sheet-name"
                      value={sheetName}
                      onChange={(e) => setSheetName(e.target.value)}
                      placeholder="Sheet1"
                      data-testid="sheet-name-input"
                    />
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
                    id="has-headers"
                    checked={hasHeaders}
                    onCheckedChange={setHasHeaders}
                    data-testid="has-headers-switch"
                  />
                  <Label htmlFor="has-headers">First row contains headers</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Convert Button */}
          <div className="flex justify-center">
            <Button
              onClick={convertToExcel}
              disabled={files.length === 0 || isProcessing}
              className="px-8 py-3 text-lg"
              data-testid="convert-button"
            >
              {isProcessing ? "Converting..." : "Convert to Excel"}
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
                <Label>Converting CSV to Excel...</Label>
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
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Table className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Excel File Ready!</h3>
                  <p className="text-muted-foreground">
                    Size: {resultSize} • {files.length} file{files.length > 1 ? 's' : ''} converted
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
                  <span>Download Excel File</span>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}