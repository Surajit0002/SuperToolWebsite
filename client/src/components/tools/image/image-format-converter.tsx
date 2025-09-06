import { useState, useRef } from "react";
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
import { Upload, Download, RotateCcw, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageFormatConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpg" | "webp">("png");
  const [quality, setQuality] = useState<number>(90);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
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

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "Error",
          description: "Image size must be less than 50MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setConvertedImage(null);
    }
  };

  const convertImage = async () => {
    if (!selectedFile || !canvasRef.current) return;

    setIsConverting(true);

    try {
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const mimeType = `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`;
        const qualityValue = outputFormat === 'png' ? 1 : quality / 100;

        const convertedDataUrl = canvas.toDataURL(mimeType, qualityValue);
        setConvertedImage(convertedDataUrl);

        toast({
          title: "Success!",
          description: `Image converted to ${outputFormat.toUpperCase()}`,
        });

        setIsConverting(false);
      };

      img.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load image",
          variant: "destructive",
        });
        setIsConverting(false);
      };

      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert image",
        variant: "destructive",
      });
      setIsConverting(false);
    }
  };

  const downloadImage = () => {
    if (!convertedImage) return;

    const link = document.createElement('a');
    link.download = `converted-image.${outputFormat}`;
    link.href = convertedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Converted image has been downloaded",
    });
  };

  const reset = () => {
    setSelectedFile(null);
    setConvertedImage(null);
    setIsConverting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileSizeString = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
                  <Image className="w-8 h-8 mx-auto text-image" />
                  <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Size: {getFileSizeString(selectedFile.size)}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WebP, GIF (max 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Output Format */}
          <div>
            <Label className="block text-sm font-medium mb-2">Output Format</Label>
            <Select value={outputFormat} onValueChange={(value: any) => setOutputFormat(value)}>
              <SelectTrigger data-testid="output-format-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (Lossless)</SelectItem>
                <SelectItem value="jpg">JPG (Smaller size)</SelectItem>
                <SelectItem value="webp">WebP (Modern format)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Slider (for JPG/WebP) */}
          {outputFormat !== 'png' && (
            <div>
              <Label className="block text-sm font-medium mb-2">
                Quality: {quality}%
              </Label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                data-testid="quality-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Lower size</span>
                <span>Higher quality</span>
              </div>
            </div>
          )}

          {/* Convert Button */}
          <Button
            onClick={convertImage}
            disabled={!selectedFile || isConverting}
            className="w-full bg-image hover:bg-image/90 text-white py-3 text-lg font-medium"
            data-testid="convert-image"
          >
            <Image className="w-5 h-5 mr-2" />
            {isConverting ? "Converting..." : "Convert Image"}
          </Button>

          {/* Reset Button */}
          {selectedFile && (
            <Button
              variant="outline"
              onClick={reset}
              className="w-full"
              data-testid="reset-converter"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}

          {/* Format Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Format Guide</h3>
            <div className="space-y-1 text-sm text-blue-700">
              <div><strong>PNG:</strong> Best for images with transparency</div>
              <div><strong>JPG:</strong> Best for photos, smaller file size</div>
              <div><strong>WebP:</strong> Modern format, excellent compression</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Converted Image</Label>
            <Card className="bg-image-background border border-image/20 rounded-xl p-6 text-center min-h-[200px] flex items-center justify-center">
              {convertedImage ? (
                <div className="space-y-4 w-full">
                  <img 
                    src={convertedImage} 
                    alt="Converted" 
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                    data-testid="converted-image"
                  />
                  <div className="text-sm text-image/70">
                    Format: {outputFormat.toUpperCase()}
                    {outputFormat !== 'png' && ` • Quality: ${quality}%`}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  {isConverting ? "Converting image..." : "Converted image will appear here"}
                </div>
              )}
            </Card>
          </div>

          {/* Download Button */}
          {convertedImage && (
            <Button
              onClick={downloadImage}
              className="w-full bg-image hover:bg-image/90 text-white py-3 text-lg font-medium"
              data-testid="download-converted"
            >
              <Download className="w-5 h-5 mr-2" />
              Download {outputFormat.toUpperCase()}
            </Button>
          )}
        </div>
      </div>

      {/* Hidden canvas for conversion */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}