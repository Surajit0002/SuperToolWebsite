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
import { Copy, Share2, PiggyBank, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import LineChart from "@/components/charts/line-chart";

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState<"years" | "months">("years");
  const [compounding, setCompounding] = useState<"daily" | "monthly" | "quarterly" | "annually">("annually");
  const [additionalDeposit, setAdditionalDeposit] = useState("");
  const [depositFrequency, setDepositFrequency] = useState<"monthly" | "quarterly" | "annually">("monthly");
  const [result, setResult] = useState<{
    finalAmount: number;
    totalInterest: number;
    totalDeposits: number;
    yearlyBreakdown: Array<{
      year: number;
      startAmount: number;
      deposits: number;
      interest: number;
      endAmount: number;
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

  const getCompoundingFrequency = () => {
    switch (compounding) {
      case "daily": return 365;
      case "monthly": return 12;
      case "quarterly": return 4;
      case "annually": return 1;
      default: return 1;
    }
  };

  const getDepositFrequency = () => {
    switch (depositFrequency) {
      case "monthly": return 12;
      case "quarterly": return 4;
      case "annually": return 1;
      default: return 12;
    }
  };

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(time);
    const additionalDepositAmount = parseFloat(additionalDeposit) || 0;

    if (isNaN(p) || isNaN(r) || isNaN(t) || p < 0 || r < 0 || t <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid positive numbers",
        variant: "destructive",
      });
      return;
    }

    const years = timeUnit === "years" ? t : t / 12;
    const n = getCompoundingFrequency(); // Compounding frequency per year
    const depositFreq = getDepositFrequency(); // Deposit frequency per year
    const annualRate = r / 100;

    // Calculate compound interest with regular deposits
    let amount = p;
    let totalDeposits = p;
    const yearlyBreakdown = [];

    for (let year = 1; year <= years; year++) {
      const startAmount = amount;
      const startTotalDeposits = totalDeposits;

      // Calculate deposits for this year
      const depositsThisYear = additionalDepositAmount * depositFreq;
      
      if (n === depositFreq) {
        // If compounding and deposit frequencies match, use PMT formula
        const periodicRate = annualRate / n;
        for (let period = 1; period <= n; period++) {
          amount = amount * (1 + periodicRate) + additionalDepositAmount;
        }
      } else {
        // Different frequencies - calculate month by month for accuracy
        const monthlyRate = annualRate / 12;
        const monthlyDeposit = additionalDepositAmount * depositFreq / 12;
        
        for (let month = 1; month <= 12; month++) {
          // Apply monthly compound interest
          amount *= (1 + monthlyRate);
          // Add monthly portion of deposits
          amount += monthlyDeposit;
        }
      }

      totalDeposits += depositsThisYear;
      const interestThisYear = amount - startAmount - depositsThisYear;

      yearlyBreakdown.push({
        year,
        startAmount,
        deposits: depositsThisYear,
        interest: interestThisYear,
        endAmount: amount,
      });
    }

    const totalInterest = amount - totalDeposits;

    setResult({
      finalAmount: amount,
      totalInterest,
      totalDeposits,
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
      const text = `Compound Interest Result:\nFinal Amount: ${formatCurrency(result.finalAmount)}\nTotal Interest: ${formatCurrency(result.totalInterest)}\nTotal Deposits: ${formatCurrency(result.totalDeposits)}`;
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Compound interest calculation copied to clipboard",
      });
    }
  };

  const downloadBreakdown = () => {
    if (!result) return;

    const csv = ["Year,Start Amount,Deposits,Interest Earned,End Amount"];
    result.yearlyBreakdown.forEach(year => {
      csv.push(`${year.year},${year.startAmount.toFixed(2)},${year.deposits.toFixed(2)},${year.interest.toFixed(2)},${year.endAmount.toFixed(2)}`);
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compound-interest-breakdown.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Compound interest breakdown downloaded as CSV",
    });
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="principal" className="block text-sm font-medium mb-2">
              Initial Principal ({getCurrencySymbol()})
            </Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="10000"
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
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="5.0"
              className="w-full px-4 py-3 text-lg"
              data-testid="rate-input"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Time Period</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10"
                className="flex-1 px-4 py-3 text-lg"
                data-testid="time-input"
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
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="additional" className="block text-sm font-medium mb-2">
              Additional Deposits ({getCurrencySymbol()}) - Optional
            </Label>
            <Input
              id="additional"
              type="number"
              value={additionalDeposit}
              onChange={(e) => setAdditionalDeposit(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-3 text-lg"
              data-testid="additional-deposit-input"
            />
          </div>

          {additionalDeposit && (
            <div>
              <Label className="block text-sm font-medium mb-2">Deposit Frequency</Label>
              <Select value={depositFrequency} onValueChange={(value: any) => setDepositFrequency(value)}>
                <SelectTrigger data-testid="deposit-frequency-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={calculate}
            disabled={!principal || !rate || !time}
            className="w-full bg-calculator hover:bg-calculator/90 text-white py-3 text-lg font-medium"
            data-testid="calculate-compound-interest"
          >
            <PiggyBank className="w-5 h-5 mr-2" />
            Calculate Interest
          </Button>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Compound Interest Formula</h3>
            <p className="text-sm text-green-700">
              A = P(1 + r/n)^(nt)
            </p>
            <p className="text-xs text-green-600 mt-1">
              Where A = final amount, P = principal, r = rate, n = compounding frequency, t = time
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Final Amount</Label>
            <Card className="bg-calculator-background border border-calculator/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-calculator mb-2" data-testid="final-amount">
                {result ? formatCurrency(result.finalAmount) : `${getCurrencySymbol()}0`}
              </div>
              <div className="text-sm text-calculator/70">after {time} {timeUnit}</div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-calculator/10 hover:bg-calculator/20 border border-calculator/20 text-calculator rounded-xl font-medium"
              data-testid="copy-compound-result"
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
              <h3 className="font-medium mb-3">Compound Growth Over Time</h3>
              <Card className="p-4 bg-muted/30 rounded-xl">
                <LineChart
                  data={result.yearlyBreakdown.map(year => ({
                    name: year.year,
                    Principal: year.startAmount + year.deposits - year.interest,
                    Interest: year.interest,
                    Total: year.endAmount
                  }))}
                  lines={[
                    { dataKey: "Principal", name: "Principal", color: "#3b82f6" },
                    { dataKey: "Interest", name: "Compound Interest", color: "#10b981" },
                    { dataKey: "Total", name: "Total Value", color: "#8b5cf6" }
                  ]}
                  title="Compound Interest Growth"
                  xLabel="Year"
                  yLabel="Amount"
                  valueFormatter={(value) => getCurrencySymbol() + value.toLocaleString()}
                  height={250}
                />
              </Card>
            </div>
          )}

          {result && (
            <div>
              <h3 className="font-medium mb-3">Interest Summary</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="text-sm font-medium text-green-800 mb-1">Total Interest Earned</div>
                  <div className="text-lg font-bold text-green-700">{formatCurrency(result.totalInterest)}</div>
                  <div className="text-xs text-green-600">
                    {((result.totalInterest / result.totalDeposits) * 100).toFixed(1)}% return
                  </div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Total Deposits</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(result.totalDeposits)}</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Growth Breakdown</div>
                  <div className="text-sm text-muted-foreground">
                    {((result.totalDeposits / result.finalAmount) * 100).toFixed(1)}% deposits, {" "}
                    {((result.totalInterest / result.finalAmount) * 100).toFixed(1)}% interest
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
                      <span className="text-sm font-mono">{formatCurrency(year.endAmount)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Interest: {formatCurrency(year.interest)} | Deposits: {formatCurrency(year.deposits)}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div>
              <h3 className="font-medium mb-3">Power of Compounding</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Without compounding:</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(result.totalDeposits + (result.totalDeposits * (parseFloat(rate) / 100) * parseFloat(time)))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>With compounding:</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(result.finalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-medium">Compounding benefit:</span>
                  <span className="text-green-600 font-bold">
                    {formatCurrency(result.finalAmount - (result.totalDeposits + (result.totalDeposits * (parseFloat(rate) / 100) * parseFloat(time))))}
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