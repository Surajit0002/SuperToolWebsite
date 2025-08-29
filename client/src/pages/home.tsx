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

  const renderToolIcon = (iconName: string, category: ToolCategory) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Calculator;
    
    const getIconClasses = (cat: ToolCategory) => {
      switch (cat) {
        case 'calculators':
          return 'text-blue-500 group-hover:text-white';
        case 'converters':
          return 'text-green-500 group-hover:text-white';
        case 'image-tools':
          return 'text-purple-500 group-hover:text-white';
        case 'document-tools':
          return 'text-orange-500 group-hover:text-white';
        case 'audio-video-tools':
          return 'text-red-500 group-hover:text-white';
        default:
          return 'text-gray-500 group-hover:text-white';
      }
    };
    
    return <IconComponent className={`w-6 h-6 ${getIconClasses(category)} transition-colors`} />;
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
              const icon = getCategoryIcon(category);
              const toolCount = getToolsByCategory(category).length;

              // Define color classes for each category
              const getCategoryColorClasses = (cat: ToolCategory) => {
                switch (cat) {
                  case 'calculators':
                    return {
                      cardBg: 'bg-blue-50 dark:bg-blue-950/20',
                      cardBorder: 'border-blue-200 dark:border-blue-800/30',
                      iconBg: 'bg-blue-500',
                      textPrimary: 'text-blue-900 dark:text-blue-100',
                      textSecondary: 'text-blue-700 dark:text-blue-300',
                      textTertiary: 'text-blue-600 dark:text-blue-400'
                    };
                  case 'converters':
                    return {
                      cardBg: 'bg-green-50 dark:bg-green-950/20',
                      cardBorder: 'border-green-200 dark:border-green-800/30',
                      iconBg: 'bg-green-500',
                      textPrimary: 'text-green-900 dark:text-green-100',
                      textSecondary: 'text-green-700 dark:text-green-300',
                      textTertiary: 'text-green-600 dark:text-green-400'
                    };
                  case 'image-tools':
                    return {
                      cardBg: 'bg-purple-50 dark:bg-purple-950/20',
                      cardBorder: 'border-purple-200 dark:border-purple-800/30',
                      iconBg: 'bg-purple-500',
                      textPrimary: 'text-purple-900 dark:text-purple-100',
                      textSecondary: 'text-purple-700 dark:text-purple-300',
                      textTertiary: 'text-purple-600 dark:text-purple-400'
                    };
                  case 'document-tools':
                    return {
                      cardBg: 'bg-orange-50 dark:bg-orange-950/20',
                      cardBorder: 'border-orange-200 dark:border-orange-800/30',
                      iconBg: 'bg-orange-500',
                      textPrimary: 'text-orange-900 dark:text-orange-100',
                      textSecondary: 'text-orange-700 dark:text-orange-300',
                      textTertiary: 'text-orange-600 dark:text-orange-400'
                    };
                  case 'audio-video-tools':
                    return {
                      cardBg: 'bg-red-50 dark:bg-red-950/20',
                      cardBorder: 'border-red-200 dark:border-red-800/30',
                      iconBg: 'bg-red-500',
                      textPrimary: 'text-red-900 dark:text-red-100',
                      textSecondary: 'text-red-700 dark:text-red-300',
                      textTertiary: 'text-red-600 dark:text-red-400'
                    };
                  default:
                    return {
                      cardBg: 'bg-gray-50 dark:bg-gray-950/20',
                      cardBorder: 'border-gray-200 dark:border-gray-800/30',
                      iconBg: 'bg-gray-500',
                      textPrimary: 'text-gray-900 dark:text-gray-100',
                      textSecondary: 'text-gray-700 dark:text-gray-300',
                      textTertiary: 'text-gray-600 dark:text-gray-400'
                    };
                }
              };

              const colorClasses = getCategoryColorClasses(category);

              return (
                <Link key={categoryId} href={`/categories/${categoryId}`}>
                  <Card className="group cursor-pointer hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl">
                    <CardContent className={`${colorClasses.cardBg} border ${colorClasses.cardBorder} rounded-2xl p-6 text-center`}>
                      <div className={`w-16 h-16 ${colorClasses.iconBg} rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        {renderIcon(icon)}
                      </div>
                      <h3 className={`font-bold text-lg ${colorClasses.textPrimary} mb-2`}>{categoryData.name}</h3>
                      <p className={`text-sm ${colorClasses.textSecondary} mb-4`}>
                        {categoryId === 'calculators' && 'Mathematical calculations and financial tools'}
                        {categoryId === 'converters' && 'Units, currency, and format conversions'}
                        {categoryId === 'image-tools' && 'Edit, resize, and convert images'}
                        {categoryId === 'document-tools' && 'PDF processing and text utilities'}
                        {categoryId === 'audio-video-tools' && 'Media processing and conversion'}
                      </p>
                      <div className={`text-xs ${colorClasses.textTertiary}`}>{toolCount} tools</div>
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
              // Define color classes for each category
              const getToolColorClasses = (category: ToolCategory) => {
                switch (category) {
                  case 'calculators':
                    return {
                      iconBg: 'bg-blue-50 dark:bg-blue-950/50',
                      iconBorder: 'border-blue-200 dark:border-blue-800/50',
                      iconHover: 'group-hover:bg-blue-500',
                      iconColor: 'text-blue-500',
                      iconColorHover: 'group-hover:text-white',
                      badgeBg: 'bg-blue-50 dark:bg-blue-950/50',
                      badgeText: 'text-blue-700 dark:text-blue-300',
                      badgeBorder: 'border-blue-200 dark:border-blue-800/50',
                      arrowHover: 'group-hover:text-blue-500'
                    };
                  case 'converters':
                    return {
                      iconBg: 'bg-green-50 dark:bg-green-950/50',
                      iconBorder: 'border-green-200 dark:border-green-800/50',
                      iconHover: 'group-hover:bg-green-500',
                      iconColor: 'text-green-500',
                      iconColorHover: 'group-hover:text-white',
                      badgeBg: 'bg-green-50 dark:bg-green-950/50',
                      badgeText: 'text-green-700 dark:text-green-300',
                      badgeBorder: 'border-green-200 dark:border-green-800/50',
                      arrowHover: 'group-hover:text-green-500'
                    };
                  case 'image-tools':
                    return {
                      iconBg: 'bg-purple-50 dark:bg-purple-950/50',
                      iconBorder: 'border-purple-200 dark:border-purple-800/50',
                      iconHover: 'group-hover:bg-purple-500',
                      iconColor: 'text-purple-500',
                      iconColorHover: 'group-hover:text-white',
                      badgeBg: 'bg-purple-50 dark:bg-purple-950/50',
                      badgeText: 'text-purple-700 dark:text-purple-300',
                      badgeBorder: 'border-purple-200 dark:border-purple-800/50',
                      arrowHover: 'group-hover:text-purple-500'
                    };
                  case 'document-tools':
                    return {
                      iconBg: 'bg-orange-50 dark:bg-orange-950/50',
                      iconBorder: 'border-orange-200 dark:border-orange-800/50',
                      iconHover: 'group-hover:bg-orange-500',
                      iconColor: 'text-orange-500',
                      iconColorHover: 'group-hover:text-white',
                      badgeBg: 'bg-orange-50 dark:bg-orange-950/50',
                      badgeText: 'text-orange-700 dark:text-orange-300',
                      badgeBorder: 'border-orange-200 dark:border-orange-800/50',
                      arrowHover: 'group-hover:text-orange-500'
                    };
                  case 'audio-video-tools':
                    return {
                      iconBg: 'bg-red-50 dark:bg-red-950/50',
                      iconBorder: 'border-red-200 dark:border-red-800/50',
                      iconHover: 'group-hover:bg-red-500',
                      iconColor: 'text-red-500',
                      iconColorHover: 'group-hover:text-white',
                      badgeBg: 'bg-red-50 dark:bg-red-950/50',
                      badgeText: 'text-red-700 dark:text-red-300',
                      badgeBorder: 'border-red-200 dark:border-red-800/50',
                      arrowHover: 'group-hover:text-red-500'
                    };
                  default:
                    return {
                      iconBg: 'bg-gray-50 dark:bg-gray-950/50',
                      iconBorder: 'border-gray-200 dark:border-gray-800/50',
                      iconHover: 'group-hover:bg-gray-500',
                      iconColor: 'text-gray-500',
                      iconColorHover: 'group-hover:text-white',
                      badgeBg: 'bg-gray-50 dark:bg-gray-950/50',
                      badgeText: 'text-gray-700 dark:text-gray-300',
                      badgeBorder: 'border-gray-200 dark:border-gray-800/50',
                      arrowHover: 'group-hover:text-gray-500'
                    };
                }
              };

              const colorClasses = getToolColorClasses(tool.category);

              return (
                <Card
                  key={tool.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => openTool(tool.id, tool.category)}
                  data-testid={`tool-card-${tool.id}`}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${colorClasses.iconBg} border ${colorClasses.iconBorder} rounded-xl mb-4 flex items-center justify-center ${colorClasses.iconHover} transition-colors`}>
                      {renderToolIcon(tool.icon, tool.category)}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`${colorClasses.badgeBg} ${colorClasses.badgeText} ${colorClasses.badgeBorder}`}
                      >
                        {toolCategories[tool.category].name}
                      </Badge>
                      <ArrowRight className={`w-4 h-4 text-muted-foreground ${colorClasses.arrowHover} transition-colors`} />
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