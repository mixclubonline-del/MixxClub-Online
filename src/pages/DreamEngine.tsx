import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Check, Image as ImageIcon, Video, Zap, Eye, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLandingImagery } from '@/hooks/useLandingImagery';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// ============================================
// PROMPT PRESETS
// ============================================

const ORIGIN_PROMPTS = [
  {
    id: 'architect',
    name: 'The Architect',
    prompt: `Cinematic portrait of an African American music producer/engineer in a recording studio that bridges eras - vintage analog equipment on one side, futuristic AI-powered holographic displays on the other. Hands confidently on mixing console. Studio monitors illuminate their face. Authentic hip-hop culture aesthetic. 30 years of experience visible in their presence. Raw, real, powerful. Photorealistic with moody purple and cyan lighting accents.`,
  },
  {
    id: 'basement',
    name: 'The Basement',
    prompt: `Interior of a legendary basement recording studio at night. Raw brick walls, vintage mixing console covered in stickers, foam padding, dim lighting from gear LEDs. A single person working late, surrounded by decades of music history. Real hip-hop energy. Smoke in the air. This is where legends were born. Photorealistic, cinematic composition, warm amber and purple lighting.`,
  },
  {
    id: 'penthouse',
    name: 'The Penthouse',
    prompt: `Luxurious penthouse recording studio in Atlanta or NYC. Floor-to-ceiling windows showing city skyline at night. State-of-the-art equipment. Same producer from the basement, now in a different setting but still the same authentic energy. The journey from basement to billboard. Cinematic, aspirational but grounded in reality.`,
  },
];

const PEOPLE_PROMPTS = [
  {
    id: 'artist_soul',
    name: 'The Artist',
    prompt: `Close-up portrait of a young hip-hop artist in the booth, headphones on, eyes closed, lost in the music. Raw emotion on their face. The song that's been sitting in their heart finally coming out. Authentic, unpolished, beautiful. Moody studio lighting with purple and amber tones.`,
  },
  {
    id: 'engineer_master',
    name: 'The Engineer',
    prompt: `Portrait of a seasoned mixing engineer at their console, hands adjusting faders with precision. Multiple monitors showing waveforms. Years of expertise in their confident posture. The craftsman behind the sound. Cinematic lighting, professional but not corporate.`,
  },
];

const STUDIO_PROMPTS = [
  {
    id: 'hallway_base',
    name: 'Hallway Base',
    context: 'studio_hallway_base',
    prompt: `Long cinematic shot of a dark recording studio hallway at night. Doors on each side leading to different rooms, most dark and quiet. Moody atmospheric lighting - dim purple LEDs along the floor, subtle cyan accents. Fog machine haze in the air. This is the waiting space, the potential, the silence before creation. 8K, photorealistic, film grain.`,
    videoPrompt: `Slow tracking shot through a dark recording studio hallway. Dim purple floor lights, cyan accent lighting, subtle fog. Doors to empty rooms on each side. Atmospheric, moody, cinematic. The silence before the music. Camera moves forward slowly.`,
  },
  {
    id: 'hallway_active',
    name: 'Hallway Active',
    context: 'studio_hallway_active',
    prompt: `Same recording studio hallway but alive with energy. Doors glowing with warm light from active sessions inside. Through glass windows you can see silhouettes of artists working. LED strips pulsing gently with the beat. Energy flowing through the space. Purple and gold lighting. This is MixClub alive.`,
    videoPrompt: `Recording studio hallway with glowing rooms, doors emanating warm light. Silhouettes visible through frosted glass. LED strips pulsing with music energy. Purple and gold lighting. Alive, active, creative energy flowing. Camera drifts through the space.`,
  },
  {
    id: 'room_lit',
    name: 'Room Interior (Lit)',
    context: 'studio_room_lit',
    prompt: `Inside a professional recording studio room during an active session. Mixing console glowing, monitors displaying waveforms and meters. Artists visible in the booth through glass. Warm lighting, creative energy. This is where the magic happens. Photorealistic, intimate, powerful.`,
    videoPrompt: `Inside an active recording studio. Mixing console with lit faders, monitors showing waveforms. Artists in the booth visible through glass. Warm amber and purple lighting. Meters bouncing. Creative energy in the air.`,
  },
];

const CELEBRATION_PROMPTS = [
  {
    id: 'unlock_moment',
    name: 'Unlock Celebration',
    context: 'community_unlock_celebration',
    prompt: `Abstract visualization of a community achievement moment. Particles of light converging from many sources into a central bright point that then explodes outward in celebration. Purple, gold, and cyan colors. The moment when collective effort unlocks something new. Euphoric, powerful, unified.`,
    videoPrompt: `Abstract particle effect - many small lights from different directions converging to center, building intensity, then exploding outward in celebration. Purple, gold, cyan colors. Communal achievement visualized. 4 second loop.`,
  },
];

// MixxCoinz Economy prompts - Frequency Coin visual identity
const ECONOMY_PROMPTS = [
  {
    id: 'earned',
    name: 'Earned Coin (Work)',
    context: 'economy_coin_earned',
    prompt: `Product photography of a premium digital currency coin floating in dramatic space. Titanium/gunmetal metal core with precision machined edges. Holographic concentric frequency rings on surface in purple-to-cyan gradient. Center emblem: stylized "M" from audio waveform peaks. 32 vinyl-groove notches around edge. Cyan-purple glow beneath. Chromatic aberration on edges. Dark background with fog. 8K hyperrealistic.`,
  },
  {
    id: 'purchased',
    name: 'Purchased Coin (Value)',
    context: 'economy_coin_purchased',
    prompt: `Product photography of a premium digital currency coin floating in dramatic space. Polished gold/brass metal core with warm lustrous finish. Geometric gem/diamond facet patterns catching light. Crown/gem emblem in center. Gold-plated beveled rim. Amber-gold glow beneath. Golden light rays background. Dark atmosphere. 8K hyperrealistic luxury product photography.`,
  },
  {
    id: 'hero',
    name: 'Hero Display (Dual)',
    context: 'economy_coin_hero',
    prompt: `Two premium digital currency coins floating side by side in cinematic space. LEFT: titanium with purple-cyan frequency rings, waveform M emblem, cyan glow. RIGHT: polished gold with gem facets, crown emblem, gold glow. Energy particles bridging between them. Dark atmospheric background. 8K cinematic.`,
  },
  {
    id: 'celebration',
    name: 'Reward Celebration',
    context: 'economy_coin_celebration',
    prompt: `Dynamic action shot of a titanium coin with purple-cyan frequency rings exploding in celebration. Mid-spin rotation. Particle burst of smaller coins and light fragments radiating outward. Purple, cyan, gold particles spiral. Motion blur. Dark background illuminated by the burst. 8K high-speed photography.`,
  },
];

// ============================================
// TYPES
// ============================================

type GenerationMode = 'image' | 'video';

interface PromptCard {
  id: string;
  name: string;
  prompt: string;
  videoPrompt?: string;
  context?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DreamEngine() {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('origin');
  const [generationMode, setGenerationMode] = useState<GenerationMode>('image');
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedAsset, setGeneratedAsset] = useState<{ url: string; type: GenerationMode } | null>(null);
  const [generatedPromptId, setGeneratedPromptId] = useState<string | null>(null);
  const [generatedPromptText, setGeneratedPromptText] = useState<string | null>(null);
  const [generatedContext, setGeneratedContext] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [saving, setSaving] = useState(false);
  const [applyToSite, setApplyToSite] = useState(true);
  const { images, refetch, getImagesByPhase } = useLandingImagery();

  const generateAsset = async (promptId: string, promptText: string, context?: string) => {
    setGenerating(promptId);
    setGeneratedAsset(null);

    try {
      const assetContext = context || `landing_${activeTab}_${promptId}`;
      
      if (generationMode === 'image') {
        const { data, error } = await supabase.functions.invoke('generate-landing-image', {
          body: { prompt: promptText, context: assetContext },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        
        if (data?.imageUrl) {
          setGeneratedAsset({ url: data.imageUrl, type: 'image' });
          setGeneratedPromptId(promptId);
          setGeneratedPromptText(promptText);
          setGeneratedContext(assetContext);
          toast.success('Image generated! Review and save.');
        } else {
          throw new Error('No image returned');
        }
      } else {
        // Video generation
        const { data, error } = await supabase.functions.invoke('generate-video', {
          body: { type: 'text-to-video', prompt: promptText },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        
        if (data?.output) {
          const videoUrl = Array.isArray(data.output) ? data.output[0] : data.output;
          setGeneratedAsset({ url: videoUrl, type: 'video' });
          setGeneratedPromptId(promptId);
          setGeneratedPromptText(promptText);
          setGeneratedContext(assetContext);
          toast.success('Video generated! Review and save.');
        } else {
          throw new Error('No video returned');
        }
      }
    } catch (err: unknown) {
      console.error('Generation error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setGenerating(null);
    }
  };

  const saveToLibrary = async () => {
    if (!generatedAsset || !generatedPromptId || !generatedPromptText) return;

    if (authLoading) return;

    if (!authUser) {
      toast.error('Please sign in to save');
      navigate(`/auth?mode=login&redirect=${encodeURIComponent('/dream-engine')}`);
      return;
    }

    setSaving(true);

    try {
      const assetContext = generatedContext || `landing_${activeTab}_${generatedPromptId}`;
      
      const { data, error } = await supabase.functions.invoke('save-brand-asset', {
        body: {
          imageUrl: generatedAsset.url,
          assetContext,
          promptUsed: generatedPromptText,
          name: `${activeTab} - ${generatedPromptId}`,
          category: activeTab,
          setActive: applyToSite,
          deactivateSiblings: applyToSite,
          assetType: generatedAsset.type,
        },
      });

      if (error) throw error;
      
      if (!data?.ok) {
        throw new Error(`[${data?.step || 'unknown'}] ${data?.message || 'Save failed'}`);
      }

      toast.success(applyToSite ? 'Saved and applied to site!' : 'Saved to library!');
      setGeneratedAsset(null);
      setGeneratedPromptId(null);
      setGeneratedPromptText(null);
      setGeneratedContext(null);
      refetch();
    } catch (err: unknown) {
      console.error('Save error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const renderPromptCards = (prompts: PromptCard[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {prompts.map((p) => (
        <Card key={p.id} className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
            {p.context && (
              <Badge variant="outline" className="text-xs">
                {p.context}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
            {generationMode === 'video' && p.videoPrompt ? p.videoPrompt : p.prompt}
          </p>
          <Button
            onClick={() => generateAsset(
              p.id, 
              generationMode === 'video' && p.videoPrompt ? p.videoPrompt : p.prompt,
              p.context
            )}
            disabled={generating !== null}
            className="w-full"
          >
            {generating === p.id ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Dreaming...
              </>
            ) : (
              <>
                {generationMode === 'video' ? <Video className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Dream {generationMode === 'video' ? 'Video' : 'Image'}
              </>
            )}
          </Button>
        </Card>
      ))}
    </div>
  );

  const renderSavedImages = (phase: string) => {
    const phaseImages = getImagesByPhase(phase);
    if (phaseImages.length === 0) return null;

    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Saved Assets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {phaseImages.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.public_url}
                alt={img.name}
                className="w-full aspect-square object-cover rounded-lg border border-border/50"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <p className="text-xs text-white text-center px-2">{img.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Dream Engine
            </h1>
            <p className="text-sm text-muted-foreground">Vision Control System</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
              <Button
                variant={generationMode === 'image' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setGenerationMode('image')}
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Image
              </Button>
              <Button
                variant={generationMode === 'video' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setGenerationMode('video')}
              >
                <Video className="w-4 h-4 mr-1" />
                Video
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="w-4 h-4" />
              <span>{images.length} saved</span>
            </div>

            {!authLoading && (
              authUser ? (
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/auth?mode=login&redirect=${encodeURIComponent('/dream-engine')}`)}
                >
                  Sign In
                </Button>
              )
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Generated Asset Preview */}
        <AnimatePresence>
          {generatedAsset && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-6 bg-card/50 border border-primary/30 rounded-xl backdrop-blur-sm"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {generatedAsset.type === 'video' ? (
                  <video
                    src={generatedAsset.url}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full md:w-1/2 rounded-lg shadow-2xl"
                  />
                ) : (
                  <img
                    src={generatedAsset.url}
                    alt="Generated"
                    className="w-full md:w-1/2 rounded-lg shadow-2xl"
                  />
                )}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-xl font-bold mb-2">Your Vision</h3>
                  <p className="text-muted-foreground mb-4">
                    Review this {generatedAsset.type}. Save it to your library.
                  </p>
                  
                  {/* Apply to Site Toggle */}
                  <div className="flex items-center gap-3 mb-6 p-3 bg-muted/30 rounded-lg">
                    <Switch
                      id="apply-to-site"
                      checked={applyToSite}
                      onCheckedChange={setApplyToSite}
                    />
                    <Label htmlFor="apply-to-site" className="flex items-center gap-2 cursor-pointer">
                      <Eye className="w-4 h-4" />
                      Apply to live site immediately
                    </Label>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={saveToLibrary}
                      disabled={saving}
                      className="flex-1"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      {applyToSite ? 'Save & Apply' : 'Save to Library'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedAsset(null)}
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full max-w-4xl mb-8">
            <TabsTrigger value="origin">ORIGIN</TabsTrigger>
            <TabsTrigger value="people">PEOPLE</TabsTrigger>
            <TabsTrigger value="studio">STUDIO</TabsTrigger>
            <TabsTrigger value="economy" className="flex items-center gap-1">
              <Coins className="w-3 h-3" />
              ECONOMY
            </TabsTrigger>
            <TabsTrigger value="celebration">CELEBRATE</TabsTrigger>
            <TabsTrigger value="custom">CUSTOM</TabsTrigger>
          </TabsList>

          <TabsContent value="origin">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">THE ORIGIN</h2>
              <p className="text-muted-foreground">
                Built from the ground up by the people. 30 years in the culture.
              </p>
            </div>
            {renderPromptCards(ORIGIN_PROMPTS)}
            {renderSavedImages('origin')}
          </TabsContent>

          <TabsContent value="people">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">THE PEOPLE</h2>
              <p className="text-muted-foreground">
                Real artists. Real engineers. The faces of the culture.
              </p>
            </div>
            {renderPromptCards(PEOPLE_PROMPTS)}
            {renderSavedImages('people')}
          </TabsContent>

          <TabsContent value="studio">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">STUDIO TEXTURES</h2>
              <p className="text-muted-foreground">
                Backgrounds for the Studio Hallway. {generationMode === 'video' ? 'Create living, breathing textures.' : 'Static imagery for the space.'}
              </p>
            </div>
            {renderPromptCards(STUDIO_PROMPTS)}
            {renderSavedImages('studio')}
          </TabsContent>

          <TabsContent value="economy">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Coins className="w-6 h-6 text-primary" />
                MIXXCOINZ IDENTITY
              </h2>
              <p className="text-muted-foreground">
                The Frequency Coin. Visual identity for the platform currency.
                Earned (purple-cyan) vs Purchased (gold) distinction.
              </p>
            </div>
            {renderPromptCards(ECONOMY_PROMPTS)}
            {renderSavedImages('economy')}
          </TabsContent>

          <TabsContent value="celebration">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">CELEBRATIONS</h2>
              <p className="text-muted-foreground">
                Community unlock moments. Visual effects for achievements.
              </p>
            </div>
            {renderPromptCards(CELEBRATION_PROMPTS)}
            {renderSavedImages('celebration')}
          </TabsContent>

          <TabsContent value="custom">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">CUSTOM DREAM</h2>
              <p className="text-muted-foreground">
                Write your own vision. Describe exactly what you see.
              </p>
            </div>
            <Card className="p-6 bg-card/30 border-border/50">
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={generationMode === 'video' 
                  ? "Describe the motion, the camera movement, the energy..."
                  : "Describe the scene, the lighting, the emotion..."
                }
                className="mb-4 min-h-[120px]"
              />
              <Button
                onClick={() => generateAsset('custom', customPrompt)}
                disabled={!customPrompt.trim() || generating !== null}
              >
                {generating === 'custom' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Dreaming...
                  </>
                ) : (
                  <>
                    {generationMode === 'video' ? <Video className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Dream Custom {generationMode === 'video' ? 'Video' : 'Image'}
                  </>
                )}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
