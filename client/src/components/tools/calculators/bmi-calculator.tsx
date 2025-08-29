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
import { Copy, Share2, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "">("");
  const [bmi, setBmi] = useState<number | null>(null);
  const { toast } = useToast();

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { category: "Underweight", color: "text-blue-600", bgColor: "bg-blue-100" };
    if (bmiValue >= 18.5 && bmiValue < 25) return { category: "Normal weight", color: "text-green-600", bgColor: "bg-green-100" };
    if (bmiValue >= 25 && bmiValue < 30) return { category: "Overweight", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    return { category: "Obese", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const getHealthyRange = () => {
    let heightInM: number;
    
    if (heightUnit === "cm") {
      heightInM = parseFloat(height) / 100;
    } else {
      const totalInches = parseFloat(feet) * 12 + parseFloat(inches);
      heightInM = totalInches * 0.0254;
    }

    if (isNaN(heightInM) || heightInM <= 0) return null;

    const minWeight = 18.5 * heightInM * heightInM;
    const maxWeight = 24.9 * heightInM * heightInM;

    if (weightUnit === "lb") {
      return { min: (minWeight * 2.20462).toFixed(1), max: (maxWeight * 2.20462).toFixed(1), unit: "lb" };
    }
    return { min: minWeight.toFixed(1), max: maxWeight.toFixed(1), unit: "kg" };
  };

  const calculate = () => {
    let heightInM: number;
    let weightInKg: number;

    // Convert height to meters
    if (heightUnit === "cm") {
      const heightValue = parseFloat(height);
      if (isNaN(heightValue) || heightValue <= 0 || heightValue < 50 || heightValue > 250) {
        toast({
          title: "Error",
          description: "Please enter a valid height between 50-250 cm",
          variant: "destructive",
        });
        return;
      }
      heightInM = heightValue / 100;
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
      heightInM = totalInches * 0.0254;
    }

    // Convert weight to kg
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }

    if (weightUnit === "kg") {
      weightInKg = weightValue;
    } else {
      weightInKg = weightValue / 2.20462;
    }

    const calculatedBMI = weightInKg / (heightInM * heightInM);
    setBmi(calculatedBMI);
  };

  const copyResult = () => {
    if (bmi !== null) {
      navigator.clipboard.writeText(bmi.toFixed(1));
      toast({
        title: "Copied!",
        description: "BMI result copied to clipboard",
      });
    }
  };

  const healthyRange = getHealthyRange();
  const bmiInfo = bmi ? getBMICategory(bmi) : null;

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Age (optional)</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="30"
                className="w-full px-4 py-3"
                data-testid="age-input"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Sex (optional)</Label>
              <Select value={sex} onValueChange={(value: any) => setSex(value)}>
                <SelectTrigger data-testid="sex-select">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={calculate}
            disabled={!weight || (!height && heightUnit === "cm") || (!feet && !inches && heightUnit === "ft")}
            className="w-full bg-calculator hover:bg-calculator/90 text-white py-3 text-lg font-medium"
            data-testid="calculate-bmi"
          >
            <Activity className="w-5 h-5 mr-2" />
            Calculate BMI
          </Button>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This BMI calculator is for informational purposes only and should not be used as a substitute for professional medical advice.
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">BMI Result</Label>
            <Card className="bg-calculator-background border border-calculator/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-calculator mb-2" data-testid="bmi-result">
                {bmi !== null ? bmi.toFixed(1) : "0.0"}
              </div>
              <div className="text-sm text-calculator/70">Body Mass Index</div>
              {bmiInfo && (
                <Badge className={`mt-2 ${bmiInfo.bgColor} ${bmiInfo.color} border-0`}>
                  {bmiInfo.category}
                </Badge>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={bmi === null}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-calculator/10 hover:bg-calculator/20 border border-calculator/20 text-calculator rounded-xl font-medium"
              data-testid="copy-bmi-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy BMI</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (bmi !== null) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('bmi', bmi.toFixed(1));
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={bmi === null}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-bmi-calculation"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {bmi !== null && (
            <div>
              <h3 className="font-medium mb-3">BMI Categories</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-sm font-medium text-blue-800">Underweight</div>
                  <div className="text-sm text-blue-600">BMI less than 18.5</div>
                </Card>
                <Card className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="text-sm font-medium text-green-800">Normal weight</div>
                  <div className="text-sm text-green-600">BMI 18.5 - 24.9</div>
                </Card>
                <Card className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="text-sm font-medium text-yellow-800">Overweight</div>
                  <div className="text-sm text-yellow-600">BMI 25 - 29.9</div>
                </Card>
                <Card className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="text-sm font-medium text-red-800">Obese</div>
                  <div className="text-sm text-red-600">BMI 30 or greater</div>
                </Card>
              </div>
            </div>
          )}

          {healthyRange && (
            <div>
              <h3 className="font-medium mb-3">Healthy Weight Range</h3>
              <Card className="p-4 bg-muted/30 rounded-xl">
                <div className="text-sm font-medium mb-1">For your height</div>
                <div className="text-sm text-muted-foreground">
                  {healthyRange.min} - {healthyRange.max} {healthyRange.unit}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
