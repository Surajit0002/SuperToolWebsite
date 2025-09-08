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
      <DialogContent className="search-modal-content rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden p-0 border-2 border-primary/30 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <DialogTitle className="sr-only">
          Global Search - Search Tools and Calculators
        </DialogTitle>
        <DialogDescription className="sr-only">
          Search through all available tools, calculators, converters, image tools, document tools, and audio/video tools. Use arrow keys to navigate and Enter to select.
        </DialogDescription>
        <div className="relative w-full h-full">
          {/* Modern Search Header */}
          <div className="relative p-8 pb-6 bg-gradient-to-r from-emerald-500 to-teal-600 border-b border-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-orange-400/10"></div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/30 to-blue-500/20 rounded-3xl opacity-0 group-focus-within:opacity-100 transition-all duration-700 scale-125"></div>
              <div className="relative">
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center group-focus-within:scale-110 group-focus-within:rotate-12 transition-all duration-500 shadow-lg border border-white/30">
                    <Search className="w-5 h-5 text-white group-focus-within:text-yellow-100 transition-all duration-300" />
                  </div>
                </div>
                <Input
                  type="text"
                  placeholder="Discover amazing tools and calculators..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="pl-20 pr-28 py-6 text-lg font-medium bg-white/95 border-2 border-white/40 rounded-3xl focus:outline-none focus:ring-0 focus:border-yellow-300 focus:bg-white transition-all duration-500 placeholder:text-gray-500 shadow-2xl hover:shadow-3xl hover:border-orange-300 text-gray-800"
                  autoFocus
                  data-testid="global-search-input"
                />
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                  {query && (
                    <button
                      onClick={() => {
                        setQuery("");
                        setSelectedIndex(0);
                      }}
                      className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-2xl flex items-center justify-center text-white hover:text-yellow-100 transition-all duration-300 hover:scale-110 hover:rotate-90 shadow-md border border-white/30"
                    >
                      ×
                    </button>
                  )}
                  <div className="hidden sm:flex items-center justify-center bg-gradient-to-br from-slate-700 to-gray-800 text-white text-xs px-3 py-2 rounded-xl border border-white/30 shadow-md font-mono font-medium hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 hover:text-yellow-100 transition-all duration-300">
                    ESC
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Action Hints */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 opacity-80 group-focus-within:opacity-100 transition-all duration-300">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-lime-400 to-green-500 px-4 py-2 rounded-2xl border border-white/40 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-xs font-medium text-white">Press ↵ to select</span>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 rounded-2xl border border-white/40 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-xs font-medium text-white">Use ↑↓ to navigate</span>
              </div>
            </div>
          </div>

          {/* Modern Search Results */}
          <div className="max-h-[65vh] overflow-y-auto scrollbar-hide bg-gradient-to-b from-white to-gray-50">
            <div className="p-8 pt-6">
              {query ? (
                <>
                  {searchResults.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between px-4 py-3 mb-2">
                        <div className="text-sm font-semibold text-foreground flex items-center space-x-2">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
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
                                  ? `bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 border border-white/30 shadow-xl scale-[1.03] ring-2 ring-yellow-400/50`
                                  : "hover:bg-gradient-to-r hover:from-blue-100 hover:via-purple-100 hover:to-pink-100 border border-transparent hover:border-indigo-300 hover:shadow-lg hover:scale-[1.02] hover:ring-1 hover:ring-purple-300"
                              }`}
                              onClick={() => openTool(tool.id, tool.category)}
                              data-testid={`search-result-${tool.id}`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className={`relative w-14 h-14 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 border border-white/40 rounded-2xl flex items-center justify-center shadow-lg ${
                                isSelected ? 'scale-115 shadow-xl' : 'group-hover:scale-110 group-hover:shadow-xl'
                              } transition-all duration-300`}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/20 rounded-2xl"></div>
                                <div className="text-white">
                                  {renderIcon(tool.icon, 'white')}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`font-semibold transition-colors ${
                                  isSelected ? 'text-white' : 'text-gray-800 group-hover:text-purple-700'
                                }`}>
                                  {tool.name}
                                </div>
                                <div className={`text-sm mt-0.5 flex items-center space-x-2 ${
                                  isSelected ? 'text-gray-200' : 'text-gray-600 group-hover:text-purple-600'
                                }`}>
                                  <span>{toolCategories[tool.category].name}</span>
                                  <span className="w-1 h-1 bg-current/60 rounded-full"></span>
                                  <span className="text-xs">{tool.description?.slice(0, 40)}...</span>
                                </div>
                              </div>
                              <div className={`transition-all duration-200 ${
                                isSelected ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                              }`}>
                                <ArrowRight className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
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
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
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
                              ? `bg-gradient-to-r from-amber-400 to-orange-500 border border-white/30 shadow-lg scale-[1.02]`
                              : "hover:bg-gradient-to-r hover:from-yellow-100 hover:to-orange-100 border border-transparent hover:shadow-md hover:scale-[1.01] hover:border-orange-300"
                          }`}
                          onClick={() => openTool(tool.id, tool.category)}
                          data-testid={`popular-tool-${tool.id}`}
                        >
                          <div className={`w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 border border-white/30 rounded-xl flex items-center justify-center shadow-sm ${
                            isSelected ? 'scale-110' : 'group-hover:scale-105'
                          } transition-transform duration-200`}>
                            <div className="text-white">
                              {renderIcon(tool.icon, 'white')}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold transition-colors ${
                              isSelected ? 'text-white' : 'text-gray-800 group-hover:text-orange-700'
                            }`}>
                              {tool.name}
                            </div>
                            <div className={`text-sm mt-0.5 ${
                              isSelected ? 'text-gray-100' : 'text-gray-600 group-hover:text-orange-600'
                            }`}>
                              {toolCategories[tool.category].name}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-white/30 text-xs font-medium">
                              🔥 Popular
                            </Badge>
                            <div className={`transition-all duration-200 ${
                              isSelected ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                            }`}>
                              <ArrowRight className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Categories */}
                  <div className="flex items-center justify-between px-4 py-3 mb-2">
                    <div className="text-sm font-semibold text-foreground flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Browse Categories</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Explore more</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
                          className="cursor-pointer hover:bg-gradient-to-r hover:from-indigo-100 hover:to-blue-200 border border-transparent hover:border-blue-300 rounded-xl p-4 flex items-center space-x-3 transition-all duration-200 group hover:shadow-md hover:scale-[1.02]"
                          onClick={() => setIsOpen(false)}
                          data-testid={`category-${categoryId}`}
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 border border-white/30 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                            <div className="text-white">
                              {renderIcon(iconName, 'white')}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors text-sm">
                              {categoryData.name}
                            </div>
                            <div className="text-xs text-gray-600 group-hover:text-blue-600 mt-0.5">
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