import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Lock, Swords, ShoppingBag, GraduationCap, Radio,
  Sparkles, CheckCircle, AlertCircle, Loader2, Zap,
  LucideIcon,
} from 'lucide-react';
import { useDreamEngine } from '@/hooks/useDreamEngine';

/* ─── pillar definitions ─── */
interface PillarDef {
  id: string;
  context: string;
  icon: LucideIcon;
  label: string;
  prompt: string;
  accentColor: string;
}

const PILLARS: PillarDef[] = [
  {
    id: 'unlockables',
    context: 'community_unlockables',
    icon: Lock,
    label: 'Unlockables',
    prompt:
      'A futuristic progression matrix floating in a dark space, five glowing pathways radiating from a central hub, each path a different color (purple, cyan, amber, pink, green), tiered milestone markers along each path like checkpoints in a video game, holographic achievement badges orbiting the structure, dark background with subtle grid lines, music industry aesthetic meets sci-fi RPG progression system, ultra high resolution',
    accentColor: 'hsl(263 70% 63%)',
  },
  {
    id: 'battles',
    context: 'community_battles',
    icon: Swords,
    label: 'Battles',
    prompt:
      'Two music producers facing off in a neon-lit arena, turntables and mixing consoles as weapons, crowd of spectators visible in silhouette behind glowing barriers, scoreboard floating above showing versus scores, purple and red lighting clash in the center, hip-hop battle culture meets esports arena, dramatic spotlight, smoke effects, urban energy, ultra high resolution',
    accentColor: 'hsl(350 80% 55%)',
  },
  {
    id: 'merch',
    context: 'community_merch',
    icon: ShoppingBag,
    label: 'Merch',
    prompt:
      'A sleek digital storefront floating in space, holographic product displays showing vinyl records, beat packs, branded streetwear, preset bundles, and sample pack cubes, neon price tags in MixxCoinz currency, shopping cart with glowing items, modern e-commerce meets music culture aesthetic, clean dark UI with accent lighting, ultra high resolution',
    accentColor: 'hsl(160 84% 40%)',
  },
  {
    id: 'learning',
    context: 'community_learning',
    icon: GraduationCap,
    label: 'Learning',
    prompt:
      'A masterclass in session inside a futuristic studio classroom, a veteran engineer at a massive mixing console teaching a small group, holographic waveforms and EQ curves floating in the air as visual aids, certification badges displayed on the wall, warm amber and cyan lighting, knowledge transfer moment, mentorship atmosphere, professional music education, ultra high resolution',
    accentColor: 'hsl(180 100% 50%)',
  },
  {
    id: 'sessions',
    context: 'community_sessions',
    icon: Radio,
    label: 'Sessions',
    prompt:
      'A live collaborative music session viewed through a floating holographic screen, multiple participants visible in small video panels around a central waveform visualization, real-time chat messages scrolling, listening party atmosphere with glowing audio meters, purple and pink neon accents, community gathering around music being created, intimate yet connected feeling, ultra high resolution',
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

  const updateState = useCallback(
    (id: string, patch: Partial<PillarState>) => {
      setStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    },
    []
  );

  const dreamPillar = useCallback(
    async (pillar: PillarDef) => {
      updateState(pillar.id, { status: 'generating', error: undefined });

      const result = await generate('image', pillar.prompt, pillar.context, {
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
    [generate, updateState]
  );

  const dreamAll = useCallback(async () => {
    setIsDreamingAll(true);
    for (const pillar of PILLARS) {
      await dreamPillar(pillar);
    }
    setIsDreamingAll(false);
  }, [dreamPillar]);

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

              {/* Status */}
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

                {/* Individual retry */}
                {(state.status === 'idle' || state.status === 'error') && !isDreamingAll && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dreamPillar(pillar)}
                    className="h-7 text-xs"
                  >
                    Dream
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
