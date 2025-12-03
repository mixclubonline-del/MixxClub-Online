import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Music, Wand2, Play, Pause, Download, RefreshCw,
  Sliders, Disc3, Mic, Guitar, Drum, Piano, Volume2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CityLayout } from '@/components/city/CityLayout';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const genres = [
  { id: 'trap', name: 'Trap', icon: Drum, color: 'from-red-500 to-orange-500' },
  { id: 'hiphop', name: 'Hip Hop', icon: Mic, color: 'from-purple-500 to-pink-500' },
  { id: 'rnb', name: 'R&B', icon: Music, color: 'from-blue-500 to-cyan-500' },
  { id: 'pop', name: 'Pop', icon: Sparkles, color: 'from-pink-500 to-rose-500' },
  { id: 'rock', name: 'Rock', icon: Guitar, color: 'from-amber-500 to-red-500' },
  { id: 'electronic', name: 'Electronic', icon: Disc3, color: 'from-cyan-500 to-blue-500' },
  { id: 'jazz', name: 'Jazz', icon: Piano, color: 'from-emerald-500 to-teal-500' },
];

const moods = ['Energetic', 'Chill', 'Dark', 'Uplifting', 'Aggressive', 'Melodic', 'Atmospheric', 'Groovy'];

const stylePresets = [
  { id: 'metro', name: 'Metro Boomin Style', tags: ['hard 808s', 'dark melodies', 'spacey'] },
  { id: 'mustard', name: 'DJ Mustard Style', tags: ['west coast', 'ratchet', 'club'] },
  { id: 'pierre', name: 'Pi\'erre Bourne Style', tags: ['playful', 'video game', 'bouncy'] },
  { id: 'wheezy', name: 'Wheezy Style', tags: ['flute', 'guitar', 'melodic trap'] },
  { id: 'custom', name: 'Custom Style', tags: ['your vision'] },
];

interface GeneratedBeat {
  id: string;
  prompt: string;
  genre: string;
  mood: string;
  audioUrl?: string;
  status: 'generating' | 'ready' | 'error';
  createdAt: Date;
}

export default function RSDChamber() {
  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('trap');
  const [selectedMood, setSelectedMood] = useState('Energetic');
  const [selectedStyle, setSelectedStyle] = useState('custom');
  const [bpm, setBpm] = useState([140]);
  const [intensity, setIntensity] = useState([3]);
  const [generatedBeats, setGeneratedBeats] = useState<GeneratedBeat[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('generate');

  const { generate: generateMusic, isGenerating } = useAIGeneration({
    functionName: 'generate-music',
    successMessage: 'Beat generation started!',
    errorMessage: 'Failed to start beat generation',
  });

  const { generate: generateTrapBeat, isGenerating: isGeneratingTrap } = useAIGeneration({
    functionName: 'generate-trap-beat',
    successMessage: 'Trap beat generated!',
    errorMessage: 'Failed to generate trap beat',
  });

  const handleGenerateBeat = async () => {
    if (!prompt && selectedStyle === 'custom') {
      toast.error('Please describe your beat idea');
      return;
    }

    const beatId = Date.now().toString();
    const stylePreset = stylePresets.find(s => s.id === selectedStyle);
    const fullPrompt = selectedStyle !== 'custom' 
      ? `${stylePreset?.name}: ${stylePreset?.tags.join(', ')}. ${prompt}`
      : prompt;

    // Add to generated beats list
    setGeneratedBeats(prev => [{
      id: beatId,
      prompt: fullPrompt,
      genre: selectedGenre,
      mood: selectedMood,
      status: 'generating',
      createdAt: new Date(),
    }, ...prev]);

    const result = await generateMusic({
      prompt: fullPrompt,
      genre: selectedGenre,
      mood: selectedMood,
      duration: 30,
      generateType: 'beat',
    });

    if (result?.jobId) {
      // Update status - in production, we'd poll for completion
      setGeneratedBeats(prev => prev.map(beat => 
        beat.id === beatId 
          ? { ...beat, status: 'ready', audioUrl: result.audioUrl } 
          : beat
      ));
    } else {
      setGeneratedBeats(prev => prev.map(beat => 
        beat.id === beatId ? { ...beat, status: 'error' } : beat
      ));
    }
  };

  const handleQuickTrapBeat = async (intensityLevel: number) => {
    const beatId = Date.now().toString();
    
    setGeneratedBeats(prev => [{
      id: beatId,
      prompt: `Trap beat intensity ${intensityLevel}`,
      genre: 'trap',
      mood: intensityLevel > 3 ? 'Aggressive' : 'Chill',
      status: 'generating',
      createdAt: new Date(),
    }, ...prev]);

    const result = await generateTrapBeat({ intensity: intensityLevel });

    if (result?.audioUrl) {
      setGeneratedBeats(prev => prev.map(beat => 
        beat.id === beatId 
          ? { ...beat, status: 'ready', audioUrl: result.audioUrl } 
          : beat
      ));
    } else {
      setGeneratedBeats(prev => prev.map(beat => 
        beat.id === beatId ? { ...beat, status: 'error' } : beat
      ));
    }
  };

  const togglePlay = (beatId: string) => {
    setCurrentlyPlaying(currentlyPlaying === beatId ? null : beatId);
  };

  return (
    <CityLayout currentDistrict="rsd">
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 mb-4">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">AI-Powered Studio</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            RSD <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Chamber</span>
          </h1>
          <p className="text-muted-foreground">Generate professional beats with Suno AI</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="quick">Quick Beats</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Controls */}
              <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-primary" />
                  Beat Generator
                </h3>

                {/* Genre Selection */}
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Genre</label>
                  <div className="grid grid-cols-4 gap-2">
                    {genres.slice(0, 4).map(genre => (
                      <button
                        key={genre.id}
                        onClick={() => setSelectedGenre(genre.id)}
                        className={cn(
                          "p-3 rounded-xl border transition-all flex flex-col items-center gap-1",
                          selectedGenre === genre.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
                          genre.color
                        )}>
                          <genre.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs">{genre.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Presets */}
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Style Preset</label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stylePresets.map(style => (
                        <SelectItem key={style.id} value={style.id}>
                          <div>
                            <span>{style.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {style.tags.slice(0, 2).join(', ')}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mood */}
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Mood</label>
                  <div className="flex flex-wrap gap-2">
                    {moods.map(mood => (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(mood)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-all",
                          selectedMood === mood
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                        )}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BPM Slider */}
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 flex justify-between">
                    <span>BPM</span>
                    <span className="text-primary">{bpm[0]}</span>
                  </label>
                  <Slider
                    value={bpm}
                    onValueChange={setBpm}
                    min={60}
                    max={200}
                    step={1}
                  />
                </div>

                {/* Custom Prompt */}
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Describe your beat (optional)
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Hard hitting 808s with dark piano melody, heavy snare rolls..."
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <Button 
                  onClick={handleGenerateBeat}
                  disabled={isGenerating}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Beat
                    </>
                  )}
                </Button>
              </Card>

              {/* Right: Preview */}
              <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary" />
                  Beat Preview
                </h3>

                {generatedBeats.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                    <Disc3 className="w-16 h-16 mb-4 opacity-20" />
                    <p>Your generated beats will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {generatedBeats.slice(0, 5).map((beat, index) => (
                      <motion.div
                        key={beat.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl bg-background/50 border border-border/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {beat.genre}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {beat.mood}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {beat.createdAt.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                          {beat.prompt}
                        </p>

                        <div className="flex items-center gap-2">
                          {beat.status === 'generating' ? (
                            <div className="flex items-center gap-2 text-primary">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Generating...</span>
                            </div>
                          ) : beat.status === 'ready' ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => togglePlay(beat.id)}
                                className="gap-1"
                              >
                                {currentlyPlaying === beat.id ? (
                                  <Pause className="w-3 h-3" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                                {currentlyPlaying === beat.id ? 'Pause' : 'Play'}
                              </Button>
                              <Button size="sm" variant="ghost" className="gap-1">
                                <Download className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateBeat()}
                              className="gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Quick Beats Tab */}
          <TabsContent value="quick" className="space-y-6">
            <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Drum className="w-4 h-4 text-orange-400" />
                Quick Trap Beats
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Generate trap beats instantly with different intensity levels
              </p>

              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((level) => (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickTrapBeat(level)}
                    disabled={isGeneratingTrap}
                    className={cn(
                      "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all",
                      level <= 2 ? "border-green-500/50 hover:bg-green-500/10" :
                      level <= 3 ? "border-yellow-500/50 hover:bg-yellow-500/10" :
                      level <= 4 ? "border-orange-500/50 hover:bg-orange-500/10" :
                      "border-red-500/50 hover:bg-red-500/10"
                    )}
                  >
                    <span className="text-3xl font-bold">{level}</span>
                    <span className="text-xs text-muted-foreground">
                      {level === 1 ? 'Ambient' : 
                       level === 2 ? 'Chill' :
                       level === 3 ? 'Hard' :
                       level === 4 ? 'Aggressive' :
                       'Maximum'}
                    </span>
                  </motion.button>
                ))}
              </div>

              {isGeneratingTrap && (
                <div className="mt-6 flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating trap beat...</span>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                Your Beat Library
              </h3>

              {generatedBeats.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Disc3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No beats generated yet</p>
                  <p className="text-sm">Start creating in the Generate tab!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {generatedBeats.map((beat) => (
                    <div
                      key={beat.id}
                      className="p-4 rounded-lg bg-background/50 border border-border/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent-blue/20 flex items-center justify-center">
                          <Music className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{beat.prompt}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{beat.genre}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {beat.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {beat.status === 'ready' && (
                          <>
                            <Button size="icon" variant="ghost">
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CityLayout>
  );
}
