import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Minimize2, Download } from "lucide-react";

export default function VideoCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    
    setIsCompressing(true);
    // Simulate compression process
    setTimeout(() => {
      setIsCompressing(false);
      alert("Video compression completed! Download would start here.");
    }, 5000);
  };

  const getEstimatedSize = () => {
    if (!file) return "";
    const originalSizeMB = file.size / 1024 / 1024;
    const reductionFactors = { low: 0.8, medium: 0.5, high: 0.3 };
    const estimatedSizeMB = originalSizeMB * reductionFactors[compressionLevel as keyof typeof reductionFactors];
    return `~${estimatedSizeMB.toFixed(1)} MB`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Video Compressor</h1>
        <p className="text-muted-foreground">
          Reduce video file size while maintaining quality
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Video File</h3>
              <p className="text-muted-foreground">
                Select a video file to compress
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
                data-testid="video-upload-input"
              />
              <label htmlFor="video-upload">
                <Button variant="outline" className="cursor-pointer" data-testid="upload-button">
                  Choose Video File
                </Button>
              </label>
            </div>
          </div>

          {/* Compression Settings */}
          {file && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Minimize2 className="w-8 h-8 text-rose-500" />
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
                      <div className="text-xs">20% smaller</div>
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
                      <div className="text-xs">50% smaller</div>
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
                      <div className="text-xs">70% smaller</div>
                    </button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Estimated output size: <span className="font-medium">{getEstimatedSize()}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCompress}
                  disabled={isCompressing}
                  className="w-full mt-4"
                  data-testid="compress-button"
                >
                  {isCompressing ? "Compressing..." : "Compress Video"}
                  <Download className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <Minimize2 className="w-8 h-8 mx-auto mb-2 text-rose-500" />
              <h4 className="font-medium">Smart Compression</h4>
              <p className="text-sm text-muted-foreground">
                Advanced algorithms for optimal size reduction
              </p>
            </div>
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-medium">Quality Options</h4>
              <p className="text-sm text-muted-foreground">
                Choose the right balance for your needs
              </p>
            </div>
            <div className="text-center p-4">
              <Download className="w-8 h-8 mx-auto mb-2 text-green-500" />
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