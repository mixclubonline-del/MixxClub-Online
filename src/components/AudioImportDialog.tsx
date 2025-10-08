import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  X, 
  Play, 
  Pause, 
  FileAudio, 
  Clock, 
  Music,
  Trash2,
  Download 
} from "lucide-react";
import { useAudioImport } from "@/hooks/useAudioImport.ts";
import { useToast } from "@/hooks/use-toast";

interface ImportedAudioFile {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  duration?: number;
  sampleRate?: number;
  channels?: number;
  url?: string;
  blob?: Blob;
}

interface AudioImportDialogProps {
  sessionId: string;
  onImportComplete: (file: ImportedAudioFile) => void;
  onClose: () => void;
}

const AudioImportDialog: React.FC<AudioImportDialogProps> = ({
  sessionId,
  onImportComplete,
  onClose
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewingFile, setPreviewingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  
  const {
    importAudioFile,
    getImportedFiles,
    deleteImportedFile,
    analyzeBPM,
    isUploading,
    uploadProgress
  } = useAudioImport(sessionId);

  const [importedFiles, setImportedFiles] = useState<ImportedAudioFile[]>([]);

  // Load imported files on mount
  useEffect(() => {
    getImportedFiles().then(setImportedFiles);
  }, [getImportedFiles]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Import all dropped files
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        await handleFileImport(file);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Import all selected files
      const files = Array.from(e.target.files);
      for (const file of files) {
        await handleFileImport(file);
      }
    }
  };

  const handleFileImport = async (file: File) => {
    try {
      const importedFile = await importAudioFile(file);
      
      // Refresh the imported files list first
      const updatedFiles = await getImportedFiles();
      setImportedFiles(updatedFiles);
      
      // Show success message
      toast({
        title: "File uploaded!",
        description: `${file.name} is ready. Click "Add to Session" to use it.`,
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const togglePreview = (fileUrl: string | undefined, fileName: string) => {
    if (!fileUrl) {
      toast({
        title: "Preview unavailable",
        description: "Audio file URL not available for preview",
        variant: "destructive"
      });
      return;
    }

    if (previewingFile === fileName) {
      // Stop current preview
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPreviewingFile(null);
    } else {
      // Start new preview
      setPreviewingFile(fileName);
      if (audioRef.current) {
        audioRef.current.src = fileUrl;
        audioRef.current.play();
      }
    }
  };

  const handleDeleteFile = async (fileId: string, filePath: string, fileName: string) => {
    try {
      await deleteImportedFile(fileId, filePath);
      
      // Stop preview if this file is currently playing
      if (previewingFile === fileName) {
        setPreviewingFile(null);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
      
      // Refresh the list
      const updatedFiles = await getImportedFiles();
      setImportedFiles(updatedFiles);
    } catch (error) {
      // Error handled in hook
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] bg-background border-border shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Import Audio Files</h2>
            <p className="text-muted-foreground mt-1">
              Upload beats, loops, and samples to your session
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
              multiple
            />
            
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isUploading ? 'Uploading...' : 'Drop audio files here'}
                </h3>
                <p className="text-muted-foreground">
                  Or click to browse • MP3, WAV, FLAC, AAC, OGG • Max 50MB
                </p>
              </div>

              {isUploading && (
                <div className="max-w-xs mx-auto space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress}% uploaded
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Imported Files List */}
          {importedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Imports</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {importedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileAudio className="w-5 h-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.fileName}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(file.duration)}
                        </span>
                        <span>{formatFileSize(file.fileSize)}</span>
                        {file.sampleRate && (
                          <span>{file.sampleRate}Hz</span>
                        )}
                        {file.channels && (
                          <Badge variant="secondary" className="text-xs">
                            {file.channels === 1 ? 'Mono' : 'Stereo'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePreview(file.url, file.fileName)}
                        className="hover:bg-primary/10"
                      >
                        {previewingFile === file.fileName ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          onImportComplete(file);
                          // Parent will close dialog after successful import
                        }}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Add to Session
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id, file.filePath, file.fileName)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hidden audio element for preview */}
        <audio ref={audioRef} />
      </Card>
    </div>
  );
};

export default AudioImportDialog;