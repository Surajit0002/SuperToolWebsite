import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { X, Search, ShieldCheck, ChevronDown, Grid3X3, Layers } from "lucide-react";
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
import ImageFormatConverter from "./image/image-format-converter";
import ImageToPdfConverter from "./image/image-to-pdf-converter";
// Remove duplicate - using color-picker-tool instead
import ImageWatermarkTool from "./image/image-watermark-tool";
import ImageEnhancer from "./image/image-enhancer";
import MemeGenerator from "./image/meme-generator";
import ImageRotatorFlipper from "./image/image-rotator-flipper";
import ImageBlurPixelate from "./image/image-blur-pixelate";
import ColorPickerTool from "./image/color-picker-tool";
import PDFMerger from "./document/pdf-merger";
import PDFSplitter from "./document/pdf-splitter";
import TextToPdfGenerator from "./document/text-to-pdf-generator";
import MP3Cutter from "./audio/mp3-cutter";
import GifMaker from "./audio/gif-maker";
import VideoDownloader from "./audio/video-downloader";

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
      "image-format-converter": ImageFormatConverter,
      "image-to-pdf-converter": ImageToPdfConverter,
      "image-color-picker": ColorPickerTool,
      "image-watermark-tool": ImageWatermarkTool,
      "image-enhancer": ImageEnhancer,
      "meme-generator": MemeGenerator,
      "image-rotator-flipper": ImageRotatorFlipper,
      "image-blur-pixelate": ImageBlurPixelate,
      "color-picker-tool": ColorPickerTool,
      "pdf-merger": PDFMerger,
      "pdf-splitter": PDFSplitter,
      "text-to-pdf-generator": TextToPdfGenerator,
      "mp3-cutter": MP3Cutter,
      "gif-maker": GifMaker,
      "video-downloader": VideoDownloader,
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
      <DialogContent className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] max-h-[95vh] flex flex-col animate-fade-in p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {currentTool.name} - {toolCategories[currentTool.category].name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {currentTool.description}
        </DialogDescription>
        
        {/* Enhanced Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-muted/20 to-muted/10">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br from-${color} to-${color}/80 rounded-xl flex items-center justify-center shadow-lg`}>
                {renderIcon(currentTool.icon)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground" data-testid="modal-title">
                  {currentTool.name}
                </h2>
                <Badge
                  variant="outline"
                  className={`bg-${color}/10 text-${color} border-${color}/20 mt-1`}
                  data-testid="modal-category"
                >
                  <Layers className="w-3 h-3 mr-1" />
                  {toolCategories[currentTool.category].name}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Advanced Tool Switcher Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 min-w-[180px] justify-between"
                  data-testid="tool-switcher"
                >
                  <div className="flex items-center space-x-2">
                    <Grid3X3 className="w-4 h-4" />
                    <span className="truncate">Switch Tool</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
                <DropdownMenuLabel className="flex items-center space-x-2">
                  <div className={`w-4 h-4 bg-${color} rounded`}></div>
                  <span>{toolCategories[currentTool.category].name} Tools</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Search within dropdown */}
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-8"
                      data-testid="dropdown-search"
                    />
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Grid of tools in dropdown */}
                <div className="p-2 grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
                  {filteredTools.map((tool) => (
                    <DropdownMenuItem
                      key={tool.id}
                      onClick={() => switchTool(tool.id)}
                      className={`p-3 cursor-pointer rounded-lg transition-all ${
                        tool.id === currentToolId
                          ? `bg-${color}/10 border border-${color}/20`
                          : "hover:bg-muted/60"
                      }`}
                      data-testid={`dropdown-switch-to-${tool.id}`}
                    >
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <div className={`w-8 h-8 bg-${color} rounded-lg flex items-center justify-center`}>
                          {renderIcon(tool.icon)}
                        </div>
                        <div className="space-y-1">
                          <div className={`font-medium text-xs ${
                            tool.id === currentToolId ? `text-${color}` : "text-foreground"
                          }`}>
                            {tool.name}
                          </div>
                          <div className="text-xs text-muted-foreground leading-tight">
                            {tool.description.length > 40 
                              ? `${tool.description.substring(0, 40)}...` 
                              : tool.description
                            }
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                
                {filteredTools.length === 0 && searchQuery && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tools found matching "{searchQuery}"</p>
                  </div>
                )}
                
                <DropdownMenuSeparator />
                <div className="p-2 text-xs text-muted-foreground text-center">
                  {categoryTools.length} tools available
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Single Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeTool}
              className="hover:bg-destructive/10 hover:text-destructive"
              data-testid="close-modal"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Enhanced Modal Body - Grid Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-12 gap-0">
          {/* Sidebar - Quick Tool Navigation */}
          <div className="col-span-3 border-r border-border bg-muted/10 flex flex-col">
            {/* Quick Actions */}
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-sm mb-3 flex items-center">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Quick Switch
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {categoryTools.slice(0, 4).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => switchTool(tool.id)}
                    className={`p-2 rounded-lg transition-all text-left ${
                      tool.id === currentToolId
                        ? `bg-${color}/10 border border-${color}/20`
                        : "bg-background hover:bg-muted/60 border border-transparent"
                    }`}
                    data-testid={`quick-switch-${tool.id}`}
                  >
                    <div className={`w-6 h-6 bg-${color} rounded flex items-center justify-center mb-1`}>
                      {renderIcon(tool.icon)}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {tool.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tool List - Scrollable */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => switchTool(tool.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all hover:shadow-sm ${
                      tool.id === currentToolId
                        ? `bg-${color}/15 border border-${color}/30 shadow-sm`
                        : "bg-background hover:bg-muted/40 border border-transparent"
                    }`}
                    data-testid={`sidebar-switch-to-${tool.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-br from-${color} to-${color}/80 rounded-lg flex items-center justify-center flex-shrink-0`}>
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
              </div>
            </ScrollArea>
            
            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border bg-muted/5">
              <div className="text-xs text-muted-foreground text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className={`w-2 h-2 bg-${color} rounded-full`}></div>
                  <span>{categoryTools.length} tools</span>
                </div>
                <span className="text-muted-foreground/70">in {toolCategories[currentTool.category].name}</span>
              </div>
            </div>
          </div>
          
          {/* Main Tool Content Area */}
          <div className="col-span-9 overflow-hidden bg-background">
            <div className="h-full overflow-auto">
              {renderToolComponent(currentToolId)}
            </div>
          </div>
        </div>

        {/* Enhanced Modal Footer */}
        <div className="p-4 border-t border-border bg-gradient-to-r from-muted/10 to-muted/5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <span className="flex items-center text-muted-foreground">
                <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                <span className="font-medium">Privacy-first:</span>
                <span className="ml-1">
                  {currentTool.clientOnly ? "All processing done locally" : "Files auto-deleted after processing"}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                No usage limits
              </span>
              <span>•</span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Results not stored
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
