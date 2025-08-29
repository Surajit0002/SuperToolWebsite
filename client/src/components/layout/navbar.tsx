
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
  Bookmark
} from "lucide-react";
import Flag from "react-world-flags";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [location] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    <nav className="sticky top-0 z-50 glass-effect border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Super-Tool</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors ${
                  location === item.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={openSearch}
              className="hidden sm:flex items-center space-x-2"
              data-testid="search-button"
            >
              <Search className="w-4 h-4" />
              <span>Search tools...</span>
              <div className="search-shortcut text-xs">⌘K</div>
            </Button>

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="language-dropdown" className="flex items-center space-x-2">
                  <Flag code={getCurrentLanguage().countryCode} className="w-5 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">
                    {getCurrentLanguage().code.toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => updateSettings({ language: lang.code })}
                    data-testid={`language-option-${lang.code}`}
                    className="flex items-center space-x-3 p-3"
                  >
                    <Flag code={lang.countryCode} className="w-6 h-4" />
                    <div>
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-xs text-muted-foreground">{lang.code.toUpperCase()}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="currency-dropdown" className="flex items-center space-x-2">
                  <Flag code={getCurrentCurrency().countryCode} className="w-5 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">{getCurrentCurrency().code}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                {currencies.map((currency) => (
                  <DropdownMenuItem
                    key={currency.code}
                    onClick={() => updateSettings({ currency: currency.code })}
                    data-testid={`currency-option-${currency.code}`}
                    className="flex items-center space-x-3 p-3"
                  >
                    <Flag code={currency.countryCode} className="w-6 h-4" />
                    <div>
                      <div className="font-medium">{currency.name}</div>
                      <div className="text-xs text-muted-foreground">{currency.code} ({currency.symbol})</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              data-testid="theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>

            {/* Profile Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="profile-dropdown">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/api/placeholder/40/40" alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/40/40" alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      john.doe@example.com
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center space-x-2 w-full cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                  <Bookmark className="h-4 w-4" />
                  <span>Favorites</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer text-red-600">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden" data-testid="mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`font-medium text-lg transition-colors ${
                        location === item.href
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <DropdownMenuSeparator />
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 font-medium text-lg text-muted-foreground hover:text-foreground"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
