import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Scissors, Music2, Mic, Drum, Guitar, Loader2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StemSeparationProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StemResult {
  type: string;
  url: string;
  duration: number;
  channels: number;
  sampleRate: number;
}

const STEM_OPTIONS = [
  { id: 'vocals', label: 'Vocals', icon: Mic },
  { id: 'drums', label: 'Drums', icon: Drum },
  { id: 'bass', label: 'Bass', icon: Music2 },
  { id: 'other', label: 'Other', icon: Guitar },
];

export const StemSeparation = ({ isOpen, onClose }: StemSeparationProps) => {
  const [selectedStems, setSelectedStems] = useState<string[]>(['vocals', 'drums', 'bass', 'other']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<StemResult[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        setResults([]);
        toast.success(`Selected: ${file.name}`);
      } else {
        toast.error('Please select an audio file');
      }
    }
  };

  const toggleStem = (stemId: string) => {
    setSelectedStems(prev =>
      prev.includes(stemId)
        ? prev.filter(id => id !== stemId)
        : [...prev, stemId]
    );
  };

  const processStemSeparation = async () => {
    if (!audioFile) {
      toast.error('Please select an audio file first');
      return;
    }

    if (selectedStems.length === 0) {
      toast.error('Please select at least one stem type');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 30; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // In production, upload to Supabase Storage first
      const audioUrl = URL.createObjectURL(audioFile);

      setProgress(40);

      // Call stem separation function
      const { data, error } = await supabase.functions.invoke('stem-separation', {
        body: {
          audioUrl,
          stems: selectedStems
        }
      });

      if (error) throw error;

      // Simulate processing progress
      for (let i = 40; i <= 90; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setProgress(100);
      setResults(data.stems);
      toast.success(`Separated into ${data.stems.length} stems!`);

    } catch (error) {
      console.error('Stem separation error:', error);
      toast.error('Failed to separate stems');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">AI Stem Separation</h3>
          </div>
        </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label>Audio File</Label>
        <div className="flex gap-2">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
            id="stem-audio-upload"
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById('stem-audio-upload')?.click()}
          >
            {audioFile ? audioFile.name : 'Select Audio File'}
          </Button>
        </div>
      </div>

      {/* Stem Selection */}
      <div className="space-y-2">
        <Label>Select Stems to Extract</Label>
        <div className="grid grid-cols-2 gap-3">
          {STEM_OPTIONS.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleStem(id)}
            >
              <Checkbox
                checked={selectedStems.includes(id)}
                onCheckedChange={() => toggleStem(id)}
              />
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Process Button */}
      <Button
        onClick={processStemSeparation}
        disabled={isProcessing || !audioFile}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Scissors className="w-4 h-4 mr-2" />
            Separate Stems
          </>
        )}
      </Button>

      {/* Progress */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Processing with AI...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <Label>Separated Stems</Label>
          <div className="space-y-2">
            {results.map((stem, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
              >
                <div className="flex items-center gap-2">
                  {STEM_OPTIONS.find(opt => opt.id === stem.type)?.icon && (
                    <div className="p-2 rounded bg-primary/10">
                      {(() => {
                        const Icon = STEM_OPTIONS.find(opt => opt.id === stem.type)!.icon;
                        return <Icon className="w-4 h-4 text-primary" />;
                      })()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium capitalize">{stem.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {stem.duration}s • {stem.sampleRate / 1000}kHz
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
};
