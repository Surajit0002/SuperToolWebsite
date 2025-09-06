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
import { Copy, Share2, TrendingUp, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";

export default function InvestmentCalculator() {
  const [initialAmount, setInitialAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [annualReturn, setAnnualReturn] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("");
  const [timeUnit, setTimeUnit] = useState<"years" | "months">("years");
  const [compounding, setCompounding] = useState<"monthly" | "quarterly" | "annually">("monthly");
  const [result, setResult] = useState<{
    finalAmount: number;
    totalContributions: number;
    totalInterest: number;
    yearlyBreakdown: Array<{
      year: number;
      startBalance: number;
      contributions: number;
      interest: number;
      endBalance: number;
    }>;
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
    const initial = parseFloat(initialAmount) || 0;
    const monthly = parseFloat(monthlyContribution) || 0;
    const rate = parseFloat(annualReturn);
    const time = parseFloat(timeHorizon);

    if (isNaN(rate) || isNaN(time) || rate < 0 || time <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid positive numbers for return rate and time",
        variant: "destructive",
      });
      return;
    }

    if (initial < 0 || monthly < 0) {
      toast({
        title: "Error",
        description: "Investment amounts cannot be negative",
        variant: "destructive",
      });
      return;
    }

    const years = timeUnit === "years" ? time : time / 12;
    const totalMonths = years * 12;
    
    // Determine compounding frequency
    const compoundingsPerYear = compounding === "monthly" ? 12 : compounding === "quarterly" ? 4 : 1;
    const periodRate = rate / 100 / compoundingsPerYear;
    const monthlyRate = rate / 100 / 12;

    let balance = initial;
    const yearlyBreakdown = [];
    let totalContributions = initial;

    // Calculate year by year for breakdown
    for (let year = 1; year <= Math.ceil(years); year++) {
      const startBalance = balance;
      const startContributions = totalContributions;
      
      const monthsThisYear = Math.min(12, totalMonths - (year - 1) * 12);
      
      // Add monthly contributions with compound interest
      for (let month = 1; month <= monthsThisYear; month++) {
        // Add monthly contribution
        balance += monthly;
        totalContributions += monthly;
        
        // Apply monthly compound interest
        balance *= (1 + monthlyRate);
      }

      const contributionsThisYear = totalContributions - startContributions;
      const interestThisYear = balance - startBalance - contributionsThisYear;

      yearlyBreakdown.push({
        year,
        startBalance,
        contributions: contributionsThisYear,
        interest: interestThisYear,
        endBalance: balance,
      });

      if ((year - 1) * 12 + monthsThisYear >= totalMonths) break;
    }

    const totalInterest = balance - totalContributions;

    setResult({
      finalAmount: balance,
      totalContributions,
      totalInterest,
      yearlyBreakdown,
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
      const text = `Investment Result:\nFinal Amount: ${formatCurrency(result.finalAmount)}\nTotal Contributions: ${formatCurrency(result.totalContributions)}\nTotal Growth: ${formatCurrency(result.totalInterest)}`;
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Investment calculation copied to clipboard",
      });
    }
  };

  const downloadBreakdown = () => {
    if (!result) return;

    const csv = ["Year,Start Balance,Contributions,Interest Earned,End Balance"];
    result.yearlyBreakdown.forEach(year => {
      csv.push(`${year.year},${year.startBalance.toFixed(2)},${year.contributions.toFixed(2)},${year.interest.toFixed(2)},${year.endBalance.toFixed(2)}`);
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'investment-breakdown.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Investment breakdown downloaded as CSV",
    });
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="initial" className="block text-sm font-medium mb-2">
              Initial Investment ({getCurrencySymbol()})
            </Label>
            <Input
              id="initial"
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              placeholder="10000"
              className="w-full px-4 py-3 text-lg"
              data-testid="initial-amount-input"
            />
          </div>

          <div>
            <Label htmlFor="monthly" className="block text-sm font-medium mb-2">
              Monthly Contribution ({getCurrencySymbol()})
            </Label>
            <Input
              id="monthly"
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              placeholder="500"
              className="w-full px-4 py-3 text-lg"
              data-testid="monthly-contribution-input"
            />
          </div>

          <div>
            <Label htmlFor="return" className="block text-sm font-medium mb-2">
              Expected Annual Return (%)
            </Label>
            <Input
              id="return"
              type="number"
              step="0.1"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(e.target.value)}
              placeholder="8.0"
              className="w-full px-4 py-3 text-lg"
              data-testid="annual-return-input"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Investment Period</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(e.target.value)}
                placeholder="20"
                className="flex-1 px-4 py-3 text-lg"
                data-testid="time-horizon-input"
              />
              <Select value={timeUnit} onValueChange={(value: any) => setTimeUnit(value)}>
                <SelectTrigger className="w-32" data-testid="time-unit-select">
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
            <Label className="block text-sm font-medium mb-2">Compounding Frequency</Label>
            <Select value={compounding} onValueChange={(value: any) => setCompounding(value)}>
              <SelectTrigger data-testid="compounding-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={calculate}
            disabled={!annualReturn || !timeHorizon}
            className="w-full bg-calculator hover:bg-calculator/90 text-white py-3 text-lg font-medium"
            data-testid="calculate-investment"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Calculate Returns
          </Button>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Investment Tips</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Historical S&P 500 average: ~10% annually</li>
              <li>• Conservative estimate: 6-8% annually</li>
              <li>• Consider inflation (~3% annually)</li>
              <li>• Diversify your portfolio</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Final Investment Value</Label>
            <Card className="bg-calculator-background border border-calculator/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-calculator mb-2" data-testid="final-amount">
                {result ? formatCurrency(result.finalAmount) : `${getCurrencySymbol()}0`}
              </div>
              <div className="text-sm text-calculator/70">After {timeHorizon} {timeUnit}</div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-calculator/10 hover:bg-calculator/20 border border-calculator/20 text-calculator rounded-xl font-medium"
              data-testid="copy-investment-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </Button>
            <Button
              variant="outline"
              onClick={downloadBreakdown}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="download-breakdown"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </Button>
          </div>

          {result && (
            <div>
              <h3 className="font-medium mb-3">Investment Summary</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="text-sm font-medium text-green-800 mb-1">Total Growth</div>
                  <div className="text-lg font-bold text-green-700">{formatCurrency(result.totalInterest)}</div>
                  <div className="text-xs text-green-600">
                    {((result.totalInterest / result.totalContributions) * 100).toFixed(1)}% return on investment
                  </div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Total Contributions</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(result.totalContributions)}</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Investment Breakdown</div>
                  <div className="text-sm text-muted-foreground">
                    {((result.totalContributions / result.finalAmount) * 100).toFixed(1)}% contributions, {" "}
                    {((result.totalInterest / result.finalAmount) * 100).toFixed(1)}% growth
                  </div>
                </Card>
              </div>
            </div>
          )}

          {result && result.yearlyBreakdown.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Yearly Breakdown (Last 5 Years)</h3>
              <div className="space-y-2">
                {result.yearlyBreakdown.slice(-5).map((year) => (
                  <Card key={year.year} className="p-3 bg-muted/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Year {year.year}</span>
                      <span className="text-sm font-mono">{formatCurrency(year.endBalance)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Growth: {formatCurrency(year.interest)} | Contributions: {formatCurrency(year.contributions)}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}