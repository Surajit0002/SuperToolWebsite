import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Palette, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PieChart from "@/components/charts/pie-chart";

export default function ColorPickerTool() {
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const { toast } = useToast();

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const addToHistory = (color: string) => {
    if (!colorHistory.includes(color)) {
      setColorHistory(prev => [color, ...prev.slice(0, 9)]);
    }
  };

  const copyToClipboard = (value: string, format: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied!",
      description: `${format} value copied to clipboard`,
    });
  };

  const generatePalette = () => {
    const rgb = hexToRgb(selectedColor);
    const hsl = hexToHsl(selectedColor);
    if (!rgb || !hsl) return [];

    const colors = [];
    
    // Add the main color
    colors.push({ name: "Primary", value: 1, color: selectedColor });
    
    // Generate complementary colors
    const complementaryHue = (hsl.h + 180) % 360;
    colors.push({ 
      name: "Complementary", 
      value: 1, 
      color: `hsl(${complementaryHue}, ${hsl.s}%, ${hsl.l}%)` 
    });
    
    // Generate triadic colors
    const triadic1 = (hsl.h + 120) % 360;
    const triadic2 = (hsl.h + 240) % 360;
    colors.push({ 
      name: "Triadic 1", 
      value: 1, 
      color: `hsl(${triadic1}, ${hsl.s}%, ${hsl.l}%)` 
    });
    colors.push({ 
      name: "Triadic 2", 
      value: 1, 
      color: `hsl(${triadic2}, ${hsl.s}%, ${hsl.l}%)` 
    });

    return colors;
  };

  const generateShades = () => {
    const hsl = hexToHsl(selectedColor);
    if (!hsl) return [];

    const shades = [];
    for (let i = 10; i <= 90; i += 20) {
      shades.push(`hsl(${hsl.h}, ${hsl.s}%, ${i}%)`);
    }
    return shades;
  };

  const generateTints = () => {
    const hsl = hexToHsl(selectedColor);
    if (!hsl) return [];

    const tints = [];
    for (let i = 20; i <= 80; i += 20) {
      tints.push(`hsl(${hsl.h}, ${i}%, ${hsl.l}%)`);
    }
    return tints;
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    addToHistory(color);
  };

  const reset = () => {
    setSelectedColor("#3b82f6");
    setColorHistory([]);
  };

  const rgb = hexToRgb(selectedColor);
  const hsl = hexToHsl(selectedColor);
  const palette = generatePalette();
  const shades = generateShades();
  const tints = generateTints();

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          {/* Color Picker */}
          <div>
            <Label className="block text-sm font-medium mb-2">Pick a Color</Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-16 h-16 rounded-lg border border-border cursor-pointer"
                  data-testid="color-picker"
                />
                <div className="flex-1">
                  <Input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#3b82f6"
                    className="text-lg font-mono"
                    data-testid="hex-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a HEX color code
                  </p>
                </div>
              </div>

              {/* Color Preview */}
              <Card 
                className="h-24 rounded-xl border-2 border-border"
                style={{ backgroundColor: selectedColor }}
                data-testid="color-preview"
              />
            </div>
          </div>

          {/* Color History */}
          {colorHistory.length > 0 && (
            <div>
              <Label className="block text-sm font-medium mb-2">Color History</Label>
              <div className="grid grid-cols-5 gap-2">
                {colorHistory.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className="w-12 h-12 rounded-lg border border-border hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                    data-testid={`history-color-${index}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preset Colors */}
          <div>
            <Label className="block text-sm font-medium mb-2">Preset Colors</Label>
            <div className="grid grid-cols-8 gap-2">
              {[
                "#ef4444", "#f97316", "#f59e0b", "#eab308", 
                "#22c55e", "#10b981", "#06b6d4", "#3b82f6",
                "#6366f1", "#8b5cf6", "#d946ef", "#ec4899",
                "#000000", "#374151", "#6b7280", "#ffffff"
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-8 h-8 rounded-lg border border-border hover:scale-105 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                  data-testid={`preset-${color}`}
                />
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={reset}
            className="w-full"
            data-testid="reset-color-picker"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          {/* Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Click the color square to open system color picker</li>
              <li>• Type HEX values directly in the input field</li>
              <li>• Use preset colors for common selections</li>
              <li>• View color harmonies and variations on the right</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Color Values */}
          <div>
            <Label className="block text-sm font-medium mb-2">Color Values</Label>
            <div className="space-y-3">
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">HEX</div>
                    <div className="text-sm font-mono text-muted-foreground">{selectedColor}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedColor, "HEX")}
                    data-testid="copy-hex"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {rgb && (
                <Card className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">RGB</div>
                      <div className="text-sm font-mono text-muted-foreground">
                        rgb({rgb.r}, {rgb.g}, {rgb.b})
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "RGB")}
                      data-testid="copy-rgb"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )}

              {hsl && (
                <Card className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">HSL</div>
                      <div className="text-sm font-mono text-muted-foreground">
                        hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "HSL")}
                      data-testid="copy-hsl"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Color Harmony */}
          <div>
            <Label className="block text-sm font-medium mb-2">Color Harmony</Label>
            <Card className="p-4 bg-muted/30 rounded-xl">
              <PieChart
                data={palette}
                title="Color Palette"
                showLegend={true}
              />
            </Card>
          </div>

          {/* Shades */}
          <div>
            <Label className="block text-sm font-medium mb-2">Shades</Label>
            <div className="flex space-x-2">
              {shades.map((shade, index) => (
                <button
                  key={index}
                  onClick={() => handleColorChange(shade)}
                  className="flex-1 h-12 rounded-lg border border-border hover:scale-105 transition-transform"
                  style={{ backgroundColor: shade }}
                  title={shade}
                  data-testid={`shade-${index}`}
                />
              ))}
            </div>
          </div>

          {/* Tints */}
          <div>
            <Label className="block text-sm font-medium mb-2">Saturation Variations</Label>
            <div className="flex space-x-2">
              {tints.map((tint, index) => (
                <button
                  key={index}
                  onClick={() => handleColorChange(tint)}
                  className="flex-1 h-12 rounded-lg border border-border hover:scale-105 transition-transform"
                  style={{ backgroundColor: tint }}
                  title={tint}
                  data-testid={`tint-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}