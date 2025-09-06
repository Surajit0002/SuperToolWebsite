import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Download, RotateCcw, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageWatermarkTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState("WATERMARK");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.5);
  const [position, setPosition] = useState<"center" | "top-left" | "top-right" | "bottom-left" | "bottom-right">("center");
  const [color, setColor] = useState("#ffffff");
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
    }
  };

  const applyWatermark = () => {
    if (!originalImage || !canvasRef.current || !watermarkText.trim()) return;

    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Set watermark properties
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Calculate position
      let x: number, y: number;
      const margin = 50;

      switch (position) {
        case 'top-left':
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          x = margin;
          y = margin;
          break;
        case 'top-right':
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          x = canvas.width - margin;
          y = margin;
          break;
        case 'bottom-left':
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          x = margin;
          y = canvas.height - margin;
          break;
        case 'bottom-right':
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          x = canvas.width - margin;
          y = canvas.height - margin;
          break;
        default: // center
          x = canvas.width / 2;
          y = canvas.height / 2;
      }

      // Add text outline for better visibility
      ctx.strokeStyle = color === '#ffffff' ? '#000000' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeText(watermarkText, x, y);
      ctx.fillText(watermarkText, x, y);

      const watermarkedDataUrl = canvas.toDataURL('image/png');
      setWatermarkedImage(watermarkedDataUrl);
      setIsProcessing(false);

      toast({
        title: "Success!",
        description: "Watermark applied to image",
      });
    };

    img.src = originalImage;
  };

  const downloadImage = () => {
    if (!watermarkedImage) return;

    const link = document.createElement('a');
    link.download = 'watermarked-image.png';
    link.href = watermarkedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Watermarked image has been downloaded",
    });
  };

  const reset = () => {
    setSelectedFile(null);
    setOriginalImage(null);
    setWatermarkedImage(null);
    setWatermarkText("WATERMARK");
    setFontSize(48);
    setOpacity(0.5);
    setPosition("center");
    setColor("#ffffff");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                  <Shield className="w-8 h-8 mx-auto text-image" />
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

          {/* Watermark Text */}
          <div>
            <Label htmlFor="watermarkText" className="block text-sm font-medium mb-2">
              Watermark Text
            </Label>
            <Input
              id="watermarkText"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="Enter watermark text"
              className="text-lg"
              data-testid="watermark-text-input"
            />
          </div>

          {/* Watermark Settings */}
          {originalImage && (
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Position</Label>
                <Select value={position} onValueChange={(value: any) => setPosition(value)}>
                  <SelectTrigger data-testid="position-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  Font Size: {fontSize}px
                </Label>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full"
                  data-testid="font-size-slider"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  Opacity: {Math.round(opacity * 100)}%
                </Label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full"
                  data-testid="opacity-slider"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Text Color</Label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-10 rounded border border-border"
                    data-testid="color-picker"
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setColor("#ffffff")}
                      className="px-3 py-1"
                      data-testid="white-color"
                    >
                      White
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setColor("#000000")}
                      className="px-3 py-1"
                      data-testid="black-color"
                    >
                      Black
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Apply Watermark Button */}
          <Button
            onClick={applyWatermark}
            disabled={!originalImage || !watermarkText.trim() || isProcessing}
            className="w-full bg-image hover:bg-image/90 text-white py-3 text-lg font-medium"
            data-testid="apply-watermark"
          >
            <Shield className="w-5 h-5 mr-2" />
            {isProcessing ? "Applying..." : "Apply Watermark"}
          </Button>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={reset}
            className="w-full"
            data-testid="reset-watermark"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          {/* Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Watermark Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use lower opacity for subtle watermarks</li>
              <li>• Choose contrasting colors for visibility</li>
              <li>• Corner positions work well for branding</li>
              <li>• Center position for copyright protection</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Watermarked Image</Label>
            <Card className="bg-image-background border border-image/20 rounded-xl p-6 text-center min-h-[400px] flex items-center justify-center">
              {watermarkedImage ? (
                <img 
                  src={watermarkedImage} 
                  alt="Watermarked" 
                  className="max-w-full max-h-96 rounded-lg shadow-md"
                  data-testid="watermarked-image"
                />
              ) : originalImage ? (
                <img 
                  src={originalImage} 
                  alt="Original Preview" 
                  className="max-w-full max-h-96 rounded-lg shadow-md opacity-50"
                  data-testid="original-preview"
                />
              ) : (
                <div className="text-muted-foreground">
                  {isProcessing ? "Applying watermark..." : "Watermarked image will appear here"}
                </div>
              )}
            </Card>
          </div>

          {/* Download Button */}
          {watermarkedImage && (
            <Button
              onClick={downloadImage}
              className="w-full bg-image hover:bg-image/90 text-white py-3 text-lg font-medium"
              data-testid="download-watermarked"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Watermarked Image
            </Button>
          )}

          {/* Preview Settings */}
          {originalImage && !watermarkedImage && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">Preview Settings</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Text: "{watermarkText}"</div>
                <div>Position: {position.replace('-', ' ')}</div>
                <div>Size: {fontSize}px</div>
                <div>Opacity: {Math.round(opacity * 100)}%</div>
                <div>Color: {color}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for watermarking */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}