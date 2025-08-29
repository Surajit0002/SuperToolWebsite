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
import { Switch } from "@/components/ui/switch";
import { Copy, Share2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DateCalculator() {
  const [mode, setMode] = useState<"between" | "add">("between");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [addDays, setAddDays] = useState("");
  const [businessDaysOnly, setBusinessDaysOnly] = useState(false);
  const [result, setResult] = useState<{
    years?: number;
    months?: number;
    days?: number;
    totalDays?: number;
    businessDays?: number;
    newDate?: string;
    dayOfWeek?: string;
  } | null>(null);
  const { toast } = useToast();

  const isBusinessDay = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // Not Sunday (0) or Saturday (6)
  };

  const addBusinessDays = (startDate: Date, days: number) => {
    const result = new Date(startDate);
    let addedDays = 0;
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      if (isBusinessDay(result)) {
        addedDays++;
      }
    }
    
    return result;
  };

  const countBusinessDays = (start: Date, end: Date) => {
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      if (isBusinessDay(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  const calculateBetween = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please enter both start and end dates",
        variant: "destructive",
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast({
        title: "Error",
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    // Calculate difference
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const businessDays = businessDaysOnly ? countBusinessDays(start, end) : undefined;

    setResult({
      years,
      months,
      days,
      totalDays,
      businessDays
    });
  };

  const calculateAdd = () => {
    if (!startDate || !addDays) {
      toast({
        title: "Error",
        description: "Please enter start date and number of days",
        variant: "destructive",
      });
      return;
    }

    const start = new Date(startDate);
    const daysToAdd = parseInt(addDays);

    if (isNaN(daysToAdd)) {
      toast({
        title: "Error",
        description: "Please enter a valid number of days",
        variant: "destructive",
      });
      return;
    }

    let newDate: Date;
    
    if (businessDaysOnly && daysToAdd > 0) {
      newDate = addBusinessDays(start, daysToAdd);
    } else {
      newDate = new Date(start);
      newDate.setDate(start.getDate() + daysToAdd);
    }

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = weekdays[newDate.getDay()];

    setResult({
      newDate: newDate.toISOString().split('T')[0],
      dayOfWeek
    });
  };

  const calculate = () => {
    if (mode === "between") {
      calculateBetween();
    } else {
      calculateAdd();
    }
  };

  const copyResult = () => {
    if (result) {
      let text = "";
      if (mode === "between") {
        text = `${result.totalDays} days`;
        if (result.years || result.months) {
          text = `${result.years} years, ${result.months} months, ${result.days} days (${result.totalDays} total days)`;
        }
      } else {
        text = result.newDate || "";
      }
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Result copied to clipboard",
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Calculation Mode</Label>
            <Select value={mode} onValueChange={(value: any) => setMode(value)}>
              <SelectTrigger data-testid="date-mode-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="between">Days Between Dates</SelectItem>
                <SelectItem value="add">Add/Subtract Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "between" ? (
            <>
              <div>
                <Label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 text-lg"
                  data-testid="start-date-input"
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 text-lg"
                  data-testid="end-date-input"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 text-lg"
                  data-testid="start-date-input"
                />
              </div>

              <div>
                <Label htmlFor="addDays" className="block text-sm font-medium mb-2">
                  Days to Add/Subtract
                </Label>
                <Input
                  id="addDays"
                  type="number"
                  value={addDays}
                  onChange={(e) => setAddDays(e.target.value)}
                  placeholder="30"
                  className="w-full px-4 py-3 text-lg"
                  data-testid="add-days-input"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use negative numbers to subtract days
                </p>
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="businessDays" className="text-sm font-medium">
                Business Days Only
              </Label>
              <p className="text-xs text-muted-foreground">
                Exclude weekends {mode === "between" ? "from count" : "when adding"}
              </p>
            </div>
            <Switch
              id="businessDays"
              checked={businessDaysOnly}
              onCheckedChange={setBusinessDaysOnly}
              data-testid="business-days-switch"
            />
          </div>

          <Button
            onClick={calculate}
            disabled={!startDate || (mode === "between" && !endDate) || (mode === "add" && !addDays)}
            className="w-full bg-calculator hover:bg-calculator/90 text-white py-3 text-lg font-medium"
            data-testid="calculate-date"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Calculate
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Examples</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              {mode === "between" ? (
                <>
                  <li>• Calculate days until a deadline</li>
                  <li>• Find project duration</li>
                  <li>• Count working days between dates</li>
                </>
              ) : (
                <>
                  <li>• Find date 30 days from today</li>
                  <li>• Calculate deadline dates</li>
                  <li>• Add business days for delivery</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Result</Label>
            <Card className="bg-calculator-background border border-calculator/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-calculator mb-2" data-testid="date-result">
                {result ? (
                  mode === "between" ? 
                    `${result.totalDays}` : 
                    result.newDate || "0"
                ) : "0"}
              </div>
              <div className="text-sm text-calculator/70">
                {mode === "between" ? "Days" : "New Date"}
              </div>
              {result && mode === "between" && result.years !== undefined && (
                <div className="text-lg text-calculator/90 mt-2">
                  {result.years} years, {result.months} months, {result.days} days
                </div>
              )}
              {result && mode === "add" && result.dayOfWeek && (
                <div className="text-lg text-calculator/90 mt-2">
                  {result.dayOfWeek}
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-calculator/10 hover:bg-calculator/20 border border-calculator/20 text-calculator rounded-xl font-medium"
              data-testid="copy-date-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (result) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('date-calc', JSON.stringify(result));
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-date-calculation"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {result && mode === "between" && (
            <div>
              <h3 className="font-medium mb-3">Detailed Breakdown</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Total Days</div>
                  <div className="text-sm text-muted-foreground">{result.totalDays} days</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Total Weeks</div>
                  <div className="text-sm text-muted-foreground">{Math.floor((result.totalDays || 0) / 7)} weeks</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Total Hours</div>
                  <div className="text-sm text-muted-foreground">{((result.totalDays || 0) * 24).toLocaleString()} hours</div>
                </Card>
                {businessDaysOnly && result.businessDays !== undefined && (
                  <Card className="p-4 bg-muted/30 rounded-xl">
                    <div className="text-sm font-medium mb-1">Business Days</div>
                    <div className="text-sm text-muted-foreground">{result.businessDays} days</div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
