import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, Download, RotateCcw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BarChart from "@/components/charts/bar-chart";

export default function ImageEnhancer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [hue, setHue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (originalImage) {
      applyFilters();
    }
  }, [brightness, contrast, saturation, blur, hue, originalImage]);

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

  const applyFilters = () => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply CSS filters to the canvas context
      ctx.filter = [
        `brightness(${brightness}%)`,
        `contrast(${contrast}%)`,
        `saturate(${saturation}%)`,
        `blur(${blur}px)`,
        `hue-rotate(${hue}deg)`
      ].join(' ');

      ctx.drawImage(img, 0, 0);

      const enhancedDataUrl = canvas.toDataURL('image/png');
      setEnhancedImage(enhancedDataUrl);
      setIsProcessing(false);
    };

    img.src = originalImage;
  };

  const downloadImage = () => {
    if (!enhancedImage) return;

    const link = document.createElement('a');
    link.download = 'enhanced-image.png';
    link.href = enhancedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Enhanced image has been downloaded",
    });
  };

  const reset = () => {
    setSelectedFile(null);
    setOriginalImage(null);
    setEnhancedImage(null);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setHue(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setHue(0);
  };

  const getFilterData = () => {
    return [
      { name: "Brightness", value: brightness, color: "#f59e0b" },
      { name: "Contrast", value: contrast, color: "#3b82f6" },
      { name: "Saturation", value: saturation, color: "#10b981" },
      { name: "Blur", value: blur * 10, color: "#8b5cf6" }, // Scale blur for visibility
      { name: "Hue Shift", value: Math.abs(hue) / 3.6, color: "#ef4444" }, // Convert to percentage
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
                  <Sparkles className="w-8 h-8 mx-auto text-image" />
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

          {/* Filter Controls */}
          {originalImage && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Enhancement Filters</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  data-testid="reset-filters"
                >
                  Reset Filters
                </Button>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  Brightness: {brightness}%
                </Label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full"
                  data-testid="brightness-slider"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  Contrast: {contrast}%
                </Label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full"
                  data-testid="contrast-slider"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  Saturation: {saturation}%
                </Label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                  className="w-full"
                  data-testid="saturation-slider"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  Blur: {blur}px
                </Label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={blur}
                  onChange={(e) => setBlur(parseInt(e.target.value))}
                  className="w-full"
                  data-testid="blur-slider"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  Hue Shift: {hue}°
                </Label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={hue}
                  onChange={(e) => setHue(parseInt(e.target.value))}
                  className="w-full"
                  data-testid="hue-slider"
                />
              </div>
            </div>
          )}

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={reset}
            className="w-full"
            data-testid="reset-enhancer"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>

          {/* Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Enhancement Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Brightness: Makes image lighter or darker</li>
              <li>• Contrast: Increases difference between colors</li>
              <li>• Saturation: Makes colors more vivid</li>
              <li>• Blur: Adds softness to the image</li>
              <li>• Hue: Shifts the color spectrum</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Enhanced Image</Label>
            <Card className="bg-image-background border border-image/20 rounded-xl p-6 text-center min-h-[300px] flex items-center justify-center">
              {enhancedImage ? (
                <img 
                  src={enhancedImage} 
                  alt="Enhanced" 
                  className="max-w-full max-h-80 rounded-lg shadow-md"
                  data-testid="enhanced-image"
                />
              ) : (
                <div className="text-muted-foreground">
                  {isProcessing ? "Processing..." : "Enhanced image will appear here"}
                </div>
              )}
            </Card>
          </div>

          {/* Enhancement Comparison Chart */}
          {originalImage && (
            <div>
              <Label className="block text-sm font-medium mb-2">Filter Values</Label>
              <Card className="p-4 bg-muted/30 rounded-xl">
                <BarChart
                  data={getFilterData()}
                  title="Applied Enhancements"
                  valueFormatter={(value) => `${value.toFixed(1)}${value > 100 ? '%' : value < 10 ? 'px' : value < 50 ? '°' : '%'}`}
                  height={200}
                />
              </Card>
            </div>
          )}

          {/* Download Button */}
          {enhancedImage && (
            <Button
              onClick={downloadImage}
              className="w-full bg-image hover:bg-image/90 text-white py-3 text-lg font-medium"
              data-testid="download-enhanced"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Enhanced Image
            </Button>
          )}
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}