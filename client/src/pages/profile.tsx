import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/lib/theme";
import { User, Settings, Clock, Download, Trash2 } from "lucide-react";

export default function Profile() {
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [recentTools] = useState([
    { id: "general-calculator", name: "General Calculator", category: "Calculators", usedAt: "2 hours ago" },
    { id: "currency-converter", name: "Currency Converter", category: "Converters", usedAt: "1 day ago" },
    { id: "image-resizer", name: "Image Resizer", category: "Image Tools", usedAt: "3 days ago" },
    { id: "pdf-merger", name: "PDF Merger", category: "Document Tools", usedAt: "1 week ago" },
  ]);

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
  ];

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
  ];

  const timezones = [
    { value: "UTC", name: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", name: "Eastern Time (US)" },
    { value: "America/Los_Angeles", name: "Pacific Time (US)" },
    { value: "Europe/London", name: "Greenwich Mean Time" },
    { value: "Europe/Paris", name: "Central European Time" },
    { value: "Asia/Tokyo", name: "Japan Standard Time" },
  ];

  const openTool = (toolId: string) => {
    document.dispatchEvent(new CustomEvent("open-tool", { detail: { toolId, category: "calculators" } }));
  };

  const clearHistory = () => {
    // TODO: Implement clear history
    console.log("Clear history");
  };

  const exportData = () => {
    // TODO: Implement export data
    console.log("Export data");
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Profile & Settings</h1>
          <p className="text-xl text-muted-foreground">
            Customize your Super-Tool experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  data-testid="theme-switch"
                />
              </div>

              {/* Language */}
              <div>
                <Label className="text-sm font-medium">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => updateSettings({ language: value })}
                >
                  <SelectTrigger className="mt-2" data-testid="language-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Currency */}
              <div>
                <Label className="text-sm font-medium">Default Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => updateSettings({ currency: value })}
                >
                  <SelectTrigger className="mt-2" data-testid="currency-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timezone */}
              <div>
                <Label className="text-sm font-medium">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => updateSettings({ timezone: value })}
                >
                  <SelectTrigger className="mt-2" data-testid="timezone-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => openTool(tool.id)}
                    data-testid={`recent-tool-${tool.id}`}
                  >
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {tool.category}
                        </Badge>
                        <span>{tool.usedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={exportData}
                  className="flex items-center gap-2"
                  data-testid="export-data"
                >
                  <Download className="w-4 h-4" />
                  Export Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={clearHistory}
                  className="flex items-center gap-2"
                  data-testid="clear-history"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Your privacy is important to us. We only store your preferences locally and never share your data with third parties.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
