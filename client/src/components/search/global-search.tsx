import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight } from "lucide-react";
import { searchTools, getPopularTools, toolCategories, getCategoryColor } from "@/lib/tools";
import { ToolCategory } from "@shared/schema";
import * as LucideIcons from "lucide-react";

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchResults = query ? searchTools(query) : [];
  const popularTools = getPopularTools().slice(0, 3);
  const categories = Object.entries(toolCategories);

  const allResults = [...searchResults.slice(0, 5), ...(!query ? popularTools : [])];

  useEffect(() => {
    const handleOpenSearch = () => {
      setIsOpen(true);
      setQuery("");
      setSelectedIndex(0);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleOpenSearch();
      }

      if (isOpen && e.key === "Escape") {
        setIsOpen(false);
      }

      if (isOpen && e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
      }

      if (isOpen && e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }

      if (isOpen && e.key === "Enter" && allResults[selectedIndex]) {
        e.preventDefault();
        const tool = allResults[selectedIndex];
        openTool(tool.id, tool.category);
      }
    };

    document.addEventListener("open-global-search", handleOpenSearch);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("open-global-search", handleOpenSearch);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, selectedIndex, allResults]);

  const openTool = (toolId: string, category: ToolCategory) => {
    setIsOpen(false);
    document.dispatchEvent(new CustomEvent("open-tool", { detail: { toolId, category } }));
  };

  const renderIcon = (iconName: string, color: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Calculator;
    return <IconComponent className={`w-4 h-4 text-${color}`} />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden p-0 border border-gray-200 bg-white">
        <DialogTitle className="sr-only">
          Global Search - Search Tools and Calculators
        </DialogTitle>
        <DialogDescription className="sr-only">
          Search through all available tools, calculators, converters, image tools, document tools, and audio/video tools. Use arrow keys to navigate and Enter to select.
        </DialogDescription>
        <div className="relative w-full h-full">
          {/* Search Header */}
          <div className="relative p-6 bg-blue-600 border-b border-white/20">
            <div className="relative">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                </div>
                <Input
                  type="text"
                  placeholder="Search tools and calculators..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="pl-16 pr-24 py-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-400 placeholder:text-gray-500 text-gray-800"
                  autoFocus
                  data-testid="global-search-input"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {query && (
                    <button
                      onClick={() => {
                        setQuery("");
                        setSelectedIndex(0);
                      }}
                      className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center text-white text-sm"
                    >
                      ×
                    </button>
                  )}
                  <div className="hidden sm:flex items-center justify-center bg-gray-700 text-white text-xs px-2 py-1 rounded font-mono">
                    ESC
                  </div>
                </div>
              </div>
            </div>

            {/* Action Hints */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
              <div className="flex items-center space-x-1 bg-green-500 px-3 py-1 rounded-lg">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <span className="text-xs font-medium text-white">↵ select</span>
              </div>
              <div className="flex items-center space-x-1 bg-blue-500 px-3 py-1 rounded-lg">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <span className="text-xs font-medium text-white">↑↓ navigate</span>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[65vh] overflow-y-auto bg-white">
            <div className="p-6">
              {query ? (
                <>
                  {searchResults.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between px-2 py-2 mb-3">
                        <div className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>Search Results</span>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {searchResults.length} found
                        </div>
                      </div>
                      <div className="space-y-2">
                        {searchResults.slice(0, 8).map((tool, index) => {
                          const color = getCategoryColor(tool.category);
                          const isSelected = index === selectedIndex;

                          return (
                            <div
                              key={tool.id}
                              className={`cursor-pointer rounded-xl p-4 flex items-center space-x-3 ${
                                isSelected
                                  ? `bg-blue-600 border border-blue-700`
                                  : "hover:bg-gray-50 border border-gray-200"
                              }`}
                              onClick={() => openTool(tool.id, tool.category)}
                              data-testid={`search-result-${tool.id}`}
                            >
                              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                <div className="text-white">
                                  {renderIcon(tool.icon, 'white')}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`font-semibold ${
                                  isSelected ? 'text-white' : 'text-gray-800'
                                }`}>
                                  {tool.name}
                                </div>
                                <div className={`text-sm mt-0.5 flex items-center space-x-2 ${
                                  isSelected ? 'text-gray-200' : 'text-gray-600'
                                }`}>
                                  <span>{toolCategories[tool.category].name}</span>
                                  <span className="w-1 h-1 bg-current/60 rounded-full"></span>
                                  <span className="text-xs">{tool.description?.slice(0, 40)}...</span>
                                </div>
                              </div>
                              <div className={isSelected ? 'opacity-100' : 'opacity-60'}>
                                <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-12 text-center">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="text-lg font-medium text-foreground mb-2">No results found</div>
                      <div className="text-sm text-muted-foreground">
                        Try searching for "{query.slice(0, 20)}" with different keywords
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Popular Tools */}
                  <div className="flex items-center justify-between px-2 py-2 mb-3">
                    <div className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span>Popular Tools</span>
                    </div>
                    <div className="text-xs text-gray-500">Trending</div>
                  </div>
                  <div className="space-y-2 mb-6">
                    {popularTools.map((tool, index) => {
                      const color = getCategoryColor(tool.category);
                      const isSelected = index === selectedIndex;

                      return (
                        <div
                          key={tool.id}
                          className={`cursor-pointer rounded-xl p-3 flex items-center space-x-3 ${
                            isSelected
                              ? `bg-orange-500 border border-orange-600`
                              : "hover:bg-gray-50 border border-gray-200"
                          }`}
                          onClick={() => openTool(tool.id, tool.category)}
                          data-testid={`popular-tool-${tool.id}`}
                        >
                          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                            <div className="text-white">
                              {renderIcon(tool.icon, 'white')}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold ${
                              isSelected ? 'text-white' : 'text-gray-800'
                            }`}>
                              {tool.name}
                            </div>
                            <div className={`text-sm mt-0.5 ${
                              isSelected ? 'text-gray-100' : 'text-gray-600'
                            }`}>
                              {toolCategories[tool.category].name}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-red-500 text-white border-red-600 text-xs">
                              🔥 Popular
                            </Badge>
                            <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Categories */}
                  <div className="flex items-center justify-between px-2 py-2 mb-3">
                    <div className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Browse Categories</span>
                    </div>
                    <div className="text-xs text-gray-500">Explore more</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories.slice(0, 4).map(([categoryId, categoryData]) => {
                      const category = categoryId as ToolCategory;
                      const color = getCategoryColor(category);
                      const iconName = categoryId === 'calculators' ? 'calculator' :
                                       categoryId === 'converters' ? 'repeat' :
                                       categoryId === 'image-tools' ? 'image' :
                                       categoryId === 'document-tools' ? 'file-text' : 'play';

                      return (
                        <div
                          key={categoryId}
                          className="cursor-pointer hover:bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center space-x-3"
                          onClick={() => setIsOpen(false)}
                          data-testid={`category-${categoryId}`}
                        >
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <div className="text-white">
                              {renderIcon(iconName, 'white')}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 text-sm">
                              {categoryData.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              Browse all {categoryData.name.toLowerCase()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>


        </div>
      </DialogContent>
    </Dialog>
  );
}