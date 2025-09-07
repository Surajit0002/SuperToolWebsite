import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Grid3X3, Download, Plus, X } from "lucide-react";

export default function CollageMaker() {
  const [images, setImages] = useState<File[]>([]);
  const [layout, setLayout] = useState("2x2");
  const [isCreating, setIsCreating] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    setImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateCollage = async () => {
    if (images.length === 0) return;
    
    setIsCreating(true);
    // Simulate collage creation process
    setTimeout(() => {
      setIsCreating(false);
      alert("Collage created successfully! Download would start here.");
    }, 3000);
  };

  const layouts = [
    { id: "2x1", name: "2×1", description: "2 images horizontal" },
    { id: "1x2", name: "1×2", description: "2 images vertical" },
    { id: "2x2", name: "2×2", description: "4 images grid" },
    { id: "3x2", name: "3×2", description: "6 images grid" },
    { id: "3x3", name: "3×3", description: "9 images grid" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Collage Maker</h1>
        <p className="text-muted-foreground">
          Create beautiful photo collages with multiple images
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Upload Images</h3>
                <p className="text-muted-foreground">
                  Select multiple images to create a collage
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="images-upload"
                  data-testid="images-upload-input"
                />
                <label htmlFor="images-upload">
                  <Button variant="outline" className="cursor-pointer" data-testid="upload-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Images
                  </Button>
                </label>
              </div>
            </div>

            {/* Uploaded Images */}
            {images.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">Uploaded Images ({images.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square border rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                        data-testid={`remove-image-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Layout Selection */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Choose Layout</h3>
            <div className="space-y-2">
              {layouts.map((layoutOption) => (
                <button
                  key={layoutOption.id}
                  onClick={() => setLayout(layoutOption.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    layout === layoutOption.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  }`}
                  data-testid={`layout-${layoutOption.id}`}
                >
                  <div className="font-medium">{layoutOption.name}</div>
                  <div className="text-sm opacity-80">{layoutOption.description}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Create Collage</h3>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Layout: <span className="font-medium">{layouts.find(l => l.id === layout)?.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Images: <span className="font-medium">{images.length}</span>
              </div>
              <Button
                onClick={handleCreateCollage}
                disabled={images.length === 0 || isCreating}
                className="w-full"
                data-testid="create-collage-button"
              >
                {isCreating ? "Creating..." : "Create Collage"}
                <Grid3X3 className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>

          {/* Features */}
          <Card className="p-6">
            <h4 className="font-medium mb-4">Features</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-4 h-4 text-blue-500" />
                <span>Multiple layout options</span>
              </div>
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-green-500" />
                <span>Unlimited image uploads</span>
              </div>
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-purple-500" />
                <span>High-resolution output</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}