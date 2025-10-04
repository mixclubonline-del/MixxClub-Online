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
  { value: 'rough_mix', label: '🎧 Rough Mix', description: 'Initial balance for artist review' },
  { value: 'revision', label: '🔄 Revision', description: 'Updated mix based on feedback' },
  { value: 'final_mix', label: '✨ Final Mix', description: 'Approved final version' },
  { value: 'master', label: '🎵 Master', description: 'Mastered & ready for release' },
  { value: 'stems_package', label: '📦 Stems Package', description: 'Individual track exports' },
];

const NOTES_TEMPLATES = {
  rough_mix: 'Please review the overall balance and let me know if you have any feedback on the direction.',
  revision: 'Changes made:\n- \n- \n- ',
  final_mix: 'Final mix completed per your specifications. Ready for your approval.',
  master: 'Mastered to streaming standards (-14 LUFS). Ready for distribution.',
  stems_package: 'Individual stems exported at the same settings as the final mix.',
};

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

  // Auto-fill notes template when delivery type changes
  const handleDeliveryTypeChange = (value: string) => {
    setDeliveryType(value);
    if (!notes.trim()) {
      setNotes(NOTES_TEMPLATES[value as keyof typeof NOTES_TEMPLATES] || '');
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
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">📤</span>
          Upload Mix for Review
        </h3>
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
        <label className="text-sm font-medium mb-2 block">Mix Version</label>
        <Select value={deliveryType} onValueChange={handleDeliveryTypeChange}>
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DELIVERY_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex flex-col items-start py-1">
                  <span className="font-medium">{type.label}</span>
                  <span className="text-xs text-muted-foreground">{type.description}</span>
                </div>
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
          placeholder="What should the artist know about this version?"
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Be specific about changes made or areas that need feedback
        </p>
      </div>

      {/* Quality Check Preview */}
      {selectedFile && (
        <div className="rounded-lg border border-success/20 bg-success/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✅</span>
            <h4 className="font-semibold text-sm">Quality Check</h4>
          </div>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>File Format:</span>
              <span className="text-foreground font-medium">{selectedFile.name.split('.').pop()?.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>File Size:</span>
              <span className="text-foreground font-medium">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <p className="text-xs pt-2 border-t border-success/20 mt-2">
              💡 Artist will receive instant notification when upload completes
            </p>
          </div>
        </div>
      )}

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