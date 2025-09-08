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
          <div className="relative p-6 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-white/20">
            {/* Close Button - Top Right */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white hover:text-gray-200 transition-all duration-200 hover:scale-110"
              data-testid="modal-close-button"
            >
              ×
            </button>
            
            <div className="relative pr-16">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
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
                  className="pl-16 pr-28 py-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-400 placeholder:text-gray-500 text-gray-800 shadow-lg"
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
                      className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center text-white text-sm transition-colors duration-200 hover:scale-105"
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                  <div className="hidden sm:flex items-center justify-center bg-gray-700/80 text-white text-xs px-2 py-1 rounded-md font-mono border border-gray-600">
                    ESC
                  </div>
                </div>
              </div>
            </div>

            {/* Action Hints */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl shadow-lg border border-green-400/50 transition-colors duration-200">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-white">↵ select</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl shadow-lg border border-blue-400/50 transition-colors duration-200">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-white">↑↓ navigate</span>
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
                      <div className="flex items-center justify-between px-3 py-3 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="text-sm font-bold text-gray-800 flex items-center space-x-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                          <span>Search Results</span>
                        </div>
                        <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
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
                    <div className="px-6 py-16 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Search className="w-10 h-10 text-gray-400" />
                      </div>
                      <div className="text-xl font-bold text-gray-700 mb-3">No results found</div>
                      <div className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                        We couldn't find any tools matching <span className="font-semibold text-gray-700">"{query.slice(0, 20)}"</span>
                        <br />Try different keywords or browse our categories below
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Popular Tools */}
                  <div className="flex items-center justify-between px-3 py-3 mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                    <div className="text-sm font-bold text-gray-800 flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-pulse"></div>
                      <span>Popular Tools</span>
                    </div>
                    <div className="text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200 flex items-center space-x-1">
                      <span>🔥</span>
                      <span>Trending</span>
                    </div>
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
                  <div className="flex items-center justify-between px-3 py-3 mb-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-100">
                    <div className="text-sm font-bold text-gray-800 flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-full animate-pulse"></div>
                      <span>Browse Categories</span>
                    </div>
                    <div className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1.5 rounded-lg border border-green-200">
                      Explore more
                    </div>
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