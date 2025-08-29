import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Plus } from "lucide-react";
import { toolCategories, getCategoryColor, getCategoryIcon, getPopularTools, getToolsByCategory } from "@/lib/tools";
import { ToolCategory } from "@shared/schema";
import * as LucideIcons from "lucide-react";

export default function Home() {
  const popularTools = getPopularTools();

  const openSearch = () => {
    document.dispatchEvent(new CustomEvent("open-global-search"));
  };

  const openTool = (toolId: string, category: ToolCategory) => {
    document.dispatchEvent(new CustomEvent("open-tool", { detail: { toolId, category } }));
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Calculator;
    return <IconComponent className="w-8 h-8 text-white" />;
  };

  const renderToolIcon = (iconName: string, color: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Calculator;
    return <IconComponent className={`w-6 h-6 text-${color} group-hover:text-white`} />;
  };

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            All Your Tools in One Place
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            From calculators to converters, image editing to document processing - everything you need, beautifully organized and lightning fast.
          </p>
          
          {/* Global Search Bar */}
          <div className="relative max-w-xl mx-auto mb-8">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search tools, calculators, converters..."
              className="w-full pl-10 pr-4 py-4 text-lg bg-card border border-border rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              onClick={openSearch}
              readOnly
              data-testid="hero-search"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <div className="search-shortcut">⌘K</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/categories">
              <Button size="lg" className="px-6 py-3 rounded-xl" data-testid="browse-categories">
                Browse Categories
              </Button>
            </Link>
            <Link href="/tools">
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-3 rounded-xl"
                data-testid="popular-tools"
              >
                Popular Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground text-lg">Choose from our comprehensive collection of tools</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
            {Object.entries(toolCategories).map(([categoryId, categoryData]) => {
              const category = categoryId as ToolCategory;
              const color = getCategoryColor(category);
              const icon = getCategoryIcon(category);
              const toolCount = getToolsByCategory(category).length;

              return (
                <Link key={categoryId} href={`/categories/${categoryId}`}>
                  <Card className="group cursor-pointer hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl">
                    <CardContent className={`bg-${color}-background border border-${color}/20 rounded-2xl p-6 text-center`}>
                      <div className={`w-16 h-16 bg-${color} rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        {renderIcon(icon)}
                      </div>
                      <h3 className={`font-bold text-lg text-${color}-foreground mb-2`}>{categoryData.name}</h3>
                      <p className={`text-sm text-${color}-foreground/70 mb-4`}>
                        {categoryId === 'calculators' && 'Mathematical calculations and financial tools'}
                        {categoryId === 'converters' && 'Units, currency, and format conversions'}
                        {categoryId === 'image-tools' && 'Edit, resize, and convert images'}
                        {categoryId === 'document-tools' && 'PDF processing and text utilities'}
                        {categoryId === 'audio-video-tools' && 'Media processing and conversion'}
                      </p>
                      <div className={`text-xs text-${color}-foreground/60`}>{toolCount} tools</div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Tools</h2>
            <p className="text-muted-foreground text-lg">Most used tools by our community</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularTools.map((tool) => {
              const color = getCategoryColor(tool.category);
              
              return (
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
                      <Badge
                        variant="outline"
                        className={`bg-${color}/10 text-${color} border-${color}/20`}
                      >
                        {toolCategories[tool.category].name}
                      </Badge>
                      <ArrowRight className={`w-4 h-4 text-muted-foreground group-hover:text-${color} transition-colors`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* More Tools Button */}
            <Link href="/tools">
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-dashed">
                <CardContent className="p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-muted/50 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary transition-colors">
                      <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">View All Tools</h3>
                    <p className="text-sm text-muted-foreground">Explore 20+ tools</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
