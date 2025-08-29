import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, Shuffle, ChevronDown, ShieldCheck } from "lucide-react";
import { getToolById, getToolsByCategory, getCategoryColor, toolCategories } from "@/lib/tools";
import { ToolCategory } from "@shared/schema";
import * as LucideIcons from "lucide-react";

// Tool Components
import GeneralCalculator from "./calculators/general-calculator";
import ScientificCalculator from "./calculators/scientific-calculator";
import PercentageCalculator from "./calculators/percentage-calculator";
import BMICalculator from "./calculators/bmi-calculator";
import AgeCalculator from "./calculators/age-calculator";
import DateCalculator from "./calculators/date-calculator";
import LoanCalculator from "./calculators/loan-calculator";
import UnitConverter from "./converters/unit-converter";
import CurrencyConverter from "./converters/currency-converter";
import TimezoneConverter from "./converters/timezone-converter";
import NumberSystemConverter from "./converters/number-system-converter";
import TextCaseConverter from "./converters/text-case-converter";
import ImageResizer from "./image/image-resizer";
import ImageCompressor from "./image/image-compressor";
import ImageCropper from "./image/image-cropper";
import PDFMerger from "./document/pdf-merger";
import PDFSplitter from "./document/pdf-splitter";
import MP3Cutter from "./audio/mp3-cutter";

export default function ToolModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentToolId, setCurrentToolId] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenTool = (event: CustomEvent) => {
      const { toolId } = event.detail;
      setCurrentToolId(toolId);
      setIsOpen(true);
      document.body.style.overflow = 'hidden';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeTool();
      }
    };

    document.addEventListener("open-tool", handleOpenTool as EventListener);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("open-tool", handleOpenTool as EventListener);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeTool = () => {
    setIsOpen(false);
    setCurrentToolId(null);
    document.body.style.overflow = 'auto';
  };

  const switchTool = (toolId: string) => {
    setCurrentToolId(toolId);
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Calculator;
    return <IconComponent className="w-5 h-5 text-white" />;
  };

  const renderToolComponent = (toolId: string) => {
    const componentMap: Record<string, React.ComponentType> = {
      "general-calculator": GeneralCalculator,
      "scientific-calculator": ScientificCalculator,
      "percentage-calculator": PercentageCalculator,
      "bmi-calculator": BMICalculator,
      "age-calculator": AgeCalculator,
      "date-calculator": DateCalculator,
      "loan-calculator": LoanCalculator,
      "currency-converter": CurrencyConverter,
      "unit-converter": UnitConverter,
      "timezone-converter": TimezoneConverter,
      "number-system-converter": NumberSystemConverter,
      "text-case-converter": TextCaseConverter,
      "image-resizer": ImageResizer,
      "image-compressor": ImageCompressor,
      "image-cropper": ImageCropper,
      "pdf-merger": PDFMerger,
      "pdf-splitter": PDFSplitter,
      "mp3-cutter": MP3Cutter,
    };

    const Component = componentMap[toolId];
    return Component ? <Component /> : <div>Tool not found</div>;
  };

  if (!currentToolId) return null;

  const currentTool = getToolById(currentToolId);
  if (!currentTool) return null;

  const color = getCategoryColor(currentTool.category);
  const categoryTools = getToolsByCategory(currentTool.category);
  const otherTools = categoryTools.filter(tool => tool.id !== currentToolId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-7xl h-[80vh] max-h-[90vh] flex flex-col animate-fade-in p-0">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-${color} rounded-xl flex items-center justify-center`}>
                  {renderIcon(currentTool.icon)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold" data-testid="modal-title">
                    {currentTool.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className={`bg-${color}/10 text-${color} border-${color}/20 mt-1`}
                    data-testid="modal-category"
                  >
                    {toolCategories[currentTool.category].name}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Tool Switcher Dropdown */}
              {otherTools.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                      data-testid="tool-switcher"
                    >
                      <Shuffle className="w-4 h-4" />
                      <span>Switch Tool</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {otherTools.map((tool) => (
                      <DropdownMenuItem
                        key={tool.id}
                        onClick={() => switchTool(tool.id)}
                        data-testid={`switch-to-${tool.id}`}
                      >
                        {tool.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={closeTool}
                data-testid="close-modal"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-hidden">
            {renderToolComponent(currentToolId)}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-border">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Privacy-first: {currentTool.clientOnly ? "All calculations are done locally" : "Files auto-deleted after processing"}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span>No usage limits</span>
                <span>•</span>
                <span>Results are not stored</span>
              </div>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}
