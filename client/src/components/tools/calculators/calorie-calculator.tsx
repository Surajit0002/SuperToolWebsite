import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Share2, Apple, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CalorieCalculator() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [activityLevel, setActivityLevel] = useState<"sedentary" | "light" | "moderate" | "active" | "very-active" | "">("");
  const [goal, setGoal] = useState<"maintain" | "lose" | "gain" | "">("");
  const [result, setResult] = useState<{
    bmr: number;
    maintenance: number;
    weightLoss: number;
    moderateLoss: number;
    extremeLoss: number;
    weightGain: number;
    moderateGain: number;
    macros: {
      protein: { min: number; max: number };
      carbs: { min: number; max: number };
      fats: { min: number; max: number };
    };
  } | null>(null);
  const { toast } = useToast();

  const activityMultipliers = {
    sedentary: { value: 1.2, label: "Sedentary (little/no exercise)" },
    light: { value: 1.375, label: "Light (light exercise 1-3 days/week)" },
    moderate: { value: 1.55, label: "Moderate (moderate exercise 3-5 days/week)" },
    active: { value: 1.725, label: "Active (hard exercise 6-7 days/week)" },
    "very-active": { value: 1.9, label: "Very Active (very hard exercise, physical job)" },
  };

  const calculate = () => {
    const ageValue = parseFloat(age);
    const weightValue = parseFloat(weight);
    let heightValue: number;

    // Validate inputs
    if (isNaN(ageValue) || ageValue < 10 || ageValue > 120) {
      toast({
        title: "Error",
        description: "Please enter a valid age between 10-120 years",
        variant: "destructive",
      });
      return;
    }

    if (!gender || !activityLevel) {
      toast({
        title: "Error",
        description: "Please select gender and activity level",
        variant: "destructive",
      });
      return;
    }

    // Convert height to cm
    if (heightUnit === "cm") {
      heightValue = parseFloat(height);
      if (isNaN(heightValue) || heightValue < 100 || heightValue > 250) {
        toast({
          title: "Error",
          description: "Please enter a valid height between 100-250 cm",
          variant: "destructive",
        });
        return;
      }
    } else {
      const feetValue = parseFloat(feet);
      const inchesValue = parseFloat(inches);
      if (isNaN(feetValue) || isNaN(inchesValue) || feetValue < 3 || feetValue > 8 || inchesValue < 0 || inchesValue >= 12) {
        toast({
          title: "Error",
          description: "Please enter a valid height",
          variant: "destructive",
        });
        return;
      }
      const totalInches = feetValue * 12 + inchesValue;
      heightValue = totalInches * 2.54; // Convert to cm
    }

    // Convert weight to kg
    let weightInKg: number;
    if (weightUnit === "kg") {
      weightInKg = weightValue;
    } else {
      weightInKg = weightValue / 2.20462;
    }

    if (isNaN(weightInKg) || weightInKg < 30 || weightInKg > 300) {
      toast({
        title: "Error",
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * weightInKg + 6.25 * heightValue - 5 * ageValue + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightValue - 5 * ageValue - 161;
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const maintenance = bmr * activityMultipliers[activityLevel].value;

    // Calculate different calorie targets
    const weightLoss = maintenance - 250; // 0.5 lb/week loss
    const moderateLoss = maintenance - 500; // 1 lb/week loss
    const extremeLoss = maintenance - 750; // 1.5 lb/week loss
    const weightGain = maintenance + 250; // 0.5 lb/week gain
    const moderateGain = maintenance + 500; // 1 lb/week gain

    // Calculate macronutrient recommendations based on maintenance calories
    const macros = {
      protein: {
        min: Math.round((maintenance * 0.15) / 4), // 15% of calories from protein
        max: Math.round((maintenance * 0.25) / 4), // 25% of calories from protein
      },
      carbs: {
        min: Math.round((maintenance * 0.45) / 4), // 45% of calories from carbs
        max: Math.round((maintenance * 0.65) / 4), // 65% of calories from carbs
      },
      fats: {
        min: Math.round((maintenance * 0.20) / 9), // 20% of calories from fats
        max: Math.round((maintenance * 0.35) / 9), // 35% of calories from fats
      },
    };

    setResult({
      bmr,
      maintenance,
      weightLoss,
      moderateLoss,
      extremeLoss,
      weightGain,
      moderateGain,
      macros,
    });
  };

  const copyResult = () => {
    if (result) {
      const text = `Daily Calorie Needs:\nMaintenance: ${Math.round(result.maintenance)} calories\nWeight Loss: ${Math.round(result.weightLoss)} calories\nWeight Gain: ${Math.round(result.weightGain)} calories\nBMR: ${Math.round(result.bmr)} calories`;
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Calorie calculation copied to clipboard",
      });
    }
  };

  const getCalorieTarget = () => {
    if (!result || !goal) return result?.maintenance || 0;
    
    switch (goal) {
      case "lose":
        return result.moderateLoss;
      case "gain":
        return result.moderateGain;
      default:
        return result.maintenance;
    }
  };

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

          <div>
            <Label className="block text-sm font-medium mb-2">Activity Level</Label>
            <Select value={activityLevel} onValueChange={(value: any) => setActivityLevel(value)}>
              <SelectTrigger data-testid="activity-level-select">
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(activityMultipliers).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Goal (optional)</Label>
            <Select value={goal} onValueChange={(value: any) => setGoal(value)}>
              <SelectTrigger data-testid="goal-select">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lose">Lose Weight</SelectItem>
                <SelectItem value="maintain">Maintain Weight</SelectItem>
                <SelectItem value="gain">Gain Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={calculate}
            disabled={!age || !gender || !weight || (!height && heightUnit === "cm") || (!feet && !inches && heightUnit === "ft") || !activityLevel}
            className="w-full bg-calculator hover:bg-calculator/90 text-white py-3 text-lg font-medium"
            data-testid="calculate-calories"
          >
            <Apple className="w-5 h-5 mr-2" />
            Calculate Calories
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Formula Used</h3>
            <p className="text-sm text-blue-700">
              Mifflin-St Jeor Equation for BMR calculation
            </p>
            <p className="text-xs text-blue-600 mt-1">
              BMR × Activity Factor = Total Daily Energy Expenditure
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">
              {goal ? `Daily Calories (${goal === "lose" ? "Weight Loss" : goal === "gain" ? "Weight Gain" : "Maintenance"})` : "Maintenance Calories"}
            </Label>
            <Card className="bg-calculator-background border border-calculator/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-calculator mb-2" data-testid="calorie-result">
                {result ? Math.round(getCalorieTarget()) : "0"}
              </div>
              <div className="text-sm text-calculator/70">calories per day</div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-calculator/10 hover:bg-calculator/20 border border-calculator/20 text-calculator rounded-xl font-medium"
              data-testid="copy-calorie-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (result) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('calories', Math.round(result.maintenance).toString());
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-calorie-calculation"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {result && (
            <div>
              <h3 className="font-medium mb-3">Calorie Targets</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">BMR (Basal Metabolic Rate)</div>
                  <div className="text-sm text-muted-foreground">{Math.round(result.bmr)} calories</div>
                </Card>
                <Card className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="text-sm font-medium text-green-800 mb-1">Maintenance</div>
                  <div className="text-sm text-green-600">{Math.round(result.maintenance)} calories</div>
                </Card>
                <Card className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-sm font-medium text-blue-800 mb-1">Weight Loss</div>
                  <div className="text-xs text-blue-600 mb-1">
                    Mild: {Math.round(result.weightLoss)} • Moderate: {Math.round(result.moderateLoss)} • Aggressive: {Math.round(result.extremeLoss)}
                  </div>
                </Card>
                <Card className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="text-sm font-medium text-orange-800 mb-1">Weight Gain</div>
                  <div className="text-xs text-orange-600 mb-1">
                    Mild: {Math.round(result.weightGain)} • Moderate: {Math.round(result.moderateGain)}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {result && (
            <div>
              <h3 className="font-medium mb-3">Macronutrient Recommendations</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="text-sm font-medium text-red-800 mb-1">Protein</div>
                  <div className="text-sm text-red-600">{result.macros.protein.min}-{result.macros.protein.max}g per day</div>
                  <div className="text-xs text-red-500">15-25% of total calories</div>
                </Card>
                <Card className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="text-sm font-medium text-yellow-800 mb-1">Carbohydrates</div>
                  <div className="text-sm text-yellow-600">{result.macros.carbs.min}-{result.macros.carbs.max}g per day</div>
                  <div className="text-xs text-yellow-500">45-65% of total calories</div>
                </Card>
                <Card className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="text-sm font-medium text-purple-800 mb-1">Fats</div>
                  <div className="text-sm text-purple-600">{result.macros.fats.min}-{result.macros.fats.max}g per day</div>
                  <div className="text-xs text-purple-500">20-35% of total calories</div>
                </Card>
              </div>
            </div>
          )}

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This calculator provides estimates based on scientific formulas. Consult a healthcare professional for personalized nutrition advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}