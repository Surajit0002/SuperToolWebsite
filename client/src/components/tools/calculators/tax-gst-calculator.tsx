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
import { Copy, Share2, Receipt, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";

export default function TaxGSTCalculator() {
  const [amount, setAmount] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [calculationType, setCalculationType] = useState<"add" | "remove" | "exclusive" | "inclusive">("add");
  const [presetRate, setPresetRate] = useState<string>("");
  const [result, setResult] = useState<{
    originalAmount: number;
    taxAmount: number;
    finalAmount: number;
    effectiveRate: number;
  } | null>(null);
  const { settings } = useSettings();
  const { toast } = useToast();

  const taxPresets = {
    "5": "5% (GST - Some countries)",
    "7": "7% (Singapore GST)",
    "8": "8% (Japan Consumption Tax)",
    "10": "10% (Australia GST)",
    "12": "12% (Standard rate)",
    "15": "15% (Canada HST)",
    "18": "18% (India GST)",
    "19": "19% (Germany VAT)",
    "20": "20% (UK VAT)",
    "21": "21% (Netherlands VAT)",
    "25": "25% (Sweden VAT)",
  };

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
    const amountValue = parseFloat(amount);
    const rateValue = parseFloat(taxRate);

    if (isNaN(amountValue) || isNaN(rateValue) || amountValue < 0 || rateValue < 0) {
      toast({
        title: "Error",
        description: "Please enter valid positive numbers",
        variant: "destructive",
      });
      return;
    }

    if (rateValue > 100) {
      toast({
        title: "Error",
        description: "Tax rate cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }

    let originalAmount: number;
    let taxAmount: number;
    let finalAmount: number;
    let effectiveRate: number;

    switch (calculationType) {
      case "add":
      case "exclusive":
        // Add tax to amount (tax-exclusive)
        originalAmount = amountValue;
        taxAmount = (originalAmount * rateValue) / 100;
        finalAmount = originalAmount + taxAmount;
        effectiveRate = rateValue;
        break;

      case "remove":
      case "inclusive":
        // Remove tax from amount (tax-inclusive)
        finalAmount = amountValue;
        originalAmount = finalAmount / (1 + rateValue / 100);
        taxAmount = finalAmount - originalAmount;
        effectiveRate = (taxAmount / originalAmount) * 100;
        break;

      default:
        return;
    }

    setResult({
      originalAmount,
      taxAmount,
      finalAmount,
      effectiveRate,
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
      const text = `Tax Calculation:\nOriginal Amount: ${formatCurrency(result.originalAmount)}\nTax Amount: ${formatCurrency(result.taxAmount)}\nFinal Amount: ${formatCurrency(result.finalAmount)}\nTax Rate: ${result.effectiveRate.toFixed(2)}%`;
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Tax calculation copied to clipboard",
      });
    }
  };

  const handlePresetChange = (value: string) => {
    setPresetRate(value);
    setTaxRate(value);
  };

  const getCalculationTypeDescription = () => {
    switch (calculationType) {
      case "add":
      case "exclusive":
        return "Add tax to the amount (tax-exclusive pricing)";
      case "remove":
      case "inclusive":
        return "Remove tax from the amount (tax-inclusive pricing)";
      default:
        return "";
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="amount" className="block text-sm font-medium mb-2">
              Amount ({getCurrencySymbol()})
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100.00"
              className="w-full px-4 py-3 text-lg"
              data-testid="amount-input"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Calculation Type</Label>
            <Select value={calculationType} onValueChange={(value: any) => setCalculationType(value)}>
              <SelectTrigger data-testid="calculation-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Tax (Tax Exclusive)</SelectItem>
                <SelectItem value="remove">Remove Tax (Tax Inclusive)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {getCalculationTypeDescription()}
            </p>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Tax Rate Presets</Label>
            <Select value={presetRate} onValueChange={handlePresetChange}>
              <SelectTrigger data-testid="preset-rate-select">
                <SelectValue placeholder="Select a common rate" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(taxPresets).map(([rate, description]) => (
                  <SelectItem key={rate} value={rate}>
                    {description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="taxRate" className="block text-sm font-medium mb-2">
              Tax Rate (%)
            </Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              value={taxRate}
              onChange={(e) => {
                setTaxRate(e.target.value);
                setPresetRate(""); // Clear preset when manually entering
              }}
              placeholder="10.00"
              className="w-full px-4 py-3 text-lg"
              data-testid="tax-rate-input"
            />
          </div>

          <Button
            onClick={calculate}
            disabled={!amount || !taxRate}
            className="w-full bg-calculator hover:bg-calculator/90 text-white py-3 text-lg font-medium"
            data-testid="calculate-tax"
          >
            <Receipt className="w-5 h-5 mr-2" />
            Calculate Tax
          </Button>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Quick Examples</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span>Add 10% to $100:</span>
                  <span className="font-mono">$110.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Remove 10% from $110:</span>
                  <span className="font-mono">$100.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax amount in both:</span>
                  <span className="font-mono">$10.00</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Common Use Cases</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Adding sales tax to product prices</li>
                <li>• Calculating VAT for international sales</li>
                <li>• Determining base price from total amount</li>
                <li>• Business expense calculations</li>
                <li>• Invoice preparation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">
              {calculationType === "add" || calculationType === "exclusive" ? "Total Amount (with tax)" : "Original Amount (without tax)"}
            </Label>
            <Card className="bg-calculator-background border border-calculator/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-calculator mb-2" data-testid="tax-result">
                {result ? formatCurrency(calculationType === "add" || calculationType === "exclusive" ? result.finalAmount : result.originalAmount) : `${getCurrencySymbol()}0.00`}
              </div>
              <div className="text-sm text-calculator/70">
                {calculationType === "add" || calculationType === "exclusive" ? "Final amount including tax" : "Base amount excluding tax"}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-calculator/10 hover:bg-calculator/20 border border-calculator/20 text-calculator rounded-xl font-medium"
              data-testid="copy-tax-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (result) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('amount', amount);
                  url.searchParams.set('rate', taxRate);
                  url.searchParams.set('type', calculationType);
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-tax-calculation"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {result && (
            <div>
              <h3 className="font-medium mb-3">Tax Breakdown</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Original Amount</div>
                  <div className="text-lg font-bold text-foreground">{formatCurrency(result.originalAmount)}</div>
                  <div className="text-xs text-muted-foreground">Amount before tax</div>
                </Card>
                <Card className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="text-sm font-medium text-orange-800 mb-1">Tax Amount</div>
                  <div className="text-lg font-bold text-orange-700">{formatCurrency(result.taxAmount)}</div>
                  <div className="text-xs text-orange-600">Tax portion</div>
                </Card>
                <Card className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="text-sm font-medium text-green-800 mb-1">Final Amount</div>
                  <div className="text-lg font-bold text-green-700">{formatCurrency(result.finalAmount)}</div>
                  <div className="text-xs text-green-600">Total including tax</div>
                </Card>
                <Card className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-sm font-medium text-blue-800 mb-1">Effective Tax Rate</div>
                  <div className="text-lg font-bold text-blue-700">{result.effectiveRate.toFixed(3)}%</div>
                  <div className="text-xs text-blue-600">Calculated rate</div>
                </Card>
              </div>
            </div>
          )}

          {result && (
            <div>
              <h3 className="font-medium mb-3">Calculation Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tax as % of original:</span>
                  <span className="font-mono">{((result.taxAmount / result.originalAmount) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax as % of total:</span>
                  <span className="font-mono">{((result.taxAmount / result.finalAmount) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-medium">Markup factor:</span>
                  <span className="font-mono font-medium">{(result.finalAmount / result.originalAmount).toFixed(4)}x</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Important Notes</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Tax rates vary by location and product type</li>
              <li>• Some items may be tax-exempt</li>
              <li>• Business taxes may have different rules</li>
              <li>• Consult local tax authorities for official rates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}