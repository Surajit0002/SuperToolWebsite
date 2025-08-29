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
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Copy, Share2, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageCompressor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressionMode, setCompressionMode] = useState<"quality" | "size">("quality");
  const [quality, setQuality] = useState([80]);
  const [targetSize, setTargetSize] = useState("");
  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      toast({
        title: "Error",
        description: "File size must be less than 20MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setOriginalSize(file.size);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    if (compressionMode === "size" && (!targetSize || parseInt(targetSize) <= 0)) {
      toast({
        title: "Error",
        description: "Please enter a valid target size",
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

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        setProgress(30);

        let currentQuality = compressionMode === "quality" ? quality[0] / 100 : 0.8;
        let attempts = 0;
        const maxAttempts = 10;

        const compress = async (qualityValue: number): Promise<Blob | null> => {
          return new Promise((resolve) => {
            canvas.toBlob(resolve, `image/${format}`, qualityValue);
          });
        };

        if (compressionMode === "size") {
          const targetBytes = parseInt(targetSize) * 1024; // Convert KB to bytes
          let bestBlob: Blob | null = null;
          let bestQuality = currentQuality;

          // Binary search for optimal quality
          let minQuality = 0.1;
          let maxQuality = 1.0;

          while (attempts < maxAttempts && Math.abs(maxQuality - minQuality) > 0.05) {
            attempts++;
            setProgress(30 + (attempts / maxAttempts) * 50);

            const testQuality = (minQuality + maxQuality) / 2;
            const blob = await compress(testQuality);

            if (blob) {
              if (blob.size <= targetBytes) {
                bestBlob = blob;
                bestQuality = testQuality;
                minQuality = testQuality;
              } else {
                maxQuality = testQuality;
              }
            }
          }

          if (bestBlob) {
            const url = URL.createObjectURL(bestBlob);
            setResultImage(url);
            setCompressedSize(bestBlob.size);
          }
        } else {
          const blob = await compress(currentQuality);
          if (blob) {
            const url = URL.createObjectURL(blob);
            setResultImage(url);
            setCompressedSize(blob.size);
          }
        }

        setProgress(100);
        setIsProcessing(false);

        toast({
          title: "Success!",
          description: "Image compressed successfully",
        });
      };

      img.onerror = () => {
        setIsProcessing(false);
        setProgress(0);
        toast({
          title: "Error",
          description: "Failed to load image. Please try again.",
          variant: "destructive",
        });
      };

      img.src = preview!;
    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      toast({
        title: "Error",
        description: "Failed to compress image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadResult = () => {
    if (resultImage) {
      const a = document.createElement('a');
      a.href = resultImage;
      a.download = `compressed-${selectedFile?.name?.split('.')[0] || 'image'}.${format}`;
      a.click();

      toast({
        title: "Downloaded!",
        description: "Compressed image downloaded successfully",
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

  const getSavingsPercentage = (): number => {
    if (originalSize && compressedSize) {
      return Math.round(((originalSize - compressedSize) / originalSize) * 100);
    }
    return 0;
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
                  {originalSize && (
                    <p className="text-xs text-muted-foreground">
                      Size: {formatFileSize(originalSize)}
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
                    Supports: JPG, PNG, WebP (max 20MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Compression Settings */}
          {selectedFile && (
            <>
              <div>
                <Label className="block text-sm font-medium mb-2">Compression Mode</Label>
                <Select value={compressionMode} onValueChange={(value: any) => setCompressionMode(value)}>
                  <SelectTrigger data-testid="compression-mode-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality">Quality-based</SelectItem>
                    <SelectItem value="size">Target file size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {compressionMode === "quality" ? (
                <div>
                  <Label className="block text-sm font-medium mb-2">
                    Quality: {quality[0]}%
                  </Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                    data-testid="quality-slider"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="targetSize" className="block text-sm font-medium mb-2">
                    Target File Size (KB)
                  </Label>
                  <Input
                    id="targetSize"
                    type="number"
                    value={targetSize}
                    onChange={(e) => setTargetSize(e.target.value)}
                    placeholder="e.g. 500"
                    data-testid="target-size-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current size: {originalSize ? formatFileSize(originalSize) : 'N/A'}
                  </p>
                </div>
              )}

              <div>
                <Label className="block text-sm font-medium mb-2">Output Format</Label>
                <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                  <SelectTrigger data-testid="format-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG (best compression)</SelectItem>
                    <SelectItem value="webp">WebP (modern format)</SelectItem>
                    <SelectItem value="png">PNG (lossless)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={compressImage}
                disabled={isProcessing}
                className="w-full bg-image hover:bg-image/90 text-white py-3 text-lg font-medium"
                data-testid="compress-image-button"
              >
                <Minimize className="w-5 h-5 mr-2" />
                {isProcessing ? "Compressing..." : "Compress Image"}
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

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Compression Tips</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• JPEG: Best for photos with many colors</div>
              <div>• PNG: Best for graphics with transparency</div>
              <div>• WebP: Modern format with better compression</div>
              <div>• Lower quality = smaller file size</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Compressed Image</Label>
            <Card className="bg-image-background border border-image/20 rounded-xl p-6 text-center min-h-[300px] flex items-center justify-center">
              {resultImage ? (
                <div className="space-y-4 w-full">
                  <img 
                    src={resultImage} 
                    alt="Compressed" 
                    className="max-w-full max-h-64 mx-auto rounded border"
                    data-testid="compressed-image"
                  />
                  <div className="text-sm text-image-foreground">
                    {compressedSize && (
                      <>
                        New size: {formatFileSize(compressedSize)}
                        {originalSize && (
                          <span className="block text-green-600 font-medium">
                            {getSavingsPercentage()}% reduction
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-image-foreground/70">
                  Compressed image will appear here
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
                  data-testid="download-compressed"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
                  data-testid="copy-compressed"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </Button>
              </div>

              <div>
                <h3 className="font-medium mb-3">Compression Results</h3>
                <div className="space-y-3">
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Original Size</div>
                    <div className="text-sm text-muted-foreground">
                      {originalSize ? formatFileSize(originalSize) : 'N/A'}
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Compressed Size</div>
                    <div className="text-sm text-muted-foreground">
                      {compressedSize ? formatFileSize(compressedSize) : 'N/A'}
                    </div>
                  </Card>
                  <Card className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="text-sm font-medium text-green-800 mb-1">Space Saved</div>
                    <div className="text-sm text-green-700">
                      {originalSize && compressedSize ? (
                        <>
                          {formatFileSize(originalSize - compressedSize)} ({getSavingsPercentage()}%)
                        </>
                      ) : 'N/A'}
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Output Format</div>
                    <div className="text-sm text-muted-foreground">
                      {format.toUpperCase()}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Quality vs Size</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>• 90-100%: Excellent quality, larger files</div>
              <div>• 70-90%: Good quality, balanced size</div>
              <div>• 50-70%: Fair quality, smaller files</div>
              <div>• Below 50%: Poor quality, very small files</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
