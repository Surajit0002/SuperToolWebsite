import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Share2, Activity, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BodyFatCalculator() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [method, setMethod] = useState<"navy" | "bmi" | "ymca">("navy");
  
  // Navy method measurements
  const [neck, setNeck] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  
  // YMCA method measurements  
  const [abdomen, setAbdomen] = useState("");
  
  const [result, setResult] = useState<{
    bodyFat: number;
    category: string;
    healthyRange: { min: number; max: number };
    bmi: number;
    leanMass: number;
    fatMass: number;
  } | null>(null);
  const { toast } = useToast();

  const getBodyFatCategory = (bodyFat: number, gender: string) => {
    if (gender === "male") {
      if (bodyFat < 6) return { category: "Essential fat", color: "text-red-600", bgColor: "bg-red-100" };
      if (bodyFat >= 6 && bodyFat < 14) return { category: "Athletic", color: "text-green-600", bgColor: "bg-green-100" };
      if (bodyFat >= 14 && bodyFat < 18) return { category: "Fitness", color: "text-blue-600", bgColor: "bg-blue-100" };
      if (bodyFat >= 18 && bodyFat < 25) return { category: "Average", color: "text-yellow-600", bgColor: "bg-yellow-100" };
      return { category: "Obese", color: "text-red-600", bgColor: "bg-red-100" };
    } else {
      if (bodyFat < 12) return { category: "Essential fat", color: "text-red-600", bgColor: "bg-red-100" };
      if (bodyFat >= 12 && bodyFat < 17) return { category: "Athletic", color: "text-green-600", bgColor: "bg-green-100" };
      if (bodyFat >= 17 && bodyFat < 21) return { category: "Fitness", color: "text-blue-600", bgColor: "bg-blue-100" };
      if (bodyFat >= 21 && bodyFat < 31) return { category: "Average", color: "text-yellow-600", bgColor: "bg-yellow-100" };
      return { category: "Obese", color: "text-red-600", bgColor: "bg-red-100" };
    }
  };

  const getHealthyRange = (gender: string) => {
    return gender === "male" 
      ? { min: 6, max: 24 }
      : { min: 12, max: 30 };
  };

  const convertToMetric = () => {
    let heightInCm: number;
    let weightInKg: number;
    let neckInCm: number = 0;
    let waistInCm: number = 0;
    let hipsInCm: number = 0;
    let abdomenInCm: number = 0;

    // Convert height
    if (heightUnit === "cm") {
      heightInCm = parseFloat(height);
    } else {
      const totalInches = parseFloat(feet) * 12 + parseFloat(inches);
      heightInCm = totalInches * 2.54;
    }

    // Convert weight
    if (weightUnit === "kg") {
      weightInKg = parseFloat(weight);
    } else {
      weightInKg = parseFloat(weight) / 2.20462;
    }

    // Convert measurements (assume input is in cm for simplicity)
    if (method === "navy") {
      neckInCm = parseFloat(neck);
      waistInCm = parseFloat(waist);
      if (gender === "female") {
        hipsInCm = parseFloat(hips);
      }
    } else if (method === "ymca") {
      abdomenInCm = parseFloat(abdomen);
    }

    return { heightInCm, weightInKg, neckInCm, waistInCm, hipsInCm, abdomenInCm };
  };

  const calculateNavyMethod = (height: number, waist: number, neck: number, hips?: number) => {
    if (gender === "male") {
      // Male formula: 86.010 × log10(abdomen - neck) - 70.041 × log10(height) + 36.76
      const logWaistNeck = Math.log10(waist - neck);
      const logHeight = Math.log10(height);
      return 86.010 * logWaistNeck - 70.041 * logHeight + 36.76;
    } else {
      // Female formula: 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
      if (!hips) return 0;
      const logWaistHipNeck = Math.log10(waist + hips - neck);
      const logHeight = Math.log10(height);
      return 163.205 * logWaistHipNeck - 97.684 * logHeight - 78.387;
    }
  };

  const calculateBMIMethod = (bmi: number, age: number, gender: string) => {
    // Deurenberg formula
    const genderFactor = gender === "male" ? 1 : 0;
    return (1.20 * bmi) + (0.23 * age) - (10.8 * genderFactor) - 5.4;
  };

  const calculateYMCAMethod = (weight: number, abdomen: number, gender: string) => {
    // YMCA formula approximation
    if (gender === "male") {
      return (4.15 * (abdomen / 2.54)) - (0.082 * (weight * 2.20462)) - 98.42;
    } else {
      return (4.15 * (abdomen / 2.54)) - (0.082 * (weight * 2.20462)) - 76.76;
    }
  };

  const calculate = () => {
    const ageValue = parseFloat(age);
    const weightValue = parseFloat(weight);

    // Validate inputs
    if (isNaN(ageValue) || ageValue < 10 || ageValue > 120) {
      toast({
        title: "Error",
        description: "Please enter a valid age between 10-120 years",
        variant: "destructive",
      });
      return;
    }

    if (!gender) {
      toast({
        title: "Error",
        description: "Please select gender",
        variant: "destructive",
      });
      return;
    }

    const { heightInCm, weightInKg, neckInCm, waistInCm, hipsInCm, abdomenInCm } = convertToMetric();

    if (isNaN(heightInCm) || heightInCm < 100 || heightInCm > 250) {
      toast({
        title: "Error",
        description: "Please enter a valid height",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(weightInKg) || weightInKg < 30 || weightInKg > 300) {
      toast({
        title: "Error",
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }

    let bodyFatPercentage: number;

    switch (method) {
      case "navy":
        if (isNaN(neckInCm) || isNaN(waistInCm) || (gender === "female" && isNaN(hipsInCm))) {
          toast({
            title: "Error",
            description: "Please enter all required measurements for Navy method",
            variant: "destructive",
          });
          return;
        }
        bodyFatPercentage = calculateNavyMethod(heightInCm, waistInCm, neckInCm, gender === "female" ? hipsInCm : undefined);
        break;

      case "bmi":
        const bmi = weightInKg / Math.pow(heightInCm / 100, 2);
        bodyFatPercentage = calculateBMIMethod(bmi, ageValue, gender);
        break;

      case "ymca":
        if (isNaN(abdomenInCm)) {
          toast({
            title: "Error",
            description: "Please enter abdomen measurement for YMCA method",
            variant: "destructive",
          });
          return;
        }
        bodyFatPercentage = calculateYMCAMethod(weightInKg, abdomenInCm, gender);
        break;

      default:
        return;
    }

    // Ensure reasonable bounds
    bodyFatPercentage = Math.max(2, Math.min(50, bodyFatPercentage));

    const bmi = weightInKg / Math.pow(heightInCm / 100, 2);
    const fatMass = (bodyFatPercentage / 100) * weightInKg;
    const leanMass = weightInKg - fatMass;
    const healthyRange = getHealthyRange(gender);

    setResult({
      bodyFat: bodyFatPercentage,
      category: getBodyFatCategory(bodyFatPercentage, gender).category,
      healthyRange,
      bmi,
      leanMass,
      fatMass,
    });
  };

  const copyResult = () => {
    if (result) {
      const text = `Body Fat: ${result.bodyFat.toFixed(1)}%\nCategory: ${result.category}\nBMI: ${result.bmi.toFixed(1)}\nLean Mass: ${result.leanMass.toFixed(1)}kg\nFat Mass: ${result.fatMass.toFixed(1)}kg`;
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Body fat calculation copied to clipboard",
      });
    }
  };

  const categoryInfo = result ? getBodyFatCategory(result.bodyFat, gender) : null;

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age" className="block text-sm font-medium mb-2">
                Age (years)
              </Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="30"
                className="w-full px-4 py-3 text-lg"
                data-testid="age-input"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Gender</Label>
              <Select value={gender} onValueChange={(value: any) => setGender(value)}>
                <SelectTrigger data-testid="gender-select">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Calculation Method</Label>
            <Select value={method} onValueChange={(value: any) => setMethod(value)}>
              <SelectTrigger data-testid="method-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="navy">Navy Method (Most Accurate)</SelectItem>
                <SelectItem value="bmi">BMI-based Method</SelectItem>
                <SelectItem value="ymca">YMCA Method</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Height</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Select value={heightUnit} onValueChange={(value: any) => setHeightUnit(value)}>
                <SelectTrigger className="w-24" data-testid="height-unit-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="ft">ft/in</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {heightUnit === "cm" ? (
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                className="w-full px-4 py-3 text-lg"
                data-testid="height-cm-input"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                  placeholder="5"
                  className="flex-1 px-4 py-3 text-lg"
                  data-testid="height-feet-input"
                />
                <span className="text-sm text-muted-foreground">ft</span>
                <Input
                  type="number"
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                  placeholder="8"
                  className="flex-1 px-4 py-3 text-lg"
                  data-testid="height-inches-input"
                />
                <span className="text-sm text-muted-foreground">in</span>
              </div>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Weight</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Select value={weightUnit} onValueChange={(value: any) => setWeightUnit(value)}>
                <SelectTrigger className="w-24" data-testid="weight-unit-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={weightUnit === "kg" ? "70" : "154"}
              className="w-full px-4 py-3 text-lg"
              data-testid="weight-input"
            />
          </div>

          {/* Method-specific measurements */}
          {method === "navy" && (
            <div className="space-y-4">
              <h3 className="font-medium">Navy Method Measurements (cm)</h3>
              <div>
                <Label className="block text-sm font-medium mb-2">Neck Circumference</Label>
                <Input
                  type="number"
                  value={neck}
                  onChange={(e) => setNeck(e.target.value)}
                  placeholder="37"
                  className="w-full px-4 py-3"
                  data-testid="neck-input"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Waist Circumference</Label>
                <Input
                  type="number"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="85"
                  className="w-full px-4 py-3"
                  data-testid="waist-input"
                />
              </div>
              {gender === "female" && (
                <div>
                  <Label className="block text-sm font-medium mb-2">Hip Circumference</Label>
                  <Input
                    type="number"
                    value={hips}
                    onChange={(e) => setHips(e.target.value)}
                    placeholder="95"
                    className="w-full px-4 py-3"
                    data-testid="hips-input"
                  />
                </div>
              )}
            </div>
          )}

          {method === "ymca" && (
            <div>
              <h3 className="font-medium mb-2">YMCA Method Measurements</h3>
              <div>
                <Label className="block text-sm font-medium mb-2">Abdomen Circumference (cm)</Label>
                <Input
                  type="number"
                  value={abdomen}
                  onChange={(e) => setAbdomen(e.target.value)}
                  placeholder="85"
                  className="w-full px-4 py-3"
                  data-testid="abdomen-input"
                />
              </div>
            </div>
          )}

          <Button
            onClick={calculate}
            disabled={!age || !gender || !weight || (!height && heightUnit === "cm") || (!feet && !inches && heightUnit === "ft")}
            className="w-full bg-calculator hover:bg-calculator/90 text-white py-3 text-lg font-medium"
            data-testid="calculate-body-fat"
          >
            <Activity className="w-5 h-5 mr-2" />
            Calculate Body Fat
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Method Information</h3>
            <div className="text-sm text-blue-700">
              {method === "navy" && "Most accurate method using circumference measurements"}
              {method === "bmi" && "Based on BMI correlation - less accurate but simple"}
              {method === "ymca" && "Uses abdomen measurement - good accuracy"}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> These calculations provide estimates. For accurate body composition analysis, consider professional methods like DEXA scans or hydrostatic weighing.
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Body Fat Percentage</Label>
            <Card className="bg-calculator-background border border-calculator/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-calculator mb-2" data-testid="body-fat-result">
                {result ? `${result.bodyFat.toFixed(1)}%` : "0.0%"}
              </div>
              <div className="text-sm text-calculator/70">Estimated body fat</div>
              {categoryInfo && (
                <Badge className={`mt-2 ${categoryInfo.bgColor} ${categoryInfo.color} border-0`}>
                  {categoryInfo.category}
                </Badge>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-calculator/10 hover:bg-calculator/20 border border-calculator/20 text-calculator rounded-xl font-medium"
              data-testid="copy-body-fat-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (result) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('bodyfat', result.bodyFat.toFixed(1));
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-body-fat-calculation"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {result && (
            <div>
              <h3 className="font-medium mb-3">Body Composition</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">BMI</div>
                  <div className="text-sm text-muted-foreground">{result.bmi.toFixed(1)}</div>
                </Card>
                <Card className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="text-sm font-medium text-green-800 mb-1">Lean Body Mass</div>
                  <div className="text-sm text-green-600">{result.leanMass.toFixed(1)} kg</div>
                </Card>
                <Card className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="text-sm font-medium text-orange-800 mb-1">Fat Mass</div>
                  <div className="text-sm text-orange-600">{result.fatMass.toFixed(1)} kg</div>
                </Card>
                <Card className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-sm font-medium text-blue-800 mb-1">Healthy Range</div>
                  <div className="text-sm text-blue-600">{result.healthyRange.min}% - {result.healthyRange.max}%</div>
                </Card>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-3">Body Fat Categories ({gender || "general"})</h3>
            <div className="space-y-3">
              {gender === "male" ? (
                <>
                  <Card className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="text-sm font-medium text-red-800">Essential fat</div>
                    <div className="text-sm text-red-600">2-5%</div>
                  </Card>
                  <Card className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="text-sm font-medium text-green-800">Athletic</div>
                    <div className="text-sm text-green-600">6-13%</div>
                  </Card>
                  <Card className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="text-sm font-medium text-blue-800">Fitness</div>
                    <div className="text-sm text-blue-600">14-17%</div>
                  </Card>
                  <Card className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="text-sm font-medium text-yellow-800">Average</div>
                    <div className="text-sm text-yellow-600">18-24%</div>
                  </Card>
                  <Card className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="text-sm font-medium text-red-800">Obese</div>
                    <div className="text-sm text-red-600">25%+</div>
                  </Card>
                </>
              ) : gender === "female" ? (
                <>
                  <Card className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="text-sm font-medium text-red-800">Essential fat</div>
                    <div className="text-sm text-red-600">10-13%</div>
                  </Card>
                  <Card className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="text-sm font-medium text-green-800">Athletic</div>
                    <div className="text-sm text-green-600">14-20%</div>
                  </Card>
                  <Card className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="text-sm font-medium text-blue-800">Fitness</div>
                    <div className="text-sm text-blue-600">21-24%</div>
                  </Card>
                  <Card className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="text-sm font-medium text-yellow-800">Average</div>
                    <div className="text-sm text-yellow-600">25-31%</div>
                  </Card>
                  <Card className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="text-sm font-medium text-red-800">Obese</div>
                    <div className="text-sm text-red-600">32%+</div>
                  </Card>
                </>
              ) : (
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm text-muted-foreground">Select gender to see categories</div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}