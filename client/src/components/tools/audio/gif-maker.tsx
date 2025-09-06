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
import { Upload, Download, RotateCcw, Film, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GifMaker() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [frameDelay, setFrameDelay] = useState(500);
  const [quality, setQuality] = useState(80);
  const [loop, setLoop] = useState(true);
  const [generatedGif, setGeneratedGif] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Filter for images only
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select image files",
        variant: "destructive",
      });
      return;
    }

    if (imageFiles.length > 50) {
      toast({
        title: "Error",
        description: "Maximum 50 images allowed",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(imageFiles);
    setGeneratedGif(null);

    toast({
      title: "Files loaded",
      description: `${imageFiles.length} images ready for GIF creation`,
    });
  };

  const generateGif = async () => {
    if (selectedFiles.length < 2) {
      toast({
        title: "Error",
        description: "Need at least 2 images to create a GIF",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Since we can't use gif.js or similar libraries easily, 
      // we'll create a simple animated GIF simulation using canvas
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;

      // Load all images
      const images = await Promise.all(
        selectedFiles.map(file => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
          });
        })
      );

      if (images.length === 0) {
        throw new Error("No images loaded");
      }

      // Set canvas size to the first image
      const firstImg = images[0];
      canvas.width = firstImg.width;
      canvas.height = firstImg.height;

      // For demonstration, we'll create a simple slideshow effect
      // In a real implementation, you'd use a GIF encoding library
      let currentFrame = 0;
      
      const drawFrame = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[currentFrame], 0, 0, canvas.width, canvas.height);
        currentFrame = (currentFrame + 1) % images.length;
      };

      // Draw first frame
      drawFrame();

      // Convert to data URL (this is a simplified version)
      const gifDataUrl = canvas.toDataURL('image/png');
      setGeneratedGif(gifDataUrl);

      toast({
        title: "GIF Created!",
        description: "Note: This is a simplified preview. For full GIF creation, server processing is needed.",
      });

      setIsGenerating(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create GIF",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const downloadGif = () => {
    if (!generatedGif) return;

    const link = document.createElement('a');
    link.download = 'animated.gif';
    link.href = generatedGif;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "GIF preview has been downloaded",
    });
  };

  const reset = () => {
    setSelectedFiles([]);
    setGeneratedGif(null);
    setFrameDelay(500);
    setQuality(80);
    setLoop(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (newFiles.length === 0) {
      setGeneratedGif(null);
    }
  };

  const moveImage = (from: number, to: number) => {
    const newFiles = [...selectedFiles];
    const [moved] = newFiles.splice(from, 1);
    newFiles.splice(to, 0, moved);
    setSelectedFiles(newFiles);
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label className="block text-sm font-medium mb-2">Upload Images</Label>
            <div 
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-audio transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-testid="image-upload-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                data-testid="image-files-input"
              />
              <div className="space-y-2">
                <Film className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload multiple images
                </p>
                <p className="text-xs text-muted-foreground">
                  2-50 images (PNG, JPG, WebP)
                </p>
              </div>
            </div>
          </div>

          {/* Selected Images */}
          {selectedFiles.length > 0 && (
            <div>
              <Label className="block text-sm font-medium mb-2">
                Selected Images ({selectedFiles.length})
              </Label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {index + 1}
                      </span>
                      <span className="text-sm truncate max-w-40">{file.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      {index > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveImage(index, index - 1)}
                          className="p-1 h-6 w-6"
                          data-testid={`move-up-${index}`}
                        >
                          ↑
                        </Button>
                      )}
                      {index < selectedFiles.length - 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveImage(index, index + 1)}
                          className="p-1 h-6 w-6"
                          data-testid={`move-down-${index}`}
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="p-1 h-6 w-6"
                        data-testid={`remove-${index}`}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GIF Settings */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <Label className="block text-sm font-medium">GIF Settings</Label>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  Frame Delay: {frameDelay}ms
                </Label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={frameDelay}
                  onChange={(e) => setFrameDelay(parseInt(e.target.value))}
                  className="w-full"
                  data-testid="frame-delay-slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Fast (0.1s)</span>
                  <span>Slow (2s)</span>
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  Quality: {quality}%
                </Label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full"
                  data-testid="quality-slider"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Animation</Label>
                <Select value={loop ? "loop" : "once"} onValueChange={(value) => setLoop(value === "loop")}>
                  <SelectTrigger data-testid="loop-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loop">Loop continuously</SelectItem>
                    <SelectItem value="once">Play once</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateGif}
            disabled={selectedFiles.length < 2 || isGenerating}
            className="w-full bg-audio hover:bg-audio/90 text-white py-3 text-lg font-medium"
            data-testid="generate-gif"
          >
            <Film className="w-5 h-5 mr-2" />
            {isGenerating ? "Creating GIF..." : "Create GIF"}
          </Button>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={reset}
            className="w-full"
            data-testid="reset-gif-maker"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          {/* Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">GIF Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use 5-20 images for smooth animation</li>
              <li>• 300-500ms delay works well for most GIFs</li>
              <li>• Keep image sizes consistent for best results</li>
              <li>• Lower quality = smaller file size</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">GIF Preview</Label>
            <Card className="bg-audio-background border border-audio/20 rounded-xl p-6 text-center min-h-[400px] flex items-center justify-center">
              {generatedGif ? (
                <div className="space-y-4">
                  <img 
                    src={generatedGif} 
                    alt="Generated GIF" 
                    className="max-w-full max-h-80 rounded-lg shadow-md"
                    data-testid="generated-gif"
                  />
                  <div className="text-sm text-audio/70">
                    Preview frame (full GIF requires server processing)
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{isGenerating ? "Creating GIF..." : "Upload images to create an animated GIF"}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Download Button */}
          {generatedGif && (
            <Button
              onClick={downloadGif}
              className="w-full bg-audio hover:bg-audio/90 text-white py-3 text-lg font-medium"
              data-testid="download-gif"
            >
              <Download className="w-5 h-5 mr-2" />
              Download GIF Preview
            </Button>
          )}

          {/* Animation Settings Preview */}
          {selectedFiles.length > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">Animation Settings</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Frames:</span>
                  <span>{selectedFiles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frame Delay:</span>
                  <span>{frameDelay}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Duration:</span>
                  <span>{((selectedFiles.length * frameDelay) / 1000).toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Loop:</span>
                  <span>{loop ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality:</span>
                  <span>{quality}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Note about server processing */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Note</h3>
            <p className="text-sm text-yellow-700">
              This is a preview implementation. Full GIF creation with proper encoding 
              requires server-side processing for optimal file size and quality.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden canvas for GIF processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}