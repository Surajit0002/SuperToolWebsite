import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Download, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TextCaseConverter() {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<{
    lowercase: string;
    uppercase: string;
    titleCase: string;
    sentenceCase: string;
    camelCase: string;
    pascalCase: string;
    snakeCase: string;
    kebabCase: string;
    dotCase: string;
    constantCase: string;
  } | null>(null);
  const { toast } = useToast();

  const convertToTitleCase = (text: string): string => {
    const minorWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'];
    
    return text.toLowerCase().replace(/\b\w+/g, (word, index) => {
      if (index === 0 || !minorWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    });
  };

  const convertToSentenceCase = (text: string): string => {
    return text.toLowerCase().replace(/(^|\. |\n)(\w)/g, (match, prefix, letter) => {
      return prefix + letter.toUpperCase();
    });
  };

  const convertToCamelCase = (text: string): string => {
    return text
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  };

  const convertToPascalCase = (text: string): string => {
    return text
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  };

  const convertToSnakeCase = (text: string): string => {
    return text
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
  };

  const convertToKebabCase = (text: string): string => {
    return text
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
  };

  const convertToDotCase = (text: string): string => {
    return text
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '.');
  };

  const convertToConstantCase = (text: string): string => {
    return text
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_');
  };

  const convert = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert",
        variant: "destructive",
      });
      return;
    }

    setResults({
      lowercase: inputText.toLowerCase(),
      uppercase: inputText.toUpperCase(),
      titleCase: convertToTitleCase(inputText),
      sentenceCase: convertToSentenceCase(inputText),
      camelCase: convertToCamelCase(inputText),
      pascalCase: convertToPascalCase(inputText),
      snakeCase: convertToSnakeCase(inputText),
      kebabCase: convertToKebabCase(inputText),
      dotCase: convertToDotCase(inputText),
      constantCase: convertToConstantCase(inputText),
    });
  };

  const copyResult = (format: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied!",
      description: `${format} text copied to clipboard`,
    });
  };

  const downloadResult = (format: string, value: string) => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-${format.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: `${format} text file downloaded`,
    });
  };

  const caseFormats = [
    { key: 'lowercase', name: 'lowercase', description: 'all lowercase letters' },
    { key: 'uppercase', name: 'UPPERCASE', description: 'ALL UPPERCASE LETTERS' },
    { key: 'titleCase', name: 'Title Case', description: 'First Letter Of Each Word Capitalized' },
    { key: 'sentenceCase', name: 'Sentence case', description: 'First letter of each sentence capitalized' },
    { key: 'camelCase', name: 'camelCase', description: 'firstWordLowercaseRestCapitalized' },
    { key: 'pascalCase', name: 'PascalCase', description: 'FirstLetterOfEachWordCapitalized' },
    { key: 'snakeCase', name: 'snake_case', description: 'words_separated_by_underscores' },
    { key: 'kebabCase', name: 'kebab-case', description: 'words-separated-by-hyphens' },
    { key: 'dotCase', name: 'dot.case', description: 'words.separated.by.dots' },
    { key: 'constantCase', name: 'CONSTANT_CASE', description: 'UPPERCASE_WITH_UNDERSCORES' },
  ];

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = (text: string): number => {
    return text.length;
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="inputText" className="block text-sm font-medium mb-2">
              Input Text
            </Label>
            <Textarea
              id="inputText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full px-4 py-3 text-lg min-h-[200px] resize-none"
              data-testid="text-input"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Characters: {getCharacterCount(inputText)}</span>
              <span>Words: {getWordCount(inputText)}</span>
            </div>
          </div>

          <Button
            onClick={convert}
            disabled={!inputText.trim()}
            className="w-full bg-converter hover:bg-converter/90 text-white py-3 text-lg font-medium"
            data-testid="convert-text"
          >
            <Type className="w-5 h-5 mr-2" />
            Convert Text
          </Button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Examples</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Input:</strong> "Hello World Example"</div>
              <div><strong>camelCase:</strong> helloWorldExample</div>
              <div><strong>snake_case:</strong> hello_world_example</div>
              <div><strong>kebab-case:</strong> hello-world-example</div>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Use Cases</h3>
            <div className="text-sm text-green-700 space-y-1">
              <div><strong>camelCase:</strong> JavaScript variables</div>
              <div><strong>PascalCase:</strong> Class names</div>
              <div><strong>snake_case:</strong> Python variables</div>
              <div><strong>kebab-case:</strong> CSS classes, URLs</div>
              <div><strong>CONSTANT_CASE:</strong> Constants</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Outputs */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Converted Text</Label>
            <div className="space-y-4">
              {caseFormats.map((format) => (
                <Card key={format.key} className="bg-muted/30 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {format.name}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {format.description}
                      </div>
                      <div 
                        className="text-lg font-mono bg-background p-3 rounded border min-h-[3rem] break-all"
                        data-testid={`${format.key}-result`}
                      >
                        {results?.[format.key as keyof typeof results] || `${format.name} output will appear here`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => results && copyResult(format.name, results[format.key as keyof typeof results])}
                      disabled={!results}
                      className="flex items-center space-x-1"
                      data-testid={`copy-${format.key}`}
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => results && downloadResult(format.name, results[format.key as keyof typeof results])}
                      disabled={!results}
                      className="flex items-center space-x-1"
                      data-testid={`download-${format.key}`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {results && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  const allResults = caseFormats.map(format => 
                    `${format.name}: ${results[format.key as keyof typeof results]}`
                  ).join('\n\n');
                  navigator.clipboard.writeText(allResults);
                  toast({ title: "Copied!", description: "All formats copied to clipboard" });
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-converter/10 hover:bg-converter/20 border border-converter/20 text-converter rounded-xl font-medium"
                data-testid="copy-all-formats"
              >
                <Copy className="w-4 h-4" />
                <span>Copy All</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('text', encodeURIComponent(inputText));
                  navigator.clipboard.writeText(url.toString());
                  toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl font-medium"
                data-testid="share-text-conversion"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
