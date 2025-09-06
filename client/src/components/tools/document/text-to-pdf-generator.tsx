import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, RotateCcw, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

export default function TextToPdfGenerator() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState("times");
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [margin, setMargin] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePDF = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to generate PDF",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const marginSize = margin;
      const contentWidth = pageWidth - (marginSize * 2);
      
      let yPosition = marginSize;

      // Set font
      pdf.setFont(fontFamily);

      // Add title if provided
      if (title.trim()) {
        pdf.setFontSize(fontSize + 6);
        pdf.setFont(fontFamily, 'bold');
        
        const titleLines = pdf.splitTextToSize(title, contentWidth);
        titleLines.forEach((line: string) => {
          if (yPosition > pageHeight - marginSize) {
            pdf.addPage();
            yPosition = marginSize;
          }
          pdf.text(line, marginSize, yPosition);
          yPosition += (fontSize + 6) * lineSpacing;
        });
        
        yPosition += 10; // Extra space after title
      }

      // Add content
      pdf.setFontSize(fontSize);
      pdf.setFont(fontFamily, 'normal');
      
      const lines = pdf.splitTextToSize(content, contentWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - marginSize) {
          pdf.addPage();
          yPosition = marginSize;
        }
        pdf.text(line, marginSize, yPosition);
        yPosition += fontSize * lineSpacing;
      });

      // Generate PDF blob URL
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setGeneratedPdf(pdfUrl);

      toast({
        title: "Success!",
        description: "PDF generated successfully",
      });

      setIsGenerating(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!generatedPdf) return;

    const link = document.createElement('a');
    link.href = generatedPdf;
    link.download = title ? `${title}.pdf` : 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "PDF has been downloaded",
    });
  };

  const reset = () => {
    setTitle("");
    setContent("");
    setGeneratedPdf(null);
    setFontSize(12);
    setFontFamily("times");
    setLineSpacing(1.5);
    setMargin(20);
  };

  const loadTemplate = (template: string) => {
    switch (template) {
      case "letter":
        setTitle("Business Letter");
        setContent(`Dear [Recipient],

I hope this letter finds you well. I am writing to...

[Your message content here]

Please let me know if you have any questions or need further information.

Sincerely,
[Your Name]`);
        break;
      case "report":
        setTitle("Report Title");
        setContent(`Executive Summary
[Brief overview of the report]

Introduction
[Background and purpose]

Main Content
[Detailed information and analysis]

Conclusion
[Summary and recommendations]

References
[Sources and citations]`);
        break;
      case "memo":
        setTitle("Memorandum");
        setContent(`TO: [Recipient]
FROM: [Your Name]
DATE: [Current Date]
RE: [Subject]

[Memo content here]

Action Items:
• [Item 1]
• [Item 2]
• [Item 3]`);
        break;
      default:
        setTitle("Document Title");
        setContent("Enter your document content here...");
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = content.length;

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          {/* Document Title */}
          <div>
            <Label htmlFor="title" className="block text-sm font-medium mb-2">
              Document Title (Optional)
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              className="text-lg"
              data-testid="title-input"
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content" className="block text-sm font-medium mb-2">
              Document Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your document content here..."
              className="min-h-[200px] resize-none"
              data-testid="content-textarea"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>
          </div>

          {/* Templates */}
          <div>
            <Label className="block text-sm font-medium mb-2">Quick Templates</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => loadTemplate("letter")}
                data-testid="template-letter"
              >
                Business Letter
              </Button>
              <Button
                variant="outline"
                onClick={() => loadTemplate("report")}
                data-testid="template-report"
              >
                Report
              </Button>
              <Button
                variant="outline"
                onClick={() => loadTemplate("memo")}
                data-testid="template-memo"
              >
                Memo
              </Button>
            </div>
          </div>

          {/* Formatting Options */}
          <div className="space-y-4">
            <Label className="block text-sm font-medium">PDF Settings</Label>
            
            <div>
              <Label className="block text-sm font-medium mb-2">Font Family</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger data-testid="font-family-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="times">Times New Roman</SelectItem>
                  <SelectItem value="helvetica">Helvetica</SelectItem>
                  <SelectItem value="courier">Courier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">
                Font Size: {fontSize}pt
              </Label>
              <input
                type="range"
                min="8"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
                data-testid="font-size-slider"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">
                Line Spacing: {lineSpacing}
              </Label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={lineSpacing}
                onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                className="w-full"
                data-testid="line-spacing-slider"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">
                Margin: {margin}mm
              </Label>
              <input
                type="range"
                min="10"
                max="50"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                className="w-full"
                data-testid="margin-slider"
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generatePDF}
            disabled={!content.trim() || isGenerating}
            className="w-full bg-document hover:bg-document/90 text-white py-3 text-lg font-medium"
            data-testid="generate-pdf"
          >
            <FileText className="w-5 h-5 mr-2" />
            {isGenerating ? "Generating..." : "Generate PDF"}
          </Button>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={reset}
            className="w-full"
            data-testid="reset-generator"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          {/* Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">PDF Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Add a title for better document organization</li>
              <li>• Use templates for common document types</li>
              <li>• Adjust margins for printer compatibility</li>
              <li>• Times New Roman is most readable for documents</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">PDF Preview</Label>
            <Card className="bg-document-background border border-document/20 rounded-xl p-6 text-center min-h-[400px] flex items-center justify-center">
              {generatedPdf ? (
                <div className="w-full space-y-4">
                  <iframe
                    src={generatedPdf}
                    className="w-full h-96 border border-border rounded-lg"
                    title="PDF Preview"
                    data-testid="pdf-preview"
                  />
                  <div className="text-sm text-document/70">
                    PDF generated successfully
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Type className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{isGenerating ? "Generating PDF..." : "PDF preview will appear here"}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Download Button */}
          {generatedPdf && (
            <Button
              onClick={downloadPDF}
              className="w-full bg-document hover:bg-document/90 text-white py-3 text-lg font-medium"
              data-testid="download-pdf"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </Button>
          )}

          {/* Document Stats */}
          {content && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">Document Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Words</div>
                  <div className="font-medium">{wordCount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Characters</div>
                  <div className="font-medium">{charCount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Font</div>
                  <div className="font-medium">{fontFamily} {fontSize}pt</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Spacing</div>
                  <div className="font-medium">{lineSpacing}x</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}