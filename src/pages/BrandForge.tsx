import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Sparkles, Video, Image, Wand2, Download, Check } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

const logoPrompts = [
  { id: 'neural', name: 'Neural Waveform', prompt: 'A sleek logo mark combining audio waveforms morphing into neural network patterns, neon purple and electric blue glow, cyberpunk aesthetic, minimalist, on transparent background' },
  { id: 'infinity', name: 'Infinity Engine', prompt: 'Modern infinity symbol logo with AI circuit nodes along the curves, glowing data streams, holographic 3D effect, purple and cyan neon, music production brand' },
  { id: 'crown', name: 'Frequency Crown', prompt: 'Audio frequency spectrum bars arranged in a crown shape, hip-hop royalty meets technology, bold commanding presence, gold and purple gradient, logo mark' },
  { id: 'sigil', name: 'MixClub Sigil', prompt: 'Abstract geometric logo combining vinyl record grooves, circuit board traces, and sound waves, unique brand mark, purple blue pink neon colors, futuristic' },
];

const videoPrompts = [
  { id: 'studio', name: 'Studio Ambiance', prompt: 'Cyberpunk music studio interior, neon lights pulsing rhythmically, mixing console with glowing screens, professional recording equipment, purple and blue ambient lighting' },
  { id: 'portal', name: 'Entry Portal', prompt: 'Futuristic portal opening with energy swirls, stepping into a neon-lit music dimension, purple and cyan light rays, dramatic cinematic reveal' },
  { id: 'particles', name: 'Audio Particles', prompt: 'Abstract audio visualization, particles flowing and reacting to invisible music beats, bioluminescent colors, deep space background' },
];

export default function BrandForge() {
  const [activeTab, setActiveTab] = useState('logo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState<{ id: string; url: string }[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<{ id: string; url: string }[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);

  const generateLogo = async (promptConfig: typeof logoPrompts[0]) => {
    setIsGenerating(true);
    toast.loading(`Generating ${promptConfig.name}...`, { id: 'generate' });

    try {
      const { data, error } = await supabase.functions.invoke('generate-image-gemini', {
        body: { prompt: promptConfig.prompt },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedLogos(prev => [...prev, { id: promptConfig.id, url: data.imageUrl }]);
        toast.success(`${promptConfig.name} generated!`, { id: 'generate' });
      }
    } catch (error) {
      console.error('Logo generation error:', error);
      toast.error('Failed to generate logo', { id: 'generate' });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVideo = async (promptConfig: typeof videoPrompts[0]) => {
    setIsGenerating(true);
    toast.loading(`Generating ${promptConfig.name} video...`, { id: 'generate-video' });

    try {
      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: { 
          type: 'studio-ambiance',
          prompt: promptConfig.prompt,
        },
      });

      if (error) throw error;

      if (data?.output) {
        const videoUrl = Array.isArray(data.output) ? data.output[0] : data.output;
        setGeneratedVideos(prev => [...prev, { id: promptConfig.id, url: videoUrl }]);
        toast.success(`${promptConfig.name} video generated!`, { id: 'generate-video' });
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Failed to generate video', { id: 'generate-video' });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllLogos = async () => {
    for (const prompt of logoPrompts) {
      await generateLogo(prompt);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
    }
  };

  return (
    <>
      <Helmet>
        <title>Brand Forge - MixClub AI Brand Generator</title>
        <meta name="description" content="Generate unique brand assets using MixClub's AI" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <GlobalHeader />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[hsl(var(--accent-blue))] to-primary">
                Brand Forge
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Build the thing to build the thing. Generate unique brand assets using MixClub's own AI.
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="logo" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Logo Generator
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video Generator
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Custom Prompt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="logo">
              <div className="space-y-8">
                {/* Preset Logo Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {logoPrompts.map((prompt) => (
                    <Card key={prompt.id} className="bg-card/50 border-border/50 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          {prompt.name}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {prompt.prompt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => generateLogo(prompt)}
                          disabled={isGenerating}
                          className="w-full"
                          variant="outline"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                          )}
                          Generate
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Generate All Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={generateAllLogos}
                    disabled={isGenerating}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-[hsl(var(--accent-blue))]"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-5 h-5 mr-2" />
                    )}
                    Generate All Concepts
                  </Button>
                </div>

                {/* Generated Logos Gallery */}
                {generatedLogos.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Generated Logos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {generatedLogos.map((logo, index) => (
                        <motion.div
                          key={`${logo.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            selectedLogo === logo.url ? 'border-primary' : 'border-transparent'
                          }`}
                          onClick={() => setSelectedLogo(logo.url)}
                        >
                          <img
                            src={logo.url}
                            alt={`Generated logo ${logo.id}`}
                            className="w-full aspect-square object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="sm" variant="secondary" asChild>
                              <a href={logo.url} download target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                            {selectedLogo === logo.url && (
                              <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                                <Check className="w-4 h-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="video">
              <div className="space-y-8">
                {/* Video Presets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {videoPrompts.map((prompt) => (
                    <Card key={prompt.id} className="bg-card/50 border-border/50 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Video className="w-4 h-4 text-primary" />
                          {prompt.name}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {prompt.prompt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => generateVideo(prompt)}
                          disabled={isGenerating}
                          className="w-full"
                          variant="outline"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Video className="w-4 h-4 mr-2" />
                          )}
                          Generate Video
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Generated Videos */}
                {generatedVideos.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Generated Videos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generatedVideos.map((video, index) => (
                        <motion.div
                          key={`${video.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-lg overflow-hidden border border-border/50"
                        >
                          <video
                            src={video.url}
                            controls
                            loop
                            muted
                            autoPlay
                            className="w-full aspect-video"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="custom">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Custom Generation</CardTitle>
                  <CardDescription>
                    Enter your own prompt to generate unique brand assets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-prompt">Your Prompt</Label>
                    <Input
                      id="custom-prompt"
                      placeholder="A futuristic music logo with neon glow..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => generateLogo({ id: 'custom', name: 'Custom', prompt: customPrompt })}
                      disabled={isGenerating || !customPrompt}
                      className="flex-1"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Image className="w-4 h-4 mr-2" />}
                      Generate Image
                    </Button>
                    <Button
                      onClick={() => generateVideo({ id: 'custom', name: 'Custom', prompt: customPrompt })}
                      disabled={isGenerating || !customPrompt}
                      variant="outline"
                      className="flex-1"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Video className="w-4 h-4 mr-2" />}
                      Generate Video
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
