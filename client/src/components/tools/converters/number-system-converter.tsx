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
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Share2, Binary } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NumberSystemConverter() {
  const [inputValue, setInputValue] = useState("");
  const [inputBase, setInputBase] = useState<string>("10");
  const [results, setResults] = useState<{
    binary: string;
    decimal: string;
    octal: string;
    hexadecimal: string;
  } | null>(null);
  const [bitWidth, setBitWidth] = useState<string>("32");
  const [signed, setSigned] = useState(false);
  const { toast } = useToast();

  const bases = [
    { value: "2", name: "Binary", example: "1010" },
    { value: "8", name: "Octal", example: "755" },
    { value: "10", name: "Decimal", example: "123" },
    { value: "16", name: "Hexadecimal", example: "7F" },
  ];

  const bitWidths = ["8", "16", "32", "64"];

  const isValidInput = (value: string, base: number): boolean => {
    if (!value.trim()) return false;
    
    const cleanValue = value.replace(/[^0-9A-Fa-f]/g, '');
    
    try {
      const allowedChars = base <= 10 ? 
        '0123456789'.slice(0, base) : 
        '0123456789ABCDEF'.slice(0, base);
      
      return cleanValue.split('').every(char => 
        allowedChars.includes(char.toUpperCase())
      );
    } catch {
      return false;
    }
  };

  const convertToDecimal = (value: string, base: number): number => {
    const cleanValue = value.replace(/[^0-9A-Fa-f]/g, '');
    return parseInt(cleanValue, base);
  };

  const applyBitWidth = (decimal: number): number => {
    const width = parseInt(bitWidth);
    const maxUnsigned = Math.pow(2, width) - 1;
    const maxSigned = Math.pow(2, width - 1) - 1;
    const minSigned = -Math.pow(2, width - 1);

    if (signed) {
      if (decimal > maxSigned) return maxSigned;
      if (decimal < minSigned) return minSigned;
      return decimal;
    } else {
      if (decimal > maxUnsigned) return maxUnsigned;
      if (decimal < 0) return 0;
      return decimal;
    }
  };

  const convert = () => {
    if (!inputValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter a number to convert",
        variant: "destructive",
      });
      return;
    }

    const base = parseInt(inputBase);
    
    if (!isValidInput(inputValue, base)) {
      toast({
        title: "Error",
        description: `Invalid ${bases.find(b => b.value === inputBase)?.name} number`,
        variant: "destructive",
      });
      return;
    }

    try {
      let decimal = convertToDecimal(inputValue, base);
      decimal = applyBitWidth(decimal);

      // Handle negative numbers for binary representation
      const width = parseInt(bitWidth);
      let binaryResult: string;
      
      if (signed && decimal < 0) {
        // Two's complement representation
        const unsignedValue = Math.pow(2, width) + decimal;
        binaryResult = unsignedValue.toString(2).padStart(width, '0');
      } else {
        binaryResult = decimal.toString(2).padStart(width, '0');
      }

      setResults({
        binary: binaryResult,
        decimal: decimal.toString(),
        octal: decimal.toString(8),
        hexadecimal: decimal.toString(16).toUpperCase(),
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert number. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const copyResult = (format: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied!",
      description: `${format} value copied to clipboard`,
    });
  };

  const copyAllResults = () => {
    if (results) {
      const text = `Binary: ${results.binary}\nDecimal: ${results.decimal}\nOctal: ${results.octal}\nHexadecimal: ${results.hexadecimal}`;
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "All results copied to clipboard",
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Input Base</Label>
            <Select value={inputBase} onValueChange={setInputBase}>
              <SelectTrigger data-testid="input-base-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bases.map((base) => (
                  <SelectItem key={base.value} value={base.value}>
                    {base.name} (Base {base.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="inputValue" className="block text-sm font-medium mb-2">
              Number
            </Label>
            <Input
              id="inputValue"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toUpperCase())}
              placeholder={bases.find(b => b.value === inputBase)?.example || "Enter number"}
              className="w-full px-4 py-3 text-lg font-mono"
              data-testid="number-input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Valid characters for {bases.find(b => b.value === inputBase)?.name}: {
                parseInt(inputBase) <= 10 ? 
                  `0-${parseInt(inputBase) - 1}` : 
                  `0-9, A-${String.fromCharCode(55 + parseInt(inputBase))}`
              }
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Bit Width</Label>
              <Select value={bitWidth} onValueChange={setBitWidth}>
                <SelectTrigger data-testid="bit-width-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bitWidths.map((width) => (
                    <SelectItem key={width} value={width}>
                      {width} bits
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 mt-8">
              <Checkbox
                id="signed"
                checked={signed}
                onCheckedChange={setSigned}
                data-testid="signed-checkbox"
              />
              <Label htmlFor="signed" className="text-sm">
                Signed integers
              </Label>
            </div>
          </div>

          <Button
            onClick={convert}
            disabled={!inputValue.trim()}
            className="w-full bg-converter hover:bg-converter/90 text-white py-3 text-lg font-medium"
            data-testid="convert-number"
          >
            <Binary className="w-5 h-5 mr-2" />
            Convert
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Examples</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>Decimal 255 = Binary 11111111</div>
              <div>Hexadecimal FF = Decimal 255</div>
              <div>Octal 377 = Decimal 255</div>
              <div>Binary 1010 = Decimal 10</div>
            </div>
          </div>

          {signed && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Signed Mode</h3>
              <p className="text-sm text-yellow-700">
                Using two's complement representation for negative numbers. 
                Range: -{Math.pow(2, parseInt(bitWidth) - 1)} to {Math.pow(2, parseInt(bitWidth) - 1) - 1}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Conversion Results</Label>
            <div className="space-y-4">
              {/* Binary */}
              <Card className="bg-converter-background border border-converter/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-converter-foreground mb-1">Binary</div>
                    <div className="text-lg font-mono text-converter" data-testid="binary-result">
                      {results?.binary || "0".repeat(parseInt(bitWidth))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => results && copyResult("Binary", results.binary)}
                    disabled={!results}
                    data-testid="copy-binary"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* Decimal */}
              <Card className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium mb-1">Decimal</div>
                    <div className="text-lg font-mono" data-testid="decimal-result">
                      {results?.decimal || "0"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => results && copyResult("Decimal", results.decimal)}
                    disabled={!results}
                    data-testid="copy-decimal"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* Octal */}
              <Card className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium mb-1">Octal</div>
                    <div className="text-lg font-mono" data-testid="octal-result">
                      {results?.octal || "0"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => results && copyResult("Octal", results.octal)}
                    disabled={!results}
                    data-testid="copy-octal"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* Hexadecimal */}
              <Card className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium mb-1">Hexadecimal</div>
                    <div className="text-lg font-mono" data-testid="hexadecimal-result">
                      {results?.hexadecimal || "0"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => results && copyResult("Hexadecimal", results.hexadecimal)}
                    disabled={!results}
                    data-testid="copy-hexadecimal"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyAllResults}
              disabled={!results}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-converter/10 hover:bg-converter/20 border border-converter/20 text-converter rounded-xl font-medium"
              data-testid="copy-all-results"
            >
              <Copy className="w-4 h-4" />
              <span>Copy All</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (results) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('number', `${inputValue}|${inputBase}|${bitWidth}|${signed}`);
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={!results}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-number-conversion"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {results && (
            <div>
              <h3 className="font-medium mb-3">Bit Analysis</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Bit Pattern</div>
                  <div className="text-sm text-muted-foreground font-mono break-all">
                    {results.binary.match(/.{1,4}/g)?.join(' ') || results.binary}
                  </div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Range Info</div>
                  <div className="text-sm text-muted-foreground">
                    {signed ? (
                      <>Signed {bitWidth}-bit: -{Math.pow(2, parseInt(bitWidth) - 1).toLocaleString()} to {(Math.pow(2, parseInt(bitWidth) - 1) - 1).toLocaleString()}</>
                    ) : (
                      <>Unsigned {bitWidth}-bit: 0 to {(Math.pow(2, parseInt(bitWidth)) - 1).toLocaleString()}</>
                    )}
                  </div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Memory Usage</div>
                  <div className="text-sm text-muted-foreground">
                    {parseInt(bitWidth) / 8} bytes ({bitWidth} bits)
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
