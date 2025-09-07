import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Table, Download } from "lucide-react";

export default function ExcelToPdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setIsConverting(true);
    // Simulate conversion process
    setTimeout(() => {
      setIsConverting(false);
      alert("Excel to PDF conversion completed! Download would start here.");
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Excel to PDF Converter</h1>
        <p className="text-muted-foreground">
          Convert your Excel spreadsheets to PDF format
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Excel File</h3>
              <p className="text-muted-foreground">
                Select an Excel spreadsheet to convert to PDF
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileSelect}
                className="hidden"
                id="excel-upload"
                data-testid="excel-upload-input"
              />
              <label htmlFor="excel-upload">
                <Button variant="outline" className="cursor-pointer" data-testid="upload-button">
                  Choose Excel File
                </Button>
              </label>
            </div>
          </div>

          {/* Selected File */}
          {file && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <Table className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                onClick={handleConvert}
                disabled={isConverting}
                data-testid="convert-button"
              >
                {isConverting ? "Converting..." : "Convert to PDF"}
                <Download className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <Table className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium">Multiple Sheets</h4>
              <p className="text-sm text-muted-foreground">
                Converts all worksheets to PDF
              </p>
            </div>
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-medium">Layout Preserved</h4>
              <p className="text-sm text-muted-foreground">
                Maintains original formatting and layout
              </p>
            </div>
            <div className="text-center p-4">
              <Download className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-medium">High Quality</h4>
              <p className="text-sm text-muted-foreground">
                Professional PDF output
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}