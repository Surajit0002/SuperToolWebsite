import { useState, useEffect } from "react";
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
import { ArrowUpDown, Copy, Share2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { useQuery } from "@tanstack/react-query";

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const { settings } = useSettings();
  const { toast } = useToast();

  // Popular currencies
  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "KRW", name: "South Korean Won", symbol: "₩" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽" },
    { code: "MXN", name: "Mexican Peso", symbol: "$" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  ];

  // Fetch exchange rates
  const { data: rates, isLoading, refetch } = useQuery({
    queryKey: ["/api/currency/rates", fromCurrency],
    enabled: !!fromCurrency,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Set default currencies on mount
  useEffect(() => {
    if (!fromCurrency) {
      setFromCurrency(settings.currency || "USD");
    }
    if (!toCurrency && fromCurrency) {
      const defaultTo = fromCurrency === "USD" ? "EUR" : "USD";
      setToCurrency(defaultTo);
    }
  }, [fromCurrency, toCurrency, settings.currency]);

  const convert = () => {
    const inputAmount = parseFloat(amount);
    if (isNaN(inputAmount) || inputAmount < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }

    if (!fromCurrency || !toCurrency) {
      toast({
        title: "Error",
        description: "Please select both currencies",
        variant: "destructive",
      });
      return;
    }

    if (!rates || !rates.rates) {
      toast({
        title: "Error",
        description: "Exchange rates not available. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (fromCurrency === toCurrency) {
      setResult(inputAmount);
      return;
    }

    const rate = rates.rates[toCurrency];
    if (!rate) {
      toast({
        title: "Error",
        description: "Exchange rate not found for selected currency",
        variant: "destructive",
      });
      return;
    }

    const convertedAmount = inputAmount * rate;
    setResult(convertedAmount);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    if (result !== null && amount) {
      setAmount(result.toString());
      // Convert will be called automatically via useEffect when currencies change
    }
  };

  const copyResult = () => {
    if (result !== null) {
      const currency = currencies.find(c => c.code === toCurrency);
      const symbol = currency?.symbol || toCurrency;
      navigator.clipboard.writeText(`${symbol}${result.toFixed(2)}`);
      toast({
        title: "Copied!",
        description: "Converted amount copied to clipboard",
      });
    }
  };

  const getSymbol = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  };

  const rate = rates?.rates?.[toCurrency];
  const lastUpdated = rates?.timestamp ? new Date(rates.timestamp * 1000) : null;

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="amount" className="block text-sm font-medium mb-2">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 text-lg"
              data-testid="currency-amount-input"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">From</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger data-testid="from-currency-select">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={swapCurrencies}
              disabled={!fromCurrency || !toCurrency}
              className="flex items-center space-x-2"
              data-testid="swap-currencies"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Swap</span>
            </Button>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">To</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger data-testid="to-currency-select">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={convert}
            disabled={!amount || !fromCurrency || !toCurrency || isLoading}
            className="w-full bg-converter hover:bg-converter/90 text-white py-3 text-lg font-medium"
            data-testid="convert-currency"
          >
            {isLoading ? "Loading rates..." : "Convert"}
          </Button>

          {rate && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Exchange Rate</h3>
              <div className="text-sm text-green-700">
                1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
              </div>
              {lastUpdated && (
                <div className="text-xs text-green-600 mt-1">
                  Updated: {lastUpdated.toLocaleString()}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="mt-2 text-green-700 hover:text-green-800"
                data-testid="refresh-rates"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh rates
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Converted Amount</Label>
            <Card className="bg-converter-background border border-converter/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-converter mb-2" data-testid="currency-result">
                {result !== null ? `${getSymbol(toCurrency)}${result.toFixed(2)}` : `${getSymbol(toCurrency || "USD")}0.00`}
              </div>
              <div className="text-sm text-converter/70">
                {toCurrency ? currencies.find(c => c.code === toCurrency)?.name : "Select currency"}
              </div>
              {amount && fromCurrency && toCurrency && result !== null && (
                <div className="text-sm text-converter/70 mt-2">
                  {getSymbol(fromCurrency)}{amount} {fromCurrency} = {getSymbol(toCurrency)}{result.toFixed(2)} {toCurrency}
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
              data-testid="copy-currency-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Amount</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (result !== null) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('conversion', `${amount}${fromCurrency}=${result.toFixed(2)}${toCurrency}`);
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={result === null}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-currency-conversion"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {result !== null && amount && rate && (
            <div>
              <h3 className="font-medium mb-3">Conversion Details</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Exchange Rate</div>
                  <div className="text-sm text-muted-foreground">
                    1 {fromCurrency} = {rate.toFixed(6)} {toCurrency}
                  </div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Inverse Rate</div>
                  <div className="text-sm text-muted-foreground">
                    1 {toCurrency} = {(1/rate).toFixed(6)} {fromCurrency}
                  </div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Amount Breakdown</div>
                  <div className="text-sm text-muted-foreground">
                    {amount} × {rate.toFixed(4)} = {result.toFixed(2)}
                  </div>
                </Card>
                {lastUpdated && (
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Data Source</div>
                    <div className="text-sm text-muted-foreground">
                      Live exchange rates from financial markets
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {lastUpdated.toLocaleString()}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Disclaimer</h3>
            <p className="text-sm text-yellow-700">
              Exchange rates are for informational purposes only and may not reflect real-time market rates. 
              For actual transactions, please consult your financial institution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
