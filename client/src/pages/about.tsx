import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Clock, Globe, Heart, Users } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Client-side processing where possible for instant results"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Your files are processed locally or auto-deleted after use"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Always Available",
      description: "24/7 access to all tools without any downtime"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Works Offline",
      description: "Many tools work without an internet connection"
    }
  ];

  const stats = [
    { label: "Tools Available", value: "20+" },
    { label: "Categories", value: "5" },
    { label: "Users Served", value: "10K+" },
    { label: "Files Processed", value: "100K+" }
  ];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Zap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">About Super-Tool</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're building the ultimate collection of web-based tools to make your daily tasks faster, easier, and more efficient.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Super-Tool was created with a simple goal: to replace the chaos of bookmarking dozens of single-purpose websites 
              with one comprehensive, beautifully designed platform. Whether you need to calculate a loan payment, convert 
              currencies, resize an image, or merge PDFs, we've got you covered.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Super-Tool?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              By the Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Local Processing</h4>
                <p className="text-muted-foreground">
                  Whenever possible, we process your data directly in your browser. This means your files never leave your device 
                  for simple operations like calculations and basic conversions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Auto-Deletion</h4>
                <p className="text-muted-foreground">
                  For tools that require server processing, we automatically delete your files within minutes of completion. 
                  We never store your personal data permanently.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">No Tracking</h4>
                <p className="text-muted-foreground">
                  We don't use invasive tracking or sell your data. Our privacy policy is simple: your data belongs to you.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology */}
        <Card>
          <CardHeader>
            <CardTitle>Built with Modern Technology</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Super-Tool is built using cutting-edge web technologies to ensure the best possible experience:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">React</Badge>
              <Badge variant="outline">TypeScript</Badge>
              <Badge variant="outline">Tailwind CSS</Badge>
              <Badge variant="outline">Node.js</Badge>
              <Badge variant="outline">Progressive Web App</Badge>
              <Badge variant="outline">Client-side Processing</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
