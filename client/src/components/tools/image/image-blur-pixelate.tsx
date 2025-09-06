import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Download, RotateCcw, Focus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BarChart from "@/components/charts/bar-chart";

export default function ImageBlurPixelate() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [effectType, setEffectType] = useState<"blur" | "pixelate">("blur");
  const [intensity, setIntensity] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (originalImage) {
      applyEffect();
    }
  }, [effectType, intensity, originalImage]);

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
    }
  };

  const applyEffect = () => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (effectType === "blur") {
        // Apply blur effect
        ctx.filter = `blur(${intensity}px)`;
        ctx.drawImage(img, 0, 0);
      } else {
        // Apply pixelate effect
        ctx.filter = 'none';
        const pixelSize = intensity;
        
        // Draw image at reduced size
        const smallWidth = Math.floor(img.width / pixelSize);
        const smallHeight = Math.floor(img.height / pixelSize);
        
        ctx.drawImage(img, 0, 0, smallWidth, smallHeight);
        
        // Disable image smoothing for pixelated effect
        ctx.imageSmoothingEnabled = false;
        
        // Scale back up
        ctx.drawImage(canvas, 0, 0, smallWidth, smallHeight, 0, 0, img.width, img.height);
      }

      const processedDataUrl = canvas.toDataURL('image/png');
      setProcessedImage(processedDataUrl);
      setIsProcessing(false);
    };

    img.src = originalImage;
  };

  const downloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.download = `${effectType}-image.png`;
    link.href = processedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: `${effectType === 'blur' ? 'Blurred' : 'Pixelated'} image has been downloaded`,
    });
  };

  const reset = () => {
    setSelectedFile(null);
    setOriginalImage(null);
    setProcessedImage(null);
    setIntensity(5);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getIntensityData = () => {
    const maxIntensity = effectType === "blur" ? 20 : 50;
    const percentage = (intensity / maxIntensity) * 100;
    
    return [
      { name: "Current", value: percentage, color: "#3b82f6" },
      { name: "Remaining", value: 100 - percentage, color: "#e5e7eb" }
    ];
  };

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
                  <Focus className="w-8 h-8 mx-auto text-image" />
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

          {/* Effect Type */}
          <div>
            <Label className="block text-sm font-medium mb-2">Effect Type</Label>
            <Select value={effectType} onValueChange={(value: any) => setEffectType(value)}>
              <SelectTrigger data-testid="effect-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blur">Blur Effect</SelectItem>
                <SelectItem value="pixelate">Pixelate Effect</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {effectType === "blur" ? "Softens the image" : "Creates retro pixel art effect"}
            </p>
          </div>

          {/* Intensity Control */}
          {originalImage && (
            <div>
              <Label className="block text-sm font-medium mb-2">
                {effectType === "blur" ? "Blur" : "Pixel"} Intensity: {intensity}{effectType === "blur" ? "px" : ""}
              </Label>
              <input
                type="range"
                min="1"
                max={effectType === "blur" ? 20 : 50}
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full"
                data-testid="intensity-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Light</span>
                <span>Heavy</span>
              </div>
            </div>
          )}

          {/* Preset Buttons */}
          {originalImage && (
            <div>
              <Label className="block text-sm font-medium mb-2">Quick Presets</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIntensity(effectType === "blur" ? 2 : 5)}
                  data-testid="preset-light"
                >
                  Light
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIntensity(effectType === "blur" ? 8 : 15)}
                  data-testid="preset-medium"
                >
                  Medium
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIntensity(effectType === "blur" ? 15 : 30)}
                  data-testid="preset-heavy"
                >
                  Heavy
                </Button>
              </div>
            </div>
          )}

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={reset}
            className="w-full"
            data-testid="reset-blur-pixelate"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          {/* Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Effect Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Blur:</strong> Great for backgrounds or privacy</li>
              <li>• <strong>Pixelate:</strong> Perfect for retro/gaming aesthetics</li>
              <li>• Higher intensity = stronger effect</li>
              <li>• Use presets for quick common settings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">
              {effectType === "blur" ? "Blurred" : "Pixelated"} Image
            </Label>
            <Card className="bg-image-background border border-image/20 rounded-xl p-6 text-center min-h-[300px] flex items-center justify-center">
              {processedImage ? (
                <img 
                  src={processedImage} 
                  alt="Processed" 
                  className="max-w-full max-h-80 rounded-lg shadow-md"
                  data-testid="processed-image"
                />
              ) : (
                <div className="text-muted-foreground">
                  {isProcessing ? "Processing..." : `${effectType === "blur" ? "Blurred" : "Pixelated"} image will appear here`}
                </div>
              )}
            </Card>
          </div>

          {/* Effect Intensity Chart */}
          {originalImage && (
            <div>
              <Label className="block text-sm font-medium mb-2">Effect Intensity</Label>
              <Card className="p-4 bg-muted/30 rounded-xl">
                <BarChart
                  data={getIntensityData()}
                  title={`${effectType === "blur" ? "Blur" : "Pixelate"} Level`}
                  valueFormatter={(value) => `${value.toFixed(1)}%`}
                  height={150}
                />
              </Card>
            </div>
          )}

          {/* Download Button */}
          {processedImage && (
            <Button
              onClick={downloadImage}
              className="w-full bg-image hover:bg-image/90 text-white py-3 text-lg font-medium"
              data-testid="download-processed"
            >
              <Download className="w-5 h-5 mr-2" />
              Download {effectType === "blur" ? "Blurred" : "Pixelated"} Image
            </Button>
          )}
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}