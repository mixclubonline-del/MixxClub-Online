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
import { Loader2, Sparkles, Video, Image, Wand2, Download, Check, Crown, Save, Trash2, Star } from 'lucide-react';
import LogoShowcase from '@/components/brand/LogoShowcase';

import { useBrandAssets } from '@/hooks/useBrandAssets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

type AssetContext = 'hero' | 'navigation' | 'favicon' | 'splash' | 'background' | 'general';

export default function BrandForge() {
  const [activeTab, setActiveTab] = useState('assets');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState<{ id: string; url: string; prompt: string; name: string }[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<{ id: string; url: string; prompt: string; name: string }[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedContext, setSelectedContext] = useState<AssetContext>('general');

  const { 
    assets, 
    isLoading, 
    isUploading, 
    saveAsset, 
    saveAssetFromUrl, 
    applyAsset, 
    deleteAsset,
    isApplying 
  } = useBrandAssets();

  const generateLogo = async (promptConfig: typeof logoPrompts[0]) => {
    setIsGenerating(true);
    toast.loading(`Generating ${promptConfig.name}...`, { id: 'generate' });

    try {
      const { data, error } = await supabase.functions.invoke('generate-image-gemini', {
        body: { prompt: promptConfig.prompt },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedLogos(prev => [...prev, { 
          id: promptConfig.id, 
          url: data.imageUrl, 
          prompt: promptConfig.prompt,
          name: promptConfig.name 
        }]);
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
      // Try Gemini first
      const { data, error } = await supabase.functions.invoke('generate-video-gemini', {
        body: { prompt: promptConfig.prompt },
      });

      if (error) throw error;

      if (data?.videoUrl) {
        setGeneratedVideos(prev => [...prev, { 
          id: promptConfig.id, 
          url: data.videoUrl,
          prompt: promptConfig.prompt,
          name: promptConfig.name 
        }]);
        toast.success(`${promptConfig.name} video generated!`, { id: 'generate-video' });
      } else if (data?.message) {
        // Fallback message from Gemini
        toast.info(data.message, { id: 'generate-video' });
        
        // Try Replicate as fallback
        const { data: replicateData, error: replicateError } = await supabase.functions.invoke('generate-video', {
          body: { type: 'studio-ambiance', prompt: promptConfig.prompt },
        });

        if (!replicateError && replicateData?.output) {
          const videoUrl = Array.isArray(replicateData.output) ? replicateData.output[0] : replicateData.output;
          setGeneratedVideos(prev => [...prev, { 
            id: promptConfig.id, 
            url: videoUrl,
            prompt: promptConfig.prompt,
            name: promptConfig.name 
          }]);
          toast.success(`${promptConfig.name} video generated via fallback!`);
        }
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Failed to generate video', { id: 'generate-video' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsset = async (asset: { url: string; name: string; prompt: string }, type: 'logo' | 'video') => {
    try {
      const isBase64 = asset.url.startsWith('data:');
      if (isBase64) {
        await saveAsset(asset.url, type === 'logo' ? 'image' : 'video', asset.name, asset.prompt, selectedContext);
      } else {
        await saveAssetFromUrl(asset.url, type === 'logo' ? 'image' : 'video', asset.name, asset.prompt, selectedContext);
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleApplyAsset = (assetId: string) => {
    const settingId = selectedContext === 'navigation' ? 'primary_logo' : 
                      selectedContext === 'hero' ? 'hero_logo' : 
                      selectedContext === 'background' ? 'hero_video' : 'primary_logo';
    applyAsset({ assetId, settingId });
  };

  const generateAllLogos = async () => {
    for (const prompt of logoPrompts) {
      await generateLogo(prompt);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  // Filter saved assets by type
  const savedLogos = assets.filter(a => a.asset_type === 'image' || a.asset_type === 'logo');
  const savedVideos = assets.filter(a => a.asset_type === 'video' || a.asset_type === 'background');

  return (
    <>
      <Helmet>
        <title>Brand Forge - MixClub AI Brand Generator</title>
        <meta name="description" content="Generate unique brand assets using MixClub's AI" />
      </Helmet>

      <main className="min-h-screen bg-background relative">
        <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-background/90 -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)] -z-10" />
        
        
        <div className="container mx-auto px-4 py-6">
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
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="assets" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Official
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Saved ({assets.length})
              </TabsTrigger>
              <TabsTrigger value="logo" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Logo Gen
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video Gen
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assets">
              <LogoShowcase />
            </TabsContent>

            <TabsContent value="saved">
              <div className="space-y-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : assets.length === 0 ? (
                  <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No saved assets yet. Generate and save some from the Logo or Video tabs!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {savedLogos.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Saved Logos & Images</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {savedLogos.map((asset) => (
                            <motion.div
                              key={asset.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                                asset.is_active ? 'border-primary ring-2 ring-primary/50' : 'border-border/50'
                              }`}
                            >
                              <img
                                src={asset.public_url}
                                alt={asset.name}
                                className="w-full aspect-square object-cover"
                              />
                              {asset.is_active && (
                                <div className="absolute top-2 left-2 bg-primary rounded-full px-2 py-1 text-xs text-primary-foreground flex items-center gap-1">
                                  <Star className="w-3 h-3" /> Active
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                <p className="text-white text-sm font-medium text-center">{asset.name}</p>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="secondary" onClick={() => handleApplyAsset(asset.id)} disabled={isApplying}>
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="secondary" asChild>
                                    <a href={asset.public_url} download target="_blank" rel="noopener noreferrer">
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => deleteAsset(asset.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {savedVideos.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Saved Videos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {savedVideos.map((asset) => (
                            <motion.div
                              key={asset.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                                asset.is_active ? 'border-primary ring-2 ring-primary/50' : 'border-border/50'
                              }`}
                            >
                              <video
                                src={asset.public_url}
                                controls
                                loop
                                muted
                                className="w-full aspect-video"
                              />
                              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="secondary" onClick={() => handleApplyAsset(asset.id)} disabled={isApplying}>
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteAsset(asset.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              {asset.is_active && (
                                <div className="absolute top-2 left-2 bg-primary rounded-full px-2 py-1 text-xs text-primary-foreground flex items-center gap-1">
                                  <Star className="w-3 h-3" /> Active
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="logo">
              <div className="space-y-8">
                {/* Context selector */}
                <div className="flex items-center gap-4 justify-end">
                  <Label>Save as:</Label>
                  <Select value={selectedContext} onValueChange={(v) => setSelectedContext(v as AssetContext)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="hero">Hero Logo</SelectItem>
                      <SelectItem value="navigation">Nav Logo</SelectItem>
                      <SelectItem value="favicon">Favicon</SelectItem>
                      <SelectItem value="splash">Splash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                    <h3 className="text-xl font-semibold">Generated Logos (Unsaved)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {generatedLogos.map((logo, index) => (
                        <motion.div
                          key={`${logo.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group rounded-lg overflow-hidden border-2 border-dashed border-border/50"
                        >
                          <img
                            src={logo.url}
                            alt={`Generated logo ${logo.name}`}
                            className="w-full aspect-square object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            <p className="text-white text-sm font-medium">{logo.name}</p>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => handleSaveAsset(logo, 'logo')}
                                disabled={isUploading}
                              >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              </Button>
                              <Button size="sm" variant="secondary" asChild>
                                <a href={logo.url} download target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4" />
                                </a>
                              </Button>
                            </div>
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
                {/* Context selector */}
                <div className="flex items-center gap-4 justify-end">
                  <Label>Save as:</Label>
                  <Select value={selectedContext} onValueChange={(v) => setSelectedContext(v as AssetContext)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="background">Background Video</SelectItem>
                      <SelectItem value="hero">Hero Video</SelectItem>
                      <SelectItem value="splash">Splash Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                    <h3 className="text-xl font-semibold">Generated Videos (Unsaved)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generatedVideos.map((video, index) => (
                        <motion.div
                          key={`${video.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group rounded-lg overflow-hidden border-2 border-dashed border-border/50"
                        >
                          <video
                            src={video.url}
                            controls
                            loop
                            muted
                            autoPlay
                            className="w-full aspect-video"
                          />
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleSaveAsset(video, 'video')}
                              disabled={isUploading}
                            >
                              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </Button>
                          </div>
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
                  <div className="flex items-center gap-4">
                    <Label>Save as:</Label>
                    <Select value={selectedContext} onValueChange={(v) => setSelectedContext(v as AssetContext)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="hero">Hero</SelectItem>
                        <SelectItem value="navigation">Navigation</SelectItem>
                        <SelectItem value="background">Background</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => generateLogo({ id: 'custom', name: 'Custom Logo', prompt: customPrompt })}
                      disabled={isGenerating || !customPrompt}
                      className="flex-1"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Image className="w-4 h-4 mr-2" />}
                      Generate Image
                    </Button>
                    <Button
                      onClick={() => generateVideo({ id: 'custom', name: 'Custom Video', prompt: customPrompt })}
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
