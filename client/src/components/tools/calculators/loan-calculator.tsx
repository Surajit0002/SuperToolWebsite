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
import { Copy, Share2, Download, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [term, setTerm] = useState("");
  const [termUnit, setTermUnit] = useState<"months" | "years">("years");
  const [compounding, setCompounding] = useState<"monthly" | "annually">("monthly");
  const [result, setResult] = useState<{
    emi: number;
    totalInterest: number;
    totalPayment: number;
    monthlyRate: number;
    totalMonths: number;
  } | null>(null);
  const { settings } = useSettings();
  const { toast } = useToast();

  const getCurrencySymbol = () => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    };
    return symbols[settings.currency] || "$";
  };

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(term);

    if (isNaN(p) || isNaN(r) || isNaN(t) || p <= 0 || r < 0 || t <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid positive numbers",
        variant: "destructive",
      });
      return;
    }

    // Convert to monthly values
    const totalMonths = termUnit === "years" ? t * 12 : t;
    const monthlyRate = compounding === "monthly" ? r / 100 / 12 : r / 100 / 12;

    let emi: number;
    if (monthlyRate === 0) {
      // Simple division if no interest
      emi = p / totalMonths;
    } else {
      // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
      const compound = Math.pow(1 + monthlyRate, totalMonths);
      emi = (p * monthlyRate * compound) / (compound - 1);
    }

    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - p;

    setResult({
      emi,
      totalInterest,
      totalPayment,
      monthlyRate: monthlyRate * 100,
      totalMonths
    });
  };

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol()}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const copyResult = () => {
    if (result) {
      const text = `EMI: ${formatCurrency(result.emi)}\nTotal Interest: ${formatCurrency(result.totalInterest)}\nTotal Payment: ${formatCurrency(result.totalPayment)}`;
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Loan calculation copied to clipboard",
      });
    }
  };

  const downloadSchedule = () => {
    if (!result) return;

    const schedule = [];
    let balance = parseFloat(principal);
    const monthlyRate = result.monthlyRate / 100;

    schedule.push("Month,EMI,Principal,Interest,Balance");

    for (let month = 1; month <= result.totalMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = result.emi - interestPayment;
      balance -= principalPayment;

      schedule.push(
        `${month},${result.emi.toFixed(2)},${principalPayment.toFixed(2)},${interestPayment.toFixed(2)},${Math.max(0, balance).toFixed(2)}`
      );
    }

    const blob = new Blob([schedule.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loan-amortization-schedule.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Amortization schedule downloaded as CSV",
    });
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="principal" className="block text-sm font-medium mb-2">
              Loan Amount ({getCurrencySymbol()})
            </Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="100000"
              className="w-full px-4 py-3 text-lg"
              data-testid="principal-input"
            />
          </div>

          <div>
            <Label htmlFor="rate" className="block text-sm font-medium mb-2">
              Annual Interest Rate (%)
            </Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="5.5"
              className="w-full px-4 py-3 text-lg"
              data-testid="rate-input"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Loan Term</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="30"
                className="flex-1 px-4 py-3 text-lg"
                data-testid="term-input"
              />
              <Select value={termUnit} onValueChange={(value: any) => setTermUnit(value)}>
                <SelectTrigger className="w-32" data-testid="term-unit-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="years">Years</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Compounding</Label>
            <Select value={compounding} onValueChange={(value: any) => setCompounding(value)}>
              <SelectTrigger data-testid="compounding-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={calculate}
            disabled={!principal || !rate || !term}
            className="w-full bg-calculator hover:bg-calculator/90 text-white py-3 text-lg font-medium"
            data-testid="calculate-loan"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Calculate EMI
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">EMI Formula</h3>
            <p className="text-sm text-blue-700">
              EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ - 1)
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Where P = Principal, r = Monthly rate, n = Number of months
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Monthly EMI</Label>
            <Card className="bg-calculator-background border border-calculator/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-calculator mb-2" data-testid="emi-result">
                {result ? formatCurrency(result.emi) : `${getCurrencySymbol()}0`}
              </div>
              <div className="text-sm text-calculator/70">Equated Monthly Installment</div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-calculator/10 hover:bg-calculator/20 border border-calculator/20 text-calculator rounded-xl font-medium"
              data-testid="copy-loan-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </Button>
            <Button
              variant="outline"
              onClick={downloadSchedule}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="download-schedule"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </Button>
          </div>

          {result && (
            <div>
              <h3 className="font-medium mb-3">Loan Summary</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Total Interest</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(result.totalInterest)}</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Total Payment</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(result.totalPayment)}</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Monthly Interest Rate</div>
                  <div className="text-sm text-muted-foreground">{result.monthlyRate.toFixed(4)}%</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Loan Term</div>
                  <div className="text-sm text-muted-foreground">{result.totalMonths} months</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Interest vs Principal</div>
                  <div className="text-sm text-muted-foreground">
                    {((result.totalInterest / result.totalPayment) * 100).toFixed(1)}% interest, {" "}
                    {((parseFloat(principal) / result.totalPayment) * 100).toFixed(1)}% principal
                  </div>
                </Card>
              </div>
            </div>
          )}

          {result && (
            <div>
              <h3 className="font-medium mb-3">Quick Comparison</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>If paid off 1 year early:</span>
                  <span className="text-green-600">
                    Save ~{formatCurrency(result.emi * 12 * 0.8)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Extra {formatCurrency(100)}/month saves:</span>
                  <span className="text-green-600">
                    ~{Math.round(result.totalMonths * 0.15)} months
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
