import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Code, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { XMLBuilder } from "fast-xml-parser";

export default function JsonToXmlConverter() {
  const [jsonInput, setJsonInput] = useState("");
  const [xmlOutput, setXmlOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

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
      
      // Configure XML builder options
      const options = {
        ignoreAttributes: false,
        format: true,
        indentBy: "  ",
        suppressEmptyNode: false,
        textNodeName: "#text",
        attributeNamePrefix: "@_",
        attributesGroupName: false,
        cdataPropName: false
      };

      const builder = new XMLBuilder(options);
      
      // Convert to XML
      let xmlResult = builder.build(jsonData);
      
      // Add XML declaration if not present
      if (!xmlResult.startsWith('<?xml')) {
        xmlResult = '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlResult;
      }
      
      setXmlOutput(xmlResult);
      setIsValid(true);
      setError("");
      
      toast({
        title: "Success!",
        description: "JSON converted to XML successfully",
      });
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid JSON format");
      setXmlOutput("");
      toast({
        title: "Conversion Error",
        description: "Please check your JSON syntax",
        variant: "destructive",
      });
    }
  };

  const copyOutput = () => {
    if (xmlOutput) {
      navigator.clipboard.writeText(xmlOutput);
      toast({
        title: "Copied!",
        description: "XML output copied to clipboard",
      });
    }
  };

  const downloadXml = () => {
    if (xmlOutput) {
      const blob = new Blob([xmlOutput], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.xml';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded!",
        description: "XML file downloaded successfully",
      });
    }
  };

  const clearAll = () => {
    setJsonInput("");
    setXmlOutput("");
    setIsValid(null);
    setError("");
  };

  const loadExample = () => {
    const exampleJson = `{
  "person": {
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "zipcode": "10001"
    },
    "hobbies": ["reading", "swimming", "coding"],
    "isActive": true
  }
}`;
    setJsonInput(exampleJson);
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
                onClick={clearAll}
                className="text-xs"
                data-testid="clear-all"
              >
                Clear
              </Button>
            </div>
          </div>
          
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Enter your JSON data here..."
            className="min-h-[400px] font-mono text-sm"
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
            data-testid="convert-json-to-xml"
          >
            <Code className="w-5 h-5 mr-2" />
            Convert to XML
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">JSON Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use double quotes for strings</li>
              <li>• Arrays become XML elements with multiple children</li>
              <li>• Objects become nested XML elements</li>
              <li>• Attributes can be defined with "@_" prefix</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - XML Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">XML Output</Label>
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
                  disabled={!xmlOutput}
                  data-testid="copy-xml-output"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadXml}
                  disabled={!xmlOutput}
                  data-testid="download-xml"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          <Card className="p-4 min-h-[400px]">
            {xmlOutput ? (
              <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[500px] text-foreground">
                {xmlOutput}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>XML output will appear here</p>
                  <p className="text-sm">Enter JSON data and click convert</p>
                </div>
              </div>
            )}
          </Card>

          {xmlOutput && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('json', btoa(jsonInput));
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
                {xmlOutput.split('\n').length} lines, {xmlOutput.length} chars
              </div>
            </div>
          )}

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">XML Structure</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Root element wraps all content</li>
              <li>• Object properties become child elements</li>
              <li>• Arrays create multiple elements with same name</li>
              <li>• Text content is preserved</li>
              <li>• Well-formed XML with proper encoding</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}