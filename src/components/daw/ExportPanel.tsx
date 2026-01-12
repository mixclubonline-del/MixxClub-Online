/**
 * ExportPanel - DAW Export Dialog
 * 
 * Allows producers to export their projects as WAV/MP3
 * with format selection, quality options, and progress tracking.
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Download, FileAudio, Loader2, Check, AlertCircle, Radio } from 'lucide-react';
import { audioEngine } from '@/services/audioEngine';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { audioBufferToWav, downloadBlob, estimateFileSize, formatFileSize, formatDuration } from '@/lib/audioExport';
import { useToast } from '@/hooks/use-toast';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'wav-24' | 'wav-16' | 'wav-32';
type ExportState = 'idle' | 'rendering' | 'encoding' | 'complete' | 'error';

export function ExportPanel({ isOpen, onClose }: ExportPanelProps) {
  const { toast } = useToast();
  const tracks = useAIStudioStore(s => s.tracks);
  
  const [format, setFormat] = useState<ExportFormat>('wav-24');
  const [normalize, setNormalize] = useState(true);
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Calculate project duration from tracks
  const projectDuration = tracks.reduce((max, track) => {
    const trackEnd = (track.regions || []).reduce((end, region) => {
      return Math.max(end, region.startTime + region.duration);
    }, 0);
    return Math.max(max, trackEnd);
  }, 0);
  
  // Parse bit depth from format
  const bitDepth = format === 'wav-16' ? 16 : format === 'wav-32' ? 32 : 24;
  
  // Estimate file size
  const estimatedSize = estimateFileSize(projectDuration || 60, 48000, 2, bitDepth);
  
  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setExportState('idle');
      setProgress(0);
      setErrorMessage(null);
    }
  }, [isOpen]);
  
  const handleExport = async () => {
    if (projectDuration <= 0) {
      toast({
        title: "Nothing to Export",
        description: "Add some audio to your tracks first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setExportState('rendering');
      setProgress(10);
      
      // Render offline using audioEngine
      const renderedBuffer = await audioEngine.renderOffline(projectDuration);
      
      if (!renderedBuffer) {
        throw new Error('Offline render returned null');
      }
      
      setProgress(70);
      setExportState('encoding');
      
      // Encode to WAV
      const wavBlob = audioBufferToWav(renderedBuffer, {
        bitDepth,
        normalize
      });
      
      setProgress(90);
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `mixclub-export-${timestamp}.wav`;
      
      // Download
      downloadBlob(wavBlob, filename);
      
      setProgress(100);
      setExportState('complete');
      
      toast({
        title: "Export Complete!",
        description: `Downloaded ${filename}`,
      });
      
    } catch (error) {
      console.error('[ExportPanel] Export failed:', error);
      setExportState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Export failed');
      
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-primary" />
            Export Project
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Project Info */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium">Project Duration</p>
              <p className="text-2xl font-bold">{formatDuration(projectDuration)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Tracks</p>
              <p className="text-2xl font-bold">{tracks.length}</p>
            </div>
          </div>
          
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wav-24" id="wav-24" />
                <Label htmlFor="wav-24" className="cursor-pointer flex-1">
                  <span className="font-medium">WAV 24-bit</span>
                  <span className="text-xs text-muted-foreground ml-2">Professional standard</span>
                </Label>
                <Badge variant="secondary">Recommended</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wav-16" id="wav-16" />
                <Label htmlFor="wav-16" className="cursor-pointer flex-1">
                  <span className="font-medium">WAV 16-bit</span>
                  <span className="text-xs text-muted-foreground ml-2">CD quality</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wav-32" id="wav-32" />
                <Label htmlFor="wav-32" className="cursor-pointer flex-1">
                  <span className="font-medium">WAV 32-bit Float</span>
                  <span className="text-xs text-muted-foreground ml-2">Maximum headroom</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Options */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Normalize</Label>
              <p className="text-xs text-muted-foreground">Maximize volume to 0dB peak</p>
            </div>
            <Switch checked={normalize} onCheckedChange={setNormalize} />
          </div>
          
          {/* File Size Estimate */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated file size</span>
            <span className="font-medium">{formatFileSize(estimatedSize)}</span>
          </div>
          
          {/* Progress */}
          {(exportState === 'rendering' || exportState === 'encoding') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {exportState === 'rendering' ? 'Rendering audio...' : 'Encoding WAV...'}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
          
          {/* Complete State */}
          {exportState === 'complete' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-500">
              <Check className="w-5 h-5" />
              <span className="font-medium">Export complete! Check your downloads folder.</span>
            </div>
          )}
          
          {/* Error State */}
          {exportState === 'error' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{errorMessage || 'Export failed'}</span>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {exportState === 'complete' ? 'Done' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={exportState === 'rendering' || exportState === 'encoding' || projectDuration <= 0}
            className="gap-2"
          >
            {exportState === 'rendering' || exportState === 'encoding' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export WAV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
