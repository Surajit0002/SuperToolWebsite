import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileDown, X, FileText, Lock, Eye, EyeOff } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

export default function PdfLockTool() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [encryptionLevel, setEncryptionLevel] = useState("128");
  const [allowPrinting, setAllowPrinting] = useState(false);
  const [allowCopyContent, setAllowCopyContent] = useState(false);
  const [allowModifyDocument, setAllowModifyDocument] = useState(false);
  const [allowModifyAnnotations, setAllowModifyAnnotations] = useState(false);
  const [allowFillForms, setAllowFillForms] = useState(true);
  const [allowExtractForAccessibility, setAllowExtractForAccessibility] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultFiles, setResultFiles] = useState<{name: string, url: string, size: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    const pdfFiles = selectedFiles.filter(file => 
      file.type === "application/pdf" || file.name.endsWith('.pdf')
    );
    
    if (pdfFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid files",
        description: "Only PDF files are allowed",
        variant: "destructive",
      });
      return;
    }

    const newFiles: PDFFile[] = pdfFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: formatFileSize(file.size),
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const lockPdfs = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one PDF file",
        variant: "destructive",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 4) {
      toast({
        title: "Error",
        description: "Password must be at least 4 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setResultFiles([]);

    try {
      const formData = new FormData();
      files.forEach((pdfFile, index) => {
        formData.append(`pdf_${index}`, pdfFile.file);
      });
      formData.append('password', password);
      formData.append('ownerPassword', ownerPassword || password);
      formData.append('encryptionLevel', encryptionLevel);
      formData.append('allowPrinting', allowPrinting.toString());
      formData.append('allowCopyContent', allowCopyContent.toString());
      formData.append('allowModifyDocument', allowModifyDocument.toString());
      formData.append('allowModifyAnnotations', allowModifyAnnotations.toString());
      formData.append('allowFillForms', allowFillForms.toString());
      formData.append('allowExtractForAccessibility', allowExtractForAccessibility.toString());

      setProgress(30);

      const response = await fetch('/api/document/pdf-lock', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to lock PDFs');
      }

      const result = await response.json();
      
      // Create download URLs for each locked PDF
      const lockedFiles = await Promise.all(
        result.files.map(async (fileInfo: any) => {
          const fileResponse = await fetch(`/api/document/download/${fileInfo.id}`);
          const blob = await fileResponse.blob();
          const url = URL.createObjectURL(blob);
          
          return {
            name: fileInfo.name,
            url,
            size: formatFileSize(blob.size)
          };
        })
      );

      setResultFiles(lockedFiles);
      setProgress(100);

      toast({
        title: "Success!",
        description: `${lockedFiles.length} PDF file${lockedFiles.length > 1 ? 's' : ''} locked with password protection`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to lock PDFs",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (file: {name: string, url: string}) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllFiles = () => {
    resultFiles.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 100);
    });
  };

  const resetTool = () => {
    setFiles([]);
    setPassword("");
    setConfirmPassword("");
    setOwnerPassword("");
    setEncryptionLevel("128");
    setAllowPrinting(false);
    setAllowCopyContent(false);
    setAllowModifyDocument(false);
    setAllowModifyAnnotations(false);
    setAllowFillForms(true);
    setAllowExtractForAccessibility(true);
    setIsProcessing(false);
    setProgress(0);
    setResultFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">PDF Lock Tool</h1>
        </div>
        <p className="text-muted-foreground">Add password protection and permissions to PDF files</p>
      </div>

      {resultFiles.length === 0 && (
        <>
          {/* File Upload Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Select PDF Files</Label>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2"
                    data-testid="select-files-button"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Files</span>
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="file-input"
                />

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        data-testid={`file-item-${file.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-orange-600" />
                          <div>
                            <div className="font-medium">{file.name}</div>
                            <div className="text-sm text-muted-foreground">{file.size}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`remove-file-${file.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <Label className="text-base font-semibold">Password Protection</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">User Password (Required)</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="pr-10"
                        data-testid="password-input"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        data-testid="toggle-password-visibility"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Required to open the PDF</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      data-testid="confirm-password-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner-password">Owner Password (Optional)</Label>
                    <Input
                      id="owner-password"
                      type={showPassword ? "text" : "password"}
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="Leave empty to use user password"
                      data-testid="owner-password-input"
                    />
                    <p className="text-xs text-muted-foreground">Required to modify permissions</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="encryption-level">Encryption Level</Label>
                    <Select value={encryptionLevel} onValueChange={setEncryptionLevel}>
                      <SelectTrigger data-testid="encryption-level-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="40">40-bit RC4 (Compatible)</SelectItem>
                        <SelectItem value="128">128-bit RC4 (Standard)</SelectItem>
                        <SelectItem value="128-aes">128-bit AES (Secure)</SelectItem>
                        <SelectItem value="256-aes">256-bit AES (Most Secure)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <Label className="text-base font-semibold">Document Permissions</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Allow Printing</Label>
                      <p className="text-xs text-muted-foreground">Allow users to print the document</p>
                    </div>
                    <Switch
                      checked={allowPrinting}
                      onCheckedChange={setAllowPrinting}
                      data-testid="allow-printing-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Allow Copy Content</Label>
                      <p className="text-xs text-muted-foreground">Allow copying text and images</p>
                    </div>
                    <Switch
                      checked={allowCopyContent}
                      onCheckedChange={setAllowCopyContent}
                      data-testid="allow-copy-content-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Allow Modify Document</Label>
                      <p className="text-xs text-muted-foreground">Allow editing the document content</p>
                    </div>
                    <Switch
                      checked={allowModifyDocument}
                      onCheckedChange={setAllowModifyDocument}
                      data-testid="allow-modify-document-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Allow Modify Annotations</Label>
                      <p className="text-xs text-muted-foreground">Allow adding/editing annotations</p>
                    </div>
                    <Switch
                      checked={allowModifyAnnotations}
                      onCheckedChange={setAllowModifyAnnotations}
                      data-testid="allow-modify-annotations-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Allow Fill Forms</Label>
                      <p className="text-xs text-muted-foreground">Allow filling in form fields</p>
                    </div>
                    <Switch
                      checked={allowFillForms}
                      onCheckedChange={setAllowFillForms}
                      data-testid="allow-fill-forms-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Allow Accessibility</Label>
                      <p className="text-xs text-muted-foreground">Allow text extraction for screen readers</p>
                    </div>
                    <Switch
                      checked={allowExtractForAccessibility}
                      onCheckedChange={setAllowExtractForAccessibility}
                      data-testid="allow-accessibility-switch"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lock Button */}
          <div className="flex justify-center">
            <Button
              onClick={lockPdfs}
              disabled={files.length === 0 || !password || password !== confirmPassword || isProcessing}
              className="px-8 py-3 text-lg"
              data-testid="lock-button"
            >
              {isProcessing ? "Locking..." : "Lock PDFs with Password"}
            </Button>
          </div>
        </>
      )}

      {/* Progress Section */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Locking PDFs with password protection...</Label>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Section */}
      {resultFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">PDFs Locked Successfully!</h3>
                    <p className="text-muted-foreground">{resultFiles.length} file{resultFiles.length > 1 ? 's' : ''} protected</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <Button
                    onClick={downloadAllFiles}
                    className="flex items-center space-x-2"
                    data-testid="download-all-button"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download All Protected Files</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetTool}
                    data-testid="lock-another-button"
                  >
                    Lock More Files
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {resultFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    data-testid={`result-file-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <FileText className="w-5 h-5 text-orange-600" />
                        <Lock className="w-3 h-3 text-orange-600 absolute -bottom-1 -right-1" />
                      </div>
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">{file.size} • Password Protected</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(file)}
                      className="flex items-center space-x-2"
                      data-testid={`download-file-${index}`}
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}