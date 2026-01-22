import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap, ImageIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDreamEngine, DreamMode } from '@/hooks/useDreamEngine';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { ModeSelector } from '@/components/dream/ModeSelector';
import { ContextSelector } from '@/components/dream/ContextSelector';
import { StylePresetSelector, stylePresets } from '@/components/dream/StylePresetSelector';
import { LiveAssetsGrid } from '@/components/dream/LiveAssetsGrid';
import { GenerationPreview } from '@/components/dream/GenerationPreview';
import { PromptCard } from '@/components/dream/PromptCard';
import { FreeformDream } from '@/components/dream/FreeformDream';
import { HistoryPanel } from '@/components/dream/HistoryPanel';

// ============================================
// PROMPT PRESETS (Organized by context)
// ============================================

const PROMPT_PRESETS: Record<string, Array<{
  id: string;
  name: string;
  prompt: string;
  videoPrompt?: string;
  context: string;
}>> = {
  landing_: [
    {
      id: 'architect',
      name: 'The Architect',
      context: 'landing_origin_architect',
      prompt: `Cinematic portrait of an African American music producer/engineer in a recording studio that bridges eras - vintage analog equipment on one side, futuristic AI-powered holographic displays on the other. Hands confidently on mixing console. Studio monitors illuminate their face. Authentic hip-hop culture aesthetic. 30 years of experience visible in their presence. Raw, real, powerful. Photorealistic with moody purple and cyan lighting accents.`,
    },
    {
      id: 'basement',
      name: 'The Basement',
      context: 'landing_origin_basement',
      prompt: `Interior of a legendary basement recording studio at night. Raw brick walls, vintage mixing console covered in stickers, foam padding, dim lighting from gear LEDs. A single person working late, surrounded by decades of music history. Real hip-hop energy. Smoke in the air. This is where legends were born. Photorealistic, cinematic composition, warm amber and purple lighting.`,
    },
  ],
  economy_: [
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
  ],
  studio_: [
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
  ],
  prime_: [
    {
      id: 'prime_thinking',
      name: 'Prime Thinking',
      context: 'prime_character_thinking',
      prompt: `Abstract visualization of an AI assistant entity in contemplation. Geometric forms suggesting a thoughtful presence. Soft purple and cyan gradients. Data streams and musical notes flowing through the composition. Calm, intelligent, creative energy. Minimal but powerful.`,
    },
    {
      id: 'prime_creating',
      name: 'Prime Creating',
      context: 'prime_character_creating',
      prompt: `Abstract visualization of an AI assistant entity in active creation mode. Geometric forms radiating creative energy. Bright, dynamic lighting with purple, cyan, and gold accents. Musical elements and data visualizations swirling together. The moment of creation captured.`,
    },
  ],
  unlock_: [
    {
      id: 'unlock_moment',
      name: 'Unlock Celebration',
      context: 'unlock_community_celebration',
      prompt: `Abstract visualization of a community achievement moment. Particles of light converging from many sources into a central bright point that then explodes outward in celebration. Purple, gold, and cyan colors. The moment when collective effort unlocks something new. Euphoric, powerful, unified.`,
      videoPrompt: `Abstract particle effect - many small lights from different directions converging to center, building intensity, then exploding outward in celebration. Purple, gold, cyan colors. Communal achievement visualized. 4 second loop.`,
    },
  ],
  community_: [
    {
      id: 'community_hub',
      name: 'Community Hub',
      context: 'community_hub_hero',
      prompt: `Abstract visualization of a vibrant community space. Multiple nodes of light connected by flowing energy streams. Each node representing a creator, all contributing to a central shared space. Purple, cyan, and warm gold tones. Collaborative, welcoming, dynamic. The visual representation of creative community.`,
    },
  ],
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function DreamEngine() {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  
  const {
    isGenerating,
    lastResult,
    contexts,
    loadingContexts,
    liveAssets,
    loadingLiveAssets,
    refreshLiveAssets,
    history,
    loadingHistory,
    refreshHistory,
    generate,
    saveGeneration,
    capabilities,
  } = useDreamEngine();

  const [mode, setMode] = useState<DreamMode>('image');
  const [selectedContextFilter, setSelectedContextFilter] = useState<string>('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<{
    url: string;
    prompt: string;
    context: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load history when panel is opened
  useEffect(() => {
    if (!historyLoaded) {
      refreshHistory();
      setHistoryLoaded(true);
    }
  }, [historyLoaded, refreshHistory]);

  // Get presets for current filter
  const getFilteredPresets = () => {
    if (!selectedContextFilter) {
      // Show all presets
      return Object.entries(PROMPT_PRESETS).flatMap(([_, presets]) => presets);
    }
    return PROMPT_PRESETS[selectedContextFilter] || [];
  };

  const handleGenerateFromCard = async (id: string, prompt: string, context?: string) => {
    if (!context) return;
    
    setGeneratingId(id);
    const result = await generate(mode, prompt, context);
    setGeneratingId(null);
    
    if (result) {
      setPendingResult({
        url: result.url,
        prompt,
        context,
      });
    }
  };

  const handleFreeformGenerate = async (prompt: string, context: string, style?: string) => {
    setGeneratingId('freeform');
    const result = await generate(mode, prompt, context, { style });
    setGeneratingId(null);
    
    if (result) {
      setPendingResult({
        url: result.url,
        prompt,
        context,
      });
    }
  };

  const handleSave = async (name: string, makeActive: boolean) => {
    if (!pendingResult) return;
    
    setSaving(true);
    await saveGeneration(
      pendingResult.url,
      pendingResult.context,
      mode,
      pendingResult.prompt,
      name,
      makeActive
    );
    setSaving(false);
    setPendingResult(null);
    refreshLiveAssets();
    refreshHistory();
  };

  const handleDiscard = () => {
    setPendingResult(null);
  };

  const handleRegenerate = async () => {
    if (!pendingResult) return;
    
    setPendingResult(null);
    setGeneratingId('regenerate');
    const result = await generate(mode, pendingResult.prompt, pendingResult.context);
    setGeneratingId(null);
    
    if (result) {
      setPendingResult({
        url: result.url,
        prompt: pendingResult.prompt,
        context: pendingResult.context,
      });
    }
  };

  const handleAssetClick = (context: string, asset: { id: string; url: string } | null) => {
    setSelectedContextFilter(context);
  };

  const filteredPresets = getFilteredPresets();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                Dream Engine <span className="text-sm font-normal text-primary">v2.0</span>
              </h1>
              <p className="text-sm text-muted-foreground">Unified Vision Control System</p>
            </div>
            
            <div className="flex items-center gap-3">
              <ModeSelector
                mode={mode}
                onChange={setMode}
                capabilities={capabilities}
              />
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                <span>{liveAssets.size} live</span>
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Generation Preview (when pending) */}
        <AnimatePresence>
          {pendingResult && (
            <GenerationPreview
              result={{ url: pendingResult.url, type: mode }}
              mode={mode}
              prompt={pendingResult.prompt}
              context={pendingResult.context}
              onSave={handleSave}
              onDiscard={handleDiscard}
              onRegenerate={handleRegenerate}
              saving={saving}
            />
          )}
        </AnimatePresence>

        {/* Context Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-64">
            <ContextSelector
              contexts={contexts}
              loading={loadingContexts}
              value={selectedContextFilter}
              onChange={setSelectedContextFilter}
              placeholder="All contexts"
            />
          </div>
          {selectedContextFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedContextFilter('')}
            >
              Clear filter
            </Button>
          )}
        </div>

        {/* Prompt Cards */}
        <CollapsibleCard
          title="Prompt Library"
          icon={<Zap className="w-4 h-4" />}
          defaultOpen={true}
          storageKey="dream-engine-prompts"
        >
          {filteredPresets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPresets.map((preset) => (
                <PromptCard
                  key={preset.id}
                  id={preset.id}
                  name={preset.name}
                  prompt={preset.prompt}
                  videoPrompt={preset.videoPrompt}
                  context={preset.context}
                  mode={mode}
                  isGenerating={isGenerating}
                  generatingId={generatingId}
                  onGenerate={handleGenerateFromCard}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No presets for this context yet</p>
              <p className="text-sm">Use the freeform section below to create custom generations</p>
            </div>
          )}
        </CollapsibleCard>

        {/* Freeform Dream */}
        <FreeformDream
          contexts={contexts}
          loadingContexts={loadingContexts}
          mode={mode}
          isGenerating={isGenerating}
          onGenerate={handleFreeformGenerate}
        />

        {/* What's Live */}
        <CollapsibleCard
          title="What's Live"
          icon={<RefreshCw className="w-4 h-4" />}
          badge={`${liveAssets.size} active`}
          defaultOpen={true}
          storageKey="dream-engine-live"
        >
          <LiveAssetsGrid
            contexts={contexts}
            liveAssets={liveAssets}
            loading={loadingLiveAssets}
            onAssetClick={handleAssetClick}
          />
        </CollapsibleCard>

        {/* History */}
        <CollapsibleCard
          title="Generation History"
          defaultOpen={false}
          storageKey="dream-engine-history"
        >
          <HistoryPanel
            history={history}
            loading={loadingHistory}
            onRefresh={refreshHistory}
          />
        </CollapsibleCard>
      </main>
    </div>
  );
}
