import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOpenTool = (event: CustomEvent) => {
      const { toolId } = event.detail;
      setIsLoading(true);
      setCurrentToolId(toolId);
      setIsOpen(true);
      document.body.style.overflow = 'hidden';
      // Simulate loading for smooth animation
      setTimeout(() => setIsLoading(false), 300);
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
    setIsLoading(false);
    document.body.style.overflow = 'auto';
  };

  const switchTool = (toolId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentToolId(toolId);
      setIsLoading(false);
    }, 200);
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
  
  // Dynamic color schemes for each category
  const getDynamicStyles = (category: ToolCategory) => {
    const baseColor = getCategoryColor(category);
    const styles = {
      calculators: {
        gradient: 'from-blue-600 via-indigo-600 to-purple-700',
        shadow: 'shadow-blue-500/25',
        glow: 'ring-blue-400/30',
        accent: 'blue',
        headerBg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        sidebarBg: 'bg-gradient-to-b from-blue-50/50 to-white'
      },
      converters: {
        gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
        shadow: 'shadow-emerald-500/25',
        glow: 'ring-emerald-400/30',
        accent: 'emerald',
        headerBg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
        sidebarBg: 'bg-gradient-to-b from-emerald-50/50 to-white'
      },
      image: {
        gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
        shadow: 'shadow-violet-500/25',
        glow: 'ring-violet-400/30',
        accent: 'violet',
        headerBg: 'bg-gradient-to-r from-violet-50 to-purple-50',
        sidebarBg: 'bg-gradient-to-b from-violet-50/50 to-white'
      },
      document: {
        gradient: 'from-orange-500 via-red-500 to-pink-600',
        shadow: 'shadow-orange-500/25',
        glow: 'ring-orange-400/30',
        accent: 'orange',
        headerBg: 'bg-gradient-to-r from-orange-50 to-red-50',
        sidebarBg: 'bg-gradient-to-b from-orange-50/50 to-white'
      },
      audio: {
        gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
        shadow: 'shadow-cyan-500/25',
        glow: 'ring-cyan-400/30',
        accent: 'cyan',
        headerBg: 'bg-gradient-to-r from-cyan-50 to-blue-50',
        sidebarBg: 'bg-gradient-to-b from-cyan-50/50 to-white'
      }
    };
    return styles[category] || styles.calculators;
  };
  
  const dynamicStyles = getDynamicStyles(currentTool.category);
  
  // Filter tools based on search query
  const filteredTools = categoryTools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={`
        relative overflow-hidden
        bg-white/95 backdrop-blur-xl
        border border-white/20 
        rounded-3xl 
        ${dynamicStyles.shadow} shadow-2xl
        ring-1 ${dynamicStyles.glow}
        w-full max-w-7xl h-[85vh] max-h-[90vh] 
        flex flex-col 
        transition-all duration-500 ease-out
        animate-in slide-in-from-bottom-4 fade-in-0 zoom-in-95
        p-0
      `}>
        <DialogTitle className="sr-only">
          {currentTool.name} - {toolCategories[currentTool.category].name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {currentTool.description}
        </DialogDescription>
        
        {/* Modal Header */}
        <div className={`
          relative overflow-hidden
          ${dynamicStyles.headerBg}
          border-b border-white/20
          backdrop-blur-sm
        `}>
          {/* Animated gradient overlay */}
          <div className={`
            absolute inset-0 opacity-60
            bg-gradient-to-r ${dynamicStyles.gradient}
            animate-pulse
          `} />
          
          {/* Header content */}
          <div className="relative flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                {/* Enhanced icon with glow effect */}
                <div className={`
                  relative w-12 h-12 
                  bg-gradient-to-br ${dynamicStyles.gradient}
                  rounded-2xl flex items-center justify-center
                  shadow-lg ${dynamicStyles.shadow}
                  ring-2 ring-white/20
                  transition-transform duration-300 hover:scale-105
                  group
                `}>
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {renderIcon(currentTool.icon)}
                </div>
                
                <div className="space-y-1">
                  <h2 className={`
                    text-2xl font-bold bg-gradient-to-r ${dynamicStyles.gradient} 
                    bg-clip-text text-transparent
                    transition-all duration-300
                  `} data-testid="modal-title">
                    {currentTool.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className={`
                      bg-white/80 backdrop-blur-sm
                      text-${dynamicStyles.accent}-700
                      border-${dynamicStyles.accent}-200/50
                      shadow-sm
                      transition-all duration-300 hover:shadow-md
                    `}
                    data-testid="modal-category"
                  >
                    {toolCategories[currentTool.category].name}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Enhanced close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={closeTool}
                data-testid="close-modal"
                className="
                  relative rounded-full w-10 h-10 p-0
                  bg-white/10 hover:bg-white/20
                  border border-white/20
                  backdrop-blur-sm
                  transition-all duration-300
                  hover:scale-110 hover:rotate-90
                  group
                "
              >
                <X className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors" />
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Body with Tabs */}
        <div className="flex-1 overflow-hidden flex">
          {/* Tool Switcher Sidebar */}
          <div className={`
            w-80 border-r border-white/20 
            ${dynamicStyles.sidebarBg}
            backdrop-blur-sm
            flex flex-col
            transition-all duration-500
          `}>
            {/* Search within category */}
            <div className="p-4 border-b border-white/10">
              <div className="relative group">
                <Search className={`
                  absolute left-3 top-1/2 transform -translate-y-1/2 
                  w-4 h-4 text-${dynamicStyles.accent}-400
                  transition-colors duration-300
                  group-focus-within:text-${dynamicStyles.accent}-600
                `} />
                <Input
                  type="text"
                  placeholder={`Search ${toolCategories[currentTool.category].name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
                    pl-10 
                    bg-white/50 backdrop-blur-sm
                    border-${dynamicStyles.accent}-200/50
                    focus:border-${dynamicStyles.accent}-400
                    focus:ring-2 focus:ring-${dynamicStyles.accent}-400/20
                    rounded-xl
                    transition-all duration-300
                    placeholder:text-${dynamicStyles.accent}-400/70
                  `}
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
                    className={`
                      group relative w-full text-left p-3 rounded-xl mb-2 
                      transition-all duration-300 ease-out
                      hover:transform hover:scale-[1.02]
                      hover:shadow-lg hover:shadow-${dynamicStyles.accent}-500/10
                      ${tool.id === currentToolId
                        ? `
                          bg-gradient-to-r ${dynamicStyles.gradient} 
                          shadow-lg ${dynamicStyles.shadow}
                          ring-2 ring-white/30
                          text-white
                        `
                        : `
                          bg-white/30 backdrop-blur-sm
                          border border-white/20
                          hover:bg-white/50
                          hover:border-${dynamicStyles.accent}-200/50
                        `
                      }
                    `}
                    data-testid={`switch-to-${tool.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        relative w-8 h-8 rounded-lg 
                        flex items-center justify-center flex-shrink-0
                        transition-all duration-300
                        ${tool.id === currentToolId
                          ? 'bg-white/20 backdrop-blur-sm'
                          : `bg-gradient-to-br ${dynamicStyles.gradient} group-hover:scale-110`
                        }
                      `}>
                        {tool.id === currentToolId && (
                          <div className="absolute inset-0 rounded-lg bg-white/10 animate-pulse" />
                        )}
                        <div className={tool.id === currentToolId ? 'text-white' : 'text-white'}>
                          {renderIcon(tool.icon)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`
                          font-medium text-sm transition-colors duration-300
                          ${tool.id === currentToolId 
                            ? 'text-white drop-shadow-sm' 
                            : `text-${dynamicStyles.accent}-800 group-hover:text-${dynamicStyles.accent}-900`
                          }
                        `}>
                          {tool.name}
                        </div>
                        <div className={`
                          text-xs truncate transition-colors duration-300
                          ${tool.id === currentToolId 
                            ? 'text-white/80' 
                            : `text-${dynamicStyles.accent}-600 group-hover:text-${dynamicStyles.accent}-700`
                          }
                        `}>
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
          <div className="flex-1 overflow-hidden relative">
            {/* Loading overlay */}
            {isLoading && (
              <div className={`
                absolute inset-0 z-50 
                bg-gradient-to-br ${dynamicStyles.gradient} 
                bg-opacity-10 backdrop-blur-sm
                flex items-center justify-center
                transition-opacity duration-300
              `}>
                <div className="flex flex-col items-center space-y-4">
                  <div className={`
                    w-12 h-12 border-4 border-${dynamicStyles.accent}-200 
                    border-t-${dynamicStyles.accent}-600 
                    rounded-full animate-spin
                  `} />
                  <p className={`text-${dynamicStyles.accent}-600 font-medium animate-pulse`}>
                    Loading {currentTool.name}...
                  </p>
                </div>
              </div>
            )}
            
            {/* Tool content with fade animation */}
            <div className={`
              h-full transition-opacity duration-300 ease-in-out
              ${isLoading ? 'opacity-50' : 'opacity-100'}
            `}>
              {renderToolComponent(currentToolId)}
            </div>
          </div>
        </div>

          {/* Modal Footer */}
          <div className={`
            p-6 border-t border-white/10 
            bg-gradient-to-r from-white/30 to-white/10
            backdrop-blur-sm
          `}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className={`
                  flex items-center text-${dynamicStyles.accent}-700
                  transition-colors duration-300
                `}>
                  <ShieldCheck className={`
                    w-4 h-4 mr-2 text-${dynamicStyles.accent}-600
                    transition-transform duration-300 hover:scale-110
                  `} />
                  Privacy-first: {currentTool.clientOnly ? "All calculations are done locally" : "Files auto-deleted after processing"}
                </span>
              </div>
              <div className={`
                flex items-center space-x-4 text-${dynamicStyles.accent}-600
                transition-colors duration-300
              `}>
                <span className="opacity-80">No usage limits</span>
                <span className="opacity-60">•</span>
                <span className="opacity-80">Results are not stored</span>
              </div>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}
