import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Search, ShieldCheck } from "lucide-react";
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
import InvestmentCalculator from "./calculators/investment-calculator";
import CalorieCalculator from "./calculators/calorie-calculator";
import CompoundInterestCalculator from "./calculators/compound-interest-calculator";
import BodyFatCalculator from "./calculators/body-fat-calculator";
import TaxGstCalculator from "./calculators/tax-gst-calculator";
import UnitConverter from "./converters/unit-converter";
import CurrencyConverter from "./converters/currency-converter";
import TimezoneConverter from "./converters/timezone-converter";
import NumberSystemConverter from "./converters/number-system-converter";
import TextCaseConverter from "./converters/text-case-converter";
import TemperatureConverter from "./converters/temperature-converter";
import JsonToXmlConverter from "./converters/json-to-xml-converter";
import XmlToJsonConverter from "./converters/xml-to-json-converter";
import CsvToJsonConverter from "./converters/csv-to-json-converter";
import JsonToCsvConverter from "./converters/json-to-csv-converter";
import ImageResizer from "./image/image-resizer";
import ImageCompressor from "./image/image-compressor";
import ImageCropper from "./image/image-cropper";
import PDFMerger from "./document/pdf-merger";
import PDFSplitter from "./document/pdf-splitter";
import MP3Cutter from "./audio/mp3-cutter";

export default function ToolModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentToolId, setCurrentToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    setSearchQuery("");
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
      "investment-calculator": InvestmentCalculator,
      "calorie-calculator": CalorieCalculator,
      "compound-interest-calculator": CompoundInterestCalculator,
      "body-fat-calculator": BodyFatCalculator,
      "tax-gst-calculator": TaxGstCalculator,
      "currency-converter": CurrencyConverter,
      "unit-converter": UnitConverter,
      "timezone-converter": TimezoneConverter,
      "number-system-converter": NumberSystemConverter,
      "text-case-converter": TextCaseConverter,
      "temperature-converter": TemperatureConverter,
      "json-to-xml-converter": JsonToXmlConverter,
      "xml-to-json-converter": XmlToJsonConverter,
      "csv-to-json-converter": CsvToJsonConverter,
      "json-to-csv-converter": JsonToCsvConverter,
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
  
  // Filter tools based on search query
  const filteredTools = categoryTools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-7xl h-[85vh] max-h-[90vh] flex flex-col animate-fade-in p-0">
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

        {/* Modal Body with Tabs */}
        <div className="flex-1 overflow-hidden flex">
          {/* Tool Switcher Sidebar */}
          <div className="w-80 border-r border-border bg-muted/20 flex flex-col">
            {/* Search within category */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={`Search ${toolCategories[currentTool.category].name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="tool-search"
                />
              </div>
            </div>
            
            {/* Tool List */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => switchTool(tool.id)}
                    className={`w-full text-left p-3 rounded-lg mb-2 transition-colors hover:bg-muted/60 ${
                      tool.id === currentToolId
                        ? `bg-${color}/10 border border-${color}/20`
                        : "bg-background border border-transparent"
                    }`}
                    data-testid={`switch-to-${tool.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        {renderIcon(tool.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm ${
                          tool.id === currentToolId ? `text-${color}` : "text-foreground"
                        }`}>
                          {tool.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {tool.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                
                {filteredTools.length === 0 && searchQuery && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tools found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-border text-xs text-muted-foreground">
              {categoryTools.length} tools in {toolCategories[currentTool.category].name}
            </div>
          </div>
          
          {/* Tool Content */}
          <div className="flex-1 overflow-hidden">
            {renderToolComponent(currentToolId)}
          </div>
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
