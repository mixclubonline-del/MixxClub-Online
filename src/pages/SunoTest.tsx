import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, Drum, Play, Pause, Download, Loader2, 
  RefreshCw, Volume2, VolumeX, Sparkles, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GenerationResult {
  id: string;
  type: 'music' | 'trap';
  prompt?: string;
  intensity?: number;
  status: 'pending' | 'generating' | 'ready' | 'error';
  audioUrl?: string;
  jobId?: string;
  error?: string;
  createdAt: Date;
  rawResponse?: any;
}

export default function SunoTest() {
  // General music state
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('trap');
  const [mood, setMood] = useState('energetic');
  const [generateType, setGenerateType] = useState('beat');
  const [duration, setDuration] = useState(30);

  // Trap beat state
  const [trapIntensity, setTrapIntensity] = useState(3);

  // Results
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isGeneratingTrap, setIsGeneratingTrap] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handleGenerateMusic = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    const resultId = Date.now().toString();
    const newResult: GenerationResult = {
      id: resultId,
      type: 'music',
      prompt,
      status: 'generating',
      createdAt: new Date(),
    };

    setResults(prev => [newResult, ...prev]);
    setIsGeneratingMusic(true);

    try {
      console.log('Calling generate-music with:', { prompt, genre, mood, duration, generateType });
      
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: { prompt, genre, mood, duration, generateType }
      });

      console.log('generate-music response:', { data, error });

      if (error) throw error;

      setResults(prev => prev.map(r => 
        r.id === resultId 
          ? { 
              ...r, 
              status: data?.audioUrl ? 'ready' : 'pending',
              jobId: data?.jobId,
              audioUrl: data?.audioUrl,
              rawResponse: data,
            } 
          : r
      ));

      if (data?.jobId) {
        toast.success(`Job started: ${data.jobId}`);
      } else if (data?.audioUrl) {
        toast.success('Audio generated!');
      }
    } catch (err: any) {
      console.error('generate-music error:', err);
      setResults(prev => prev.map(r => 
        r.id === resultId 
          ? { ...r, status: 'error', error: err.message } 
          : r
      ));
      toast.error(err.message || 'Generation failed');
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleGenerateTrap = async (intensity: number) => {
    const resultId = Date.now().toString();
    const newResult: GenerationResult = {
      id: resultId,
      type: 'trap',
      intensity,
      status: 'generating',
      createdAt: new Date(),
    };

    setResults(prev => [newResult, ...prev]);
    setIsGeneratingTrap(true);
    setTrapIntensity(intensity);

    try {
      console.log('Calling generate-trap-beat with intensity:', intensity);
      
      const { data, error } = await supabase.functions.invoke('generate-trap-beat', {
        body: { intensity }
      });

      console.log('generate-trap-beat response:', { data, error });

      if (error) throw error;

      setResults(prev => prev.map(r => 
        r.id === resultId 
          ? { 
              ...r, 
              status: data?.audioUrl ? 'ready' : 'error',
              audioUrl: data?.audioUrl,
              rawResponse: data,
              error: data?.error,
            } 
          : r
      ));

      if (data?.audioUrl) {
        toast.success('Trap beat generated!');
      } else {
        toast.error(data?.error || 'No audio URL returned');
      }
    } catch (err: any) {
      console.error('generate-trap-beat error:', err);
      setResults(prev => prev.map(r => 
        r.id === resultId 
          ? { ...r, status: 'error', error: err.message } 
          : r
      ));
      toast.error(err.message || 'Generation failed');
    } finally {
      setIsGeneratingTrap(false);
    }
  };

  const togglePlay = (result: GenerationResult) => {
    if (!result.audioUrl) return;

    if (currentlyPlaying === result.id) {
      audioElement?.pause();
      setCurrentlyPlaying(null);
      setAudioElement(null);
    } else {
      audioElement?.pause();
      const audio = new Audio(result.audioUrl);
      audio.play();
      audio.onended = () => {
        setCurrentlyPlaying(null);
        setAudioElement(null);
      };
      setAudioElement(audio);
      setCurrentlyPlaying(result.id);
    }
  };

  const clearResults = () => {
    audioElement?.pause();
    setCurrentlyPlaying(null);
    setAudioElement(null);
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Suno API Test Lab</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Suno <span className="text-primary">Integration</span> Tester
          </h1>
          <p className="text-muted-foreground">
            Isolated environment to test both Suno edge functions
          </p>
        </motion.div>

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Endpoints</AlertTitle>
          <AlertDescription className="text-sm">
            <strong>generate-music:</strong> Uses <code className="bg-muted px-1 rounded">api.suno.ai/v1/generate</code> - Returns job ID (no polling)<br/>
            <strong>generate-trap-beat:</strong> Uses <code className="bg-muted px-1 rounded">api.sunoapi.com</code> - Polls until audio ready (up to 5 min)
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Controls */}
          <div className="space-y-6">
            <Tabs defaultValue="music" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="music" className="gap-2">
                  <Music className="w-4 h-4" />
                  General Music
                </TabsTrigger>
                <TabsTrigger value="trap" className="gap-2">
                  <Drum className="w-4 h-4" />
                  Trap Beats
                </TabsTrigger>
              </TabsList>

              {/* General Music Tab */}
              <TabsContent value="music">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">generate-music</CardTitle>
                    <CardDescription>
                      Test the general music generation endpoint
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt">Prompt *</Label>
                      <Textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Hard hitting 808s with dark piano melody..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Genre</Label>
                        <Select value={genre} onValueChange={setGenre}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trap">Trap</SelectItem>
                            <SelectItem value="hiphop">Hip Hop</SelectItem>
                            <SelectItem value="rnb">R&B</SelectItem>
                            <SelectItem value="pop">Pop</SelectItem>
                            <SelectItem value="electronic">Electronic</SelectItem>
                            <SelectItem value="rock">Rock</SelectItem>
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
                            <SelectItem value="energetic">Energetic</SelectItem>
                            <SelectItem value="chill">Chill</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="uplifting">Uplifting</SelectItem>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                            <SelectItem value="melodic">Melodic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={generateType} onValueChange={setGenerateType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beat">Beat (Instrumental)</SelectItem>
                            <SelectItem value="melody">Melody</SelectItem>
                            <SelectItem value="song">Full Song</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Duration (seconds)</Label>
                        <Input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          min={10}
                          max={120}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleGenerateMusic}
                      disabled={isGeneratingMusic || !prompt.trim()}
                      className="w-full gap-2"
                      size="lg"
                    >
                      {isGeneratingMusic ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Music className="w-4 h-4" />
                          Generate Music
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Trap Beats Tab */}
              <TabsContent value="trap">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">generate-trap-beat</CardTitle>
                    <CardDescription>
                      Test trap beat generation with intensity levels (polls for completion)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Click an intensity level to generate. This endpoint waits for the audio to be ready.
                    </p>

                    <div className="grid grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <motion.button
                          key={level}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleGenerateTrap(level)}
                          disabled={isGeneratingTrap}
                          className={cn(
                            "aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50",
                            level === 1 && "border-green-500/50 hover:bg-green-500/10",
                            level === 2 && "border-lime-500/50 hover:bg-lime-500/10",
                            level === 3 && "border-yellow-500/50 hover:bg-yellow-500/10",
                            level === 4 && "border-orange-500/50 hover:bg-orange-500/10",
                            level === 5 && "border-red-500/50 hover:bg-red-500/10",
                            isGeneratingTrap && trapIntensity === level && "animate-pulse"
                          )}
                        >
                          <span className="text-2xl font-bold">{level}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {level === 1 && 'Ambient'}
                            {level === 2 && 'Chill'}
                            {level === 3 && 'Hard'}
                            {level === 4 && 'Aggro'}
                            {level === 5 && 'Max'}
                          </span>
                        </motion.button>
                      ))}
                    </div>

                    {isGeneratingTrap && (
                      <div className="flex items-center justify-center gap-2 py-4 text-primary">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Generating & polling for audio... (may take up to 5 min)</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Results */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Results</CardTitle>
                <CardDescription>Generation history & responses</CardDescription>
              </div>
              {results.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearResults}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Volume2 className="w-12 h-12 mb-4 opacity-20" />
                  <p>No generations yet</p>
                  <p className="text-xs">Results will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {results.map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={result.type === 'music' ? 'default' : 'secondary'}>
                            {result.type === 'music' ? 'Music' : `Trap L${result.intensity}`}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={cn(
                              result.status === 'ready' && 'border-green-500 text-green-500',
                              result.status === 'generating' && 'border-yellow-500 text-yellow-500',
                              result.status === 'pending' && 'border-blue-500 text-blue-500',
                              result.status === 'error' && 'border-red-500 text-red-500',
                            )}
                          >
                            {result.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {result.createdAt.toLocaleTimeString()}
                        </span>
                      </div>

                      {result.prompt && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          "{result.prompt}"
                        </p>
                      )}

                      {result.jobId && (
                        <p className="text-xs font-mono bg-background px-2 py-1 rounded mb-2">
                          Job ID: {result.jobId}
                        </p>
                      )}

                      {result.error && (
                        <p className="text-xs text-red-500 mb-2">
                          Error: {result.error}
                        </p>
                      )}

                      {result.audioUrl && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePlay(result)}
                            className="gap-1"
                          >
                            {currentlyPlaying === result.id ? (
                              <>
                                <Pause className="w-3 h-3" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                Play
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                          >
                            <a href={result.audioUrl} download target="_blank" rel="noopener">
                              <Download className="w-3 h-3" />
                            </a>
                          </Button>
                        </div>
                      )}

                      {/* Raw response for debugging */}
                      {result.rawResponse && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            View raw response
                          </summary>
                          <pre className="text-[10px] bg-background p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(result.rawResponse, null, 2)}
                          </pre>
                        </details>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Button variant="ghost" asChild>
            <a href="/">← Back to Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
