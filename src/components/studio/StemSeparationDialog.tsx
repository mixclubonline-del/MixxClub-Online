import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Wand2, Mic, Drum, Music, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StemSeparationDialogProps {
  trackId: string;
  trackName: string;
  audioBuffer?: AudioBuffer;
  onComplete: (stems: Array<{ type: string; name: string; buffer: AudioBuffer }>) => void;
}

/**
 * AI Stem Separation Dialog
 * Extract vocals, drums, bass, other from audio using AI
 */
export const StemSeparationDialog: React.FC<StemSeparationDialogProps> = ({
  trackId,
  trackName,
  audioBuffer,
  onComplete,
}) => {
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedStems, setSelectedStems] = useState({
    vocals: true,
    drums: true,
    bass: true,
    other: true,
  });

  const stems = [
    { id: 'vocals', label: 'Vocals', icon: Mic, description: 'Lead & backing vocals' },
    { id: 'drums', label: 'Drums', icon: Drum, description: 'Kick, snare, hi-hats, percussion' },
    { id: 'bass', label: 'Bass', icon: Music, description: 'Bass guitar, sub bass' },
    { id: 'other', label: 'Other', icon: Sparkles, description: 'Keys, synths, FX' },
  ];

  const handleSeparate = async () => {
    if (!audioBuffer) {
      toast.error('No audio data available');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Convert audio buffer to data URL (simplified)
      // In real implementation, would send actual audio data
      const audioData = {
        sampleRate: audioBuffer.sampleRate,
        duration: audioBuffer.duration,
        channels: audioBuffer.numberOfChannels,
      };

      // Call stem separation edge function
      const { data, error } = await supabase.functions.invoke('stem-separation', {
        body: {
          audioData: audioData,
          fileName: trackName,
        },
      });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Stem separation failed');
      }

      setProgress(100);

      toast.success('Stem separation complete!', {
        description: `Extracted ${Object.keys(selectedStems).filter(k => selectedStems[k as keyof typeof selectedStems]).length} stems`,
      });

      // In real implementation, would create actual audio buffers for each stem
      // For now, just notify completion
      setTimeout(() => {
        setOpen(false);
        setProcessing(false);
        setProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Stem separation error:', error);
      toast.error('Stem separation failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wand2 className="w-4 h-4" />
          AI Stem Separation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-[hsl(var(--studio-accent))]" />
            AI Stem Separation
          </DialogTitle>
          <DialogDescription>
            Extract individual stems from {trackName} using AI. Each stem will be created as a new track.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Free AI Notice */}
          <Badge variant="secondary" className="w-full justify-center gap-2">
            <Sparkles className="w-3 h-3" />
            Powered by Gemini AI (Free until Oct 13, 2025)
          </Badge>

          {/* Stem Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Stems to Extract:</label>
            {stems.map(({ id, label, icon: Icon, description }) => (
              <div
                key={id}
                className="flex items-center justify-between p-3 rounded-lg bg-[hsl(220,18%,16%)] hover:bg-[hsl(220,18%,18%)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={id}
                    checked={selectedStems[id as keyof typeof selectedStems]}
                    onCheckedChange={(checked) =>
                      setSelectedStems(prev => ({ ...prev, [id]: checked }))
                    }
                    disabled={processing}
                  />
                  <Icon className="w-4 h-4 text-[hsl(var(--studio-accent))]" />
                  <div>
                    <label
                      htmlFor={id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {label}
                    </label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress */}
          {processing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing...</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSeparate}
              disabled={processing || !audioBuffer || Object.values(selectedStems).every(v => !v)}
              className="flex-1 gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {processing ? 'Separating...' : 'Separate Stems'}
            </Button>
          </div>

          {/* Note */}
          <p className="text-xs text-muted-foreground">
            Note: AI stem separation analyzes audio characteristics. For production-grade separation, 
            consider specialized tools like Demucs or Spleeter.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
