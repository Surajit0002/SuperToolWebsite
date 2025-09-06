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
import { ArrowUpDown, Copy, Share2, Thermometer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GaugeChart from "@/components/charts/gauge-chart";

export default function TemperatureConverter() {
  const [temperature, setTemperature] = useState("");
  const [fromUnit, setFromUnit] = useState<"celsius" | "fahrenheit" | "kelvin">("celsius");
  const [toUnit, setToUnit] = useState<"celsius" | "fahrenheit" | "kelvin">("fahrenheit");
  const [results, setResults] = useState<{
    celsius: number;
    fahrenheit: number;
    kelvin: number;
  } | null>(null);
  const { toast } = useToast();

  const units = [
    { value: "celsius", label: "Celsius (°C)", symbol: "°C" },
    { value: "fahrenheit", label: "Fahrenheit (°F)", symbol: "°F" },
    { value: "kelvin", label: "Kelvin (K)", symbol: "K" },
  ];

  const convertTemperature = (value: number, from: string, to: string): number => {
    // Convert to Celsius first
    let celsius: number;
    switch (from) {
      case "celsius":
        celsius = value;
        break;
      case "fahrenheit":
        celsius = (value - 32) * 5/9;
        break;
      case "kelvin":
        celsius = value - 273.15;
        break;
      default:
        celsius = value;
    }

    // Convert from Celsius to target unit
    switch (to) {
      case "celsius":
        return celsius;
      case "fahrenheit":
        return (celsius * 9/5) + 32;
      case "kelvin":
        return celsius + 273.15;
      default:
        return celsius;
    }
  };

  const convert = () => {
    const inputTemp = parseFloat(temperature);
    if (isNaN(inputTemp)) {
      toast({
        title: "Error",
        description: "Please enter a valid temperature",
        variant: "destructive",
      });
      return;
    }

    // Check for absolute zero violations
    if (fromUnit === "kelvin" && inputTemp < 0) {
      toast({
        title: "Error",
        description: "Kelvin cannot be below 0 K (absolute zero)",
        variant: "destructive",
      });
      return;
    }

    if (fromUnit === "celsius" && inputTemp < -273.15) {
      toast({
        title: "Error",
        description: "Celsius cannot be below -273.15°C (absolute zero)",
        variant: "destructive",
      });
      return;
    }

    if (fromUnit === "fahrenheit" && inputTemp < -459.67) {
      toast({
        title: "Error",
        description: "Fahrenheit cannot be below -459.67°F (absolute zero)",
        variant: "destructive",
      });
      return;
    }

    // Convert to all units
    const celsius = convertTemperature(inputTemp, fromUnit, "celsius");
    const fahrenheit = convertTemperature(inputTemp, fromUnit, "fahrenheit");
    const kelvin = convertTemperature(inputTemp, fromUnit, "kelvin");

    setResults({ celsius, fahrenheit, kelvin });
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const copyResult = () => {
    if (results) {
      const targetResult = results[toUnit];
      const unit = units.find(u => u.value === toUnit)?.symbol || "";
      navigator.clipboard.writeText(`${targetResult.toFixed(2)}${unit}`);
      toast({
        title: "Copied!",
        description: "Temperature conversion copied to clipboard",
      });
    }
  };

  const formatTemperature = (value: number, unit: string) => {
    const symbol = units.find(u => u.value === unit)?.symbol || "";
    return `${value.toFixed(2)}${symbol}`;
  };

  const getTemperatureReference = (celsius: number) => {
    if (celsius <= 0) return "Water freezes";
    if (celsius >= 100) return "Water boils";
    if (celsius >= 37) return "Human body temperature";
    if (celsius >= 20) return "Room temperature";
    if (celsius >= 0) return "Above freezing";
    return "";
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="temperature" className="block text-sm font-medium mb-2">
              Temperature Value
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.01"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="Enter temperature"
              className="w-full px-4 py-3 text-lg"
              data-testid="temperature-input"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">From Unit</Label>
            <Select value={fromUnit} onValueChange={(value: any) => setFromUnit(value)}>
              <SelectTrigger data-testid="from-unit-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
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
              className="rounded-full"
              data-testid="swap-units"
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">To Unit</Label>
            <Select value={toUnit} onValueChange={(value: any) => setToUnit(value)}>
              <SelectTrigger data-testid="to-unit-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={convert}
            disabled={!temperature}
            className="w-full bg-converter hover:bg-converter/90 text-white py-3 text-lg font-medium"
            data-testid="convert-temperature"
          >
            <Thermometer className="w-5 h-5 mr-2" />
            Convert Temperature
          </Button>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Quick References</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span>Water freezes:</span>
                  <span>0°C, 32°F, 273.15K</span>
                </div>
                <div className="flex justify-between">
                  <span>Water boils:</span>
                  <span>100°C, 212°F, 373.15K</span>
                </div>
                <div className="flex justify-between">
                  <span>Body temperature:</span>
                  <span>37°C, 98.6°F, 310.15K</span>
                </div>
                <div className="flex justify-between">
                  <span>Room temperature:</span>
                  <span>20°C, 68°F, 293.15K</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Conversion Formulas</h3>
              <div className="space-y-1 text-sm text-green-700">
                <div>°F = (°C × 9/5) + 32</div>
                <div>°C = (°F - 32) × 5/9</div>
                <div>K = °C + 273.15</div>
                <div>°C = K - 273.15</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Converted Temperature</Label>
            <Card className="bg-converter-background border border-converter/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-converter mb-2" data-testid="temperature-result">
                {results ? formatTemperature(results[toUnit], toUnit) : "0.00°"}
              </div>
              <div className="text-sm text-converter/70">
                {units.find(u => u.value === toUnit)?.label}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={!results}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-converter/10 hover:bg-converter/20 border border-converter/20 text-converter rounded-xl font-medium"
              data-testid="copy-temperature-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (results) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('temp', temperature);
                  url.searchParams.set('from', fromUnit);
                  url.searchParams.set('to', toUnit);
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={!results}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-temperature-conversion"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {results && (
            <div>
              <h3 className="font-medium mb-3">Temperature Scale</h3>
              <Card className="p-4 bg-muted/30 rounded-xl">
                <GaugeChart
                  value={results.celsius}
                  min={-50}
                  max={150}
                  title="Temperature"
                  unit="°C"
                  categories={[
                    { name: "Freezing", range: [-50, 0], color: "#3b82f6" },
                    { name: "Cold", range: [0, 20], color: "#06b6d4" },
                    { name: "Comfortable", range: [20, 30], color: "#10b981" },
                    { name: "Warm", range: [30, 40], color: "#f59e0b" },
                    { name: "Hot", range: [40, 150], color: "#ef4444" }
                  ]}
                />
              </Card>
            </div>
          )}

          {results && (
            <div>
              <h3 className="font-medium mb-3">All Conversions</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="text-sm font-medium text-red-800 mb-1">Celsius</div>
                  <div className="text-lg font-bold text-red-700">{formatTemperature(results.celsius, "celsius")}</div>
                </Card>
                <Card className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="text-sm font-medium text-orange-800 mb-1">Fahrenheit</div>
                  <div className="text-lg font-bold text-orange-700">{formatTemperature(results.fahrenheit, "fahrenheit")}</div>
                </Card>
                <Card className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="text-sm font-medium text-purple-800 mb-1">Kelvin</div>
                  <div className="text-lg font-bold text-purple-700">{formatTemperature(results.kelvin, "kelvin")}</div>
                </Card>
              </div>
            </div>
          )}

          {results && (
            <div>
              <h3 className="font-medium mb-3">Temperature Context</h3>
              <Card className="p-4 bg-muted/30 rounded-xl">
                <div className="text-sm font-medium mb-1">Reference Point</div>
                <div className="text-sm text-muted-foreground">
                  {getTemperatureReference(results.celsius) || "Custom temperature"}
                </div>
              </Card>
            </div>
          )}

          {results && results.kelvin < 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This temperature is below absolute zero, which is physically impossible!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}