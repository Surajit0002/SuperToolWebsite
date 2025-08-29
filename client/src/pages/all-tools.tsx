import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowRight, Filter } from "lucide-react";
import { tools, toolCategories, getCategoryColor, searchTools } from "@/lib/tools";
import { ToolCategory } from "@shared/schema";
import * as LucideIcons from "lucide-react";

export default function AllTools() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const openTool = (toolId: string, category: ToolCategory) => {
    document.dispatchEvent(new CustomEvent("open-tool", { detail: { toolId, category } }));
  };

  const renderToolIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Calculator;
    return <IconComponent className={`w-6 h-6 text-white`} />;
  };

  // Filter and sort tools
  let filteredTools = searchQuery ? searchTools(searchQuery) : tools;

  if (selectedCategory !== "all") {
    filteredTools = filteredTools.filter(tool => tool.category === selectedCategory);
  }

  filteredTools = filteredTools.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "popular":
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      case "category":
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">All Tools</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our complete collection of {tools.length} professional tools
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-tools"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48" data-testid="filter-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(toolCategories).map(([id, categoryData]) => (
                <SelectItem key={id} value={id}>
                  {categoryData.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48" data-testid="sort-tools">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="popular">Popular First</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing {filteredTools.length} of {tools.length} tools
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== "all" && ` in ${toolCategories[selectedCategory as ToolCategory].name}`}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => {
            // Get unique solid colors for each tool
            const getToolSolidColors = (toolId: string) => {
              const colors = [
                { bg: 'bg-blue-500', text: 'text-white', badge: 'bg-blue-600', arrow: 'text-blue-200' },
                { bg: 'bg-green-500', text: 'text-white', badge: 'bg-green-600', arrow: 'text-green-200' },
                { bg: 'bg-purple-500', text: 'text-white', badge: 'bg-purple-600', arrow: 'text-purple-200' },
                { bg: 'bg-orange-500', text: 'text-white', badge: 'bg-orange-600', arrow: 'text-orange-200' },
                { bg: 'bg-red-500', text: 'text-white', badge: 'bg-red-600', arrow: 'text-red-200' },
                { bg: 'bg-pink-500', text: 'text-white', badge: 'bg-pink-600', arrow: 'text-pink-200' },
                { bg: 'bg-indigo-500', text: 'text-white', badge: 'bg-indigo-600', arrow: 'text-indigo-200' },
                { bg: 'bg-cyan-500', text: 'text-white', badge: 'bg-cyan-600', arrow: 'text-cyan-200' },
                { bg: 'bg-teal-500', text: 'text-white', badge: 'bg-teal-600', arrow: 'text-teal-200' },
                { bg: 'bg-emerald-500', text: 'text-white', badge: 'bg-emerald-600', arrow: 'text-emerald-200' },
                { bg: 'bg-violet-500', text: 'text-white', badge: 'bg-violet-600', arrow: 'text-violet-200' },
                { bg: 'bg-rose-500', text: 'text-white', badge: 'bg-rose-600', arrow: 'text-rose-200' }
              ];

              let hash = 0;
              for (let i = 0; i < toolId.length; i++) {
                hash = toolId.charCodeAt(i) + ((hash << 5) - hash);
              }
              const colorIndex = Math.abs(hash) % colors.length;
              return colors[colorIndex];
            };

            const solidColors = getToolSolidColors(tool.id);

            return (
              <Card
                key={tool.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-0"
                onClick={() => openTool(tool.id, tool.category)}
                data-testid={`tool-card-${tool.id}`}
              >
                <CardContent className={`p-6 ${solidColors.bg} rounded-lg`}>
                  <div className="w-12 h-12 bg-white/20 rounded-xl mb-4 flex items-center justify-center">
                    {renderToolIcon(tool.icon)}
                  </div>
                  <h3 className={`font-semibold text-lg mb-2 ${solidColors.text}`}>{tool.name}</h3>
                  <p className={`text-sm mb-4 ${solidColors.text} opacity-90`}>{tool.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={`${solidColors.badge} ${solidColors.text} border-white/30`}
                    >
                      {toolCategories[tool.category].name}
                    </Badge>
                    {tool.popular && (
                      <Badge variant="outline" className="bg-yellow-400 text-yellow-900 border-yellow-500">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
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

        {/* No Results */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tools found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              data-testid="clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}