import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Minimize2, Download } from "lucide-react";

export default function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState("medium");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    
    setIsCompressing(true);
    // Simulate compression process
    setTimeout(() => {
      setIsCompressing(false);
      alert("PDF compression completed! Download would start here.");
    }, 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">PDF Compressor</h1>
        <p className="text-muted-foreground">
          Reduce PDF file size while maintaining quality
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
                Select a PDF file to compress
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

          {/* Compression Settings */}
          {file && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Minimize2 className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Original size: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Compression Level:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setCompressionLevel("low")}
                      className={`p-3 rounded-lg border text-center ${
                        compressionLevel === "low"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted"
                      }`}
                      data-testid="compression-low"
                    >
                      <div className="font-medium">Low</div>
                      <div className="text-xs">Best Quality</div>
                    </button>
                    <button
                      onClick={() => setCompressionLevel("medium")}
                      className={`p-3 rounded-lg border text-center ${
                        compressionLevel === "medium"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted"
                      }`}
                      data-testid="compression-medium"
                    >
                      <div className="font-medium">Medium</div>
                      <div className="text-xs">Balanced</div>
                    </button>
                    <button
                      onClick={() => setCompressionLevel("high")}
                      className={`p-3 rounded-lg border text-center ${
                        compressionLevel === "high"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted"
                      }`}
                      data-testid="compression-high"
                    >
                      <div className="font-medium">High</div>
                      <div className="text-xs">Smallest Size</div>
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleCompress}
                  disabled={isCompressing}
                  className="w-full mt-4"
                  data-testid="compress-button"
                >
                  {isCompressing ? "Compressing..." : "Compress PDF"}
                  <Download className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <Minimize2 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-medium">Smart Compression</h4>
              <p className="text-sm text-muted-foreground">
                Reduces file size intelligently
              </p>
            </div>
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium">Quality Options</h4>
              <p className="text-sm text-muted-foreground">
                Choose compression level that suits your needs
              </p>
            </div>
            <div className="text-center p-4">
              <Download className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-medium">Fast Processing</h4>
              <p className="text-sm text-muted-foreground">
                Quick compression with reliable results
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}