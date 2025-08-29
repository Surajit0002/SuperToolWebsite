import { useState, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Copy, Share2, Maximize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageResizer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [resizeMode, setResizeMode] = useState<"cover" | "contain" | "fill">("contain");
  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [quality, setQuality] = useState("80");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        setWidth(img.width.toString());
        setHeight(img.height.toString());
      };
      img.src = e.target?.result as string;
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (value: string) => {
    setWidth(value);
    if (maintainAspect && originalDimensions && value) {
      const aspectRatio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(parseInt(value) * aspectRatio).toString());
    }
  };

  const handleHeightChange = (value: string) => {
    setHeight(value);
    if (maintainAspect && originalDimensions && value) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(parseInt(value) * aspectRatio).toString());
    }
  };

  const resizeImage = async () => {
    if (!selectedFile || !width || !height) {
      toast({
        title: "Error",
        description: "Please select an image and specify dimensions",
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
        const targetWidth = parseInt(width);
        const targetHeight = parseInt(height);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        setProgress(50);

        // Clear canvas
        ctx?.clearRect(0, 0, targetWidth, targetHeight);

        // Calculate dimensions based on resize mode
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        let dx = 0, dy = 0, dw = targetWidth, dh = targetHeight;

        if (resizeMode === 'cover') {
          const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          dx = (targetWidth - scaledWidth) / 2;
          dy = (targetHeight - scaledHeight) / 2;
          dw = scaledWidth;
          dh = scaledHeight;
        } else if (resizeMode === 'contain') {
          const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          dx = (targetWidth - scaledWidth) / 2;
          dy = (targetHeight - scaledHeight) / 2;
          dw = scaledWidth;
          dh = scaledHeight;
        }

        // Draw image
        ctx?.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

        setProgress(80);

        // Convert to desired format
        const mimeType = `image/${format}`;
        const qualityValue = format === 'png' ? undefined : parseInt(quality) / 100;
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setResultImage(url);
            setProgress(100);
            
            toast({
              title: "Success!",
              description: "Image resized successfully",
            });
          }
          setIsProcessing(false);
        }, mimeType, qualityValue);
      };

      img.src = preview!;
    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      toast({
        title: "Error",
        description: "Failed to resize image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadResult = () => {
    if (resultImage) {
      const a = document.createElement('a');
      a.href = resultImage;
      a.download = `resized-${selectedFile?.name?.split('.')[0] || 'image'}.${format}`;
      a.click();

      toast({
        title: "Downloaded!",
        description: "Resized image downloaded successfully",
      });
    }
  };

  const copyToClipboard = async () => {
    if (resultImage) {
      try {
        const response = await fetch(resultImage);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        
        toast({
          title: "Copied!",
          description: "Image copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy image to clipboard",
          variant: "destructive",
        });
      }
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
              {preview ? (
                <div className="space-y-2">
                  <img src={preview} alt="Preview" className="max-w-full max-h-32 mx-auto rounded" />
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

          {/* Dimensions */}
          {selectedFile && (
            <>
              <div>
                <Label className="block text-sm font-medium mb-2">Dimensions</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width" className="text-sm">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      placeholder="Width"
                      data-testid="width-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-sm">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      placeholder="Height"
                      data-testid="height-input"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="maintainAspect"
                    checked={maintainAspect}
                    onCheckedChange={setMaintainAspect}
                    data-testid="maintain-aspect-checkbox"
                  />
                  <Label htmlFor="maintainAspect" className="text-sm">
                    Maintain aspect ratio
                  </Label>
                </div>
              </div>

              {/* Resize Mode */}
              <div>
                <Label className="block text-sm font-medium mb-2">Resize Mode</Label>
                <Select value={resizeMode} onValueChange={(value: any) => setResizeMode(value)}>
                  <SelectTrigger data-testid="resize-mode-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contain">Contain (fit inside)</SelectItem>
                    <SelectItem value="cover">Cover (fill area)</SelectItem>
                    <SelectItem value="fill">Fill (stretch to fit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Output Format */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium mb-2">Format</Label>
                  <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                    <SelectTrigger data-testid="format-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {format !== 'png' && (
                  <div>
                    <Label className="block text-sm font-medium mb-2">Quality (%)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      data-testid="quality-input"
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={resizeImage}
                disabled={isProcessing || !width || !height}
                className="w-full bg-image hover:bg-image/90 text-white py-3 text-lg font-medium"
                data-testid="resize-image-button"
              >
                <Maximize className="w-5 h-5 mr-2" />
                {isProcessing ? "Resizing..." : "Resize Image"}
              </Button>

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
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Resized Image</Label>
            <Card className="bg-image-background border border-image/20 rounded-xl p-6 text-center min-h-[300px] flex items-center justify-center">
              {resultImage ? (
                <div className="space-y-4 w-full">
                  <img 
                    src={resultImage} 
                    alt="Resized" 
                    className="max-w-full max-h-64 mx-auto rounded border"
                    data-testid="resized-image"
                  />
                  <div className="text-sm text-image-foreground">
                    Resized to {width} × {height} pixels
                  </div>
                </div>
              ) : (
                <div className="text-image-foreground/70">
                  Resized image will appear here
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
                  data-testid="download-resized"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
                  data-testid="copy-resized"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </Button>
              </div>

              <div>
                <h3 className="font-medium mb-3">Image Details</h3>
                <div className="space-y-3">
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Original Size</div>
                    <div className="text-sm text-muted-foreground">
                      {originalDimensions ? `${originalDimensions.width} × ${originalDimensions.height}` : 'N/A'}
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">New Size</div>
                    <div className="text-sm text-muted-foreground">
                      {width} × {height} pixels
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Format</div>
                    <div className="text-sm text-muted-foreground">
                      {format.toUpperCase()} {format !== 'png' && `(${quality}% quality)`}
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Resize Mode</div>
                    <div className="text-sm text-muted-foreground">
                      {resizeMode.charAt(0).toUpperCase() + resizeMode.slice(1)}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Resize Modes</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Contain:</strong> Fit entire image inside dimensions</div>
              <div><strong>Cover:</strong> Fill entire area, may crop image</div>
              <div><strong>Fill:</strong> Stretch image to exact dimensions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
