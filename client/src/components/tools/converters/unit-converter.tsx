import { useState } from "react";
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
import { ArrowUpDown, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UnitConverter() {
  const [category, setCategory] = useState("length");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const { toast } = useToast();

  const units = {
    length: {
      meter: { name: "Meter", factor: 1 },
      kilometer: { name: "Kilometer", factor: 0.001 },
      centimeter: { name: "Centimeter", factor: 100 },
      millimeter: { name: "Millimeter", factor: 1000 },
      inch: { name: "Inch", factor: 39.3701 },
      foot: { name: "Foot", factor: 3.28084 },
      yard: { name: "Yard", factor: 1.09361 },
      mile: { name: "Mile", factor: 0.000621371 },
    },
    weight: {
      kilogram: { name: "Kilogram", factor: 1 },
      gram: { name: "Gram", factor: 1000 },
      pound: { name: "Pound", factor: 2.20462 },
      ounce: { name: "Ounce", factor: 35.274 },
      ton: { name: "Ton", factor: 0.001 },
      stone: { name: "Stone", factor: 0.157473 },
    },
    temperature: {
      celsius: { name: "Celsius", factor: 1 },
      fahrenheit: { name: "Fahrenheit", factor: 1 },
      kelvin: { name: "Kelvin", factor: 1 },
    },
    area: {
      square_meter: { name: "Square Meter", factor: 1 },
      square_kilometer: { name: "Square Kilometer", factor: 0.000001 },
      square_centimeter: { name: "Square Centimeter", factor: 10000 },
      square_inch: { name: "Square Inch", factor: 1550.0031 },
      square_foot: { name: "Square Foot", factor: 10.7639 },
      acre: { name: "Acre", factor: 0.000247105 },
      hectare: { name: "Hectare", factor: 0.0001 },
    },
    volume: {
      liter: { name: "Liter", factor: 1 },
      milliliter: { name: "Milliliter", factor: 1000 },
      gallon: { name: "Gallon (US)", factor: 0.264172 },
      quart: { name: "Quart", factor: 1.05669 },
      pint: { name: "Pint", factor: 2.11338 },
      cup: { name: "Cup", factor: 4.22675 },
      fluid_ounce: { name: "Fluid Ounce", factor: 33.814 },
    }
  };

  const convertTemperature = (value: number, from: string, to: string): number => {
    // Convert to Celsius first
    let celsius: number;
    switch (from) {
      case "fahrenheit":
        celsius = (value - 32) * 5/9;
        break;
      case "kelvin":
        celsius = value - 273.15;
        break;
      default:
        celsius = value;
    }

    // Convert from Celsius to target
    switch (to) {
      case "fahrenheit":
        return celsius * 9/5 + 32;
      case "kelvin":
        return celsius + 273.15;
      default:
        return celsius;
    }
  };

  const convert = () => {
    const inputValue = parseFloat(value);
    if (isNaN(inputValue)) {
      toast({
        title: "Error",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    if (!fromUnit || !toUnit) {
      toast({
        title: "Error",
        description: "Please select both units",
        variant: "destructive",
      });
      return;
    }

    let convertedValue: number;

    if (category === "temperature") {
      convertedValue = convertTemperature(inputValue, fromUnit, toUnit);
    } else {
      const categoryUnits = units[category as keyof typeof units];
      const fromFactor = categoryUnits[fromUnit as keyof typeof categoryUnits]?.factor;
      const toFactor = categoryUnits[toUnit as keyof typeof categoryUnits]?.factor;

      if (!fromFactor || !toFactor) {
        toast({
          title: "Error",
          description: "Invalid unit selection",
          variant: "destructive",
        });
        return;
      }

      // Convert to base unit, then to target unit
      const baseValue = inputValue / fromFactor;
      convertedValue = baseValue * toFactor;
    }

    setResult(convertedValue);
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    if (result !== null && value) {
      setValue(result.toString());
      convert();
    }
  };

  const copyResult = () => {
    if (result !== null) {
      navigator.clipboard.writeText(result.toString());
      toast({
        title: "Copied!",
        description: "Result copied to clipboard",
      });
    }
  };

  const currentUnits = units[category as keyof typeof units];

  // Reset units when category changes
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setFromUnit("");
    setToUnit("");
    setResult(null);
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Category</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger data-testid="unit-category-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="length">Length</SelectItem>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="value" className="block text-sm font-medium mb-2">
              Value
            </Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value to convert"
              className="w-full px-4 py-3 text-lg"
              data-testid="unit-value-input"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">From</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger data-testid="from-unit-select">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {currentUnits && Object.entries(currentUnits).map(([key, unit]) => (
                  <SelectItem key={key} value={key}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={swapUnits}
              disabled={!fromUnit || !toUnit}
              className="flex items-center space-x-2"
              data-testid="swap-units"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Swap</span>
            </Button>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">To</Label>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger data-testid="to-unit-select">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {currentUnits && Object.entries(currentUnits).map(([key, unit]) => (
                  <SelectItem key={key} value={key}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={convert}
            disabled={!value || !fromUnit || !toUnit}
            className="w-full bg-converter hover:bg-converter/90 text-white py-3 text-lg font-medium"
            data-testid="convert-units"
          >
            Convert
          </Button>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Quick Examples</h3>
            <div className="text-sm text-green-700 space-y-1">
              {category === "length" && (
                <>
                  <div>1 meter = 3.28 feet</div>
                  <div>1 kilometer = 0.62 miles</div>
                </>
              )}
              {category === "weight" && (
                <>
                  <div>1 kilogram = 2.2 pounds</div>
                  <div>1 pound = 16 ounces</div>
                </>
              )}
              {category === "temperature" && (
                <>
                  <div>0°C = 32°F = 273.15K</div>
                  <div>100°C = 212°F = 373.15K</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Result</Label>
            <Card className="bg-converter-background border border-converter/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-converter mb-2" data-testid="unit-result">
                {result !== null ? result.toLocaleString(undefined, { maximumFractionDigits: 6 }) : "0"}
              </div>
              <div className="text-sm text-converter/70">
                {toUnit && currentUnits ? currentUnits[toUnit as keyof typeof currentUnits]?.name : "Select units"}
              </div>
              {value && fromUnit && toUnit && result !== null && (
                <div className="text-sm text-converter/70 mt-2">
                  {value} {currentUnits[fromUnit as keyof typeof currentUnits]?.name} = {result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {currentUnits[toUnit as keyof typeof currentUnits]?.name}
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={result === null}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-converter/10 hover:bg-converter/20 border border-converter/20 text-converter rounded-xl font-medium"
              data-testid="copy-unit-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (result !== null) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('conversion', `${value}${fromUnit}=${result}${toUnit}`);
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={result === null}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-unit-conversion"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {result !== null && value && fromUnit && toUnit && (
            <div>
              <h3 className="font-medium mb-3">Conversion Details</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Precision</div>
                  <div className="text-sm text-muted-foreground">
                    {result.toPrecision(8)}
                  </div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Scientific Notation</div>
                  <div className="text-sm text-muted-foreground">
                    {result.toExponential(4)}
                  </div>
                </Card>
                {category !== "temperature" && (
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Ratio</div>
                    <div className="text-sm text-muted-foreground">
                      1 {currentUnits[fromUnit as keyof typeof currentUnits]?.name} = {(result / parseFloat(value)).toFixed(6)} {currentUnits[toUnit as keyof typeof currentUnits]?.name}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
