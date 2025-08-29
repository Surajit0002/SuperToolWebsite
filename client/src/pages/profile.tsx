
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/lib/theme";
import { 
  User, 
  Settings, 
  Clock, 
  Download, 
  Trash2, 
  Edit, 
  Camera,
  Trophy,
  Activity,
  Calendar,
  Star,
  Bookmark,
  History,
  Lock,
  Bell,
  Palette,
  Globe,
  DollarSign
} from "lucide-react";

export default function Profile() {
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [userBio, setUserBio] = useState("Passionate developer and calculator enthusiast");
  const [userEmail, setUserEmail] = useState("john.doe@example.com");

  const [recentTools] = useState([
    { id: "general-calculator", name: "General Calculator", category: "Calculators", usedAt: "2 hours ago", usageCount: 156 },
    { id: "currency-converter", name: "Currency Converter", category: "Converters", usedAt: "1 day ago", usageCount: 89 },
    { id: "image-resizer", name: "Image Resizer", category: "Image Tools", usedAt: "3 days ago", usageCount: 34 },
    { id: "pdf-merger", name: "PDF Merger", category: "Document Tools", usedAt: "1 week ago", usageCount: 12 },
    { id: "unit-converter", name: "Unit Converter", category: "Converters", usedAt: "2 weeks ago", usageCount: 67 },
  ]);

  const [favoriteTools] = useState([
    { id: "general-calculator", name: "General Calculator", category: "Calculators" },
    { id: "currency-converter", name: "Currency Converter", category: "Converters" },
    { id: "bmi-calculator", name: "BMI Calculator", category: "Calculators" },
  ]);

  const [achievements] = useState([
    { id: "calculator-pro", name: "Calculator Pro", description: "Used calculators 100+ times", icon: "🏆", unlocked: true },
    { id: "converter-master", name: "Converter Master", description: "Used converters 50+ times", icon: "🔄", unlocked: true },
    { id: "daily-user", name: "Daily User", description: "Used tools for 7 consecutive days", icon: "📅", unlocked: false },
    { id: "tool-explorer", name: "Tool Explorer", description: "Tried 20+ different tools", icon: "🔍", unlocked: true },
  ]);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "pt", name: "Português", flag: "🇧🇷" },
  ];

  const currencies = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
    { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
    { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
    { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  ];

  const timezones = [
    { value: "UTC", name: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", name: "Eastern Time (US)" },
    { value: "America/Los_Angeles", name: "Pacific Time (US)" },
    { value: "Europe/London", name: "Greenwich Mean Time" },
    { value: "Europe/Paris", name: "Central European Time" },
    { value: "Asia/Tokyo", name: "Japan Standard Time" },
    { value: "Asia/Shanghai", name: "China Standard Time" },
    { value: "Asia/Kolkata", name: "India Standard Time" },
  ];

  const openTool = (toolId: string) => {
    document.dispatchEvent(new CustomEvent("open-tool", { detail: { toolId, category: "calculators" } }));
  };

  const clearHistory = () => {
    console.log("Clear history");
  };

  const exportData = () => {
    console.log("Export data");
  };

  const totalUsage = recentTools.reduce((sum, tool) => sum + tool.usageCount, 0);
  const profileCompletion = 85;

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="relative mb-8">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-lg"></div>
          <div className="absolute -bottom-6 left-8">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                <AvatarImage src="/api/placeholder/150/150" alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="pt-8 pl-40 pr-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input 
                      value={userName} 
                      onChange={(e) => setUserName(e.target.value)}
                      className="text-2xl font-bold h-auto p-2"
                    />
                    <Textarea 
                      value={userBio} 
                      onChange={(e) => setUserBio(e.target.value)}
                      className="text-muted-foreground resize-none"
                      rows={2}
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{userName}</h1>
                    <p className="text-lg text-muted-foreground mb-2">{userBio}</p>
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditing ? "Save" : "Edit Profile"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUsage}</p>
                  <p className="text-sm text-muted-foreground">Total Tool Uses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{achievements.filter(a => a.unlocked).length}</p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{favoriteTools.length}</p>
                  <p className="text-sm text-muted-foreground">Favorite Tools</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">127</p>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="overview" className="flex items-center space-x-2 py-3">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2 py-3">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2 py-3">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 py-3">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2 py-3">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile Completion</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Profile Information</span>
                      <span>{profileCompletion}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Complete your profile to unlock personalized recommendations and features.
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTools.slice(0, 3).map((tool) => (
                      <div key={tool.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{tool.name}</p>
                          <p className="text-sm text-muted-foreground">{tool.usedAt}</p>
                        </div>
                        <Badge variant="secondary">{tool.category}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Favorite Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bookmark className="w-5 h-5" />
                  <span>Favorite Tools</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {favoriteTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => openTool(tool.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{tool.name}</h3>
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      </div>
                      <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Usage History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTools.map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{tool.name}</p>
                          <p className="text-sm text-muted-foreground">Last used: {tool.usedAt}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{tool.category}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">{tool.usageCount} uses</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-6">
                  <Button variant="outline" onClick={clearHistory} className="flex items-center space-x-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Clear History</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-6 rounded-lg border ${
                        achievement.unlocked 
                          ? "border-primary/50 bg-primary/5" 
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`text-2xl ${achievement.unlocked ? "grayscale-0" : "grayscale"}`}>
                          {achievement.icon}
                        </div>
                        <div>
                          <h3 className={`font-bold ${achievement.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                            {achievement.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          {achievement.unlocked && (
                            <Badge className="mt-2" variant="default">Unlocked</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Localization Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Localization</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                            <div className="flex items-center space-x-3">
                              <span>{lang.flag}</span>
                              <span>{lang.name}</span>
                            </div>
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
                            <div className="flex items-center space-x-3">
                              <span>{currency.flag}</span>
                              <span>{currency.name} ({currency.code})</span>
                            </div>
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
                        {timezones.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value}>
                            {timezone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Appearance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>Appearance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Dark Mode</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Toggle between light and dark themes
                      </p>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={toggleTheme}
                      data-testid="theme-switch"
                    />
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Notifications</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Receive updates and tips
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  {/* Auto-save */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto-save Results</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically save calculation results
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Security & Privacy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Privacy Mode</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Don't save calculation history
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Data Export</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Download all your data and settings
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportData} className="flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Delete Account</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" className="flex items-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  function openTool(toolId: string) {
    document.dispatchEvent(new CustomEvent("open-tool", { detail: { toolId, category: "calculators" } }));
  }
}
