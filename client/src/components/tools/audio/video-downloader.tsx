import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Link, Play, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VideoDownloader() {
  const [videoUrl, setVideoUrl] = useState("");
  const [quality, setQuality] = useState("720p");
  const [format, setFormat] = useState("mp4");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<{
    title: string;
    duration: string;
    thumbnail: string;
    size: string;
  } | null>(null);
  const { toast } = useToast();

  const supportedPlatforms = [
    "YouTube",
    "Vimeo", 
    "Dailymotion",
    "Facebook",
    "Instagram",
    "TikTok",
    "Twitter"
  ];

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const extractVideoInfo = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a video URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(videoUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    // Simulate video info extraction
    setTimeout(() => {
      setDownloadInfo({
        title: "Sample Video Title",
        duration: "3:45",
        thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280'%3EVideo Thumbnail%3C/text%3E%3C/svg%3E",
        size: "25.6 MB"
      });
      
      toast({
        title: "Video Info Retrieved",
        description: "Ready to download",
      });
      
      setIsDownloading(false);
    }, 2000);
  };

  const downloadVideo = async () => {
    if (!downloadInfo) {
      toast({
        title: "Error",
        description: "Please extract video info first",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    // Simulate download process
    setTimeout(() => {
      toast({
        title: "Download Started",
        description: "Video download initiated. Note: This is a demo implementation.",
      });
      setIsDownloading(false);
    }, 1000);
  };

  const reset = () => {
    setVideoUrl("");
    setDownloadInfo(null);
    setQuality("720p");
    setFormat("mp4");
  };

  const getEstimatedSize = () => {
    const baseSize = 50; // MB
    const qualityMultiplier = {
      "480p": 0.5,
      "720p": 1,
      "1080p": 2,
      "1440p": 3.5,
      "2160p": 6
    };
    
    return (baseSize * qualityMultiplier[quality as keyof typeof qualityMultiplier]).toFixed(1);
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          {/* URL Input */}
          <div>
            <Label htmlFor="videoUrl" className="block text-sm font-medium mb-2">
              Video URL
            </Label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="pl-10"
                  data-testid="video-url-input"
                />
              </div>
              <Button
                onClick={extractVideoInfo}
                disabled={!videoUrl.trim() || isDownloading}
                variant="outline"
                data-testid="extract-info"
              >
                {isDownloading ? "Loading..." : "Get Info"}
              </Button>
            </div>
          </div>

          {/* Supported Platforms */}
          <div>
            <Label className="block text-sm font-medium mb-2">Supported Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {supportedPlatforms.map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1 bg-muted/30 text-sm rounded-full"
                  data-testid={`platform-${platform.toLowerCase()}`}
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Download Settings */}
          <div className="space-y-4">
            <Label className="block text-sm font-medium">Download Settings</Label>
            
            <div>
              <Label className="block text-sm font-medium mb-2">Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger data-testid="quality-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480p">480p (SD)</SelectItem>
                  <SelectItem value="720p">720p (HD)</SelectItem>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  <SelectItem value="1440p">1440p (2K)</SelectItem>
                  <SelectItem value="2160p">2160p (4K)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Higher quality = larger file size
              </p>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger data-testid="format-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4 (Recommended)</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                  <SelectItem value="avi">AVI</SelectItem>
                  <SelectItem value="mov">MOV</SelectItem>
                  <SelectItem value="mkv">MKV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Estimated Size:</span>
                  <span className="font-medium">{getEstimatedSize()} MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={downloadVideo}
            disabled={!downloadInfo || isDownloading}
            className="w-full bg-audio hover:bg-audio/90 text-white py-3 text-lg font-medium"
            data-testid="download-video"
          >
            <Download className="w-5 h-5 mr-2" />
            {isDownloading ? "Processing..." : "Download Video"}
          </Button>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={reset}
            className="w-full"
            data-testid="reset-downloader"
          >
            Reset
          </Button>

          {/* Important Notice */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800 mb-1">Important Notice</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Only download videos you have permission to download</li>
                  <li>• Respect copyright and platform terms of service</li>
                  <li>• Some platforms may restrict downloading</li>
                  <li>• This is a demonstration interface</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Output */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Video Information</Label>
            <Card className="bg-audio-background border border-audio/20 rounded-xl p-6 min-h-[400px]">
              {downloadInfo ? (
                <div className="space-y-4">
                  {/* Video Thumbnail */}
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={downloadInfo.thumbnail}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                      data-testid="video-thumbnail"
                    />
                  </div>

                  {/* Video Details */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                      <p className="font-medium" data-testid="video-title">{downloadInfo.title}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                        <p data-testid="video-duration">{downloadInfo.duration}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Size</Label>
                        <p data-testid="video-size">{downloadInfo.size}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <Label className="text-sm font-medium text-muted-foreground">Download Options</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Quality:</span>
                          <span className="font-medium">{quality}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Format:</span>
                          <span className="font-medium">{format.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Estimated Size:</span>
                          <span className="font-medium">{getEstimatedSize()} MB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="text-muted-foreground">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Enter a video URL and click "Get Info" to see video details</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Download History/Queue (placeholder) */}
          <div>
            <Label className="block text-sm font-medium mb-2">Recent Downloads</Label>
            <Card className="p-4 bg-muted/20">
              <div className="text-center text-muted-foreground text-sm">
                <Download className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent downloads</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}