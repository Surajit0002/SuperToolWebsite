import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, ScanText, Download, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function OcrTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf')) {
      setFile(selectedFile);
      setExtractedText("");
    }
  };

  const handleExtractText = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    // Simulate OCR processing
    setTimeout(() => {
      setIsProcessing(false);
      setExtractedText("This is sample extracted text from your image or PDF. In a real implementation, this would be the actual text extracted using OCR technology.");
    }, 3000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    alert("Text copied to clipboard!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">OCR Tool</h1>
        <p className="text-muted-foreground">
          Extract text from images and PDF files using Optical Character Recognition
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Image or PDF</h3>
              <p className="text-muted-foreground">
                Select an image or PDF file to extract text from
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                data-testid="file-upload-input"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" data-testid="upload-button">
                  Choose File
                </Button>
              </label>
            </div>
          </div>

          {/* Selected File */}
          {file && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <ScanText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                onClick={handleExtractText}
                disabled={isProcessing}
                data-testid="extract-button"
              >
                {isProcessing ? "Processing..." : "Extract Text"}
                <ScanText className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Extracted Text */}
          {extractedText && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Extracted Text</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  data-testid="copy-button"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </Button>
              </div>
              <Textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="min-h-[200px]"
                placeholder="Extracted text will appear here..."
                data-testid="extracted-text"
              />
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <ScanText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-medium">Accurate OCR</h4>
              <p className="text-sm text-muted-foreground">
                High accuracy text recognition
              </p>
            </div>
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium">Multiple Formats</h4>
              <p className="text-sm text-muted-foreground">
                Supports images and PDF files
              </p>
            </div>
            <div className="text-center p-4">
              <Copy className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-medium">Easy Export</h4>
              <p className="text-sm text-muted-foreground">
                Copy or download extracted text
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}