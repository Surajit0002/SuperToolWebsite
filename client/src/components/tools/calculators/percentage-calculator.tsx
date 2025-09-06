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
import { Copy, Share2, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BarChart from "@/components/charts/bar-chart";

export default function PercentageCalculator() {
  const [mode, setMode] = useState<"of" | "change" | "what">("of");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [formula, setFormula] = useState("");
  const { toast } = useToast();

  const calculate = () => {
    const num1 = parseFloat(value1);
    const num2 = parseFloat(value2);

    if (isNaN(num1) || isNaN(num2)) {
      toast({
        title: "Error",
        description: "Please enter valid numbers",
        variant: "destructive",
      });
      return;
    }

    let calculatedResult: number;
    let formulaText: string;

    switch (mode) {
      case "of":
        calculatedResult = (num1 * num2) / 100;
        formulaText = `${num1}% of ${num2} = (${num1} × ${num2}) ÷ 100`;
        break;
      case "change":
        if (num1 === 0) {
          toast({
            title: "Error",
            description: "Original value cannot be zero for percentage change",
            variant: "destructive",
          });
          return;
        }
        calculatedResult = ((num2 - num1) / num1) * 100;
        formulaText = `Change from ${num1} to ${num2} = ((${num2} - ${num1}) ÷ ${num1}) × 100`;
        break;
      case "what":
        if (num2 === 0) {
          toast({
            title: "Error",
            description: "Total value cannot be zero",
            variant: "destructive",
          });
          return;
        }
        calculatedResult = (num1 / num2) * 100;
        formulaText = `${num1} is what % of ${num2} = (${num1} ÷ ${num2}) × 100`;
        break;
      default:
        return;
    }

    setResult(calculatedResult);
    setFormula(formulaText);
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

  const getModeLabels = () => {
    switch (mode) {
      case "of":
        return { label1: "Percentage (%)", label2: "Of Value", placeholder1: "25", placeholder2: "200" };
      case "change":
        return { label1: "Original Value", label2: "New Value", placeholder1: "100", placeholder2: "120" };
      case "what":
        return { label1: "Value", label2: "Total Value", placeholder1: "25", placeholder2: "200" };
      default:
        return { label1: "Value 1", label2: "Value 2", placeholder1: "", placeholder2: "" };
    }
  };

  const labels = getModeLabels();

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Calculation Mode</Label>
            <Select value={mode} onValueChange={(value: any) => setMode(value)}>
              <SelectTrigger data-testid="percentage-mode-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="of">X% of Y</SelectItem>
                <SelectItem value="change">% Change</SelectItem>
                <SelectItem value="what">What % is X of Y</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === "of" && "Calculate what percentage of a number is"}
              {mode === "change" && "Calculate percentage increase or decrease"}
              {mode === "what" && "Find what percentage one number is of another"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="value1" className="block text-sm font-medium mb-2">
                {labels.label1}
              </Label>
              <Input
                id="value1"
                type="number"
                value={value1}
                onChange={(e) => setValue1(e.target.value)}
                placeholder={labels.placeholder1}
                className="w-full px-4 py-3 text-lg"
                data-testid="percentage-value1"
              />
            </div>

            <div>
              <Label htmlFor="value2" className="block text-sm font-medium mb-2">
                {labels.label2}
              </Label>
              <Input
                id="value2"
                type="number"
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
                placeholder={labels.placeholder2}
                className="w-full px-4 py-3 text-lg"
                data-testid="percentage-value2"
              />
            </div>
          </div>

          <Button
            onClick={calculate}
            disabled={!value1 || !value2}
            className="w-full bg-calculator hover:bg-calculator/90 text-white py-3 text-lg font-medium"
            data-testid="calculate-percentage"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Calculate
          </Button>

          {/* Examples */}
          <div>
            <h3 className="font-medium mb-3">Examples</h3>
            <div className="space-y-2">
              {mode === "of" && (
                <>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm">
                    <strong>25% of 200</strong> = 50
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm">
                    <strong>15% of 80</strong> = 12
                  </div>
                </>
              )}
              {mode === "change" && (
                <>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm">
                    <strong>From 100 to 120</strong> = 20% increase
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm">
                    <strong>From 150 to 120</strong> = -20% decrease
                  </div>
                </>
              )}
              {mode === "what" && (
                <>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm">
                    <strong>25 is what % of 200</strong> = 12.5%
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm">
                    <strong>30 is what % of 120</strong> = 25%
                  </div>
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
            <Card className="bg-calculator-background border border-calculator/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-calculator mb-2" data-testid="percentage-result">
                {result !== null ? `${result.toFixed(2)}${mode !== "of" ? "%" : ""}` : "0"}
              </div>
              {formula && (
                <div className="text-sm text-calculator/70 mt-2">
                  {formula}
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={result === null}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-calculator/10 hover:bg-calculator/20 border border-calculator/20 text-calculator rounded-xl font-medium"
              data-testid="copy-percentage-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (result !== null) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('calc', `${value1}${mode}${value2}=${result}`);
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={result === null}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-percentage-calculation"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {result !== null && (
            <div>
              <h3 className="font-medium mb-3">Visual Comparison</h3>
              <Card className="p-4 bg-muted/30 rounded-xl">
                <BarChart
                  data={[
                    { 
                      name: mode === "of" ? "Original" : mode === "change" ? "Original" : "Part", 
                      value: parseFloat(value1), 
                      color: "#3b82f6" 
                    },
                    { 
                      name: mode === "of" ? "Result" : mode === "change" ? "New" : "Total", 
                      value: mode === "of" ? result : parseFloat(value2), 
                      color: "#10b981" 
                    }
                  ]}
                  title={mode === "of" ? "Value Comparison" : mode === "change" ? "Before vs After" : "Part vs Total"}
                  valueFormatter={(value) => value.toFixed(2)}
                  height={200}
                />
              </Card>
            </div>
          )}

          {result !== null && (
            <div>
              <h3 className="font-medium mb-3">Additional Information</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Decimal Form</div>
                  <div className="text-sm text-muted-foreground">
                    {mode === "of" ? result.toString() : (result / 100).toFixed(4)}
                  </div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Fraction Form</div>
                  <div className="text-sm text-muted-foreground">
                    {mode === "of" ? `${result}/${value2}` : `${result}/100`}
                  </div>
                </Card>
                {mode === "change" && (
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Change Type</div>
                    <div className={`text-sm font-medium ${result > 0 ? 'text-green-600' : result < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {result > 0 ? 'Increase' : result < 0 ? 'Decrease' : 'No Change'}
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
