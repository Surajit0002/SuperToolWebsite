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
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.overflowY = 'hidden';
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
      // Ensure body scroll is restored on cleanup
      document.body.style.overflow = '';
      document.body.style.overflowY = '';
    };
  }, [isOpen]);

  const closeTool = () => {
    setIsOpen(false);
    setCurrentToolId(null);
    setSearchQuery("");
    // Restore body scrolling with smooth transition
    document.body.style.overflow = 'visible';
    document.body.style.overflowY = 'auto';
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Force re-enable scrolling after a short delay to ensure it takes effect
    setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.overflowY = '';
    }, 100);
  };

  const switchTool = (toolId: string) => {
    setCurrentToolId(toolId);
  };

  // Generate unique colors for each tool
  const getToolColor = (toolId: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-cyan-500 to-cyan-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-emerald-500 to-emerald-600',
      'bg-gradient-to-br from-violet-500 to-violet-600',
      'bg-gradient-to-br from-rose-500 to-rose-600',
      'bg-gradient-to-br from-amber-500 to-amber-600',
      'bg-gradient-to-br from-lime-500 to-lime-600',
      'bg-gradient-to-br from-sky-500 to-sky-600',
      'bg-gradient-to-br from-slate-500 to-slate-600',
      'bg-gradient-to-br from-zinc-500 to-zinc-600',
      'bg-gradient-to-br from-neutral-500 to-neutral-600',
      'bg-gradient-to-br from-stone-500 to-stone-600'
    ];
    
    // Use a simple hash function to assign consistent colors to tools
    let hash = 0;
    for (let i = 0; i < toolId.length; i++) {
      const char = toolId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const renderIcon = (iconName: string) => {
    // Comprehensive icon mapping to ensure compatibility with all tools
    const iconMap: Record<string, string> = {
      // Calculator tools
      'calculator': 'Calculator',
      'percent': 'Percent', 
      'heart': 'Heart',
      'calendar': 'Calendar',
      'banknote': 'Banknote',
      'trending-up': 'TrendingUp',
      'flame': 'Flame',
      'activity': 'Activity',
      'receipt': 'Receipt',
      'coins': 'Coins',
      'apple': 'Apple',
      'piggy-bank': 'PiggyBank',
      
      // Converter tools
      'repeat': 'Repeat',
      'thermometer': 'Thermometer',
      'type': 'Type',
      'clock': 'Clock',
      'binary': 'Binary',
      'code': 'Code',
      'ruler': 'Ruler',
      'table': 'Table',
      
      // Image tools
      'maximize': 'Maximize2',
      'minimize': 'Minimize2',
      'crop': 'Crop',
      'image': 'Image',
      'file-image': 'FileImage',
      'scissors': 'Scissors',
      'layers': 'Layers',
      'palette': 'Palette',
      'sparkles': 'Sparkles',
      'rotate-cw': 'RotateCw',
      'blur': 'Circle',
      'droplet': 'Droplet',
      'paintbrush': 'PaintBucket',
      'smile': 'Smile',
      'eyedropper': 'Eyedropper',
      'shield-check': 'ShieldCheck',
      'grid-3x3': 'Grid3X3',
      
      // Document tools
      'file-json': 'FileJson',
      'file-text': 'FileText',
      'merge': 'Merge',
      'split': 'Split',
      'file-plus': 'FilePlus',
      'file-minus': 'FileMinus',
      'presentation': 'Presentation',
      'book': 'Book',
      'unlock': 'Unlock',
      'lock': 'Lock',
      'scan-text': 'ScanText',
      'markdown': 'FileText',
      
      // Audio/Video tools
      'music': 'Music',
      'film': 'Film',
      'download': 'Download',
      'video': 'Video',
      'play': 'Play',
      
      // Additional common mappings
      'compress': 'Archive',
      'expand': 'Expand',
      'watermark': 'Droplets',
      'enhance': 'Zap',
      'convert': 'RefreshCw',
      'resize': 'Move3D',
      'flip': 'FlipHorizontal',
      'background': 'Layout'
    };

    // First try the mapped name, then the original name, then fallback
    const mappedIconName = iconMap[iconName?.toLowerCase()] || iconName;
    
    // Try to get the icon component
    let IconComponent = null;
    
    if (mappedIconName && (LucideIcons as any)[mappedIconName]) {
      IconComponent = (LucideIcons as any)[mappedIconName];
    } else if (iconName && (LucideIcons as any)[iconName]) {
      IconComponent = (LucideIcons as any)[iconName];
    } else {
      // Try common variations
      const variations = [
        iconName?.charAt(0).toUpperCase() + iconName?.slice(1),
        iconName?.toLowerCase(),
        iconName?.toUpperCase(),
        iconName?.replace('-', ''),
        iconName?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')
      ].filter(Boolean);
      
      for (const variation of variations) {
        if ((LucideIcons as any)[variation]) {
          IconComponent = (LucideIcons as any)[variation];
          break;
        }
      }
    }
    
    // Final fallback
    if (!IconComponent) {
      IconComponent = LucideIcons.Calculator;
    }
    
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
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        closeTool();
      } else {
        setIsOpen(true);
      }
    }}>
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                {renderIcon(currentTool.icon)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground" data-testid="modal-title">
                  {currentTool.name}
                </h2>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800/30 mt-1"
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
                  <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded"></div>
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
                
                {/* List of tools in dropdown */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredTools.map((tool) => (
                    <DropdownMenuItem
                      key={tool.id}
                      onClick={() => switchTool(tool.id)}
                      className={`cursor-pointer transition-all hover:bg-muted/60 ${
                        tool.id === currentToolId
                          ? "bg-blue-50 dark:bg-blue-950/20"
                          : ""
                      }`}
                      data-testid={`dropdown-switch-to-${tool.id}`}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className={`w-8 h-8 ${getToolColor(tool.id)} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          {renderIcon(tool.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm flex items-center space-x-2 ${
                            tool.id === currentToolId ? "text-blue-700 dark:text-blue-300" : "text-foreground"
                          }`}>
                            <span>{tool.name}</span>
                            {tool.popular && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300 dark:border-yellow-800/30 text-xs px-1.5 py-0">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {tool.description}
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

        {/* Enhanced Modal Body - Full Width Tool Content */}
        <div className="flex-1 overflow-hidden bg-background">
          <div className="h-full overflow-auto">
            {renderToolComponent(currentToolId)}
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
