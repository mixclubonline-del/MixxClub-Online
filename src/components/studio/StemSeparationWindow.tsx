import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Music, 
  Mic2, 
  Drum, 
  Guitar, 
  Waves,
  Download,
  Play,
  Pause,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { audioEngine } from '@/services/audioEngine';
import { WaveformGenerator } from '@/services/waveformGenerator';

interface StemResult {
  stemType: string;
  stemName: string;
  url: string;
  audioBuffer?: AudioBuffer;
  isPlaying?: boolean;
}

interface StemSeparationWindowProps {
  onClose: () => void;
  onStemsProcessed: (stems: Array<{ stemType: string; stemName: string; filePath: string }>) => Promise<void>;
}

const STEM_OPTIONS = [
  { id: 'vocals', label: 'Vocals', icon: Mic2, color: 'text-pink-400' },
  { id: 'drums', label: 'Drums', icon: Drum, color: 'text-orange-400' },
  { id: 'bass', label: 'Bass', icon: Waves, color: 'text-blue-400' },
  { id: 'other', label: 'Other', icon: Guitar, color: 'text-green-400' },
  { id: 'melody', label: 'Melody', icon: Music, color: 'text-purple-400' },
];

export const StemSeparationWindow = ({ onClose, onStemsProcessed }: StemSeparationWindowProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const stemAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  
  // File state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  
  // Separation config
  const [selectedStems, setSelectedStems] = useState<Set<string>>(new Set(['vocals', 'drums', 'bass', 'other']));
  const [model, setModel] = useState<'htdemucs' | 'htdemucs_ft'>('htdemucs');
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [stems, setStems] = useState<StemResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Drag and drop
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an audio file (MP3, WAV, FLAC, etc.)',
        variant: 'destructive'
      });
      return;
    }
    
    setAudioFile(file);
    setError(null);
    setStems([]);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    // Get duration
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration);
    };
    audioPreviewRef.current = audio;
  }, [toast]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const toggleStem = (stemId: string) => {
    setSelectedStems(prev => {
      const next = new Set(prev);
      if (next.has(stemId)) {
        next.delete(stemId);
      } else {
        next.add(stemId);
      }
      return next;
    });
  };
  
  const togglePreview = () => {
    if (!audioPreviewRef.current) return;
    
    if (isPreviewPlaying) {
      audioPreviewRef.current.pause();
    } else {
      audioPreviewRef.current.play();
    }
    setIsPreviewPlaying(!isPreviewPlaying);
  };
  
  const processStemSeparation = async () => {
    if (!audioFile || selectedStems.size === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    setStatusMessage('Uploading audio...');
    setError(null);
    
    try {
      // Convert file to base64 for edge function
      const arrayBuffer = await audioFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      // Create a temporary URL (in production, upload to storage first)
      const audioDataUrl = `data:${audioFile.type};base64,${base64}`;
      
      setProgress(20);
      setStatusMessage('Sending to AI processor...');
      
      // Call edge function
      const { data, error: fnError } = await supabase.functions.invoke('stem-separation', {
        body: {
          audioUrl: audioDataUrl,
          stems: Array.from(selectedStems),
          model
        }
      });
      
      if (fnError) {
        throw new Error(fnError.message || 'Stem separation failed');
      }
      
      setProgress(50);
      setStatusMessage('Processing stems...');
      
      // Handle async job polling or immediate results
      if (data.status === 'processing' && data.predictionId) {
        // Poll for completion
        await pollForCompletion(data.predictionId);
      } else if (data.stems) {
        // Immediate results
        await processResults(data.stems);
      } else if (data.error) {
        throw new Error(data.error);
      }
      
    } catch (err) {
      console.error('[StemSeparation] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: 'Separation Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const pollForCompletion = async (predictionId: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      setProgress(50 + Math.min(40, attempts));
      setStatusMessage(`Processing... (${attempts * 5}s elapsed)`);
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const { data, error } = await supabase.functions.invoke('stem-separation', {
        body: { checkStatus: predictionId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.status === 'succeeded' && data.stems) {
        await processResults(data.stems);
        return;
      } else if (data.status === 'failed') {
        throw new Error(data.error || 'Processing failed');
      }
    }
    
    throw new Error('Processing timed out');
  };
  
  const processResults = async (stemUrls: Record<string, string>) => {
    setProgress(90);
    setStatusMessage('Decoding stems...');
    
    const results: StemResult[] = [];
    
    for (const [stemType, url] of Object.entries(stemUrls)) {
      const stemOption = STEM_OPTIONS.find(s => s.id === stemType);
      results.push({
        stemType,
        stemName: stemOption?.label || stemType,
        url,
        isPlaying: false
      });
    }
    
    setStems(results);
    setProgress(100);
    setStatusMessage('Complete!');
    
    toast({
      title: 'Stems Separated!',
      description: `Successfully extracted ${results.length} stems`,
    });
  };
  
  const toggleStemPlayback = (stemType: string) => {
    const audio = stemAudioRefs.current.get(stemType);
    const stem = stems.find(s => s.stemType === stemType);
    
    if (!audio || !stem) return;
    
    if (stem.isPlaying) {
      audio.pause();
    } else {
      // Pause all others
      stemAudioRefs.current.forEach((a, type) => {
        if (type !== stemType) {
          a.pause();
        }
      });
      audio.play();
    }
    
    setStems(prev => prev.map(s => ({
      ...s,
      isPlaying: s.stemType === stemType ? !s.isPlaying : false
    })));
  };
  
  const importStemToTimeline = async (stem: StemResult) => {
    try {
      await onStemsProcessed([{
        stemType: stem.stemType,
        stemName: stem.stemName,
        filePath: stem.url
      }]);
      
      toast({
        title: 'Stem Imported',
        description: `${stem.stemName} added to timeline`,
      });
    } catch (err) {
      toast({
        title: 'Import Failed',
        description: 'Could not add stem to timeline',
        variant: 'destructive'
      });
    }
  };
  
  const importAllStems = async () => {
    try {
      await onStemsProcessed(stems.map(s => ({
        stemType: s.stemType,
        stemName: s.stemName,
        filePath: s.url
      })));
      
      toast({
        title: 'All Stems Imported',
        description: `${stems.length} stems added to timeline`,
      });
      
      onClose();
    } catch (err) {
      toast({
        title: 'Import Failed',
        description: 'Could not add stems to timeline',
        variant: 'destructive'
      });
    }
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] overflow-hidden bg-background rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Waves className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Stem Separation</h2>
            <p className="text-sm text-muted-foreground">Extract vocals, drums, bass & more</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* File Upload Area */}
        {!audioFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
              ${isDragging 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }
            `}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop audio file here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <Badge variant="secondary">MP3, WAV, FLAC, OGG supported</Badge>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>
        ) : (
          <>
            {/* File Preview */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={togglePreview}
                  disabled={isProcessing}
                >
                  {isPreviewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{audioFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(audioDuration)} • {(audioFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAudioFile(null);
                    setAudioUrl(null);
                    setStems([]);
                  }}
                  disabled={isProcessing}
                >
                  Change
                </Button>
              </div>
            </Card>
            
            {/* Stem Selection */}
            {stems.length === 0 && (
              <>
                <div>
                  <Label className="text-sm font-medium mb-3 block">Select stems to extract</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {STEM_OPTIONS.map((stem) => {
                      const Icon = stem.icon;
                      const isSelected = selectedStems.has(stem.id);
                      
                      return (
                        <button
                          key={stem.id}
                          onClick={() => toggleStem(stem.id)}
                          disabled={isProcessing}
                          className={`
                            p-4 rounded-lg border-2 transition-all text-center
                            ${isSelected 
                              ? 'border-primary bg-primary/10' 
                              : 'border-transparent bg-muted hover:bg-muted/80'
                            }
                            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? stem.color : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${isSelected ? '' : 'text-muted-foreground'}`}>
                            {stem.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Model Selection */}
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium">Quality</Label>
                  <Select value={model} onValueChange={(v) => setModel(v as typeof model)} disabled={isProcessing}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="htdemucs">Fast (htdemucs)</SelectItem>
                      <SelectItem value="htdemucs_ft">High Quality (htdemucs_ft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            {/* Processing Progress */}
            {isProcessing && (
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="font-medium">{statusMessage}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2 text-right">{progress}%</p>
              </Card>
            )}
            
            {/* Error Display */}
            {error && (
              <Card className="p-4 border-destructive/50 bg-destructive/10">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Separation Failed</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Results */}
            {stems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Stems Ready</span>
                  </div>
                  <Button onClick={importAllStems} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Import All to Timeline
                  </Button>
                </div>
                
                <div className="grid gap-3">
                  {stems.map((stem) => {
                    const stemOption = STEM_OPTIONS.find(s => s.id === stem.stemType);
                    const Icon = stemOption?.icon || Music;
                    
                    return (
                      <Card key={stem.stemType} className="p-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleStemPlayback(stem.stemType)}
                          >
                            {stem.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <div className={`p-2 rounded-lg bg-muted ${stemOption?.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="flex-1 font-medium">{stem.stemName}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => importStemToTimeline(stem)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a href={stem.url} download={`${stem.stemName}.wav`}>
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                        {/* Hidden audio element for playback */}
                        <audio
                          ref={(el) => {
                            if (el) stemAudioRefs.current.set(stem.stemType, el);
                          }}
                          src={stem.url}
                          onEnded={() => {
                            setStems(prev => prev.map(s => 
                              s.stemType === stem.stemType ? { ...s, isPlaying: false } : s
                            ));
                          }}
                        />
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {audioFile && stems.length === 0 && (
          <Button 
            onClick={processStemSeparation}
            disabled={isProcessing || selectedStems.size === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Waves className="w-4 h-4 mr-2" />
                Separate Stems ({selectedStems.size})
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
