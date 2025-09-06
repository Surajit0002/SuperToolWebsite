import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Download, RotateCcw, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

export default function ImageToPdfConverter() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "a3">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState(20);
  const [quality, setQuality] = useState(80);
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select image files",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles([...selectedFiles, ...imageFiles]);
    setGeneratedPdf(null);

    toast({
      title: "Images Added",
      description: `${imageFiles.length} images added to PDF`,
    });
  };

  const generatePDF = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginSize = margin;
      const contentWidth = pageWidth - (marginSize * 2);
      const contentHeight = pageHeight - (marginSize * 2);

      // Remove the first page that's created by default
      let isFirstPage = true;

      for (const file of selectedFiles) {
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new window.Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = URL.createObjectURL(file);
        });

        // Calculate image dimensions to fit in page
        const imgAspectRatio = img.width / img.height;
        const pageAspectRatio = contentWidth / contentHeight;

        let imgWidth, imgHeight;

        if (imgAspectRatio > pageAspectRatio) {
          // Image is wider than page
          imgWidth = contentWidth;
          imgHeight = contentWidth / imgAspectRatio;
        } else {
          // Image is taller than page
          imgHeight = contentHeight;
          imgWidth = contentHeight * imgAspectRatio;
        }

        // Center the image on the page
        const x = marginSize + (contentWidth - imgWidth) / 2;
        const y = marginSize + (contentHeight - imgHeight) / 2;

        // Add image to PDF
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = canvas.toDataURL('image/jpeg', quality / 100);
        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      }

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setGeneratedPdf(pdfUrl);

      toast({
        title: "PDF Created!",
        description: `${selectedFiles.length} images converted to PDF`,
      });

      setIsGenerating(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create PDF",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!generatedPdf) return;

    const link = document.createElement('a');
    link.href = generatedPdf;
    link.download = 'images-to-pdf.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "PDF has been downloaded",
    });
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (newFiles.length === 0) {
      setGeneratedPdf(null);
    }
  };

  const moveImage = (from: number, to: number) => {
    const newFiles = [...selectedFiles];
    const [moved] = newFiles.splice(from, 1);
    newFiles.splice(to, 0, moved);
    setSelectedFiles(newFiles);
  };

  const reset = () => {
    setSelectedFiles([]);
    setGeneratedPdf(null);
    setPageSize("a4");
    setOrientation("portrait");
    setMargin(20);
    setQuality(80);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label className="block text-sm font-medium mb-2">Upload Images</Label>
            <div 
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-image transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-testid="image-upload-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                data-testid="image-files-input"
              />
              <div className="space-y-2">
                <FileText className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload images or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Multiple images (PNG, JPG, WebP)
                </p>
              </div>
            </div>
          </div>

          {/* Selected Images */}
          {selectedFiles.length > 0 && (
            <div>
              <Label className="block text-sm font-medium mb-2">
                Selected Images ({selectedFiles.length})
              </Label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-image px-2 py-1 rounded text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm truncate max-w-40">{file.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      {index > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveImage(index, index - 1)}
                          className="p-1 h-6 w-6"
                          data-testid={`move-up-${index}`}
                        >
                          ↑
                        </Button>
                      )}
                      {index < selectedFiles.length - 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveImage(index, index + 1)}
                          className="p-1 h-6 w-6"
                          data-testid={`move-down-${index}`}
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="p-1 h-6 w-6"
                        data-testid={`remove-${index}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDF Settings */}
          <div className="space-y-4">
            <Label className="block text-sm font-medium">PDF Settings</Label>
            
            <div>
              <Label className="block text-sm font-medium mb-2">Page Size</Label>
              <Select value={pageSize} onValueChange={(value: any) => setPageSize(value)}>
                <SelectTrigger data-testid="page-size-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                  <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                  <SelectItem value="a3">A3 (297 × 420 mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Orientation</Label>
              <Select value={orientation} onValueChange={(value: any) => setOrientation(value)}>
                <SelectTrigger data-testid="orientation-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
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

            <div>
              <Label className="block text-sm font-medium mb-2">
                Quality: {quality}%
              </Label>
              <input
                type="range"
                min="20"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full"
                data-testid="quality-slider"
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generatePDF}
            disabled={selectedFiles.length === 0 || isGenerating}
            className="w-full bg-document hover:bg-document/90 text-white py-3 text-lg font-medium"
            data-testid="generate-pdf"
          >
            <FileText className="w-5 h-5 mr-2" />
            {isGenerating ? "Creating PDF..." : "Create PDF"}
          </Button>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={reset}
            className="w-full"
            data-testid="reset-converter"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          {/* Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">PDF Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Images are automatically resized to fit pages</li>
              <li>• Use Portrait for vertical images</li>
              <li>• Adjust quality to balance size vs. clarity</li>
              <li>• Reorder images by using ↑↓ buttons</li>
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
                    className="w-full h-80 border border-border rounded-lg"
                    title="PDF Preview"
                    data-testid="pdf-preview"
                  />
                  <div className="text-sm text-document/70">
                    PDF created with {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{isGenerating ? "Creating PDF..." : "Upload images to create a PDF document"}</p>
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

          {/* PDF Info */}
          {selectedFiles.length > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">PDF Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Pages:</span>
                  <span>{selectedFiles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Page Size:</span>
                  <span>{pageSize.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Orientation:</span>
                  <span>{orientation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Margin:</span>
                  <span>{margin}mm</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality:</span>
                  <span>{quality}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}