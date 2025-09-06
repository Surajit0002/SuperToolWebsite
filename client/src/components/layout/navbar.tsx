
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/lib/theme";
import { useSettings } from "@/hooks/use-settings";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Zap, 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  History,
  Bookmark,
  Globe,
  DollarSign,
  ChevronDown
} from "lucide-react";
import Flag from "react-world-flags";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [location] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/categories", label: "Categories" },
    { href: "/tools", label: "All Tools" },
    { href: "/about", label: "About" },
  ];

  const languages = [
    { code: "en", name: "English", countryCode: "US" },
    { code: "es", name: "Español", countryCode: "ES" },
    { code: "fr", name: "Français", countryCode: "FR" },
    { code: "de", name: "Deutsch", countryCode: "DE" },
    { code: "zh", name: "中文", countryCode: "CN" },
    { code: "ja", name: "日本語", countryCode: "JP" },
    { code: "ko", name: "한국어", countryCode: "KR" },
    { code: "pt", name: "Português", countryCode: "BR" },
  ];

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar", countryCode: "US" },
    { code: "EUR", symbol: "€", name: "Euro", countryCode: "EU" },
    { code: "GBP", symbol: "£", name: "British Pound", countryCode: "GB" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", countryCode: "JP" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar", countryCode: "CA" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar", countryCode: "AU" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc", countryCode: "CH" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan", countryCode: "CN" },
    { code: "INR", symbol: "₹", name: "Indian Rupee", countryCode: "IN" },
  ];

  const openSearch = () => {
    setIsSearchOpen(true);
    document.dispatchEvent(new CustomEvent("open-global-search"));
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === settings.language) || languages[0];
  };

  const getCurrentCurrency = () => {
    return currencies.find(curr => curr.code === settings.currency) || currencies[0];
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Zap className="w-6 h-6 text-primary-foreground drop-shadow-sm" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Super-Tool
              </span>
              <span className="text-xs text-muted-foreground -mt-1">All-in-one toolkit</span>
            </div>
            <span className="sm:hidden font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Super-Tool
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "default" : "ghost"}
                  size="sm"
                  className={`relative font-medium transition-all duration-200 ${
                    location === item.href
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "hover:bg-muted/80 hover:text-foreground"
                  }`}
                  data-testid={`nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
                >
                  {item.label}
                  {location === item.href && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                  )}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={openSearch}
              className="hidden sm:flex items-center space-x-2 bg-background/80 border-border/60 hover:bg-muted/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:scale-105 group"
              data-testid="search-button"
            >
              <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span className="hidden md:inline group-hover:text-primary transition-colors">Search tools...</span>
              <div className="hidden lg:flex items-center justify-center bg-muted/60 text-muted-foreground text-xs px-1.5 py-0.5 rounded border group-hover:bg-primary/10 group-hover:text-primary transition-all">
                ⌘K
              </div>
            </Button>

            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={openSearch}
              className="sm:hidden w-9 h-9 p-0 hover:bg-muted/80 hover:scale-105 transition-all duration-200 group"
              data-testid="mobile-search-button"
            >
              <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
            </Button>

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  data-testid="language-dropdown" 
                  className="flex items-center space-x-1.5 hover:bg-muted/80 transition-all duration-200"
                >
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Flag code={getCurrentLanguage().countryCode} className="w-5 h-4 rounded-sm" />
                  {!isMobile && (
                    <>
                      <span className="text-xs font-medium">
                        {getCurrentLanguage().code.toUpperCase()}
                      </span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-background/95 backdrop-blur-xl border-border/50" align="end">
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Select Language</div>
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => updateSettings({ language: lang.code })}
                      data-testid={`language-option-${lang.code}`}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
                    >
                      <Flag code={lang.countryCode} className="w-6 h-4 rounded-sm" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{lang.name}</div>
                        <div className="text-xs text-muted-foreground">{lang.code.toUpperCase()}</div>
                      </div>
                      {settings.language === lang.code && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  data-testid="currency-dropdown" 
                  className="flex items-center space-x-1.5 hover:bg-muted/80 transition-all duration-200"
                >
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <Flag code={getCurrentCurrency().countryCode} className="w-5 h-4 rounded-sm" />
                  {!isMobile && (
                    <>
                      <span className="text-xs font-medium">{getCurrentCurrency().code}</span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-background/95 backdrop-blur-xl border-border/50" align="end">
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Select Currency</div>
                  {currencies.map((currency) => (
                    <DropdownMenuItem
                      key={currency.code}
                      onClick={() => updateSettings({ currency: currency.code })}
                      data-testid={`currency-option-${currency.code}`}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
                    >
                      <Flag code={currency.countryCode} className="w-6 h-4 rounded-sm" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{currency.name}</div>
                        <div className="text-xs text-muted-foreground">{currency.code} ({currency.symbol})</div>
                      </div>
                      {settings.currency === currency.code && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              data-testid="theme-toggle"
              className="w-9 h-9 p-0 hover:bg-muted/80 transition-all duration-200 hover:scale-105"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-500" />
              )}
            </Button>

            {/* Profile Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-9 w-9 rounded-full hover:bg-muted/80 transition-all duration-200 hover:scale-105" 
                  data-testid="profile-dropdown"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-border transition-all duration-200">
                    <AvatarImage src="/api/placeholder/40/40" alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-medium">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-background/95 backdrop-blur-xl border-border/50" align="end" forceMount>
                <div className="flex items-center space-x-3 p-4">
                  <Avatar className="h-10 w-10 ring-2 ring-border/50">
                    <AvatarImage src="/api/placeholder/40/40" alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      john.doe@example.com
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="p-2">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center space-x-3 w-full cursor-pointer p-3 rounded-lg hover:bg-muted/60">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-muted/60">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-muted/60">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">History</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-muted/60">
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Favorites</span>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="p-2">
                  <DropdownMenuItem className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-destructive/10 text-destructive">
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Log out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="lg:hidden w-9 h-9 p-0 hover:bg-muted/80 transition-all duration-200" 
                  data-testid="mobile-menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[300px] sm:w-[350px] bg-background/95 backdrop-blur-xl border-border/50"
              >
                <div className="flex flex-col space-y-6 mt-8">
                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Navigation</h3>
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={location === item.href ? "default" : "ghost"}
                          className={`w-full justify-start text-left transition-all duration-200 ${
                            location === item.href
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted/60"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
                        >
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  <DropdownMenuSeparator className="bg-border/50" />

                  {/* Mobile User Actions */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Account</h3>
                    <Link href="/profile">
                      <Button
                        variant="ghost"
                        className="w-full justify-start hover:bg-muted/60 transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3 text-muted-foreground" />
                        Profile
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:bg-muted/60 transition-all duration-200"
                    >
                      <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:bg-muted/60 transition-all duration-200"
                    >
                      <History className="h-4 w-4 mr-3 text-muted-foreground" />
                      History
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:bg-muted/60 transition-all duration-200"
                    >
                      <Bookmark className="h-4 w-4 mr-3 text-muted-foreground" />
                      Favorites
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
