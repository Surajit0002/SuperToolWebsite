import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { SettingsProvider } from "@/hooks/use-settings";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import GlobalSearch from "@/components/search/global-search";
import ToolModal from "@/components/tools/tool-modal";
import Home from "@/pages/home";
import Categories from "@/pages/categories";
import AllTools from "@/pages/all-tools";
import About from "@/pages/about";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/categories" component={Categories} />
          <Route path="/categories/:category" component={Categories} />
          <Route path="/tools" component={AllTools} />
          <Route path="/about" component={About} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <GlobalSearch />
      <ToolModal />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
