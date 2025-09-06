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
      <DialogContent className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in-0 duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <DialogTitle className="sr-only">
          Global Search - Search Tools and Calculators
        </DialogTitle>
        <DialogDescription className="sr-only">
          Search through all available tools, calculators, converters, image tools, document tools, and audio/video tools. Use arrow keys to navigate and Enter to select.
        </DialogDescription>
        <div className="relative bg-background/98 border border-border/30 rounded-3xl shadow-2xl w-full max-w-4xl backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-300 slide-in-from-top-4 max-h-[85vh] overflow-hidden ring-1 ring-white/5 mx-auto"></div>
          {/* Search Header */}
          <div className="p-6 pb-4 border-b border-border/30 bg-gradient-to-b from-background/50 to-transparent">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 rounded-3xl opacity-0 group-focus-within:opacity-100 transition-all duration-500 blur-2xl scale-110"></div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-focus-within:scale-110 transition-transform duration-300">
                    <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                  </div>
                </div>
                <Input
                  type="text"
                  placeholder="Search tools, calculators, converters, and more..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="pl-16 pr-24 py-5 text-lg bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 border-2 border-border/40 rounded-3xl focus:outline-none focus:ring-0 focus:border-primary/60 focus:bg-background/80 transition-all duration-300 placeholder:text-muted-foreground/60 shadow-inner backdrop-blur-sm"
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
          <div className="max-h-[60vh] overflow-y-auto scrollbar-hide bg-gradient-to-b from-transparent via-background/20 to-background/40">
            <div className="p-6 pt-4">
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
                              className={`cursor-pointer rounded-2xl p-5 flex items-center space-x-4 transition-all duration-300 group relative overflow-hidden ${
                                isSelected 
                                  ? `bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 border border-primary/30 shadow-xl scale-[1.03] ring-2 ring-primary/20` 
                                  : "hover:bg-gradient-to-r hover:from-muted/70 hover:via-muted/50 hover:to-muted/70 border border-transparent hover:border-border/40 hover:shadow-lg hover:scale-[1.02] hover:ring-1 hover:ring-border/20"
                              }`}
                              onClick={() => openTool(tool.id, tool.category)}
                              data-testid={`search-result-${tool.id}`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className={`relative w-14 h-14 bg-gradient-to-br from-${color}/25 via-${color}/15 to-${color}/10 border border-${color}/25 rounded-2xl flex items-center justify-center shadow-lg ${
                                isSelected ? 'scale-115 shadow-xl' : 'group-hover:scale-110 group-hover:shadow-xl'
                              } transition-all duration-300 backdrop-blur-sm`}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/10 rounded-2xl"></div>
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
          <div className="p-6 pt-4 border-t border-border/30 bg-gradient-to-t from-muted/30 via-muted/15 to-transparent backdrop-blur-sm rounded-b-3xl">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <kbd className="px-3 py-2 bg-gradient-to-b from-background to-muted/50 border border-border/60 rounded-xl font-mono shadow-md text-xs font-medium">↵</kbd>
                  <span className="font-medium">to select</span>
                </div>
                <div className="flex items-center space-x-3">
                  <kbd className="px-3 py-2 bg-gradient-to-b from-background to-muted/50 border border-border/60 rounded-xl font-mono shadow-md text-xs font-medium">↑↓</kbd>
                  <span className="font-medium">navigate</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <kbd className="px-3 py-2 bg-gradient-to-b from-background to-muted/50 border border-border/60 rounded-xl font-mono shadow-md text-xs font-medium">ESC</kbd>
                <span className="font-medium">close</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}