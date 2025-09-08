import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Trash2, Plus, Move, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CollageImage {
  id: string;
  file: File;
  preview: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

interface CollageTemplate {
  name: string;
  width: number;
  height: number;
  slots: Array<{ x: number; y: number; width: number; height: number }>;
}

const templates: CollageTemplate[] = [
  {
    name: "2x2 Grid",
    width: 800,
    height: 800,
    slots: [
      { x: 0, y: 0, width: 400, height: 400 },
      { x: 400, y: 0, width: 400, height: 400 },
      { x: 0, y: 400, width: 400, height: 400 },
      { x: 400, y: 400, width: 400, height: 400 },
    ]
  },
  {
    name: "3x3 Grid",
    width: 900,
    height: 900,
    slots: [
      { x: 0, y: 0, width: 300, height: 300 },
      { x: 300, y: 0, width: 300, height: 300 },
      { x: 600, y: 0, width: 300, height: 300 },
      { x: 0, y: 300, width: 300, height: 300 },
      { x: 300, y: 300, width: 300, height: 300 },
      { x: 600, y: 300, width: 300, height: 300 },
      { x: 0, y: 600, width: 300, height: 300 },
      { x: 300, y: 600, width: 300, height: 300 },
      { x: 600, y: 600, width: 300, height: 300 },
    ]
  },
  {
    name: "Magazine Layout",
    width: 1000,
    height: 600,
    slots: [
      { x: 0, y: 0, width: 600, height: 400 },
      { x: 620, y: 0, width: 380, height: 190 },
      { x: 620, y: 210, width: 380, height: 190 },
      { x: 0, y: 420, width: 200, height: 180 },
      { x: 220, y: 420, width: 200, height: 180 },
      { x: 440, y: 420, width: 200, height: 180 },
    ]
  }
];

export default function CollageMaker() {
  const [images, setImages] = useState<CollageImage[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CollageTemplate>(templates[0]);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [spacing, setSpacing] = useState([10]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: `File ${file.name} is too large. Max size is 10MB.`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: CollageImage = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: e.target?.result as string,
          x: 0,
          y: 0,
          width: 200,
          height: 200,
          rotation: 0,
          zIndex: images.length + 1,
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const updateImage = (id: string, updates: Partial<CollageImage>) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setSelectedImage(null);
  };

  const applyTemplate = () => {
    if (images.length === 0) {
      toast({
        title: "No Images",
        description: "Please add images before applying a template",
        variant: "destructive",
      });
      return;
    }

    setCanvasWidth(selectedTemplate.width);
    setCanvasHeight(selectedTemplate.height);

    const updatedImages = images.slice(0, selectedTemplate.slots.length).map((img, index) => {
      const slot = selectedTemplate.slots[index];
      return {
        ...img,
        x: slot.x,
        y: slot.y,
        width: slot.width,
        height: slot.height,
      };
    });

    setImages(updatedImages);
    toast({
      title: "Template Applied",
      description: `Applied ${selectedTemplate.name} template`,
    });
  };

  const generateCollage = useCallback(async () => {
    if (images.length === 0) {
      toast({
        title: "No Images",
        description: "Please add images to create a collage",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Clear canvas with background color
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      setProgress(20);

      // Sort images by z-index
      const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex);

      // Draw each image
      for (let i = 0; i < sortedImages.length; i++) {
        const image = sortedImages[i];
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            ctx.save();
            
            // Apply transformations
            const centerX = image.x + image.width / 2;
            const centerY = image.y + image.height / 2;
            
            ctx.translate(centerX, centerY);
            ctx.rotate((image.rotation * Math.PI) / 180);
            
            // Draw image
            ctx.drawImage(
              img,
              -image.width / 2,
              -image.height / 2,
              image.width,
              image.height
            );
            
            ctx.restore();
            resolve(null);
          };
          img.onerror = reject;
        });

        img.src = image.preview;
        setProgress(20 + (i + 1) * (70 / sortedImages.length));
      }

      setProgress(95);

      // Convert to blob and create result URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setResult(url);
          setProgress(100);
          toast({
            title: "Success!",
            description: "Collage generated successfully",
          });
        }
      }, 'image/png');

    } catch (error) {
      console.error("Collage generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate collage. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [images, canvasWidth, canvasHeight, backgroundColor]);

  const downloadCollage = () => {
    if (result) {
      const a = document.createElement('a');
      a.href = result;
      a.download = `collage-${Date.now()}.png`;
      a.click();
      toast({
        title: "Downloaded!",
        description: "Collage downloaded successfully",
      });
    }
  };

  const clearAll = () => {
    setImages([]);
    setResult(null);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Controls */}
      <div className="w-1/3 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label className="block text-sm font-medium mb-2">Add Images</Label>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              variant="outline"
              data-testid="add-images-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Images
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              data-testid="image-file-input"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Select multiple images (max 10MB each)
            </p>
          </div>

          {/* Template Selection */}
          <div>
            <Label className="block text-sm font-medium mb-2">Template</Label>
            <div className="space-y-3">
              <Select
                value={selectedTemplate.name}
                onValueChange={(value) => {
                  const template = templates.find(t => t.name === value);
                  if (template) setSelectedTemplate(template);
                }}
              >
                <SelectTrigger data-testid="template-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.name} value={template.name}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={applyTemplate}
                variant="outline"
                className="w-full"
                data-testid="apply-template-button"
              >
                Apply Template
              </Button>
            </div>
          </div>

          {/* Canvas Settings */}
          <div>
            <Label className="block text-sm font-medium mb-2">Canvas Size</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Width</Label>
                <Input
                  type="number"
                  value={canvasWidth}
                  onChange={(e) => setCanvasWidth(Number(e.target.value))}
                  min="100"
                  max="4000"
                  data-testid="canvas-width-input"
                />
              </div>
              <div>
                <Label className="text-xs">Height</Label>
                <Input
                  type="number"
                  value={canvasHeight}
                  onChange={(e) => setCanvasHeight(Number(e.target.value))}
                  min="100"
                  max="4000"
                  data-testid="canvas-height-input"
                />
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div>
            <Label className="block text-sm font-medium mb-2">Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-10"
                data-testid="background-color-input"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          {/* Image List */}
          {images.length > 0 && (
            <div>
              <Label className="block text-sm font-medium mb-2">
                Images ({images.length})
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                      selectedImage === image.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : ''
                    }`}
                    onClick={() => setSelectedImage(image.id)}
                    data-testid={`image-item-${image.id}`}
                  >
                    <img
                      src={image.preview}
                      alt="Collage item"
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {image.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(image.width)} × {Math.round(image.height)}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image.id);
                      }}
                      variant="ghost"
                      size="sm"
                      data-testid={`remove-image-${image.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Image Controls */}
          {selectedImage && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-medium mb-3">Image Properties</h3>
                {(() => {
                  const image = images.find(img => img.id === selectedImage);
                  if (!image) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">X Position</Label>
                          <Input
                            type="number"
                            value={Math.round(image.x)}
                            onChange={(e) => updateImage(image.id, { x: Number(e.target.value) })}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Y Position</Label>
                          <Input
                            type="number"
                            value={Math.round(image.y)}
                            onChange={(e) => updateImage(image.id, { y: Number(e.target.value) })}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Width</Label>
                          <Input
                            type="number"
                            value={Math.round(image.width)}
                            onChange={(e) => updateImage(image.id, { width: Number(e.target.value) })}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Height</Label>
                          <Input
                            type="number"
                            value={Math.round(image.height)}
                            onChange={(e) => updateImage(image.id, { height: Number(e.target.value) })}
                            className="text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Rotation: {image.rotation}°</Label>
                        <Slider
                          value={[image.rotation]}
                          onValueChange={([value]) => updateImage(image.id, { rotation: value })}
                          max={360}
                          min={0}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={generateCollage}
              disabled={isGenerating || images.length === 0}
              className="w-full"
              data-testid="generate-collage-button"
            >
              {isGenerating ? "Generating..." : "Generate Collage"}
            </Button>

            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {Math.round(progress)}%
                </p>
              </div>
            )}

            {result && (
              <Button
                onClick={downloadCollage}
                className="w-full"
                data-testid="download-collage-button"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Collage
              </Button>
            )}

            <Button
              onClick={clearAll}
              variant="outline"
              className="w-full"
              data-testid="clear-all-button"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-4">
          <Label className="block text-sm font-medium">Preview</Label>
          
          {/* Canvas Preview */}
          <div 
            className="border rounded-xl p-4 bg-muted/50 min-h-64 flex items-center justify-center"
            style={{ aspectRatio: `${canvasWidth}/${canvasHeight}` }}
          >
            {result ? (
              <img
                src={result}
                alt="Generated Collage"
                className="max-w-full max-h-full rounded shadow-lg"
                data-testid="collage-result"
              />
            ) : images.length > 0 ? (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full border rounded"
                  style={{ backgroundColor }}
                />
                <p className="text-center text-muted-foreground mt-2">
                  Click "Generate Collage" to see the final result
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Add images to start creating your collage</p>
              </div>
            )}
          </div>

          {/* Tips */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-2">Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use templates for quick layouts</li>
                <li>• Adjust image positions and sizes in the properties panel</li>
                <li>• Images with higher z-index appear on top</li>
                <li>• Try different background colors for creative effects</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}