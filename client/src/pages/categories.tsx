import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { toolCategories, getToolsByCategory, getCategoryColor, tools } from "@/lib/tools";
import { ToolCategory } from "@shared/schema";
import * as LucideIcons from "lucide-react";

export default function Categories() {
  const params = useParams();
  const selectedCategory = params.category as ToolCategory;

  const openTool = (toolId: string, category: ToolCategory) => {
    document.dispatchEvent(new CustomEvent("open-tool", { detail: { toolId, category } }));
  };

  const renderToolIcon = (iconName: string, color: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Calculator;
    return <IconComponent className={`w-6 h-6 text-${color} group-hover:text-white`} />;
  };

  const renderCategoryIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Calculator;
    return <IconComponent className="w-8 h-8 text-white" />;
  };

  // Show specific category
  if (selectedCategory && selectedCategory in toolCategories) {
    const categoryTools = getToolsByCategory(selectedCategory);
    const color = getCategoryColor(selectedCategory);
    const categoryData = toolCategories[selectedCategory];

    return (
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Category Header */}
          <div className="text-center mb-12">
            <div className={`w-20 h-20 bg-${color} rounded-2xl mx-auto mb-6 flex items-center justify-center`}>
              {renderCategoryIcon(selectedCategory === 'calculators' ? 'calculator' : 
                                  selectedCategory === 'converters' ? 'repeat' :
                                  selectedCategory === 'image-tools' ? 'image' :
                                  selectedCategory === 'document-tools' ? 'file-text' : 'play')}
            </div>
            <h1 className="text-4xl font-bold mb-4">{categoryData.name}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {selectedCategory === 'calculators' && 'Powerful calculation tools for math, finance, and everyday needs'}
              {selectedCategory === 'converters' && 'Convert between units, currencies, formats, and more'}
              {selectedCategory === 'image-tools' && 'Professional image editing and processing tools'}
              {selectedCategory === 'document-tools' && 'PDF processing and document manipulation utilities'}
              {selectedCategory === 'audio-video-tools' && 'Audio and video processing and conversion tools'}
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {categoryTools.map((tool) => {
              // Get unique solid colors and icons for each tool
              const getToolSolidColors = (toolId: string) => {
                const toolConfigs = [
                  { bg: 'bg-blue-500', text: 'text-white', badge: 'bg-blue-600', arrow: 'text-blue-200', icon: 'Calculator' },
                  { bg: 'bg-green-500', text: 'text-white', badge: 'bg-green-600', arrow: 'text-green-200', icon: 'DollarSign' },
                  { bg: 'bg-purple-500', text: 'text-white', badge: 'bg-purple-600', arrow: 'text-purple-200', icon: 'ImageIcon' },
                  { bg: 'bg-orange-500', text: 'text-white', badge: 'bg-orange-600', arrow: 'text-orange-200', icon: 'FileText' },
                  { bg: 'bg-red-500', text: 'text-white', badge: 'bg-red-600', arrow: 'text-red-200', icon: 'Video' },
                  { bg: 'bg-pink-500', text: 'text-white', badge: 'bg-pink-600', arrow: 'text-pink-200', icon: 'Activity' },
                  { bg: 'bg-indigo-500', text: 'text-white', badge: 'bg-indigo-600', arrow: 'text-indigo-200', icon: 'Pi' },
                  { bg: 'bg-cyan-500', text: 'text-white', badge: 'bg-cyan-600', arrow: 'text-cyan-200', icon: 'Mic' },
                  { bg: 'bg-teal-500', text: 'text-white', badge: 'bg-teal-600', arrow: 'text-teal-200', icon: 'Ruler' },
                  { bg: 'bg-emerald-500', text: 'text-white', badge: 'bg-emerald-600', arrow: 'text-emerald-200', icon: 'Calendar' },
                  { bg: 'bg-violet-500', text: 'text-white', badge: 'bg-violet-600', arrow: 'text-violet-200', icon: 'Type' },
                  { bg: 'bg-rose-500', text: 'text-white', badge: 'bg-rose-600', arrow: 'text-rose-200', icon: 'Globe' },
                  { bg: 'bg-amber-500', text: 'text-white', badge: 'bg-amber-600', arrow: 'text-amber-200', icon: 'Percent' },
                  { bg: 'bg-lime-500', text: 'text-black', badge: 'bg-lime-600', arrow: 'text-lime-800', icon: 'Music' },
                  { bg: 'bg-sky-500', text: 'text-white', badge: 'bg-sky-600', arrow: 'text-sky-200', icon: 'Volume2' },
                  { bg: 'bg-slate-500', text: 'text-white', badge: 'bg-slate-600', arrow: 'text-slate-200', icon: 'TrendingUp' },
                  { bg: 'bg-fuchsia-500', text: 'text-white', badge: 'bg-fuchsia-600', arrow: 'text-fuchsia-200', icon: 'Zap' },
                  { bg: 'bg-yellow-500', text: 'text-black', badge: 'bg-yellow-600', arrow: 'text-yellow-800', icon: 'Sun' },
                  { bg: 'bg-stone-500', text: 'text-white', badge: 'bg-stone-600', arrow: 'text-stone-200', icon: 'Mountain' },
                  { bg: 'bg-zinc-500', text: 'text-white', badge: 'bg-zinc-600', arrow: 'text-zinc-200', icon: 'Shield' }
                ];

                let hash = 0;
                for (let i = 0; i < toolId.length; i++) {
                  hash = toolId.charCodeAt(i) + ((hash << 5) - hash);
                }
                const configIndex = Math.abs(hash) % toolConfigs.length;
                return toolConfigs[configIndex];
              };

              const solidColors = getToolSolidColors(tool.id);

              const renderToolCardIcon = (iconName: string) => {
                const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Calculator;
                return <IconComponent className="w-6 h-6 text-white" />;
              };

              return (
                <Card
                  key={tool.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 h-[240px]"
                  onClick={() => openTool(tool.id, tool.category)}
                  data-testid={`tool-card-${tool.id}`}
                >
                  <CardContent className={`p-6 ${solidColors.bg} rounded-lg h-full flex flex-col`}>
                    <div className="w-12 h-12 bg-white/20 rounded-xl mb-4 flex items-center justify-center flex-shrink-0">
                      {renderToolCardIcon(solidColors.icon)}
                    </div>
                    <h3 className={`font-semibold text-lg mb-2 ${solidColors.text} line-clamp-1`}>{tool.name}</h3>
                    <p className={`text-sm mb-4 ${solidColors.text} opacity-90 flex-1 line-clamp-2`}>{tool.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        variant="outline"
                        className={`${solidColors.badge} ${solidColors.text} border-white/30 text-xs`}
                      >
                        {toolCategories[tool.category]?.name || 'Tool'}
                      </Badge>
                      {tool.popular && (
                        <Badge variant="outline" className="bg-yellow-400 text-yellow-900 border-yellow-500 text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <ArrowRight className={`w-4 h-4 ${solidColors.arrow} transition-colors`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {categoryTools.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No tools found in this category.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show all categories
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Tool Categories</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our comprehensive collection of tools organized by category
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(toolCategories).map(([categoryId, categoryData]) => {
            const category = categoryId as ToolCategory;
            const color = getCategoryColor(category);
            const categoryTools = getToolsByCategory(category);

            return (
              <Link key={categoryId} href={`/categories/${categoryId}`}>
                <Card className="group cursor-pointer hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl h-full">
                  <CardContent className={`bg-${color}-background border border-${color}/20 rounded-2xl p-8 text-center h-full flex flex-col`}>
                    <div className={`w-20 h-20 bg-${color} rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {renderCategoryIcon(categoryId === 'calculators' ? 'calculator' : 
                                          categoryId === 'converters' ? 'repeat' :
                                          categoryId === 'image-tools' ? 'image' :
                                          categoryId === 'document-tools' ? 'file-text' : 'play')}
                    </div>
                    <h3 className={`font-bold text-2xl text-${color}-foreground mb-4`}>{categoryData.name}</h3>
                    <p className={`text-${color}-foreground/70 mb-6 flex-1`}>
                      {categoryId === 'calculators' && 'Mathematical calculations, financial tools, and health calculators'}
                      {categoryId === 'converters' && 'Unit converters, currency exchange, and format conversions'}
                      {categoryId === 'image-tools' && 'Image editing, resizing, compression, and format conversion'}
                      {categoryId === 'document-tools' && 'PDF processing, document conversion, and text utilities'}
                      {categoryId === 'audio-video-tools' && 'Audio and video editing, conversion, and processing'}
                    </p>
                    <div className={`text-sm text-${color}-foreground/80 font-medium`}>
                      {categoryTools.length} tools available
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}