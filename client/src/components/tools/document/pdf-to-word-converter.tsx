import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Download } from "lucide-react";

export default function PdfToWordConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setIsConverting(true);
    // Simulate conversion process
    setTimeout(() => {
      setIsConverting(false);
      alert("PDF to Word conversion completed! Download would start here.");
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">PDF to Word Converter</h1>
        <p className="text-muted-foreground">
          Convert your PDF files to editable Word documents
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload PDF File</h3>
              <p className="text-muted-foreground">
                Select a PDF file to convert to Word format
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
                data-testid="pdf-upload-input"
              />
              <label htmlFor="pdf-upload">
                <Button variant="outline" className="cursor-pointer" data-testid="upload-button">
                  Choose PDF File
                </Button>
              </label>
            </div>
          </div>

          {/* Selected File */}
          {file && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-red-500" />
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
                {isConverting ? "Converting..." : "Convert to Word"}
                <Download className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-medium">High Quality</h4>
              <p className="text-sm text-muted-foreground">
                Preserves formatting and layout
              </p>
            </div>
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium">Easy Upload</h4>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to upload
              </p>
            </div>
            <div className="text-center p-4">
              <Download className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-medium">Quick Download</h4>
              <p className="text-sm text-muted-foreground">
                Download converted files instantly
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}