import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, Download, RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageRotatorFlipper() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setOriginalImage(url);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    }
  };

  const applyTransformations = () => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      // Calculate canvas size based on rotation
      const rotRad = (rotation * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rotRad));
      const sin = Math.abs(Math.sin(rotRad));
      
      const newWidth = img.width * cos + img.height * sin;
      const newHeight = img.width * sin + img.height * cos;
      
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Save the context state
      ctx.save();

      // Move to center of canvas
      ctx.translate(newWidth / 2, newHeight / 2);

      // Apply rotation
      ctx.rotate(rotRad);

      // Apply flipping
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Draw image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Restore context
      ctx.restore();

      const processedDataUrl = canvas.toDataURL('image/png');
      setProcessedImage(processedDataUrl);
      setIsProcessing(false);
    };

    img.src = originalImage;
  };

  const rotate = (degrees: number) => {
    setRotation(prev => (prev + degrees) % 360);
  };

  const flipHorizontal = () => {
    setFlipH(prev => !prev);
  };

  const flipVertical = () => {
    setFlipV(prev => !prev);
  };

  const downloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.download = 'rotated-flipped-image.png';
    link.href = processedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Transformed image has been downloaded",
    });
  };

  const reset = () => {
    setSelectedFile(null);
    setOriginalImage(null);
    setProcessedImage(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Apply transformations whenever settings change
  useEffect(() => {
    if (originalImage) {
      applyTransformations();
    }
  }, [rotation, flipH, flipV, originalImage]);

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label className="block text-sm font-medium mb-2">Upload Image</Label>
            <div 
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-image transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-testid="image-upload-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="image-file-input"
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <RotateCw className="w-8 h-8 mx-auto text-image" />
                  <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Any image format
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Original Image Preview */}
          {originalImage && (
            <div>
              <Label className="block text-sm font-medium mb-2">Original</Label>
              <img 
                src={originalImage} 
                alt="Original" 
                className="w-full max-h-40 object-contain rounded-lg border border-border"
                data-testid="original-image"
              />
            </div>
          )}

          {/* Transformation Controls */}
          {originalImage && (
            <div className="space-y-6">
              {/* Rotation Controls */}
              <div>
                <Label className="block text-sm font-medium mb-3">Rotation</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => rotate(-90)}
                    className="flex items-center justify-center"
                    data-testid="rotate-left"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    90° Left
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => rotate(90)}
                    className="flex items-center justify-center"
                    data-testid="rotate-right"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    90° Right
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => rotate(180)}
                    className="col-span-2"
                    data-testid="rotate-180"
                  >
                    180° Flip
                  </Button>
                </div>
                
                {/* Custom Rotation */}
                <div className="mt-4">
                  <Label className="block text-sm font-medium mb-2">
                    Custom Rotation: {rotation}°
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full"
                    data-testid="rotation-slider"
                  />
                </div>
              </div>

              {/* Flip Controls */}
              <div>
                <Label className="block text-sm font-medium mb-3">Flip</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={flipH ? "default" : "outline"}
                    onClick={flipHorizontal}
                    className="flex items-center justify-center"
                    data-testid="flip-horizontal"
                  >
                    <FlipHorizontal className="w-4 h-4 mr-2" />
                    Horizontal
                  </Button>
                  <Button
                    variant={flipV ? "default" : "outline"}
                    onClick={flipVertical}
                    className="flex items-center justify-center"
                    data-testid="flip-vertical"
                  >
                    <FlipVertical className="w-4 h-4 mr-2" />
                    Vertical
                  </Button>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <Label className="block text-sm font-medium mb-3">Quick Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setRotation(0); setFlipH(false); setFlipV(false); }}
                    data-testid="preset-original"
                  >
                    Original
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setRotation(90); setFlipH(false); setFlipV(false); }}
                    data-testid="preset-portrait"
                  >
                    Portrait
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setRotation(0); setFlipH(true); setFlipV(false); }}
                    data-testid="preset-mirror"
                  >
                    Mirror
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setRotation(180); setFlipH(false); setFlipV(false); }}
                    data-testid="preset-upside-down"
                  >
                    Upside Down
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={reset}
            className="w-full"
            data-testid="reset-rotator"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>

          {/* Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Transform Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use 90° rotations for orientation fixes</li>
              <li>• Combine rotation and flipping for any angle</li>
              <li>• Custom slider for precise rotation</li>
              <li>• Presets for common transformations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Transformed Image</Label>
            <Card className="bg-image-background border border-image/20 rounded-xl p-6 text-center min-h-[400px] flex items-center justify-center">
              {processedImage ? (
                <img 
                  src={processedImage} 
                  alt="Transformed" 
                  className="max-w-full max-h-96 rounded-lg shadow-md"
                  data-testid="transformed-image"
                />
              ) : (
                <div className="text-muted-foreground">
                  {isProcessing ? "Processing..." : "Transformed image will appear here"}
                </div>
              )}
            </Card>
          </div>

          {/* Transformation Summary */}
          {originalImage && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">Applied Transformations</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Rotation:</span>
                  <span className="font-medium">{rotation}°</span>
                </div>
                <div className="flex justify-between">
                  <span>Horizontal Flip:</span>
                  <span className="font-medium">{flipH ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vertical Flip:</span>
                  <span className="font-medium">{flipV ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Download Button */}
          {processedImage && (
            <Button
              onClick={downloadImage}
              className="w-full bg-image hover:bg-image/90 text-white py-3 text-lg font-medium"
              data-testid="download-transformed"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Transformed Image
            </Button>
          )}
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}