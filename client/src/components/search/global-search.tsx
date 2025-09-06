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
      <DialogContent className="modal-backdrop absolute inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/40 backdrop-blur-md">
        <DialogTitle className="sr-only">
          Global Search - Search Tools and Calculators
        </DialogTitle>
        <DialogDescription className="sr-only">
          Search through all available tools, calculators, converters, image tools, document tools, and audio/video tools. Use arrow keys to navigate and Enter to select.
        </DialogDescription>
        <div className="bg-background/95 border border-border/50 rounded-3xl shadow-2xl w-full max-w-3xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-300 slide-in-from-top-4">
          {/* Search Header */}
          <div className="p-6 border-b border-border/50">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-300 blur-xl"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  type="text"
                  placeholder="Search tools, calculators, converters, and more..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="pl-12 pr-6 py-4 text-lg bg-muted/30 border-2 border-border/50 rounded-2xl focus:outline-none focus:ring-0 focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground/70"
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
                      className="w-6 h-6 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200"
                    >
                      ×
                    </button>
                  )}
                  <div className="hidden sm:flex items-center justify-center bg-muted/60 text-muted-foreground text-xs px-2 py-1 rounded-lg border border-border/50">
                    ESC
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
            <div className="p-4">
              {query ? (
                <>
                  {searchResults.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between px-4 py-3 mb-2">
                        <div className="text-sm font-semibold text-foreground flex items-center space-x-2">
                          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                          <span>Search Results</span>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                          {searchResults.length} found
                        </div>
                      </div>
                      <div className="space-y-1">
                        {searchResults.slice(0, 8).map((tool, index) => {
                          const color = getCategoryColor(tool.category);
                          const isSelected = index === selectedIndex;

                          return (
                            <div
                              key={tool.id}
                              className={`cursor-pointer rounded-xl p-4 flex items-center space-x-4 transition-all duration-200 group ${
                                isSelected 
                                  ? `bg-primary/10 border border-primary/20 shadow-lg scale-[1.02]` 
                                  : "hover:bg-muted/60 border border-transparent hover:shadow-md hover:scale-[1.01]"
                              }`}
                              onClick={() => openTool(tool.id, tool.category)}
                              data-testid={`search-result-${tool.id}`}
                            >
                              <div className={`w-12 h-12 bg-gradient-to-br from-${color}/20 to-${color}/10 border border-${color}/20 rounded-xl flex items-center justify-center shadow-sm ${
                                isSelected ? 'scale-110' : 'group-hover:scale-105'
                              } transition-transform duration-200`}>
                                {renderIcon(tool.icon, color)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {tool.name}
                                </div>
                                <div className="text-sm text-muted-foreground mt-0.5 flex items-center space-x-2">
                                  <span>{toolCategories[tool.category].name}</span>
                                  <span className="w-1 h-1 bg-muted-foreground/50 rounded-full"></span>
                                  <span className="text-xs">{tool.description?.slice(0, 40)}...</span>
                                </div>
                              </div>
                              <div className={`transition-all duration-200 ${
                                isSelected ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                              }`}>
                                <ArrowRight className="w-5 h-5 text-muted-foreground" />
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
                  <div className="flex items-center justify-between px-4 py-3 mb-2">
                    <div className="text-sm font-semibold text-foreground flex items-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                      <span>Popular Tools</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Trending</div>
                  </div>
                  <div className="space-y-1 mb-6">
                    {popularTools.map((tool, index) => {
                      const color = getCategoryColor(tool.category);
                      const isSelected = index === selectedIndex;

                      return (
                        <div
                          key={tool.id}
                          className={`cursor-pointer rounded-xl p-4 flex items-center space-x-4 transition-all duration-200 group ${
                            isSelected 
                              ? `bg-primary/10 border border-primary/20 shadow-lg scale-[1.02]` 
                              : "hover:bg-muted/60 border border-transparent hover:shadow-md hover:scale-[1.01]"
                          }`}
                          onClick={() => openTool(tool.id, tool.category)}
                          data-testid={`popular-tool-${tool.id}`}
                        >
                          <div className={`w-12 h-12 bg-gradient-to-br from-${color}/20 to-${color}/10 border border-${color}/20 rounded-xl flex items-center justify-center shadow-sm ${
                            isSelected ? 'scale-110' : 'group-hover:scale-105'
                          } transition-transform duration-200`}>
                            {renderIcon(tool.icon, color)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {tool.name}
                            </div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {toolCategories[tool.category].name}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300 text-xs font-medium">
                              🔥 Popular
                            </Badge>
                            <div className={`transition-all duration-200 ${
                              isSelected ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                            }`}>
                              <ArrowRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Categories */}
                  <div className="flex items-center justify-between px-4 py-3 mb-2">
                    <div className="text-sm font-semibold text-foreground flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      <span>Browse Categories</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Explore more</div>
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
                          className="cursor-pointer hover:bg-muted/60 border border-transparent hover:border-border/50 rounded-xl p-4 flex items-center space-x-3 transition-all duration-200 group hover:shadow-md hover:scale-[1.02]"
                          onClick={() => setIsOpen(false)}
                          data-testid={`category-${categoryId}`}
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br from-${color}/20 to-${color}/10 border border-${color}/20 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                            {renderIcon(iconName, color)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                              {categoryData.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
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

          {/* Search Footer */}
          <div className="p-4 border-t border-border/50 bg-muted/20 rounded-b-3xl">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 bg-background border border-border/50 rounded-lg font-mono shadow-sm">↵</kbd>
                  <span className="font-medium">to select</span>
                </div>
                <div className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 bg-background border border-border/50 rounded-lg font-mono shadow-sm">↑↓</kbd>
                  <span className="font-medium">to navigate</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-background border border-border/50 rounded-lg font-mono shadow-sm">ESC</kbd>
                <span className="font-medium">to close</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}