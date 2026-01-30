import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, History, Sparkles } from 'lucide-react';
import { DistrictPortal } from '@/components/ui/DistrictPortal';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { DreamHero } from '@/components/dream/DreamHero';
import { EnhancedPromptCard } from '@/components/dream/EnhancedPromptCard';
import { GenerationReveal } from '@/components/dream/GenerationReveal';
import { ContextSelector } from '@/components/dream/ContextSelector';
import { FreeformDream } from '@/components/dream/FreeformDream';
import { LiveAssetsGrid } from '@/components/dream/LiveAssetsGrid';
import { HistoryPanel } from '@/components/dream/HistoryPanel';
import { Button } from '@/components/ui/button';
import { useDreamEngine, DreamMode } from '@/hooks/useDreamEngine';

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
      name: 'Earned Coin',
      context: 'economy_coin_earned',
      prompt: `Product photography of a premium digital currency coin floating in dramatic space. Titanium/gunmetal metal core with precision machined edges. Holographic concentric frequency rings on surface in purple-to-cyan gradient. Center emblem: stylized "M" from audio waveform peaks. 32 vinyl-groove notches around edge. Cyan-purple glow beneath. Chromatic aberration on edges. Dark background with fog. 8K hyperrealistic.`,
    },
    {
      id: 'purchased',
      name: 'Purchased Coin',
      context: 'economy_coin_purchased',
      prompt: `Product photography of a premium digital currency coin floating in dramatic space. Polished gold/brass metal core with warm lustrous finish. Geometric gem/diamond facet patterns catching light. Crown/gem emblem in center. Gold-plated beveled rim. Amber-gold glow beneath. Golden light rays background. Dark atmosphere. 8K hyperrealistic luxury product photography.`,
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
      id: 'room_lit',
      name: 'Room Interior',
      context: 'studio_room_lit',
      prompt: `Inside a professional recording studio room during an active session. Mixing console glowing, monitors displaying waveforms and meters. Artists visible in the booth through glass. Warm lighting, creative energy. This is where the magic happens. Photorealistic, intimate, powerful.`,
    },
  ],
  prime_: [
    {
      id: 'prime_thinking',
      name: 'Prime Thinking',
      context: 'prime_character_thinking',
      prompt: `Abstract visualization of an AI assistant entity in contemplation. Geometric forms suggesting a thoughtful presence. Soft purple and cyan gradients. Data streams and musical notes flowing through the composition. Calm, intelligent, creative energy. Minimal but powerful.`,
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

export default function DreamChamber() {
  const {
    isGenerating,
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
  const [generationState, setGenerationState] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [pendingResult, setPendingResult] = useState<{
    url: string;
    prompt: string;
    context: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load history when opened
  useEffect(() => {
    if (!historyLoaded) {
      refreshHistory();
      setHistoryLoaded(true);
    }
  }, [historyLoaded, refreshHistory]);

  // Get filtered presets
  const getFilteredPresets = () => {
    if (!selectedContextFilter) {
      return Object.values(PROMPT_PRESETS).flat();
    }
    return PROMPT_PRESETS[selectedContextFilter] || [];
  };

  const handleGenerateFromCard = async (id: string, prompt: string, context?: string) => {
    if (!context) return;
    
    setGeneratingId(id);
    setGenerationState('generating');
    
    const result = await generate(mode, prompt, context);
    setGeneratingId(null);
    
    if (result) {
      setGenerationState('success');
      setPendingResult({
        url: result.url,
        prompt,
        context,
      });
    } else {
      setGenerationState('error');
      setTimeout(() => setGenerationState('idle'), 3000);
    }
  };

  const handleFreeformGenerate = async (prompt: string, context: string, style?: string) => {
    setGeneratingId('freeform');
    setGenerationState('generating');
    
    const result = await generate(mode, prompt, context, { style });
    setGeneratingId(null);
    
    if (result) {
      setGenerationState('success');
      setPendingResult({
        url: result.url,
        prompt,
        context,
      });
    } else {
      setGenerationState('error');
      setTimeout(() => setGenerationState('idle'), 3000);
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
    setGenerationState('idle');
    refreshLiveAssets();
    refreshHistory();
  };

  const handleDiscard = () => {
    setPendingResult(null);
    setGenerationState('idle');
  };

  const handleRegenerate = async () => {
    if (!pendingResult) return;
    
    const { prompt, context } = pendingResult;
    setPendingResult(null);
    setGeneratingId('regenerate');
    setGenerationState('generating');
    
    const result = await generate(mode, prompt, context);
    setGeneratingId(null);
    
    if (result) {
      setGenerationState('success');
      setPendingResult({
        url: result.url,
        prompt,
        context,
      });
    } else {
      setGenerationState('error');
      setTimeout(() => setGenerationState('idle'), 3000);
    }
  };

  const handleAssetClick = (context: string) => {
    setSelectedContextFilter(context);
  };

  const filteredPresets = getFilteredPresets();

  return (
    <DistrictPortal districtId="dream">
      <div className="p-6 md:p-8 pb-24 space-y-8">
        {/* Generation Reveal Overlay */}
        <AnimatePresence>
          {pendingResult && (
            <GenerationReveal
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

        {/* Hero Section with Prime Guide */}
        <DreamHero
          mode={mode}
          onModeChange={setMode}
          capabilities={capabilities}
          liveAssetCount={liveAssets.size}
          generationState={generationState}
        />

        {/* Context Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        >
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
        </motion.div>

        {/* Vision Templates (Prompt Cards) */}
        <CollapsibleCard
          title="Vision Templates"
          icon={<Sparkles className="w-4 h-4" />}
          defaultOpen={true}
          storageKey="dream-chamber-templates"
        >
          {filteredPresets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPresets.map((preset) => (
                <EnhancedPromptCard
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
              <p>No templates for this context yet</p>
              <p className="text-sm">Use freeform dream below to create custom generations</p>
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

        {/* City Canvas (Live Assets) */}
        <CollapsibleCard
          title="City Canvas"
          icon={<RefreshCw className="w-4 h-4" />}
          badge={`${liveAssets.size} live`}
          defaultOpen={true}
          storageKey="dream-chamber-canvas"
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
          icon={<History className="w-4 h-4" />}
          defaultOpen={false}
          storageKey="dream-chamber-history"
        >
          <HistoryPanel
            history={history}
            loading={loadingHistory}
            onRefresh={refreshHistory}
          />
        </CollapsibleCard>
      </div>
    </DistrictPortal>
  );
}
