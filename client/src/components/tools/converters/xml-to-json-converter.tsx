import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Code, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { XMLParser } from "fast-xml-parser";

export default function XmlToJsonConverter() {
  const [xmlInput, setXmlInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const convert = () => {
    if (!xmlInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter XML data to convert",
        variant: "destructive",
      });
      return;
    }

    try {
      // Configure XML parser options
      const options = {
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        attributesGroupName: false,
        textNodeName: "#text",
        ignoreNameSpace: false,
        allowBooleanAttributes: true,
        parseNodeValue: true,
        parseAttributeValue: true,
        trimValues: true,
        parseTrueNumberOnly: false,
        arrayMode: false
      };

      const parser = new XMLParser(options);
      
      // Parse XML to JSON
      const jsonResult = parser.parse(xmlInput);
      
      // Format JSON with proper indentation
      const formattedJson = JSON.stringify(jsonResult, null, 2);
      
      setJsonOutput(formattedJson);
      setIsValid(true);
      setError("");
      
      toast({
        title: "Success!",
        description: "XML converted to JSON successfully",
      });
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid XML format");
      setJsonOutput("");
      toast({
        title: "Conversion Error",
        description: "Please check your XML syntax",
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
    setXmlInput("");
    setJsonOutput("");
    setIsValid(null);
    setError("");
  };

  const loadExample = () => {
    const exampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<person>
  <name>John Doe</name>
  <age>30</age>
  <email>john@example.com</email>
  <address>
    <street>123 Main St</street>
    <city>New York</city>
    <zipcode>10001</zipcode>
  </address>
  <hobbies>
    <hobby>reading</hobby>
    <hobby>swimming</hobby>
    <hobby>coding</hobby>
  </hobbies>
  <isActive>true</isActive>
</person>`;
    setXmlInput(exampleXml);
  };

  const prettifyXml = () => {
    if (!xmlInput.trim()) return;
    
    try {
      // Simple XML formatting
      let formatted = xmlInput
        .replace(/></g, '>\n<')
        .replace(/^\s+|\s+$/g, '');
      
      // Add indentation
      let indent = 0;
      const lines = formatted.split('\n');
      const indentedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('</')) {
          indent = Math.max(0, indent - 1);
        }
        const indentedLine = '  '.repeat(indent) + trimmed;
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
          indent++;
        }
        return indentedLine;
      });
      
      setXmlInput(indentedLines.join('\n'));
    } catch (err) {
      toast({
        title: "Format Error",
        description: "Could not format XML",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - XML Input */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">XML Input</Label>
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
                onClick={prettifyXml}
                className="text-xs"
                data-testid="prettify-xml"
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
          
          <Textarea
            value={xmlInput}
            onChange={(e) => setXmlInput(e.target.value)}
            placeholder="Enter your XML data here..."
            className="min-h-[400px] font-mono text-sm"
            data-testid="xml-input"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-800 mb-1">XML Error:</div>
              <div className="text-sm text-red-600 font-mono">{error}</div>
            </div>
          )}

          <Button
            onClick={convert}
            disabled={!xmlInput.trim()}
            className="w-full bg-converter hover:bg-converter/90 text-white py-3 text-lg font-medium"
            data-testid="convert-xml-to-json"
          >
            <Code className="w-5 h-5 mr-2" />
            Convert to JSON
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">XML Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Well-formed XML with proper closing tags</li>
              <li>• Attributes will be prefixed with "@_"</li>
              <li>• Text content uses "#text" property</li>
              <li>• Multiple elements with same name become arrays</li>
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
                  {isValid ? "Valid" : "Invalid"}
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
                  <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>JSON output will appear here</p>
                  <p className="text-sm">Enter XML data and click convert</p>
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
                  url.searchParams.set('xml', btoa(xmlInput));
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
              <li>• XML elements become JSON objects</li>
              <li>• Attributes are prefixed with @_</li>
              <li>• Text content uses #text property</li>
              <li>• Repeated elements become arrays</li>
              <li>• Proper JSON formatting applied</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}