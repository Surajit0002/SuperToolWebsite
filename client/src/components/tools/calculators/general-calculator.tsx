import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Clock, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GeneralCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<number | null>(null);
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
      // Basic safety check - only allow numbers, operators, and parentheses
      const safeExpression = expression.replace(/[^0-9+\-*/().%]/g, '');
      
      // Handle percentage
      const processedExpression = safeExpression.replace(/(\d+)%/g, '($1/100)');
      
      // Evaluate expression
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

  const shareCalculation = () => {
    if (result !== null) {
      const url = new URL(window.location.href);
      url.searchParams.set('calc', `${expression}=${result}`);
      navigator.clipboard.writeText(url.toString());
      toast({
        title: "Link copied!",
        description: "Shareable link copied to clipboard",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      calculate();
    } else if (e.key === 'Escape') {
      clearExpression();
    }
  };

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
              onKeyDown={handleKeyPress}
              placeholder="Enter calculation (e.g., 2 + 3 * 4)"
              className="w-full px-4 py-3 text-lg font-mono bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-calculator focus:border-transparent"
              data-testid="calculator-input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supports +, -, *, /, %, ^, parentheses
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {/* Calculator Button Grid */}
            <Button
              variant="outline"
              onClick={clearExpression}
              className="bg-muted/50 hover:bg-muted border border-border rounded-lg py-3 px-4 font-medium text-lg"
              data-testid="button-clear"
            >
              C
            </Button>
            <Button
              variant="outline"
              onClick={() => setExpression(prev => prev.slice(0, -1))}
              className="bg-muted/50 hover:bg-muted border border-border rounded-lg py-3 px-4 font-medium text-lg"
              data-testid="button-backspace"
            >
              ⌫
            </Button>
            <Button
              variant="outline"
              onClick={() => appendToExpression('%')}
              className="bg-muted/50 hover:bg-muted border border-border rounded-lg py-3 px-4 font-medium text-lg"
              data-testid="button-percent"
            >
              %
            </Button>
            <Button
              variant="outline"
              onClick={() => appendToExpression('/')}
              className="bg-calculator/20 hover:bg-calculator/30 border border-calculator/40 text-calculator rounded-lg py-3 px-4 font-medium text-lg"
              data-testid="button-divide"
            >
              ÷
            </Button>

            {/* Number rows */}
            {[
              ['7', '8', '9', '*'],
              ['4', '5', '6', '-'],
              ['1', '2', '3', '+'],
            ].map((row, rowIndex) => (
              row.map((btn, colIndex) => (
                <Button
                  key={`${rowIndex}-${colIndex}`}
                  variant="outline"
                  onClick={() => appendToExpression(btn === '*' ? '*' : btn)}
                  className={`${
                    ['*', '-', '+'].includes(btn)
                      ? 'bg-calculator/20 hover:bg-calculator/30 border border-calculator/40 text-calculator'
                      : 'bg-muted/50 hover:bg-muted border border-border'
                  } rounded-lg py-3 px-4 font-medium text-lg`}
                  data-testid={`button-${btn}`}
                >
                  {btn === '*' ? '×' : btn}
                </Button>
              ))
            ))}

            <Button
              variant="outline"
              onClick={() => appendToExpression('0')}
              className="bg-muted/50 hover:bg-muted border border-border rounded-lg py-3 px-4 font-medium text-lg col-span-2"
              data-testid="button-0"
            >
              0
            </Button>
            <Button
              variant="outline"
              onClick={() => appendToExpression('.')}
              className="bg-muted/50 hover:bg-muted border border-border rounded-lg py-3 px-4 font-medium text-lg"
              data-testid="button-decimal"
            >
              .
            </Button>
            <Button
              onClick={calculate}
              className="bg-calculator hover:bg-calculator/90 text-white rounded-lg py-3 px-4 font-medium text-lg"
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
                {history.slice(0, 5).map((calc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm font-mono cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpression(calc.expression)}
                    data-testid={`history-item-${index}`}
                  >
                    <span>{calc.expression}</span>
                    <span className="text-calculator">= {calc.result}</span>
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
                {result !== null ? result : '0'}
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
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-calculator/10 hover:bg-calculator/20 border border-calculator/20 text-calculator rounded-xl font-medium transition-colors"
              data-testid="copy-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </Button>
            <Button
              variant="outline"
              onClick={shareCalculation}
              disabled={result === null}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium transition-colors"
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
                  <div className="text-sm font-medium mb-1">Decimal Places</div>
                  <div className="text-sm text-muted-foreground">{result.toFixed(2)}</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Scientific Notation</div>
                  <div className="text-sm text-muted-foreground">{result.toExponential(2)}</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Binary</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {Number.isInteger(result) ? result.toString(2) : 'N/A'}
                  </div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Hexadecimal</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {Number.isInteger(result) ? result.toString(16).toUpperCase() : 'N/A'}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
