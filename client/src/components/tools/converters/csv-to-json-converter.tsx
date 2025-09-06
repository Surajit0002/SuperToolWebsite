import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Share2, Database, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

export default function CsvToJsonConverter() {
  const [csvInput, setCsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeaders, setHasHeaders] = useState(true);
  const [recordCount, setRecordCount] = useState(0);
  const { toast } = useToast();

  const delimiters = [
    { value: ",", label: "Comma (,)" },
    { value: ";", label: "Semicolon (;)" },
    { value: "\t", label: "Tab (\\t)" },
    { value: "|", label: "Pipe (|)" },
    { value: " ", label: "Space" },
  ];

  const convert = () => {
    if (!csvInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter CSV data to convert",
        variant: "destructive",
      });
      return;
    }

    try {
      const config = {
        header: hasHeaders,
        delimiter: delimiter,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Clean up header names
          return header.trim().replace(/[^a-zA-Z0-9_]/g, '_');
        },
        transform: (value: string) => {
          // Try to parse numbers and booleans
          const trimmed = value.trim();
          if (trimmed === '') return null;
          if (trimmed.toLowerCase() === 'true') return true;
          if (trimmed.toLowerCase() === 'false') return false;
          if (!isNaN(Number(trimmed)) && trimmed !== '') {
            return Number(trimmed);
          }
          return trimmed;
        }
      };

      const result = Papa.parse(csvInput, config);
      
      if (result.errors.length > 0) {
        const errorMessages = result.errors.map(err => `Row ${err.row}: ${err.message}`).join('\n');
        setError(errorMessages);
        setIsValid(false);
        setJsonOutput("");
        toast({
          title: "CSV Parse Error",
          description: "Please check your CSV format",
          variant: "destructive",
        });
        return;
      }

      // Format JSON with proper indentation
      const formattedJson = JSON.stringify(result.data, null, 2);
      
      setJsonOutput(formattedJson);
      setRecordCount(result.data.length);
      setIsValid(true);
      setError("");
      
      toast({
        title: "Success!",
        description: `CSV converted to JSON (${result.data.length} records)`,
      });
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "CSV conversion error");
      setJsonOutput("");
      setRecordCount(0);
      toast({
        title: "Conversion Error",
        description: "Please check your CSV format",
        variant: "destructive",
      });
    }
  };

  const copyOutput = () => {
    if (jsonOutput) {
      navigator.clipboard.writeText(jsonOutput);
      toast({
        title: "Copied!",
        description: "JSON output copied to clipboard",
      });
    }
  };

  const downloadJson = () => {
    if (jsonOutput) {
      const blob = new Blob([jsonOutput], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.json';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded!",
        description: "JSON file downloaded successfully",
      });
    }
  };

  const clearAll = () => {
    setCsvInput("");
    setJsonOutput("");
    setIsValid(null);
    setError("");
    setRecordCount(0);
  };

  const loadExample = () => {
    const exampleCsv = `name,age,email,city,active
John Doe,30,john@example.com,New York,true
Jane Smith,25,jane@example.com,Los Angeles,false
Bob Johnson,35,bob@example.com,Chicago,true
Alice Brown,28,alice@example.com,Houston,true`;
    setCsvInput(exampleCsv);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvInput(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - CSV Input */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">CSV Input</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadExample}
                className="text-xs"
                data-testid="load-example"
              >
                <FileText className="w-3 h-3 mr-1" />
                Example
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="text-xs"
                data-testid="clear-all"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Delimiter</Label>
              <Select value={delimiter} onValueChange={setDelimiter}>
                <SelectTrigger data-testid="delimiter-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {delimiters.map((delim) => (
                    <SelectItem key={delim.value} value={delim.value}>
                      {delim.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">First Row</Label>
              <Select value={hasHeaders ? "headers" : "data"} onValueChange={(value) => setHasHeaders(value === "headers")}>
                <SelectTrigger data-testid="headers-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="headers">Contains Headers</SelectItem>
                  <SelectItem value="data">Data Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="file-upload" className="text-sm font-medium mb-2 block">
              Upload CSV File (Optional)
            </Label>
            <input
              id="file-upload"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-muted hover:file:bg-muted/80"
              data-testid="file-upload"
            />
          </div>
          
          <Textarea
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder="Enter your CSV data here..."
            className="min-h-[300px] font-mono text-sm"
            data-testid="csv-input"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-800 mb-1">CSV Error:</div>
              <div className="text-sm text-red-600 font-mono whitespace-pre-wrap">{error}</div>
            </div>
          )}

          <Button
            onClick={convert}
            disabled={!csvInput.trim()}
            className="w-full bg-converter hover:bg-converter/90 text-white py-3 text-lg font-medium"
            data-testid="convert-csv-to-json"
          >
            <Database className="w-5 h-5 mr-2" />
            Convert to JSON
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">CSV Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• First row can contain column headers</li>
              <li>• Use quotes for values containing delimiters</li>
              <li>• Numbers and booleans are auto-detected</li>
              <li>• Empty values become null in JSON</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - JSON Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">JSON Output</Label>
            <div className="flex items-center gap-2">
              {isValid !== null && (
                <Badge variant={isValid ? "default" : "destructive"}>
                  {isValid ? `${recordCount} records` : "Invalid"}
                </Badge>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyOutput}
                  disabled={!jsonOutput}
                  data-testid="copy-json-output"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadJson}
                  disabled={!jsonOutput}
                  data-testid="download-json"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          <Card className="p-4 min-h-[400px]">
            {jsonOutput ? (
              <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[500px] text-foreground">
                {jsonOutput}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>JSON output will appear here</p>
                  <p className="text-sm">Enter CSV data and click convert</p>
                </div>
              </div>
            )}
          </Card>

          {jsonOutput && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('csv', btoa(csvInput));
                  url.searchParams.set('delimiter', delimiter);
                  url.searchParams.set('headers', hasHeaders.toString());
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }}
                className="flex items-center justify-center space-x-2"
                data-testid="share-conversion"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                {jsonOutput.split('\n').length} lines, {jsonOutput.length} chars
              </div>
            </div>
          )}

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">JSON Structure</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Each CSV row becomes a JSON object</li>
              <li>• Column headers become object keys</li>
              <li>• Array of objects format</li>
              <li>• Data types automatically detected</li>
              <li>• Ready for API consumption</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}