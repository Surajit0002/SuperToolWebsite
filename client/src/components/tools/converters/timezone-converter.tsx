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
import { Copy, Share2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TimezoneConverter() {
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [fromTimezone, setFromTimezone] = useState("UTC");
  const [toTimezone, setToTimezone] = useState("America/New_York");
  const [result, setResult] = useState<string | null>(null);
  const [isDSTWarning, setIsDSTWarning] = useState(false);
  const { toast } = useToast();

  const timezones = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "Eastern Time (New York)" },
    { value: "America/Chicago", label: "Central Time (Chicago)" },
    { value: "America/Denver", label: "Mountain Time (Denver)" },
    { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)" },
    { value: "Europe/London", label: "Greenwich Mean Time (London)" },
    { value: "Europe/Paris", label: "Central European Time (Paris)" },
    { value: "Europe/Berlin", label: "Central European Time (Berlin)" },
    { value: "Europe/Moscow", label: "Moscow Standard Time" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (Tokyo)" },
    { value: "Asia/Shanghai", label: "China Standard Time (Shanghai)" },
    { value: "Asia/Kolkata", label: "India Standard Time (Mumbai)" },
    { value: "Asia/Dubai", label: "Gulf Standard Time (Dubai)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (Sydney)" },
    { value: "Australia/Melbourne", label: "Australian Eastern Time (Melbourne)" },
    { value: "Pacific/Auckland", label: "New Zealand Standard Time (Auckland)" },
  ];

  const convert = () => {
    if (!dateTime) {
      toast({
        title: "Error",
        description: "Please enter a date and time",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create date object in the source timezone
      const inputDate = new Date(dateTime);
      
      // Check if the input is valid
      if (isNaN(inputDate.getTime())) {
        toast({
          title: "Error",
          description: "Please enter a valid date and time",
          variant: "destructive",
        });
        return;
      }

      // Format the result in the target timezone
      const options: Intl.DateTimeFormatOptions = {
        timeZone: toTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      };

      const convertedTime = inputDate.toLocaleString('en-US', options);
      setResult(convertedTime);

      // Check for DST transitions (simplified check)
      const now = new Date();
      const winterTime = new Date(now.getFullYear(), 0, 1);
      const summerTime = new Date(now.getFullYear(), 6, 1);
      
      const winterOffset = winterTime.toLocaleString('en-US', { timeZone: toTimezone, timeZoneName: 'short' });
      const summerOffset = summerTime.toLocaleString('en-US', { timeZone: toTimezone, timeZoneName: 'short' });
      
      setIsDSTWarning(winterOffset !== summerOffset);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert timezone. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast({
        title: "Copied!",
        description: "Converted time copied to clipboard",
      });
    }
  };

  const setCurrentTime = () => {
    setDateTime(new Date().toISOString().slice(0, 16));
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="dateTime" className="block text-sm font-medium mb-2">
              Date & Time
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="dateTime"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="flex-1 px-4 py-3 text-lg"
                data-testid="datetime-input"
              />
              <Button
                variant="outline"
                onClick={setCurrentTime}
                className="px-3 py-3"
                data-testid="current-time-button"
              >
                Now
              </Button>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">From Timezone</Label>
            <Select value={fromTimezone} onValueChange={setFromTimezone}>
              <SelectTrigger data-testid="from-timezone-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">To Timezone</Label>
            <Select value={toTimezone} onValueChange={setToTimezone}>
              <SelectTrigger data-testid="to-timezone-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={convert}
            disabled={!dateTime}
            className="w-full bg-converter hover:bg-converter/90 text-white py-3 text-lg font-medium"
            data-testid="convert-timezone"
          >
            <Clock className="w-5 h-5 mr-2" />
            Convert Time
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Quick Reference</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>UTC: Coordinated Universal Time</div>
              <div>EST/EDT: UTC-5/-4 (New York)</div>
              <div>PST/PDT: UTC-8/-7 (Los Angeles)</div>
              <div>GMT/BST: UTC+0/+1 (London)</div>
              <div>JST: UTC+9 (Tokyo)</div>
            </div>
          </div>

          {isDSTWarning && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">DST Notice</h3>
              <p className="text-sm text-yellow-700">
                This timezone observes Daylight Saving Time. The actual offset may vary depending on the date.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Converted Time</Label>
            <Card className="bg-converter-background border border-converter/20 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold font-mono text-converter mb-2" data-testid="timezone-result">
                {result || "Select time and timezone"}
              </div>
              <div className="text-sm text-converter/70">
                {toTimezone ? timezones.find(tz => tz.value === toTimezone)?.label : "Target timezone"}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={copyResult}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-converter/10 hover:bg-converter/20 border border-converter/20 text-converter rounded-xl font-medium"
              data-testid="copy-timezone-result"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Time</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (result) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('timezone', `${dateTime}|${fromTimezone}|${toTimezone}`);
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }
              }}
              disabled={!result}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
              data-testid="share-timezone-conversion"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {result && (
            <div>
              <h3 className="font-medium mb-3">Time Details</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Original Time</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(dateTime).toLocaleString('en-US', {
                      timeZone: fromTimezone,
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">UTC Time</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(dateTime).toLocaleString('en-US', {
                      timeZone: 'UTC',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </div>
                </Card>
                <Card className="p-4 bg-muted/30 rounded-xl">
                  <div className="text-sm font-medium mb-1">Unix Timestamp</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.floor(new Date(dateTime).getTime() / 1000)}
                  </div>
                </Card>
              </div>
            </div>
          )}

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">World Clock</h3>
            <div className="text-sm text-green-700 space-y-1">
              {['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'].map(tz => (
                <div key={tz} className="flex justify-between">
                  <span>{tz.split('/')[1] || tz}:</span>
                  <span>{new Date().toLocaleString('en-US', {
                    timeZone: tz,
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
