import { useState, useRef } from "react";
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
import { Upload, FileDown, FileText, Eye } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

export default function MarkdownToPdfConverter() {
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const [markdownContent, setMarkdownContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pageSize, setPageSize] = useState("A4");
  const [theme, setTheme] = useState("github");
  const [fontSize, setFontSize] = useState("12");
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [includeToc, setIncludeToc] = useState(false);
  const [syntaxHighlight, setSyntaxHighlight] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      toast({
        title: "Invalid file",
        description: "Please select a Markdown file (.md or .markdown)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Read file content for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setMarkdownContent(content);
    };
    reader.readAsText(file);
  };

  const convertToPdf = async () => {
    if (inputMode === "text" && !markdownContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter Markdown content",
        variant: "destructive",
      });
      return;
    }

    if (inputMode === "file" && !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a Markdown file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setResultUrl(null);

    try {
      const formData = new FormData();
      if (inputMode === "file" && selectedFile) {
        formData.append('markdownFile', selectedFile);
      } else {
        formData.append('markdownContent', markdownContent);
      }
      formData.append('title', title);
      formData.append('author', author);
      formData.append('pageSize', pageSize);
      formData.append('theme', theme);
      formData.append('fontSize', fontSize);
      formData.append('includePageNumbers', includePageNumbers.toString());
      formData.append('includeToc', includeToc.toString());
      formData.append('syntaxHighlight', syntaxHighlight.toString());

      setProgress(30);

      const response = await fetch('/api/document/markdown-to-pdf', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to convert Markdown to PDF');
      }

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      
      setResultUrl(pdfUrl);
      setResultSize(formatFileSize(blob.size));
      setProgress(100);

      toast({
        title: "Success!",
        description: "Markdown converted to PDF successfully",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert Markdown to PDF",
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
      a.download = title || selectedFile?.name.replace(/\.(md|markdown)$/, '.pdf') || 'markdown-document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const resetTool = () => {
    setInputMode("text");
    setMarkdownContent("");
    setSelectedFile(null);
    setTitle("");
    setAuthor("");
    setPageSize("A4");
    setTheme("github");
    setFontSize("12");
    setIncludePageNumbers(true);
    setIncludeToc(false);
    setSyntaxHighlight(true);
    setIsProcessing(false);
    setProgress(0);
    setResultUrl(null);
    setResultSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Markdown to PDF Converter</h1>
        </div>
        <p className="text-muted-foreground">Convert Markdown files to beautifully formatted PDF documents</p>
      </div>

      {!resultUrl && (
        <>
          {/* Input Section */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={inputMode} onValueChange={(value: string) => setInputMode(value as "text" | "file")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" data-testid="text-tab">Type Markdown</TabsTrigger>
                  <TabsTrigger value="file" data-testid="file-tab">Upload File</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
                  <Label htmlFor="markdown-content">Markdown Content</Label>
                  <Textarea
                    id="markdown-content"
                    value={markdownContent}
                    onChange={(e) => setMarkdownContent(e.target.value)}
                    placeholder="# My Document

## Introduction

This is a **Markdown** document that will be converted to PDF.

### Features

- Beautiful formatting
- Code syntax highlighting
- Tables and lists
- And much more!

```javascript
console.log('Hello, World!');
```"
                    className="min-h-[300px] font-mono text-sm"
                    data-testid="markdown-textarea"
                  />
                </TabsContent>
                
                <TabsContent value="file" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Select Markdown File</Label>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2"
                      data-testid="select-file-button"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Choose File</span>
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md,.markdown,text/markdown"
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="file-input"
                  />

                  {selectedFile && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="font-medium">{selectedFile.name}</div>
                          <div className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {markdownContent && (
                    <div className="space-y-2">
                      <Label>Preview (First 500 characters)</Label>
                      <div className="p-3 bg-muted rounded-lg text-sm font-mono">
                        {markdownContent.slice(0, 500)}
                        {markdownContent.length > 500 && "..."}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Options Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <Label className="text-base font-semibold">Document Options</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Document Title (Optional)</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="My Document"
                      data-testid="title-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Author (Optional)</Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Your Name"
                      data-testid="author-input"
                    />
                  </div>

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
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger data-testid="theme-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="github-dark">GitHub Dark</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="elegant">Elegant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Select value={fontSize} onValueChange={setFontSize}>
                      <SelectTrigger data-testid="font-size-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10pt</SelectItem>
                        <SelectItem value="11">11pt</SelectItem>
                        <SelectItem value="12">12pt</SelectItem>
                        <SelectItem value="14">14pt</SelectItem>
                        <SelectItem value="16">16pt</SelectItem>
                        <SelectItem value="18">18pt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-page-numbers"
                      checked={includePageNumbers}
                      onCheckedChange={setIncludePageNumbers}
                      data-testid="page-numbers-switch"
                    />
                    <Label htmlFor="include-page-numbers">Include page numbers</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-toc"
                      checked={includeToc}
                      onCheckedChange={setIncludeToc}
                      data-testid="toc-switch"
                    />
                    <Label htmlFor="include-toc">Generate table of contents</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="syntax-highlight"
                      checked={syntaxHighlight}
                      onCheckedChange={setSyntaxHighlight}
                      data-testid="syntax-highlight-switch"
                    />
                    <Label htmlFor="syntax-highlight">Enable syntax highlighting for code blocks</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Convert Button */}
          <div className="flex justify-center">
            <Button
              onClick={convertToPdf}
              disabled={isProcessing || (inputMode === "text" ? !markdownContent.trim() : !selectedFile)}
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
                <Label>Converting Markdown to PDF...</Label>
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