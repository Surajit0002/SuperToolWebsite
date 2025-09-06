import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Download, RotateCcw, Smile, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MemeGenerator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(40);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontFamily, setFontFamily] = useState("Impact");
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (imageUrl && (topText || bottomText)) {
      generateMeme();
    }
  }, [imageUrl, topText, bottomText, fontSize, fontColor, strokeColor, strokeWidth, fontFamily]);

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
      setImageUrl(url);
    }
  };

  const generateMeme = () => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Set font properties
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = fontColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Function to draw text with outline
      const drawText = (text: string, x: number, y: number) => {
        if (strokeWidth > 0) {
          ctx.strokeText(text, x, y);
        }
        ctx.fillText(text, x, y);
      };

      // Function to wrap text
      const wrapText = (text: string, maxWidth: number) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        return lines;
      };

      const maxWidth = canvas.width * 0.9;
      const centerX = canvas.width / 2;

      // Draw top text
      if (topText) {
        const topLines = wrapText(topText.toUpperCase(), maxWidth);
        const lineHeight = fontSize * 1.2;
        const startY = 20;

        topLines.forEach((line, index) => {
          drawText(line, centerX, startY + (index * lineHeight));
        });
      }

      // Draw bottom text
      if (bottomText) {
        const bottomLines = wrapText(bottomText.toUpperCase(), maxWidth);
        const lineHeight = fontSize * 1.2;
        const startY = canvas.height - (bottomLines.length * lineHeight) - 20;

        bottomLines.forEach((line, index) => {
          drawText(line, centerX, startY + (index * lineHeight));
        });
      }

      // Convert canvas to data URL
      const memeDataUrl = canvas.toDataURL('image/png');
      setGeneratedMeme(memeDataUrl);
    };

    img.src = imageUrl;
  };

  const downloadMeme = () => {
    if (!generatedMeme) return;

    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = generatedMeme;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Your meme has been downloaded",
    });
  };

  const reset = () => {
    setSelectedFile(null);
    setImageUrl(null);
    setTopText("");
    setBottomText("");
    setGeneratedMeme(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const useTemplate = (template: string) => {
    // You could expand this to load actual meme templates
    switch (template) {
      case "drake":
        setTopText("OLD THING");
        setBottomText("NEW THING");
        break;
      case "distracted":
        setTopText("ME");
        setBottomText("NEW SHINY THING");
        break;
      case "success":
        setTopText("WHEN YOU");
        setBottomText("SUCCEED");
        break;
      default:
        setTopText("TOP TEXT");
        setBottomText("BOTTOM TEXT");
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
                  <Smile className="w-8 h-8 mx-auto text-image" />
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

          {/* Template Buttons */}
          <div>
            <Label className="block text-sm font-medium mb-2">Quick Templates</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => useTemplate("basic")}
                data-testid="template-basic"
              >
                Basic Meme
              </Button>
              <Button
                variant="outline"
                onClick={() => useTemplate("success")}
                data-testid="template-success"
              >
                Success Kid
              </Button>
            </div>
          </div>

          {/* Text Inputs */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="topText" className="block text-sm font-medium mb-2">
                Top Text
              </Label>
              <Textarea
                id="topText"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="Enter top text"
                className="resize-none"
                data-testid="top-text-input"
              />
            </div>

            <div>
              <Label htmlFor="bottomText" className="block text-sm font-medium mb-2">
                Bottom Text
              </Label>
              <Textarea
                id="bottomText"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="Enter bottom text"
                className="resize-none"
                data-testid="bottom-text-input"
              />
            </div>
          </div>

          {/* Font Settings */}
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Font Family</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger data-testid="font-family-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Impact">Impact</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
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
                max="80"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
                data-testid="font-size-slider"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Text Color</Label>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-full h-10 rounded border border-border"
                  data-testid="font-color-picker"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Outline Color</Label>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-full h-10 rounded border border-border"
                  data-testid="stroke-color-picker"
                />
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">
                Outline Width: {strokeWidth}px
              </Label>
              <input
                type="range"
                min="0"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-full"
                data-testid="stroke-width-slider"
              />
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={reset}
            className="w-full"
            data-testid="reset-meme"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Generated Meme</Label>
            <Card className="bg-image-background border border-image/20 rounded-xl p-6 text-center min-h-[400px] flex items-center justify-center">
              {generatedMeme ? (
                <img 
                  src={generatedMeme} 
                  alt="Generated Meme" 
                  className="max-w-full max-h-[500px] rounded-lg shadow-md"
                  data-testid="generated-meme"
                />
              ) : (
                <div className="text-muted-foreground">
                  <Type className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Upload an image and add text to create your meme</p>
                </div>
              )}
            </Card>
          </div>

          {/* Download Button */}
          {generatedMeme && (
            <Button
              onClick={downloadMeme}
              className="w-full bg-image hover:bg-image/90 text-white py-3 text-lg font-medium"
              data-testid="download-meme"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Meme
            </Button>
          )}

          {/* Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Meme Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Keep text short and punchy</li>
              <li>• Use high contrast colors for readability</li>
              <li>• ALL CAPS is traditional for memes</li>
              <li>• Impact font is the classic meme font</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hidden canvas for meme generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}