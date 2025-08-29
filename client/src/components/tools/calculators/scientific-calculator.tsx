import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ScientificCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [history, setHistory] = useState<Array<{ expression: string; result: number }>>([]);
  const { toast } = useToast();

  const appendToExpression = (value: string) => {
    setExpression(prev => prev + value);
  };

  const clearExpression = () => {
    setExpression("");
    setResult(null);
  };

  const calculate = () => {
    try {
      // Convert trigonometric functions based on angle mode
      let processedExpression = expression;
      
      if (angleMode === "deg") {
        processedExpression = processedExpression
          .replace(/sin\(/g, 'Math.sin(Math.PI/180*')
          .replace(/cos\(/g, 'Math.cos(Math.PI/180*')
          .replace(/tan\(/g, 'Math.tan(Math.PI/180*');
      } else {
        processedExpression = processedExpression
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(');
      }

      // Replace other functions
      processedExpression = processedExpression
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**')
        .replace(/(\d+)!/g, (match, num) => {
          const n = parseInt(num);
          if (n < 0 || n > 170) throw new Error("Factorial out of range");
          let result = 1;
          for (let i = 2; i <= n; i++) result *= i;
          return result.toString();
        });

      const calculatedResult = Function(`"use strict"; return (${processedExpression})`)();
      
      if (typeof calculatedResult === 'number' && isFinite(calculatedResult)) {
        setResult(calculatedResult);
        setHistory(prev => [{ expression, result: calculatedResult }, ...prev.slice(0, 9)]);
      } else {
        throw new Error("Invalid calculation");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid expression. Please check your input.",
        variant: "destructive",
      });
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

  const scientificButtons = [
    { label: "sin", value: "sin(" },
    { label: "cos", value: "cos(" },
    { label: "tan", value: "tan(" },
    { label: "ln", value: "ln(" },
    { label: "log", value: "log(" },
    { label: "√", value: "sqrt(" },
    { label: "x²", value: "^2" },
    { label: "x^y", value: "^" },
    { label: "π", value: "π" },
    { label: "e", value: "e" },
    { label: "!", value: "!" },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
  ];

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="expression" className="block text-sm font-medium mb-2">
              Expression
            </Label>
            <Input
              id="expression"
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="Enter scientific calculation"
              className="w-full px-4 py-3 text-lg font-mono bg-muted/30 border border-border rounded-xl"
              data-testid="scientific-calculator-input"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Supports sin, cos, tan, log, ln, sqrt, ^, !, π, e
              </p>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={angleMode === "deg" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setAngleMode("deg")}
                  data-testid="angle-mode-deg"
                >
                  DEG
                </Badge>
                <Badge
                  variant={angleMode === "rad" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setAngleMode("rad")}
                  data-testid="angle-mode-rad"
                >
                  RAD
                </Badge>
              </div>
            </div>
          </div>

          {/* Scientific Functions */}
          <div>
            <Label className="block text-sm font-medium mb-2">Scientific Functions</Label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {scientificButtons.map((btn) => (
                <Button
                  key={btn.label}
                  variant="outline"
                  onClick={() => appendToExpression(btn.value)}
                  className="bg-converter/20 hover:bg-converter/30 border border-converter/40 text-converter rounded-lg py-2 px-2 text-sm"
                  data-testid={`function-${btn.label}`}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Basic Calculator Grid */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              onClick={clearExpression}
              className="bg-muted/50 hover:bg-muted border border-border rounded-lg py-3 px-4 font-medium"
              data-testid="button-clear"
            >
              C
            </Button>
            <Button
              variant="outline"
              onClick={() => setExpression(prev => prev.slice(0, -1))}
              className="bg-muted/50 hover:bg-muted border border-border rounded-lg py-3 px-4 font-medium"
              data-testid="button-backspace"
            >
              ⌫
            </Button>
            <Button
              variant="outline"
              onClick={() => appendToExpression('%')}
              className="bg-muted/50 hover:bg-muted border border-border rounded-lg py-3 px-4 font-medium"
              data-testid="button-percent"
            >
              %
            </Button>
            <Button
              variant="outline"
              onClick={() => appendToExpression('/')}
              className="bg-calculator/20 hover:bg-calculator/30 border border-calculator/40 text-calculator rounded-lg py-3 px-4 font-medium"
              data-testid="button-divide"
            >
              ÷
            </Button>

            {[
              ['7', '8', '9', '*'],
              ['4', '5', '6', '-'],
              ['1', '2', '3', '+'],
            ].map((row, rowIndex) => (
              row.map((btn, colIndex) => (
                <Button
                  key={`${rowIndex}-${colIndex}`}
                  variant="outline"
                  onClick={() => appendToExpression(btn)}
                  className={`${
                    ['*', '-', '+'].includes(btn)
                      ? 'bg-calculator/20 hover:bg-calculator/30 border border-calculator/40 text-calculator'
                      : 'bg-muted/50 hover:bg-muted border border-border'
                  } rounded-lg py-3 px-4 font-medium`}
                  data-testid={`button-${btn}`}
                >
                  {btn === '*' ? '×' : btn}
                </Button>
              ))
            ))}

            <Button
              variant="outline"
              onClick={() => appendToExpression('0')}
              className="bg-muted/50 hover:bg-muted border border-border rounded-lg py-3 px-4 font-medium col-span-2"
              data-testid="button-0"
            >
              0
            </Button>
            <Button
              variant="outline"
              onClick={() => appendToExpression('.')}
              className="bg-muted/50 hover:bg-muted border border-border rounded-lg py-3 px-4 font-medium"
              data-testid="button-decimal"
            >
              .
            </Button>
            <Button
              onClick={calculate}
              className="bg-calculator hover:bg-calculator/90 text-white rounded-lg py-3 px-4 font-medium"
              data-testid="button-equals"
            >
              =
            </Button>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Recent Calculations
              </h3>
              <div className="space-y-2">
                {history.slice(0, 3).map((calc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm font-mono cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpression(calc.expression)}
                    data-testid={`history-item-${index}`}
                  >
                    <span className="truncate">{calc.expression}</span>
                    <span className="text-calculator">= {calc.result.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Result</Label>
            <Card className="bg-calculator-background border border-calculator/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-calculator mb-2" data-testid="result-display">
                {result !== null ? result.toPrecision(10) : '0'}
              </div>
              <div className="text-sm text-calculator/70 mb-2">
                Angle mode: {angleMode.toUpperCase()}
              </div>
              {expression && (
                <div className="text-sm text-calculator/70">
                  Expression: {expression}
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
              data-testid="copy-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (result !== null) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('calc', `${expression}=${result}`);
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={result === null}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-calculation"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {result !== null && (
            <div>
              <h3 className="font-medium mb-3">Additional Information</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Scientific Notation</div>
                  <div className="text-sm text-muted-foreground">{result.toExponential(6)}</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Fixed Decimal</div>
                  <div className="text-sm text-muted-foreground">{result.toFixed(6)}</div>
                </Card>
                {result > 0 && (
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Natural Logarithm</div>
                    <div className="text-sm text-muted-foreground">{Math.log(result).toFixed(6)}</div>
                  </Card>
                )}
                {result > 0 && (
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Square Root</div>
                    <div className="text-sm text-muted-foreground">{Math.sqrt(result).toFixed(6)}</div>
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
