import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Scissors, Download } from "lucide-react";

export default function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setProcessedImageUrl("");
    }
  };

  const handleRemoveBackground = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    // Simulate background removal process
    setTimeout(() => {
      setIsProcessing(false);
      // Create a placeholder processed image URL
      setProcessedImageUrl(URL.createObjectURL(file));
      alert("Background removal completed! In a real implementation, this would show the image with background removed.");
    }, 4000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Background Remover</h1>
        <p className="text-muted-foreground">
          Remove image backgrounds with AI-powered technology
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Image</h3>
              <p className="text-muted-foreground">
                Select an image to remove its background
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
                data-testid="image-upload-input"
              />
              <label htmlFor="image-upload">
                <Button variant="outline" className="cursor-pointer" data-testid="upload-button">
                  Choose Image
                </Button>
              </label>
            </div>
          </div>

          {/* Selected File */}
          {file && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Scissors className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleRemoveBackground}
                  disabled={isProcessing}
                  data-testid="remove-bg-button"
                >
                  {isProcessing ? "Processing..." : "Remove Background"}
                  <Scissors className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Image Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Original Image</h4>
                  <div className="border rounded-lg overflow-hidden bg-checkered">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Original"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                </div>
                
                {processedImageUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Background Removed</h4>
                      <Button size="sm" variant="outline" data-testid="download-button">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden bg-checkered">
                      <img
                        src={processedImageUrl}
                        alt="Background Removed"
                        className="w-full h-auto max-h-64 object-contain"
                        data-testid="processed-image"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <Scissors className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-medium">AI-Powered</h4>
              <p className="text-sm text-muted-foreground">
                Advanced AI for precise background removal
              </p>
            </div>
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-medium">High Quality</h4>
              <p className="text-sm text-muted-foreground">
                Maintains image quality and details
              </p>
            </div>
            <div className="text-center p-4">
              <Download className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium">Transparent PNG</h4>
              <p className="text-sm text-muted-foreground">
                Downloads as PNG with transparent background
              </p>
            </div>
          </div>
        </div>
      </Card>

      <style>{`
        .bg-checkered {
          background-image: 
            linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
}