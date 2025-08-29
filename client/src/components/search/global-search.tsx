import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
      <DialogContent className="modal-backdrop absolute inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in">
          {/* Search Header */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tools, calculators, converters..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="pl-10 pr-4 py-3 text-lg bg-transparent border-none focus:outline-none"
                autoFocus
                data-testid="global-search-input"
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            <div className="p-2">
              {query ? (
                <>
                  {searchResults.length > 0 ? (
                    <>
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Results
                      </div>
                      {searchResults.slice(0, 5).map((tool, index) => {
                        const color = getCategoryColor(tool.category);
                        const isSelected = index === selectedIndex;

                        return (
                          <div
                            key={tool.id}
                            className={`cursor-pointer rounded-lg p-3 flex items-center space-x-3 ${
                              isSelected ? "bg-muted" : "hover:bg-muted/50"
                            }`}
                            onClick={() => openTool(tool.id, tool.category)}
                            data-testid={`search-result-${tool.id}`}
                          >
                            <div className={`w-8 h-8 bg-${color}/10 border border-${color}/20 rounded-lg flex items-center justify-center`}>
                              {renderIcon(tool.icon, color)}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{tool.name}</div>
                              <div className="text-sm text-muted-foreground">{toolCategories[tool.category].name}</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="px-3 py-8 text-center text-muted-foreground">
                      No tools found for "{query}"
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Popular Tools */}
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Popular
                  </div>
                  {popularTools.map((tool, index) => {
                    const color = getCategoryColor(tool.category);
                    const isSelected = index === selectedIndex;

                    return (
                      <div
                        key={tool.id}
                        className={`cursor-pointer rounded-lg p-3 flex items-center space-x-3 ${
                          isSelected ? "bg-muted" : "hover:bg-muted/50"
                        }`}
                        onClick={() => openTool(tool.id, tool.category)}
                        data-testid={`popular-tool-${tool.id}`}
                      >
                        <div className={`w-8 h-8 bg-${color}/10 border border-${color}/20 rounded-lg flex items-center justify-center`}>
                          {renderIcon(tool.icon, color)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{tool.name}</div>
                          <div className="text-sm text-muted-foreground">{toolCategories[tool.category].name}</div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                          Popular
                        </Badge>
                      </div>
                    );
                  })}

                  {/* Categories */}
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mt-4">
                    Categories
                  </div>
                  {categories.slice(0, 2).map(([categoryId, categoryData]) => {
                    const category = categoryId as ToolCategory;
                    const color = getCategoryColor(category);
                    const iconName = categoryId === 'calculators' ? 'calculator' :
                                     categoryId === 'converters' ? 'repeat' :
                                     categoryId === 'image-tools' ? 'image' :
                                     categoryId === 'document-tools' ? 'file-text' : 'play';

                    return (
                      <div
                        key={categoryId}
                        className="cursor-pointer hover:bg-muted/50 rounded-lg p-3 flex items-center space-x-3"
                        onClick={() => setIsOpen(false)}
                        data-testid={`category-${categoryId}`}
                      >
                        <div className={`w-8 h-8 bg-${color}/10 border border-${color}/20 rounded-lg flex items-center justify-center`}>
                          {renderIcon(iconName, color)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{categoryData.name}</div>
                          <div className="text-sm text-muted-foreground">Browse all {categoryData.name.toLowerCase()}</div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Search Footer */}
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <kbd className="search-shortcut">↵</kbd>
                <span>to select</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="search-shortcut">↑↓</kbd>
                <span>to navigate</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="search-shortcut">esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}