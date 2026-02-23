import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Lock, Swords, ShoppingBag, GraduationCap, Radio,
  Sparkles, CheckCircle, AlertCircle, Loader2, Zap,
  Pencil, RotateCcw, ChevronDown, ChevronUp,
  LucideIcon,
} from 'lucide-react';
import { useDreamEngine } from '@/hooks/useDreamEngine';

/* ─── pillar definitions ─── */
interface PillarDef {
  id: string;
  context: string;
  icon: LucideIcon;
  label: string;
  defaultPrompt: string;
  accentColor: string;
}

const PILLARS: PillarDef[] = [
  {
    id: 'unlockables',
    context: 'community_unlockables',
    icon: Lock,
    label: 'Unlockables',
    defaultPrompt:
      'Close-up of a young Black music producer\'s hands holding a glowing holographic trophy in a dimly lit home studio, shelves behind them filled with achievement plaques and gold records, LED strip lighting casting purple and amber gradients across the walls, vintage drum machine and modern laptop visible on the desk, streetwear hoodie sleeves visible, cinematic shallow depth of field, moody atmosphere, ultra high resolution',
    accentColor: 'hsl(263 70% 63%)',
  },
  {
    id: 'battles',
    context: 'community_battles',
    icon: Swords,
    label: 'Battles',
    defaultPrompt:
      'Wide-angle shot of two hip-hop producers going head-to-head on stage at an underground beat battle event, crowd of Black and Latino fans packed tight behind chain-link barriers, red and blue spotlights slicing through haze, one producer on MPC the other on SP-404, large LED screen behind showing waveform visualizations, raw urban venue with exposed brick and graffiti, photojournalistic style, ultra high resolution',
    accentColor: 'hsl(350 80% 55%)',
  },
  {
    id: 'merch',
    context: 'community_merch',
    icon: ShoppingBag,
    label: 'Merch',
    defaultPrompt:
      'Flat-lay product photography of a curated streetwear merch collection on a matte black surface, items include a premium embroidered hoodie with a glowing logo, vinyl record in holographic sleeve, USB drive shaped like a mixing fader, enamel pin set on branded backing card, sticker pack fanning out, soft dramatic top-lighting with purple and cyan rim accents, editorial product photography style, ultra high resolution',
    accentColor: 'hsl(160 84% 40%)',
  },
  {
    id: 'learning',
    context: 'community_learning',
    icon: GraduationCap,
    label: 'Learning',
    defaultPrompt:
      'African American veteran audio engineer mentoring a young Latino producer at a professional mixing console in a world-class recording studio, acoustic panels and outboard gear racks visible, large studio monitors glowing softly, holographic EQ overlay floating above the console, warm amber key light with cool cyan fill, both wearing streetwear, intimate knowledge-transfer moment captured in cinematic style, ultra high resolution',
    accentColor: 'hsl(180 100% 50%)',
  },
  {
    id: 'sessions',
    context: 'community_sessions',
    icon: Radio,
    label: 'Sessions',
    defaultPrompt:
      'Overhead birds-eye shot of a late-night collaborative music session, four producers gathered around a central desk covered in controllers, laptops, and microphones, takeout containers and energy drinks scattered naturally, faces lit by multiple screens showing DAW sessions, string lights and LED panels providing warm purple and pink ambient glow, authentic creative chaos, documentary photography style, ultra high resolution',
    accentColor: 'hsl(330 80% 60%)',
  },
];

/* ─── per-pillar status ─── */
type PillarStatus = 'idle' | 'generating' | 'success' | 'error';

interface PillarState {
  status: PillarStatus;
  resultUrl?: string;
  error?: string;
}

/* ─── component ─── */
export function CommunityPillarDreamer() {
  const { generate, liveAssets } = useDreamEngine();
  const [states, setStates] = useState<Record<string, PillarState>>(
    Object.fromEntries(PILLARS.map((p) => [p.id, { status: 'idle' }]))
  );
  const [isDreamingAll, setIsDreamingAll] = useState(false);

  // Inline prompt editing state
  const [customPrompts, setCustomPrompts] = useState<Record<string, string>>(
    Object.fromEntries(PILLARS.map((p) => [p.id, p.defaultPrompt]))
  );
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  const updateState = useCallback(
    (id: string, patch: Partial<PillarState>) => {
      setStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    },
    []
  );

  const dreamPillar = useCallback(
    async (pillar: PillarDef) => {
      const prompt = customPrompts[pillar.id] || pillar.defaultPrompt;
      updateState(pillar.id, { status: 'generating', error: undefined });

      const result = await generate('image', prompt, pillar.context, {
        save: true,
        makeActive: true,
        name: `Community ${pillar.label}`,
        model: 'google/gemini-3-pro-image-preview',
      });

      if (result?.url) {
        updateState(pillar.id, { status: 'success', resultUrl: result.url });
      } else {
        updateState(pillar.id, { status: 'error', error: 'Generation failed' });
      }
    },
    [generate, updateState, customPrompts]
  );

  const dreamAll = useCallback(async () => {
    setIsDreamingAll(true);
    for (const pillar of PILLARS) {
      await dreamPillar(pillar);
    }
    setIsDreamingAll(false);
  }, [dreamPillar]);

  const resetPrompt = useCallback((pillarId: string) => {
    const pillar = PILLARS.find((p) => p.id === pillarId);
    if (pillar) {
      setCustomPrompts((prev) => ({ ...prev, [pillarId]: pillar.defaultPrompt }));
    }
  }, []);

  const isPromptModified = useCallback((pillarId: string) => {
    const pillar = PILLARS.find((p) => p.id === pillarId);
    return pillar ? customPrompts[pillarId] !== pillar.defaultPrompt : false;
  }, [customPrompts]);

  const completedCount = Object.values(states).filter((s) => s.status === 'success').length;
  const progress = (completedCount / PILLARS.length) * 100;

  return (
    <Card className="p-6 space-y-6 bg-card/50 backdrop-blur border-border/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Community Pillar Dreamer
          </h3>
          <p className="text-sm text-muted-foreground">
            Generate AI imagery for all five community showcase pillars
          </p>
        </div>

        <Button
          onClick={dreamAll}
          disabled={isDreamingAll}
          variant="glow"
          size="lg"
        >
          {isDreamingAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Dreaming… ({completedCount}/{PILLARS.length})
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Dream All Pillars
            </>
          )}
        </Button>
      </div>

      {/* Progress bar */}
      {isDreamingAll && (
        <Progress value={progress} className="h-2" />
      )}

      {/* Pillar grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {PILLARS.map((pillar) => {
          const state = states[pillar.id];
          const Icon = pillar.icon;
          const existingAsset = liveAssets.get(pillar.context);
          const isExpanded = expandedPrompt === pillar.id;
          const modified = isPromptModified(pillar.id);

          return (
            <Card
              key={pillar.id}
              className="p-4 space-y-3 border-border/50 bg-background/50 relative overflow-hidden"
            >
              {/* Accent top border */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: pillar.accentColor }}
              />

              {/* Icon + label */}
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" style={{ color: pillar.accentColor }} />
                <span className="font-semibold text-sm">{pillar.label}</span>
                {modified && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/40 text-primary">
                    edited
                  </Badge>
                )}
              </div>

              {/* Preview */}
              <div className="aspect-video rounded-lg overflow-hidden bg-muted/30 border border-border/30">
                {state.resultUrl || existingAsset?.url ? (
                  <img
                    src={state.resultUrl || existingAsset?.url}
                    alt={pillar.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Icon className="w-8 h-8 opacity-30" />
                  </div>
                )}
              </div>

              {/* Inline prompt editor toggle */}
              <button
                type="button"
                onClick={() => setExpandedPrompt(isExpanded ? null : pillar.id)}
                className="w-full flex items-center justify-between gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                <span className="flex items-center gap-1">
                  <Pencil className="w-3 h-3" />
                  {isExpanded ? 'Hide prompt' : 'Edit prompt'}
                </span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {/* Expanded prompt editor */}
              {isExpanded && (
                <div className="space-y-2">
                  <Textarea
                    value={customPrompts[pillar.id]}
                    onChange={(e) =>
                      setCustomPrompts((prev) => ({
                        ...prev,
                        [pillar.id]: e.target.value,
                      }))
                    }
                    className="text-xs min-h-[100px] resize-y bg-background/80 border-border/50 focus:border-primary/50"
                    placeholder="Describe the image you want to generate..."
                  />
                  {modified && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resetPrompt(pillar.id)}
                      className="h-6 text-[11px] text-muted-foreground hover:text-foreground gap-1 px-2"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset to default
                    </Button>
                  )}
                </div>
              )}

              {/* Status + actions */}
              <div className="flex items-center justify-between">
                {state.status === 'idle' && (
                  <Badge variant="secondary" className="text-xs">
                    {existingAsset ? 'Live' : 'Pending'}
                  </Badge>
                )}
                {state.status === 'generating' && (
                  <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    Dreaming…
                  </Badge>
                )}
                {state.status === 'success' && (
                  <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Dreamed
                  </Badge>
                )}
                {state.status === 'error' && (
                  <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/30">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Failed
                  </Badge>
                )}

                {/* Individual dream button */}
                {(state.status === 'idle' || state.status === 'error' || state.status === 'success') && !isDreamingAll && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dreamPillar(pillar)}
                    className="h-7 text-xs"
                  >
                    {state.status === 'success' ? 'Re-dream' : 'Dream'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Context info */}
      <p className="text-xs text-muted-foreground text-center">
        Images are generated via Gemini 3 Pro Image and saved to brand assets with the correct context keys.
        The Community Showcase picks them up automatically via real-time subscription.
      </p>
    </Card>
  );
}
