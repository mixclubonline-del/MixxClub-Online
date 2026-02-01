/**
 * ExportPanel - DAW Export Dialog
 * 
 * Allows producers to export their projects as WAV/MP3
 * with format selection, quality options, cloud save, and progress tracking.
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, FileAudio, Loader2, Check, AlertCircle, Cloud, Share2, Sparkles } from 'lucide-react';
import { audioEngine } from '@/services/audioEngine';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { audioBufferToWav, downloadBlob, estimateFileSize, formatFileSize, formatDuration } from '@/lib/audioExport';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCreateExport } from '@/hooks/useExportedTracks';
import { useFlowNavigation } from '@/core/fabric/useFlow';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'wav-24' | 'wav-16' | 'wav-32';
type ExportState = 'idle' | 'rendering' | 'encoding' | 'uploading' | 'complete' | 'error';

export function ExportPanel({ isOpen, onClose }: ExportPanelProps) {
  const { navigateTo } = useFlowNavigation();
  const { toast } = useToast();
  const { user } = useAuth();
  const tracks = useAIStudioStore(s => s.tracks);
  const createExport = useCreateExport();
  
  const [format, setFormat] = useState<ExportFormat>('wav-24');
  const [normalize, setNormalize] = useState(true);
  const [saveToCloud, setSaveToCloud] = useState(true);
  const [trackTitle, setTrackTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exportedToCloud, setExportedToCloud] = useState(false);
  
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
      setExportedToCloud(false);
      // Generate default title
      const timestamp = new Date().toISOString().slice(0, 10);
      setTrackTitle(`MixClub Export ${timestamp}`);
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
      
      setProgress(50);
      setExportState('encoding');
      
      // Encode to WAV
      const wavBlob = audioBufferToWav(renderedBuffer, {
        bitDepth,
        normalize
      });
      
      setProgress(70);
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const safeTitle = trackTitle.replace(/[^a-zA-Z0-9]/g, '-') || 'export';
      const filename = `${safeTitle}-${timestamp}.wav`;
      
      // Cloud save if enabled and user is logged in
      if (saveToCloud && user) {
        setExportState('uploading');
        setProgress(80);
        
        await createExport.mutateAsync({
          title: trackTitle || 'Untitled Export',
          genre: genre || undefined,
          durationSeconds: projectDuration,
          bitDepth,
          sampleRate: 48000,
          audioBlob: wavBlob
        });
        
        setExportedToCloud(true);
      }
      
      // Always download locally
      downloadBlob(wavBlob, filename);
      
      setProgress(100);
      setExportState('complete');
      
      toast({
        title: "Export Complete!",
        description: saveToCloud && user 
          ? `Downloaded ${filename} and saved to cloud`
          : `Downloaded ${filename}`,
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
  
  const handleDistributeNow = () => {
    onClose();
    navigateTo('/distribution');
  };
  
  const handleAIMaster = () => {
    onClose();
    navigateTo('/ai-mastering');
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
          
          {/* Track Title (for cloud save) */}
          {user && (
            <div className="space-y-2">
              <Label htmlFor="track-title">Track Title</Label>
              <Input
                id="track-title"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="Enter track title..."
              />
            </div>
          )}
          
          {/* Genre (for cloud save) */}
          {user && saveToCloud && (
            <div className="space-y-2">
              <Label htmlFor="genre">Genre (optional)</Label>
              <Input
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g., Trap, R&B, Drill..."
              />
            </div>
          )}
          
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Normalize</Label>
                <p className="text-xs text-muted-foreground">Maximize volume to 0dB peak</p>
              </div>
              <Switch checked={normalize} onCheckedChange={setNormalize} />
            </div>
            
            {user && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-primary" />
                    Save to MixClub Cloud
                  </Label>
                  <p className="text-xs text-muted-foreground">Enable one-click distribution</p>
                </div>
                <Switch checked={saveToCloud} onCheckedChange={setSaveToCloud} />
              </div>
            )}
          </div>
          
          {/* File Size Estimate */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated file size</span>
            <span className="font-medium">{formatFileSize(estimatedSize)}</span>
          </div>
          
          {/* Progress */}
          {(exportState === 'rendering' || exportState === 'encoding' || exportState === 'uploading') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {exportState === 'rendering' && 'Rendering audio...'}
                  {exportState === 'encoding' && 'Encoding WAV...'}
                  {exportState === 'uploading' && 'Uploading to cloud...'}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
          
          {/* Complete State */}
          {exportState === 'complete' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-500">
                <Check className="w-5 h-5" />
                <span className="font-medium">
                  {exportedToCloud 
                    ? 'Export complete & saved to cloud!' 
                    : 'Export complete! Check your downloads folder.'}
                </span>
              </div>
              
              {/* Post-export actions for cloud saves */}
              {exportedToCloud && (
                <div className="flex gap-2">
                  <Button onClick={handleDistributeNow} className="flex-1 gap-2">
                    <Share2 className="w-4 h-4" />
                    Distribute Now
                  </Button>
                  <Button variant="outline" onClick={handleAIMaster} className="flex-1 gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Master First
                  </Button>
                </div>
              )}
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
          {exportState !== 'complete' && (
            <Button 
              onClick={handleExport} 
              disabled={exportState === 'rendering' || exportState === 'encoding' || exportState === 'uploading' || projectDuration <= 0}
              className="gap-2"
            >
              {(exportState === 'rendering' || exportState === 'encoding' || exportState === 'uploading') ? (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
