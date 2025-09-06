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
import { Copy, Share2, FileSpreadsheet, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

export default function JsonToCsvConverter() {
  const [jsonInput, setJsonInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [recordCount, setRecordCount] = useState(0);
  const { toast } = useToast();

  const delimiters = [
    { value: ",", label: "Comma (,)" },
    { value: ";", label: "Semicolon (;)" },
    { value: "\t", label: "Tab (\\t)" },
    { value: "|", label: "Pipe (|)" },
  ];

  const convert = () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter JSON data to convert",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse JSON first to validate
      const jsonData = JSON.parse(jsonInput);
      
      // Ensure we have an array of objects
      let dataArray;
      if (Array.isArray(jsonData)) {
        dataArray = jsonData;
      } else if (typeof jsonData === 'object' && jsonData !== null) {
        // If it's a single object, wrap it in an array
        dataArray = [jsonData];
      } else {
        throw new Error("JSON must be an array of objects or a single object");
      }

      if (dataArray.length === 0) {
        throw new Error("JSON array is empty");
      }

      // Flatten nested objects and handle complex values
      const flattenedData = dataArray.map(item => {
        const flattened: any = {};
        
        const flatten = (obj: any, prefix = '') => {
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              const newKey = prefix ? `${prefix}_${key}` : key;
              const value = obj[key];
              
              if (value === null || value === undefined) {
                flattened[newKey] = '';
              } else if (Array.isArray(value)) {
                flattened[newKey] = value.join('; ');
              } else if (typeof value === 'object') {
                flatten(value, newKey);
              } else {
                flattened[newKey] = value;
              }
            }
          }
        };
        
        flatten(item);
        return flattened;
      });

      // Configure Papa Parse for CSV generation
      const config = {
        delimiter: delimiter,
        header: includeHeaders,
        skipEmptyLines: false,
        quotes: true, // Always quote fields that might contain delimiters
      };

      const csvResult = Papa.unparse(flattenedData, config);
      
      setCsvOutput(csvResult);
      setRecordCount(flattenedData.length);
      setIsValid(true);
      setError("");
      
      toast({
        title: "Success!",
        description: `JSON converted to CSV (${flattenedData.length} records)`,
      });
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "JSON conversion error");
      setCsvOutput("");
      setRecordCount(0);
      toast({
        title: "Conversion Error",
        description: "Please check your JSON format",
        variant: "destructive",
      });
    }
  };

  const copyOutput = () => {
    if (csvOutput) {
      navigator.clipboard.writeText(csvOutput);
      toast({
        title: "Copied!",
        description: "CSV output copied to clipboard",
      });
    }
  };

  const downloadCsv = () => {
    if (csvOutput) {
      const blob = new Blob([csvOutput], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.csv';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded!",
        description: "CSV file downloaded successfully",
      });
    }
  };

  const clearAll = () => {
    setJsonInput("");
    setCsvOutput("");
    setIsValid(null);
    setError("");
    setRecordCount(0);
  };

  const loadExample = () => {
    const exampleJson = `[
  {
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "address": {
      "city": "New York",
      "zipcode": "10001"
    },
    "hobbies": ["reading", "swimming"],
    "active": true
  },
  {
    "name": "Jane Smith",
    "age": 25,
    "email": "jane@example.com",
    "address": {
      "city": "Los Angeles",
      "zipcode": "90001"
    },
    "hobbies": ["coding", "hiking"],
    "active": false
  }
]`;
    setJsonInput(exampleJson);
  };

  const prettifyJson = () => {
    if (!jsonInput.trim()) return;
    
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
    } catch (err) {
      toast({
        title: "Format Error",
        description: "Invalid JSON format",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - JSON Input */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">JSON Input</Label>
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
                onClick={prettifyJson}
                className="text-xs"
                data-testid="prettify-json"
              >
                Format
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
              <Label className="text-sm font-medium mb-2 block">Headers</Label>
              <Select value={includeHeaders ? "include" : "exclude"} onValueChange={(value) => setIncludeHeaders(value === "include")}>
                <SelectTrigger data-testid="headers-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="include">Include Headers</SelectItem>
                  <SelectItem value="exclude">Data Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Enter your JSON data here..."
            className="min-h-[350px] font-mono text-sm"
            data-testid="json-input"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-800 mb-1">JSON Error:</div>
              <div className="text-sm text-red-600 font-mono">{error}</div>
            </div>
          )}

          <Button
            onClick={convert}
            disabled={!jsonInput.trim()}
            className="w-full bg-converter hover:bg-converter/90 text-white py-3 text-lg font-medium"
            data-testid="convert-json-to-csv"
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Convert to CSV
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">JSON Requirements</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Array of objects or single object</li>
              <li>• Nested objects will be flattened</li>
              <li>• Arrays will be joined with semicolons</li>
              <li>• Null/undefined values become empty</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - CSV Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">CSV Output</Label>
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
                  disabled={!csvOutput}
                  data-testid="copy-csv-output"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCsv}
                  disabled={!csvOutput}
                  data-testid="download-csv"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          <Card className="p-4 min-h-[400px]">
            {csvOutput ? (
              <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[500px] text-foreground">
                {csvOutput}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>CSV output will appear here</p>
                  <p className="text-sm">Enter JSON data and click convert</p>
                </div>
              </div>
            )}
          </Card>

          {csvOutput && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('json', btoa(jsonInput));
                  url.searchParams.set('delimiter', delimiter);
                  url.searchParams.set('headers', includeHeaders.toString());
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
                {csvOutput.split('\n').length - 1} rows, {csvOutput.length} chars
              </div>
            </div>
          )}

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">CSV Features</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Nested objects flattened with underscores</li>
              <li>• Arrays joined with semicolons</li>
              <li>• Automatic quoting for special characters</li>
              <li>• Compatible with Excel and other tools</li>
              <li>• Customizable delimiter and headers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}