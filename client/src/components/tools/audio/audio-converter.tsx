import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Music, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AudioConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [isConverting, setIsConverting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setIsConverting(true);
    // Simulate conversion process
    setTimeout(() => {
      setIsConverting(false);
      alert(`Audio conversion to ${outputFormat.toUpperCase()} completed! Download would start here.`);
    }, 3000);
  };

  const formats = [
    { value: "mp3", label: "MP3" },
    { value: "wav", label: "WAV" },
    { value: "flac", label: "FLAC" },
    { value: "aac", label: "AAC" },
    { value: "ogg", label: "OGG" },
    { value: "m4a", label: "M4A" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Audio Converter</h1>
        <p className="text-muted-foreground">
          Convert between various audio formats
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Audio File</h3>
              <p className="text-muted-foreground">
                Select an audio file to convert to another format
              </p>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
                id="audio-upload"
                data-testid="audio-upload-input"
              />
              <label htmlFor="audio-upload">
                <Button variant="outline" className="cursor-pointer" data-testid="upload-button">
                  Choose Audio File
                </Button>
              </label>
            </div>
          </div>

          {/* Conversion Settings */}
          {file && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Music className="w-8 h-8 text-rose-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Output Format:</label>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger data-testid="format-select">
                      <SelectValue placeholder="Select output format" />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="w-full mt-4"
                  data-testid="convert-button"
                >
                  {isConverting ? "Converting..." : `Convert to ${outputFormat.toUpperCase()}`}
                  <Download className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <Music className="w-8 h-8 mx-auto mb-2 text-rose-500" />
              <h4 className="font-medium">Multiple Formats</h4>
              <p className="text-sm text-muted-foreground">
                Supports MP3, WAV, FLAC, AAC, OGG, M4A
              </p>
            </div>
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-medium">High Quality</h4>
              <p className="text-sm text-muted-foreground">
                Preserves audio quality during conversion
              </p>
            </div>
            <div className="text-center p-4">
              <Download className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium">Fast Processing</h4>
              <p className="text-sm text-muted-foreground">
                Quick conversion and download
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}