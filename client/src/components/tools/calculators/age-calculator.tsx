import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Share2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");
  const [compareDate, setCompareDate] = useState(new Date().toISOString().split('T')[0]);
  const [ageResult, setAgeResult] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalMonths: number;
    nextBirthday: number;
    weekday: string;
  } | null>(null);
  const { toast } = useToast();

  const calculate = () => {
    if (!birthDate) {
      toast({
        title: "Error",
        description: "Please enter your birth date",
        variant: "destructive",
      });
      return;
    }

    const birth = new Date(birthDate);
    const compare = new Date(compareDate);

    if (birth > compare) {
      toast({
        title: "Error",
        description: "Birth date cannot be in the future",
        variant: "destructive",
      });
      return;
    }

    // Calculate age
    let years = compare.getFullYear() - birth.getFullYear();
    let months = compare.getMonth() - birth.getMonth();
    let days = compare.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(compare.getFullYear(), compare.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate total days
    const totalDays = Math.floor((compare.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate total months
    const totalMonths = years * 12 + months;

    // Calculate next birthday
    const nextBirthday = new Date(compare.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < compare) {
      nextBirthday.setFullYear(compare.getFullYear() + 1);
    }
    const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - compare.getTime()) / (1000 * 60 * 60 * 24));

    // Get weekday of birth
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = weekdays[birth.getDay()];

    setAgeResult({
      years,
      months,
      days,
      totalDays,
      totalMonths,
      nextBirthday: daysToNextBirthday,
      weekday
    });
  };

  const copyResult = () => {
    if (ageResult) {
      const text = `${ageResult.years} years, ${ageResult.months} months, ${ageResult.days} days`;
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Age result copied to clipboard",
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="birthDate" className="block text-sm font-medium mb-2">
              Birth Date
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3 text-lg"
              data-testid="birth-date-input"
            />
          </div>

          <div>
            <Label htmlFor="compareDate" className="block text-sm font-medium mb-2">
              Calculate Age As Of
            </Label>
            <Input
              id="compareDate"
              type="date"
              value={compareDate}
              onChange={(e) => setCompareDate(e.target.value)}
              className="w-full px-4 py-3 text-lg"
              data-testid="compare-date-input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Default is today's date
            </p>
          </div>

          <Button
            onClick={calculate}
            disabled={!birthDate}
            className="w-full bg-calculator hover:bg-calculator/90 text-white py-3 text-lg font-medium"
            data-testid="calculate-age"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Calculate Age
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Enter your birth date to calculate your exact age</li>
              <li>• You can calculate age as of any specific date</li>
              <li>• Results include total days and months lived</li>
              <li>• Find out which day of the week you were born</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Your Age</Label>
            <Card className="bg-calculator-background border border-calculator/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold font-mono text-calculator mb-2" data-testid="age-result">
                {ageResult ? `${ageResult.years}` : "0"}
              </div>
              <div className="text-sm text-calculator/70">Years Old</div>
              {ageResult && (
                <div className="text-lg text-calculator/90 mt-2">
                  {ageResult.months} months, {ageResult.days} days
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={!ageResult}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-calculator/10 hover:bg-calculator/20 border border-calculator/20 text-calculator rounded-xl font-medium"
              data-testid="copy-age-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Age</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (ageResult) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('age', `${ageResult.years}y${ageResult.months}m${ageResult.days}d`);
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={!ageResult}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-age-calculation"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {ageResult && (
            <div>
              <h3 className="font-medium mb-3">Detailed Information</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Total Days Lived</div>
                  <div className="text-sm text-muted-foreground">{ageResult.totalDays.toLocaleString()} days</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Total Months Lived</div>
                  <div className="text-sm text-muted-foreground">{ageResult.totalMonths} months</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Days Until Next Birthday</div>
                  <div className="text-sm text-muted-foreground">{ageResult.nextBirthday} days</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Day of Week Born</div>
                  <div className="text-sm text-muted-foreground">{ageResult.weekday}</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Total Hours Lived</div>
                  <div className="text-sm text-muted-foreground">{(ageResult.totalDays * 24).toLocaleString()} hours</div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Total Minutes Lived</div>
                  <div className="text-sm text-muted-foreground">{(ageResult.totalDays * 24 * 60).toLocaleString()} minutes</div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
