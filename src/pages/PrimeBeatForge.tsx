import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Music, Drum, Play, Pause, Download, Trash2,
  Star, Loader2, Volume2, Wand2, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useDemoBeats, DemoBeat } from '@/hooks/useDemoBeats';
import { cn } from '@/lib/utils';

const GENRES = ['trap', 'hiphop', 'rnb', 'drill', 'lofi', 'boom-bap'];
const MOODS = ['energetic', 'dark', 'melodic', 'aggressive', 'chill', 'triumphant'];

const PRIME_PROMPTS = [
  { label: 'Metro Boomin Style', prompt: 'Dark atmospheric trap with heavy 808s, haunting melodies, and crisp hi-hats', genre: 'trap', mood: 'dark' },
  { label: 'DJ Mustard Style', prompt: 'West coast bounce with claps, synth stabs, and that signature ratchet sound', genre: 'hiphop', mood: 'energetic' },
  { label: 'Southside/808 Mafia', prompt: 'Hard hitting 808s, aggressive synths, dark pads, trap anthem vibes', genre: 'trap', mood: 'aggressive' },
  { label: 'Zaytoven Church Organs', prompt: 'Soulful church organ melodies over trap drums, Atlanta classic sound', genre: 'trap', mood: 'melodic' },
  { label: 'UK Drill', prompt: 'Dark sliding 808s, aggressive hi-hats, minor key melodies, London drill energy', genre: 'drill', mood: 'dark' },
  { label: 'Lofi Chill', prompt: 'Relaxed jazzy samples, vinyl crackle, mellow drums, study vibes', genre: 'lofi', mood: 'chill' },
];

export default function PrimeBeatForge() {
  const { beats, isLoading, isGenerating, generateBeat, deleteBeat, toggleFeatured, incrementPlayCount } = useDemoBeats();
  
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('trap');
  const [mood, setMood] = useState('energetic');
  const [intensity, setIntensity] = useState([3]);
  const [title, setTitle] = useState('');
  
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    await generateBeat({
      prompt,
      genre,
      mood,
      intensity: intensity[0],
      title: title || undefined,
      tags: [genre, mood, 'prime-generated']
    });

    // Reset form
    setPrompt('');
    setTitle('');
  };

  const handleQuickGenerate = async (preset: typeof PRIME_PROMPTS[0]) => {
    setPrompt(preset.prompt);
    setGenre(preset.genre);
    setMood(preset.mood);
    
    await generateBeat({
      prompt: preset.prompt,
      genre: preset.genre,
      mood: preset.mood,
      intensity: intensity[0],
      title: `${preset.label} Beat`,
      tags: [preset.genre, preset.mood, 'prime-generated', preset.label.toLowerCase().replace(/\s+/g, '-')]
    });
  };

  const togglePlay = (beat: DemoBeat) => {
    if (!beat.audio_url) return;

    if (playingId === beat.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(beat.audio_url);
      audio.play();
      audio.onended = () => setPlayingId(null);
      audioRef.current = audio;
      setPlayingId(beat.id);
      incrementPlayCount(beat.id);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Prime's Beat Forge</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            AI Demo <span className="text-primary">Beat Generator</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Prime uses Suno AI to generate demo beats for the platform. 
            These beats showcase Mixxclub's capabilities and populate the marketplace.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Generator Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Generate
                </CardTitle>
                <CardDescription>One-click producer style presets</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {PRIME_PROMPTS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    disabled={isGenerating}
                    onClick={() => handleQuickGenerate(preset)}
                    className="text-xs h-auto py-2 px-3"
                  >
                    {preset.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Custom Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  Custom Beat
                </CardTitle>
                <CardDescription>Describe your perfect beat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Beat Title (optional)</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Midnight Trap"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prompt *</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the beat... e.g., Hard 808s with dark piano melody, aggressive hi-hats"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map(g => (
                          <SelectItem key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mood</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOODS.map(m => (
                          <SelectItem key={m} value={m}>
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Intensity: {intensity[0]}</Label>
                  <Slider
                    value={intensity}
                    onValueChange={setIntensity}
                    min={1}
                    max={5}
                    step={1}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Ambient</span>
                    <span>Hard</span>
                    <span>Maximum</span>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Prime is creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Beat
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <p className="text-xs text-muted-foreground text-center">
                    This may take up to 5 minutes while Suno generates the audio...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Beat Library */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Demo Beat Library
                  </CardTitle>
                  <CardDescription>
                    {beats.length} beats generated by Prime
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : beats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Drum className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-medium">No beats yet</p>
                  <p className="text-sm">Use the controls to generate demo beats</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  <AnimatePresence mode="popLayout">
                    {beats.map((beat) => (
                      <motion.div
                        key={beat.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        className={cn(
                          "p-4 rounded-lg border bg-card transition-all",
                          playingId === beat.id && "border-primary bg-primary/5"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/* Play Button */}
                          <Button
                            variant={playingId === beat.id ? "default" : "outline"}
                            size="icon"
                            className="shrink-0"
                            disabled={!beat.audio_url}
                            onClick={() => togglePlay(beat)}
                          >
                            {playingId === beat.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>

                          {/* Beat Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">{beat.title}</h3>
                              {beat.is_featured && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                              {beat.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {beat.genre}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {beat.mood}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                L{beat.intensity}
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-2">
                                {beat.play_count} plays
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFeatured(beat.id, !beat.is_featured)}
                              title={beat.is_featured ? 'Unfeature' : 'Feature'}
                            >
                              <Star className={cn(
                                "w-4 h-4",
                                beat.is_featured && "text-yellow-500 fill-yellow-500"
                              )} />
                            </Button>
                            {beat.audio_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                              >
                                <a href={beat.audio_url} download target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBeat(beat.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
