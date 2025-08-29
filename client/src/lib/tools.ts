import { Tool, ToolCategory } from "@shared/schema";

export const tools: Tool[] = [
  // Calculators
  {
    id: "general-calculator",
    name: "General Calculator",
    description: "Basic arithmetic calculations with history",
    category: "calculators",
    icon: "calculator",
    clientOnly: true,
    popular: true,
    tags: ["math", "arithmetic", "calculator"],
  },
  {
    id: "scientific-calculator",
    name: "Scientific Calculator",
    description: "Advanced mathematical functions and operations",
    category: "calculators",
    icon: "calculator",
    clientOnly: true,
    popular: false,
    tags: ["math", "scientific", "trigonometry"],
  },
  {
    id: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Calculate percentages, discounts, and changes",
    category: "calculators",
    icon: "percent",
    clientOnly: true,
    popular: false,
    tags: ["percentage", "discount", "math"],
  },
  {
    id: "bmi-calculator",
    name: "BMI Calculator",
    description: "Calculate Body Mass Index quickly",
    category: "calculators",
    icon: "activity",
    clientOnly: true,
    popular: true,
    tags: ["health", "bmi", "fitness"],
  },
  {
    id: "age-calculator",
    name: "Age Calculator",
    description: "Calculate age in years, months, and days",
    category: "calculators",
    icon: "calendar",
    clientOnly: true,
    popular: false,
    tags: ["age", "date", "time"],
  },
  {
    id: "date-calculator",
    name: "Date Calculator",
    description: "Calculate differences between dates",
    category: "calculators",
    icon: "calendar-days",
    clientOnly: true,
    popular: false,
    tags: ["date", "time", "duration"],
  },
  {
    id: "loan-calculator",
    name: "Loan Calculator",
    description: "Calculate EMI, interest, and payment schedules",
    category: "calculators",
    icon: "banknote",
    clientOnly: true,
    popular: false,
    tags: ["loan", "emi", "finance"],
  },

  // Converters
  {
    id: "currency-converter",
    name: "Currency Converter",
    description: "Live exchange rates and conversions",
    category: "converters",
    icon: "banknote",
    clientOnly: false,
    popular: true,
    tags: ["currency", "exchange", "money"],
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    description: "Convert between various units",
    category: "converters",
    icon: "ruler",
    clientOnly: true,
    popular: true,
    tags: ["units", "measurement", "conversion"],
  },
  {
    id: "timezone-converter",
    name: "Time Zone Converter",
    description: "Convert time across different time zones",
    category: "converters",
    icon: "clock",
    clientOnly: true,
    popular: false,
    tags: ["time", "timezone", "clock"],
  },
  {
    id: "number-system-converter",
    name: "Number System Converter",
    description: "Convert between binary, decimal, hex, and octal",
    category: "converters",
    icon: "binary",
    clientOnly: true,
    popular: false,
    tags: ["binary", "hex", "decimal", "programming"],
  },
  {
    id: "text-case-converter",
    name: "Text Case Converter",
    description: "Convert text to different cases",
    category: "converters",
    icon: "type",
    clientOnly: true,
    popular: false,
    tags: ["text", "case", "uppercase", "lowercase"],
  },

  // Image Tools
  {
    id: "image-resizer",
    name: "Image Resizer",
    description: "Resize images while maintaining quality",
    category: "image-tools",
    icon: "maximize",
    clientOnly: false,
    popular: true,
    tags: ["image", "resize", "photo"],
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Reduce image file sizes",
    category: "image-tools",
    icon: "minimize",
    clientOnly: false,
    popular: false,
    tags: ["image", "compress", "optimize"],
  },
  {
    id: "image-cropper",
    name: "Image Cropper",
    description: "Crop images to specific dimensions",
    category: "image-tools",
    icon: "crop",
    clientOnly: false,
    popular: false,
    tags: ["image", "crop", "photo"],
  },

  // Document Tools
  {
    id: "pdf-merger",
    name: "PDF Merger",
    description: "Combine multiple PDFs into one",
    category: "document-tools",
    icon: "file-plus",
    clientOnly: false,
    popular: true,
    tags: ["pdf", "merge", "combine"],
  },
  {
    id: "pdf-splitter",
    name: "PDF Splitter",
    description: "Split PDF into multiple files",
    category: "document-tools",
    icon: "file-minus",
    clientOnly: false,
    popular: false,
    tags: ["pdf", "split", "separate"],
  },

  // Audio/Video Tools
  {
    id: "mp3-cutter",
    name: "MP3 Cutter",
    description: "Cut and trim audio files",
    category: "audio-video-tools",
    icon: "scissors",
    clientOnly: false,
    popular: false,
    tags: ["audio", "mp3", "cut", "trim"],
  },
];

export const getToolsByCategory = (category: ToolCategory): Tool[] => {
  return tools.filter(tool => tool.category === category);
};

export const getPopularTools = (): Tool[] => {
  return tools.filter(tool => tool.popular);
};

export const getToolById = (id: string): Tool | undefined => {
  return tools.find(tool => tool.id === id);
};

export const searchTools = (query: string): Tool[] => {
  const lowerQuery = query.toLowerCase();
  return tools.filter(tool => 
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getCategoryColor = (category: ToolCategory): string => {
  const colorMap = {
    calculators: "calculator",
    converters: "converter",
    "image-tools": "image",
    "document-tools": "document",
    "audio-video-tools": "audio",
  };
  return colorMap[category];
};

export const getCategoryIcon = (category: ToolCategory): string => {
  const iconMap = {
    calculators: "calculator",
    converters: "repeat",
    "image-tools": "image",
    "document-tools": "file-text",
    "audio-video-tools": "play",
  };
  return iconMap[category];
};

export const toolCategories: Record<ToolCategory, { name: string; description: string; icon: string; color: string }> = {
  calculators: {
    name: "Calculators",
    description: "Mathematical and financial calculations",
    icon: "calculator",
    color: "calculator"
  },
  converters: {
    name: "Converters", 
    description: "Unit, currency, and format conversions",
    icon: "repeat",
    color: "converter"
  },
  "image-tools": {
    name: "Image Tools",
    description: "Image processing and manipulation",
    icon: "image", 
    color: "image"
  },
  "document-tools": {
    name: "Document Tools",
    description: "PDF and document utilities",
    icon: "file-text",
    color: "document"
  },
  "audio-video-tools": {
    name: "Audio/Video Tools",
    description: "Media processing and editing",
    icon: "play",
    color: "audio"
  }
};
