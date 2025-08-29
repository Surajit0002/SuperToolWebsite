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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryTools.map((tool) => (
              <Card
                key={tool.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => openTool(tool.id, tool.category)}
                data-testid={`tool-card-${tool.id}`}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${color}/10 border border-${color}/20 rounded-xl mb-4 flex items-center justify-center group-hover:bg-${color} group-hover:border-${color} transition-colors`}>
                    {renderToolIcon(tool.icon, color)}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                  <div className="flex items-center justify-between">
                    {tool.popular && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Popular
                      </Badge>
                    )}
                    <ArrowRight className={`w-4 h-4 text-muted-foreground group-hover:text-${color} transition-colors ml-auto`} />
                  </div>
                </CardContent>
              </Card>
            ))}
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
