/**
 * AI Beat Generator - Suno integration for genre-specific beat generation
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Music, Loader2, Play, Pause, Download, Plus, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedBeat {
  id: string;
  url: string;
  title: string;
  genre: string;
  bpm: number;
  duration: number;
}

interface GenreConfig {
  id: string;
  name: string;
  defaultBpm: number;
  prompt: string;
  moodOptions: string[];
}

const GENRE_CONFIGS: GenreConfig[] = [
  {
    id: 'trap',
    name: 'Trap',
    defaultBpm: 140,
    prompt: 'Hard trap beat, heavy 808 bass, rolling hi-hats, dark atmosphere',
    moodOptions: ['aggressive', 'dark', 'melodic', 'bouncy'],
  },
  {
    id: 'drill',
    name: 'UK Drill',
    defaultBpm: 140,
    prompt: 'UK drill beat, sliding 808s, aggressive, minor key, dark pads',
    moodOptions: ['aggressive', 'dark', 'menacing', 'cold'],
  },
  {
    id: 'rnb',
    name: 'R&B',
    defaultBpm: 90,
    prompt: 'Smooth R&B beat, warm pads, subtle drums, soulful melodies',
    moodOptions: ['smooth', 'sensual', 'emotional', 'late night'],
  },
  {
    id: 'reggaeton',
    name: 'Reggaeton',
    defaultBpm: 95,
    prompt: 'Reggaeton dembow beat, Latin percussion, tropical vibes',
    moodOptions: ['party', 'tropical', 'sensual', 'aggressive'],
  },
  {
    id: 'afrobeat',
    name: 'Afrobeat',
    defaultBpm: 105,
    prompt: 'Afrobeat, log drums, uplifting, danceable, African percussion',
    moodOptions: ['uplifting', 'danceable', 'joyful', 'groovy'],
  },
];

interface AIBeatGeneratorProps {
  onImportBeat?: (beat: GeneratedBeat) => void;
  onClose?: () => void;
}

export const AIBeatGenerator: React.FC<AIBeatGeneratorProps> = ({ onImportBeat, onClose }) => {
  const { toast } = useToast();
  
  // State
  const [selectedGenre, setSelectedGenre] = useState<string>('trap');
  const [bpm, setBpm] = useState(140);
  const [mood, setMood] = useState<string>('');
  const [energy, setEnergy] = useState(75);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBeats, setGeneratedBeats] = useState<GeneratedBeat[]>([]);
  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  
  // Get current genre config
  const genreConfig = GENRE_CONFIGS.find(g => g.id === selectedGenre) || GENRE_CONFIGS[0];
  
  // Handle genre change
  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    const config = GENRE_CONFIGS.find(g => g.id === genre);
    if (config) {
      setBpm(config.defaultBpm);
      setMood(config.moodOptions[0] || '');
    }
  };
  
  // Build the full prompt
  const buildPrompt = (): string => {
    let prompt = genreConfig.prompt;
    
    if (mood) {
      prompt += `, ${mood} mood`;
    }
    
    if (energy > 75) {
      prompt += ', high energy, intense';
    } else if (energy < 40) {
      prompt += ', mellow, laid back';
    }
    
    prompt += `, ${bpm} BPM`;
    
    return prompt;
  };
  
  // Generate beat
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const prompt = buildPrompt();
      
      toast({
        title: "Generating Beat...",
        description: `Creating ${genreConfig.name} beat at ${bpm} BPM`,
      });
      
      // Call the generate-music edge function
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          prompt,
          duration: 30,
          genre: selectedGenre,
        },
      });
      
      if (error) throw error;
      
      if (data?.audioUrl) {
        const newBeat: GeneratedBeat = {
          id: `beat-${Date.now()}`,
          url: data.audioUrl,
          title: `${genreConfig.name} Beat ${generatedBeats.length + 1}`,
          genre: selectedGenre,
          bpm,
          duration: 30,
        };
        
        setGeneratedBeats(prev => [newBeat, ...prev]);
        
        toast({
          title: "Beat Generated!",
          description: "Your AI-generated beat is ready to preview",
        });
      } else {
        throw new Error('No audio URL returned');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate beat",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Play/pause beat preview
  const togglePlayBeat = (beat: GeneratedBeat) => {
    if (playingBeatId === beat.id) {
      audioRef?.pause();
      setPlayingBeatId(null);
    } else {
      if (audioRef) {
        audioRef.pause();
      }
      
      const audio = new Audio(beat.url);
      audio.play();
      audio.onended = () => setPlayingBeatId(null);
      
      setAudioRef(audio);
      setPlayingBeatId(beat.id);
    }
  };
  
  // Import beat to timeline
  const handleImport = (beat: GeneratedBeat) => {
    if (onImportBeat) {
      onImportBeat(beat);
      toast({
        title: "Beat Imported!",
        description: `${beat.title} added to timeline`,
      });
    }
  };
  
  return (
    <Card className="p-6 bg-gradient-to-b from-background to-background/80 border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold">AI Beat Generator</h3>
            <p className="text-xs text-muted-foreground">Powered by Suno AI</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        )}
      </div>
      
      {/* Genre Selection */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Genre</label>
          <div className="flex flex-wrap gap-2">
            {GENRE_CONFIGS.map(genre => (
              <Button
                key={genre.id}
                variant={selectedGenre === genre.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenreChange(genre.id)}
                className="rounded-full"
              >
                {genre.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* BPM */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-muted-foreground">BPM</label>
            <span className="text-sm font-mono text-primary">{bpm}</span>
          </div>
          <Slider
            value={[bpm]}
            onValueChange={([v]) => setBpm(v)}
            min={60}
            max={180}
            step={1}
            className="w-full"
          />
        </div>
        
        {/* Mood */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Mood</label>
          <Select value={mood} onValueChange={setMood}>
            <SelectTrigger>
              <SelectValue placeholder="Select mood" />
            </SelectTrigger>
            <SelectContent>
              {genreConfig.moodOptions.map(m => (
                <SelectItem key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Energy */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-muted-foreground">Energy</label>
            <span className="text-sm font-mono text-primary">{energy}%</span>
          </div>
          <Slider
            value={[energy]}
            onValueChange={([v]) => setEnergy(v)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Generate Button */}
      <Button
        className="w-full mb-6"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Beat
          </>
        )}
      </Button>
      
      {/* Generated Beats List */}
      {generatedBeats.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Generated Beats</h4>
          
          {generatedBeats.map(beat => (
            <div
              key={beat.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => togglePlayBeat(beat)}
              >
                {playingBeatId === beat.id ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{beat.title}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {beat.bpm} BPM
                  </Badge>
                  <span className="text-xs text-muted-foreground capitalize">
                    {beat.genre}
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleImport(beat)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
