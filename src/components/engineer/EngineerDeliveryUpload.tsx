import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, FileAudio, X } from "lucide-react";
import { useEngineerDeliverables } from "@/hooks/useEngineerDeliverables";

interface EngineerDeliveryUploadProps {
  projectId: string;
  projectTitle: string;
  onUploadComplete?: () => void;
}

const DELIVERY_TYPES = [
  { value: 'rough_mix', label: 'Rough Mix' },
  { value: 'final_mix', label: 'Final Mix' },
  { value: 'master', label: 'Master' },
  { value: 'stems_package', label: 'Stems Package' },
  { value: 'revision', label: 'Revision' },
];

export const EngineerDeliveryUpload = ({ 
  projectId, 
  projectTitle,
  onUploadComplete 
}: EngineerDeliveryUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deliveryType, setDeliveryType] = useState<string>('final_mix');
  const [notes, setNotes] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const { isUploading, uploadProgress, uploadMix } = useEngineerDeliverables(projectId);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const result = await uploadMix({
      file: selectedFile,
      deliveryType: deliveryType as any,
      notes: notes.trim() || undefined,
    });

    if (result) {
      setSelectedFile(null);
      setNotes('');
      onUploadComplete?.();
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Upload Completed Mix</h3>
        <p className="text-sm text-muted-foreground">Project: {projectTitle}</p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="audio/*,.wav,.mp3,.aiff,.flac"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <FileAudio className="w-8 h-8 text-primary" />
            <div className="text-left">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">Drag & Drop Files Here</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Delivery Type</label>
        <Select value={deliveryType} onValueChange={setDeliveryType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DELIVERY_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Notes for Artist</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this mix version..."
          rows={4}
        />
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!selectedFile || isUploading}
        className="w-full"
        size="lg"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Submit Mix for Review'}
      </Button>
    </Card>
  );
};