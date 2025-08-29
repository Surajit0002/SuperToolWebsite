import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Copy, Crop, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageCropper() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("free");
  const [cropX, setCropX] = useState("0");
  const [cropY, setCropY] = useState("0");
  const [cropWidth, setCropWidth] = useState("");
  const [cropHeight, setCropHeight] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [selectionRect, setSelectionRect] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const aspectRatios = [
    { value: "free", label: "Free form" },
    { value: "1:1", label: "Square (1:1)" },
    { value: "4:3", label: "Standard (4:3)" },
    { value: "3:4", label: "Portrait (3:4)" },
    { value: "16:9", label: "Widescreen (16:9)" },
    { value: "9:16", label: "Vertical video (9:16)" },
    { value: "3:2", label: "Photo (3:2)" },
    { value: "2:3", label: "Portrait photo (2:3)" },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setCropWidth(Math.floor(img.width * 0.8).toString());
        setCropHeight(Math.floor(img.height * 0.8).toString());
        setCropX(Math.floor(img.width * 0.1).toString());
        setCropY(Math.floor(img.height * 0.1).toString());
      };
      img.src = e.target?.result as string;
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getAspectRatio = () => {
    if (aspectRatio === "free") return null;
    const [w, h] = aspectRatio.split(':').map(Number);
    return w / h;
  };

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value);
    
    if (value !== "free" && originalDimensions && cropWidth) {
      const ratio = getAspectRatio();
      if (ratio) {
        const newHeight = Math.round(parseInt(cropWidth) / ratio);
        setCropHeight(newHeight.toString());
      }
    }
  };

  const handleWidthChange = (value: string) => {
    setCropWidth(value);
    
    const ratio = getAspectRatio();
    if (ratio && value) {
      const newHeight = Math.round(parseInt(value) / ratio);
      setCropHeight(newHeight.toString());
    }
  };

  const handleHeightChange = (value: string) => {
    setCropHeight(value);
    
    const ratio = getAspectRatio();
    if (ratio && value) {
      const newWidth = Math.round(parseInt(value) * ratio);
      setCropWidth(newWidth.toString());
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!originalDimensions) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = originalDimensions.width / canvas.width;
    const scaleY = originalDimensions.height / canvas.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionRect({ x, y, width: 0, height: 0 });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !selectionStart || !originalDimensions) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = originalDimensions.width / canvas.width;
    const scaleY = originalDimensions.height / canvas.height;
    
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;
    
    let width = currentX - selectionStart.x;
    let height = currentY - selectionStart.y;
    
    const ratio = getAspectRatio();
    if (ratio) {
      // Maintain aspect ratio
      const ratioHeight = Math.abs(width) / ratio;
      height = width < 0 ? -ratioHeight : ratioHeight;
    }
    
    setSelectionRect({
      x: width < 0 ? selectionStart.x + width : selectionStart.x,
      y: height < 0 ? selectionStart.y + height : selectionStart.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleCanvasMouseUp = () => {
    if (selectionRect && selectionRect.width > 10 && selectionRect.height > 10) {
      setCropX(Math.round(selectionRect.x).toString());
      setCropY(Math.round(selectionRect.y).toString());
      setCropWidth(Math.round(selectionRect.width).toString());
      setCropHeight(Math.round(selectionRect.height).toString());
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
  };

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img || !originalDimensions) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const maxSize = 400;
    const scale = Math.min(maxSize / originalDimensions.width, maxSize / originalDimensions.height);
    canvas.width = originalDimensions.width * scale;
    canvas.height = originalDimensions.height * scale;
    
    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Draw crop overlay
    if (cropX && cropY && cropWidth && cropHeight) {
      const x = parseInt(cropX) * scale;
      const y = parseInt(cropY) * scale;
      const w = parseInt(cropWidth) * scale;
      const h = parseInt(cropHeight) * scale;
      
      // Darken outside crop area
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, y); // Top
      ctx.fillRect(0, y, x, h); // Left
      ctx.fillRect(x + w, y, canvas.width - (x + w), h); // Right
      ctx.fillRect(0, y + h, canvas.width, canvas.height - (y + h)); // Bottom
      
      // Draw crop rectangle
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      
      // Draw resize handles
      const handleSize = 8;
      ctx.fillStyle = '#4F46E5';
      ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
      ctx.fillRect(x + w - handleSize/2, y - handleSize/2, handleSize, handleSize);
      ctx.fillRect(x - handleSize/2, y + h - handleSize/2, handleSize, handleSize);
      ctx.fillRect(x + w - handleSize/2, y + h - handleSize/2, handleSize, handleSize);
    }
    
    // Draw current selection
    if (selectionRect) {
      const x = selectionRect.x * scale;
      const y = selectionRect.y * scale;
      const w = selectionRect.width * scale;
      const h = selectionRect.height * scale;
      
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }
  }, [cropX, cropY, cropWidth, cropHeight, selectionRect, originalDimensions]);

  const cropImage = async () => {
    if (!selectedFile || !cropWidth || !cropHeight || !cropX || !cropY) {
      toast({
        title: "Error",
        description: "Please select crop area",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const x = parseInt(cropX);
        const y = parseInt(cropY);
        const w = parseInt(cropWidth);
        const h = parseInt(cropHeight);

        // Validate crop bounds
        if (x < 0 || y < 0 || x + w > img.width || y + h > img.height) {
          toast({
            title: "Error",
            description: "Crop area is outside image bounds",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        canvas.width = w;
        canvas.height = h;

        setProgress(50);

        // Draw cropped portion
        ctx?.drawImage(img, x, y, w, h, 0, 0, w, h);

        setProgress(80);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setResultImage(url);
            setProgress(100);
            
            toast({
              title: "Success!",
              description: "Image cropped successfully",
            });
          }
          setIsProcessing(false);
        }, 'image/png');
      };

      img.src = preview!;
    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      toast({
        title: "Error",
        description: "Failed to crop image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadResult = () => {
    if (resultImage) {
      const a = document.createElement('a');
      a.href = resultImage;
      a.download = `cropped-${selectedFile?.name?.split('.')[0] || 'image'}.png`;
      a.click();

      toast({
        title: "Downloaded!",
        description: "Cropped image downloaded successfully",
      });
    }
  };

  const resetCrop = () => {
    if (originalDimensions) {
      setCropWidth(Math.floor(originalDimensions.width * 0.8).toString());
      setCropHeight(Math.floor(originalDimensions.height * 0.8).toString());
      setCropX(Math.floor(originalDimensions.width * 0.1).toString());
      setCropY(Math.floor(originalDimensions.height * 0.1).toString());
      setAspectRatio("free");
    }
  };

  // Update preview when crop values change
  React.useEffect(() => {
    if (preview) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        drawPreview();
      };
      img.src = preview;
    }
  }, [preview, drawPreview]);

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
              {preview ? (
                <div className="space-y-2">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full mx-auto rounded border cursor-crosshair"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    data-testid="crop-canvas"
                  />
                  <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                  {originalDimensions && (
                    <p className="text-xs text-muted-foreground">
                      {originalDimensions.width} × {originalDimensions.height} pixels
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports: JPG, PNG, GIF, WebP (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Crop Settings */}
          {selectedFile && (
            <>
              <div>
                <Label className="block text-sm font-medium mb-2">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
                  <SelectTrigger data-testid="aspect-ratio-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map((ratio) => (
                      <SelectItem key={ratio.value} value={ratio.value}>
                        {ratio.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Crop Position & Size</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cropX" className="text-sm">X Position</Label>
                    <Input
                      id="cropX"
                      type="number"
                      value={cropX}
                      onChange={(e) => setCropX(e.target.value)}
                      min="0"
                      max={originalDimensions?.width || 0}
                      data-testid="crop-x-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cropY" className="text-sm">Y Position</Label>
                    <Input
                      id="cropY"
                      type="number"
                      value={cropY}
                      onChange={(e) => setCropY(e.target.value)}
                      min="0"
                      max={originalDimensions?.height || 0}
                      data-testid="crop-y-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cropWidth" className="text-sm">Width</Label>
                    <Input
                      id="cropWidth"
                      type="number"
                      value={cropWidth}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      min="1"
                      max={originalDimensions?.width || 0}
                      data-testid="crop-width-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cropHeight" className="text-sm">Height</Label>
                    <Input
                      id="cropHeight"
                      type="number"
                      value={cropHeight}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      min="1"
                      max={originalDimensions?.height || 0}
                      data-testid="crop-height-input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={cropImage}
                  disabled={isProcessing || !cropWidth || !cropHeight}
                  className="flex-1 bg-image hover:bg-image/90 text-white py-3 text-lg font-medium"
                  data-testid="crop-image-button"
                >
                  <Crop className="w-5 h-5 mr-2" />
                  {isProcessing ? "Cropping..." : "Crop Image"}
                </Button>
                <Button
                  onClick={resetCrop}
                  variant="outline"
                  disabled={isProcessing}
                  data-testid="reset-crop-button"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    Processing... {progress}%
                  </p>
                </div>
              )}
            </>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">How to Use</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>1. Upload an image</div>
              <div>2. Click and drag on preview to select crop area</div>
              <div>3. Adjust position and size manually if needed</div>
              <div>4. Choose aspect ratio for consistent dimensions</div>
              <div>5. Click "Crop Image" to process</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Cropped Image</Label>
            <Card className="bg-image-background border border-image/20 rounded-xl p-6 text-center min-h-[300px] flex items-center justify-center">
              {resultImage ? (
                <div className="space-y-4 w-full">
                  <img 
                    src={resultImage} 
                    alt="Cropped" 
                    className="max-w-full max-h-64 mx-auto rounded border"
                    data-testid="cropped-image"
                  />
                  <div className="text-sm text-image-foreground">
                    Cropped to {cropWidth} × {cropHeight} pixels
                  </div>
                </div>
              ) : (
                <div className="text-image-foreground/70">
                  Cropped image will appear here
                </div>
              )}
            </Card>
          </div>

          {resultImage && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={downloadResult}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-image/10 hover:bg-image/20 border border-image/20 text-image rounded-xl font-medium"
                  data-testid="download-cropped"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (resultImage) {
                      navigator.clipboard.writeText(resultImage);
                      toast({ title: "Copied!", description: "Image URL copied to clipboard" });
                    }
                  }}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
                  data-testid="copy-cropped"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy URL</span>
                </Button>
              </div>

              <div>
                <h3 className="font-medium mb-3">Crop Details</h3>
                <div className="space-y-3">
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Original Size</div>
                    <div className="text-sm text-muted-foreground">
                      {originalDimensions ? `${originalDimensions.width} × ${originalDimensions.height}` : 'N/A'}
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Cropped Size</div>
                    <div className="text-sm text-muted-foreground">
                      {cropWidth} × {cropHeight} pixels
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Crop Position</div>
                    <div className="text-sm text-muted-foreground">
                      X: {cropX}, Y: {cropY}
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Aspect Ratio</div>
                    <div className="text-sm text-muted-foreground">
                      {aspectRatio === "free" ? "Free form" : aspectRatio}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
