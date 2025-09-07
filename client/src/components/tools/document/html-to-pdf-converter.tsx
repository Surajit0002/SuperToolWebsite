import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Code, Globe, FileText } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

export default function HtmlToPdfConverter() {
  const [inputMode, setInputMode] = useState<"html" | "url">("html");
  const [htmlContent, setHtmlContent] = useState("");
  const [url, setUrl] = useState("");
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [margin, setMargin] = useState("normal");
  const [includeBackground, setIncludeBackground] = useState(true);
  const [waitForLoad, setWaitForLoad] = useState(true);
  const [headerFooter, setHeaderFooter] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);
  const { toast } = useToast();

  const convertToPdf = async () => {
    if (inputMode === "html" && !htmlContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter HTML content",
        variant: "destructive",
      });
      return;
    }

    if (inputMode === "url" && !url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setResultUrl(null);

    try {
      const formData = new FormData();
      formData.append('inputMode', inputMode);
      if (inputMode === "html") {
        formData.append('htmlContent', htmlContent);
      } else {
        formData.append('url', url);
      }
      formData.append('pageSize', pageSize);
      formData.append('orientation', orientation);
      formData.append('margin', margin);
      formData.append('includeBackground', includeBackground.toString());
      formData.append('waitForLoad', waitForLoad.toString());
      formData.append('headerFooter', headerFooter.toString());

      setProgress(30);

      const response = await fetch('/api/document/html-to-pdf', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to convert HTML to PDF');
      }

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      
      setResultUrl(pdfUrl);
      setResultSize(formatFileSize(blob.size));
      setProgress(100);

      toast({
        title: "Success!",
        description: "HTML converted to PDF successfully",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert HTML to PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = inputMode === "url" 
        ? `${new URL(url).hostname}-page.pdf`
        : 'html-document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const resetTool = () => {
    setInputMode("html");
    setHtmlContent("");
    setUrl("");
    setPageSize("A4");
    setOrientation("portrait");
    setMargin("normal");
    setIncludeBackground(true);
    setWaitForLoad(true);
    setHeaderFooter(false);
    setIsProcessing(false);
    setProgress(0);
    setResultUrl(null);
    setResultSize(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Code className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">HTML to PDF Converter</h1>
        </div>
        <p className="text-muted-foreground">Convert HTML content or web pages to PDF documents</p>
      </div>

      {!resultUrl && (
        <>
          {/* Input Section */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={inputMode} onValueChange={(value: string) => setInputMode(value as "html" | "url")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="html" data-testid="html-tab">HTML Content</TabsTrigger>
                  <TabsTrigger value="url" data-testid="url-tab">Web Page URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="html" className="space-y-4">
                  <Label htmlFor="html-content">HTML Content</Label>
                  <Textarea
                    id="html-content"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="<html>
<head>
    <title>My Document</title>
    <style>
        body { font-family: Arial, sans-serif; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>Hello World</h1>
    <p>This is my HTML content that will be converted to PDF.</p>
</body>
</html>"
                    className="min-h-[200px] font-mono text-sm"
                    data-testid="html-textarea"
                  />
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4">
                  <Label htmlFor="url-input">Website URL</Label>
                  <Input
                    id="url-input"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    data-testid="url-input"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the complete URL including http:// or https://
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Options Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <Label className="text-base font-semibold">PDF Options</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="page-size">Page Size</Label>
                    <Select value={pageSize} onValueChange={setPageSize}>
                      <SelectTrigger data-testid="page-size-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="A3">A3</SelectItem>
                        <SelectItem value="A5">A5</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                        <SelectItem value="Tabloid">Tabloid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orientation">Orientation</Label>
                    <Select value={orientation} onValueChange={setOrientation}>
                      <SelectTrigger data-testid="orientation-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="margin">Margins</Label>
                    <Select value={margin} onValueChange={setMargin}>
                      <SelectTrigger data-testid="margin-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="minimum">Minimum</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="maximum">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-background"
                      checked={includeBackground}
                      onCheckedChange={setIncludeBackground}
                      data-testid="include-background-switch"
                    />
                    <Label htmlFor="include-background">Include background graphics and colors</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="header-footer"
                      checked={headerFooter}
                      onCheckedChange={setHeaderFooter}
                      data-testid="header-footer-switch"
                    />
                    <Label htmlFor="header-footer">Include header and footer</Label>
                  </div>

                  {inputMode === "url" && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="wait-for-load"
                        checked={waitForLoad}
                        onCheckedChange={setWaitForLoad}
                        data-testid="wait-for-load-switch"
                      />
                      <Label htmlFor="wait-for-load">Wait for page to fully load</Label>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Convert Button */}
          <div className="flex justify-center">
            <Button
              onClick={convertToPdf}
              disabled={isProcessing || (inputMode === "html" ? !htmlContent.trim() : !url.trim())}
              className="px-8 py-3 text-lg"
              data-testid="convert-button"
            >
              {isProcessing ? "Converting..." : "Convert to PDF"}
            </Button>
          </div>
        </>
      )}

      {/* Progress Section */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Converting HTML to PDF...</Label>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Section */}
      {resultUrl && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">PDF Ready!</h3>
                  <p className="text-muted-foreground">Size: {resultSize}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={downloadResult}
                  className="flex items-center space-x-2"
                  data-testid="download-button"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={resetTool}
                  data-testid="convert-another-button"
                >
                  Convert Another
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}