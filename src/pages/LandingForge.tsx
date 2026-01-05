import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Download, Check, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLandingImagery } from '@/hooks/useLandingImagery';
import { toast } from 'sonner';

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
  {
    id: 'handshake',
    name: 'The Handshake',
    prompt: `Symbolic image of a human hand reaching toward a digital/AI presence. Not a robot hand - a visualization of data, sound waves, neural patterns forming the shape of assistance. The moment of partnership between human creativity and AI capability. Abstract but emotional. Purple and cyan energy flowing between them.`,
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

const JOURNEY_PROMPTS = [
  {
    id: 'transformation',
    name: 'The Transformation',
    prompt: `Abstract visualization of sound transformation - raw audio waves on the left morphing into polished, crystalline sound structures on the right. The mixing and mastering process visualized. Deep purples, electric blues, and gold accents. Ethereal and powerful.`,
  },
];

const FUTURE_PROMPTS = [
  {
    id: 'ownership',
    name: 'The Ownership',
    prompt: `Symbolic image of many hands - diverse, real, working hands - coming together to hold something precious and glowing. Representing collective ownership of hip-hop's future. Not corporate suits, but real creators. Unity without uniformity. Warm, hopeful, powerful.`,
  },
];

export default function LandingForge() {
  const [activeTab, setActiveTab] = useState('origin');
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [saving, setSaving] = useState(false);
  const { images, isLoading, refetch, getImagesByPhase } = useLandingImagery();

  const generateImage = async (promptId: string, promptText: string) => {
    setGenerating(promptId);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-landing-image', {
        body: { 
          prompt: promptText,
          context: `landing_${activeTab}_${promptId}`
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success('Image generated! Review and save to your library.');
      } else {
        throw new Error('No image returned');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      toast.error(err.message || 'Failed to generate image');
    } finally {
      setGenerating(null);
    }
  };

  const saveToLibrary = async (promptId: string, promptText: string) => {
    if (!generatedImage) return;
    setSaving(true);

    try {
      // Convert base64 to blob
      const base64Data = generatedImage.replace(/^data:image\/\w+;base64,/, '');
      const blob = await fetch(`data:image/png;base64,${base64Data}`).then(r => r.blob());
      
      const fileName = `landing_${activeTab}_${promptId}_${Date.now()}.png`;
      const filePath = `landing/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, blob, { contentType: 'image/png' });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase.from('brand_assets').insert({
        name: `Landing ${activeTab} - ${promptId}`,
        asset_type: 'image',
        storage_path: filePath,
        public_url: urlData.publicUrl,
        asset_context: `landing_${activeTab}_${promptId}`,
        prompt_used: promptText,
        is_active: true,
      });

      if (dbError) throw dbError;

      toast.success('Saved to library!');
      setGeneratedImage(null);
      refetch();
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const renderPromptCards = (prompts: typeof ORIGIN_PROMPTS) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {prompts.map((p) => (
        <Card key={p.id} className="p-6 bg-card/50 border-border/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-foreground mb-3">{p.name}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-4">{p.prompt}</p>
          <Button
            onClick={() => generateImage(p.id, p.prompt)}
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
                <Sparkles className="w-4 h-4 mr-2" />
                Dream This
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Saved Images</h3>
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
            <h1 className="text-2xl font-bold">Landing Image Forge</h1>
            <p className="text-sm text-muted-foreground">Dream First. Build Second.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="w-4 h-4" />
            <span>{images.length} images saved</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Generated Image Preview */}
        <AnimatePresence>
          {generatedImage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-6 bg-card/50 border border-primary/30 rounded-xl backdrop-blur-sm"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full md:w-1/2 rounded-lg shadow-2xl"
                />
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-xl font-bold mb-2">Your Vision</h3>
                  <p className="text-muted-foreground mb-6">
                    Review this image. If it captures the dream, save it to your library.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => saveToLibrary('custom', customPrompt)}
                      disabled={saving}
                      className="flex-1"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Save to Library
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedImage(null)}
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
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-8">
            <TabsTrigger value="origin">THE ORIGIN</TabsTrigger>
            <TabsTrigger value="people">THE PEOPLE</TabsTrigger>
            <TabsTrigger value="journey">THE JOURNEY</TabsTrigger>
            <TabsTrigger value="future">THE FUTURE</TabsTrigger>
          </TabsList>

          <TabsContent value="origin">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">THE ORIGIN</h2>
              <p className="text-muted-foreground">
                Built from the ground up by the people. No suits. 30 years in the culture.
              </p>
            </div>
            {renderPromptCards(ORIGIN_PROMPTS)}
            {renderSavedImages('origin')}
          </TabsContent>

          <TabsContent value="people">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">THE PEOPLE</h2>
              <p className="text-muted-foreground">
                Real artists. Real engineers. Real stories. The faces of the culture.
              </p>
            </div>
            {renderPromptCards(PEOPLE_PROMPTS)}
            {renderSavedImages('people')}
          </TabsContent>

          <TabsContent value="journey">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">THE JOURNEY</h2>
              <p className="text-muted-foreground">
                From basement to billboard. The transformation of sound and artist.
              </p>
            </div>
            {renderPromptCards(JOURNEY_PROMPTS)}
            {renderSavedImages('journey')}
          </TabsContent>

          <TabsContent value="future">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">THE FUTURE</h2>
              <p className="text-muted-foreground">
                We're gonna own hip-hop. We're gonna own the future.
              </p>
            </div>
            {renderPromptCards(FUTURE_PROMPTS)}
            {renderSavedImages('future')}
          </TabsContent>
        </Tabs>

        {/* Custom Prompt */}
        <div className="mt-12 p-6 bg-card/30 border border-border/50 rounded-xl">
          <h3 className="text-lg font-bold mb-3">Custom Dream</h3>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Write your own vision... describe exactly what you see."
            className="mb-4 min-h-[100px]"
          />
          <Button
            onClick={() => generateImage('custom', customPrompt)}
            disabled={!customPrompt.trim() || generating !== null}
          >
            {generating === 'custom' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Dreaming...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Dream Custom Vision
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
