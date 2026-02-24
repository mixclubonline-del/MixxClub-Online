/**
 * Promo Studio — Internal admin dashboard for campaign creation & management
 * 
 * Uses MixxClub's own generate-* edge functions to create promotional content.
 * The platform that promotes itself.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket, Play, Pause, CheckCircle, AlertCircle, Sparkles,
    Music, Image, Video, FileText, Mic, Wand2, RefreshCw,
    ChevronRight, Clock, Zap, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MIXXCLUB_CHARACTERS, type CharacterId } from '@/config/characters';

// Phase display config
const PHASES = [
    {
        id: 'made-with-mixxclub',
        name: 'Made With MixxClub',
        icon: Music,
        description: '5 original tracks + visuals — all created by our tools',
        color: 'hsl(var(--primary))',
        week: '1-2',
    },
    {
        id: 'character-launch',
        name: 'Character Launch Series',
        icon: Users,
        description: 'Cinematic intros for Jax, Prime, Rell & Nova',
        color: 'hsl(142 76% 36%)',
        week: '2-3',
    },
    {
        id: 'challenge',
        name: 'The MixxClub Challenge',
        icon: Zap,
        description: '24-hour livestreamed production challenge',
        color: 'hsl(45 90% 50%)',
        week: '3-4',
    },
    {
        id: 'insider-drip',
        name: 'Insider Access',
        icon: Sparkles,
        description: 'Personalized AI content for waitlist subscribers',
        color: 'hsl(330 80% 60%)',
        week: '1-6',
    },
    {
        id: 'grand-opening',
        name: 'The Grand Opening',
        icon: Rocket,
        description: 'Live cross-platform launch event',
        color: 'hsl(var(--secondary))',
        week: 'Launch',
    },
] as const;

// Asset type icons
const ASSET_ICONS: Record<string, typeof Music> = {
    beat: Music,
    album_art: Image,
    video: Video,
    ad_copy: FileText,
    social_post: FileText,
    waveform: Music,
    voiceover: Mic,
    landing_image: Image,
    avatar: Users,
    track_name: FileText,
    economy_asset: Sparkles,
};

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle }> = {
    draft: { color: 'text-muted-foreground', icon: Clock },
    generating: { color: 'text-amber-400', icon: RefreshCw },
    ready: { color: 'text-emerald-400', icon: CheckCircle },
    published: { color: 'text-primary', icon: Rocket },
    failed: { color: 'text-red-400', icon: AlertCircle },
    archived: { color: 'text-muted-foreground/50', icon: Pause },
};

interface Campaign {
    id: string;
    name: string;
    phase: string;
    status: string;
    character_id: string | null;
    genre: string | null;
    asset_count: number;
    created_at: string;
    published_at: string | null;
}

interface PromoAsset {
    id: string;
    campaign_id: string;
    asset_type: string;
    generator_function: string;
    content_url: string | null;
    content_text: string | null;
    status: string;
    created_at: string;
}

export default function PromoStudio() {
    const queryClient = useQueryClient();
    const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>('prime');
    const [selectedGenre, setSelectedGenre] = useState('trap');
    const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

    // Fetch campaigns
    const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
        queryKey: ['promo-campaigns'],
        queryFn: async () => {
            const { data, error } = await (supabase.from as any)('promo_campaigns')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Campaign[];
        },
    });

    // Fetch assets for expanded campaign
    const { data: campaignAssets = [] } = useQuery({
        queryKey: ['promo-assets', expandedCampaign],
        queryFn: async () => {
            if (!expandedCampaign) return [];
            const { data, error } = await (supabase.from as any)('promo_assets')
                .select('*')
                .eq('campaign_id', expandedCampaign)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data as PromoAsset[];
        },
        enabled: !!expandedCampaign,
    });

    // Generate campaign mutation
    const generateMutation = useMutation({
        mutationFn: async (params: { phase: string; character: string; genre: string }) => {
            const phaseConfig = PHASES.find(p => p.id === params.phase);
            const { data, error } = await supabase.functions.invoke('orchestrate-promo-campaign', {
                body: {
                    phase: params.phase,
                    name: `${phaseConfig?.name || params.phase} — ${new Date().toLocaleDateString()}`,
                    character: params.character,
                    genre: params.genre,
                },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            toast.success(`Campaign generated! ${data.ready}/${data.total} assets ready.`);
            queryClient.invalidateQueries({ queryKey: ['promo-campaigns'] });
            setSelectedPhase(null);
        },
        onError: (error) => {
            toast.error(`Generation failed: ${error.message}`);
        },
    });

    const handleGenerate = useCallback(() => {
        if (!selectedPhase) return;
        generateMutation.mutate({
            phase: selectedPhase,
            character: selectedCharacter,
            genre: selectedGenre,
        });
    }, [selectedPhase, selectedCharacter, selectedGenre, generateMutation]);

    const genres = ['trap', 'r&b', 'drill', 'lo-fi', 'afrobeats', 'pop', 'latin', 'indie'];
    const characters = Object.values(MIXXCLUB_CHARACTERS);

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="mg-icon w-10 h-10 rounded-xl flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Promo Studio</h1>
                        <Badge variant="outline" className="mg-pill text-xs">
                            Internal
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        The platform that promotes itself. Generate campaign content using MixxClub's own tools.
                    </p>
                </motion.div>

                {/* Campaign Phase Selector */}
                <section className="mb-10">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-primary" />
                        Generate New Campaign
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {PHASES.map((phase, i) => {
                            const PhaseIcon = phase.icon;
                            const isSelected = selectedPhase === phase.id;
                            return (
                                <motion.button
                                    key={phase.id}
                                    onClick={() => setSelectedPhase(isSelected ? null : phase.id)}
                                    className={`mg-panel text-left p-4 transition-all duration-300 ${isSelected ? 'ring-2 ring-primary' : ''
                                        }`}
                                    style={{
                                        borderColor: isSelected ? phase.color : undefined,
                                    }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <PhaseIcon className="w-4 h-4" style={{ color: phase.color }} />
                                        <span className="text-xs text-muted-foreground">Week {phase.week}</span>
                                    </div>
                                    <h3 className="font-bold text-sm mb-1">{phase.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{phase.description}</p>
                                </motion.button>
                            );
                        })}
                    </div>
                </section>

                {/* Generator Config Panel */}
                <AnimatePresence>
                    {selectedPhase && (
                        <motion.section
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-10 overflow-hidden"
                        >
                            <Card className="mg-panel mg-shimmer">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        Configure &amp; Generate
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Character Selection */}
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Character</label>
                                        <div className="flex flex-wrap gap-2">
                                            {characters.map(char => (
                                                <button
                                                    key={char.id}
                                                    onClick={() => setSelectedCharacter(char.id)}
                                                    className={`mg-pill text-xs font-medium transition-all ${selectedCharacter === char.id
                                                            ? 'ring-2 ring-primary'
                                                            : 'opacity-60 hover:opacity-100'
                                                        }`}
                                                    style={{
                                                        color: selectedCharacter === char.id ? char.accentColor : undefined,
                                                    }}
                                                >
                                                    {char.name} — {char.role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Genre Selection */}
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Genre</label>
                                        <div className="flex flex-wrap gap-2">
                                            {genres.map(genre => (
                                                <button
                                                    key={genre}
                                                    onClick={() => setSelectedGenre(genre)}
                                                    className={`mg-pill text-xs font-medium capitalize transition-all ${selectedGenre === genre
                                                            ? 'ring-2 ring-primary text-primary'
                                                            : 'opacity-60 hover:opacity-100'
                                                        }`}
                                                >
                                                    {genre}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Generate Button */}
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={generateMutation.isPending}
                                        size="lg"
                                        className="w-full text-lg h-14 font-bold"
                                    >
                                        {generateMutation.isPending ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Rocket className="w-5 h-5 mr-2" />
                                                Generate Campaign Content
                                            </>
                                        )}
                                    </Button>

                                    {generateMutation.isPending && (
                                        <div className="space-y-2">
                                            <Progress value={33} className="h-2" />
                                            <p className="text-xs text-muted-foreground text-center">
                                                Chaining generate-* functions... this may take a minute
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Campaign List */}
                <section>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Play className="w-4 h-4 text-primary" />
                        Campaigns ({campaigns.length})
                    </h2>

                    {loadingCampaigns ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-20 rounded-xl" />
                            ))}
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="mg-panel p-12 text-center">
                            <Rocket className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                            <p className="text-muted-foreground">No campaigns yet. Select a phase above to generate your first one.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {campaigns.map((campaign, i) => {
                                const phase = PHASES.find(p => p.id === campaign.phase);
                                const statusCfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
                                const StatusIcon = statusCfg.icon;
                                const isExpanded = expandedCampaign === campaign.id;
                                const character = campaign.character_id ? MIXXCLUB_CHARACTERS[campaign.character_id as CharacterId] : null;

                                return (
                                    <motion.div
                                        key={campaign.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                    >
                                        <button
                                            onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)}
                                            className="mg-panel w-full text-left p-4 transition-all hover:scale-[1.005]"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="mg-icon w-8 h-8 rounded-lg flex items-center justify-center"
                                                        style={{ color: phase?.color }}
                                                    >
                                                        {phase && <phase.icon className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-sm">{campaign.name}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>{phase?.name}</span>
                                                            {character && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span style={{ color: character.accentColor }}>{character.name}</span>
                                                                </>
                                                            )}
                                                            {campaign.genre && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="capitalize">{campaign.genre}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className={`flex items-center gap-1.5 text-xs ${statusCfg.color}`}>
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        <span className="capitalize">{campaign.status}</span>
                                                    </div>
                                                    <Badge variant="outline" className="mg-pill text-xs">
                                                        {campaign.asset_count} assets
                                                    </Badge>
                                                    <ChevronRight
                                                        className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        </button>

                                        {/* Expanded asset list */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mg-panel ml-6 mt-1 p-4 space-y-2">
                                                        {campaignAssets.length === 0 ? (
                                                            <p className="text-xs text-muted-foreground">Loading assets...</p>
                                                        ) : (
                                                            campaignAssets.map(asset => {
                                                                const AssetIcon = ASSET_ICONS[asset.asset_type] || FileText;
                                                                const assetStatus = STATUS_CONFIG[asset.status] || STATUS_CONFIG.draft;
                                                                return (
                                                                    <div
                                                                        key={asset.id}
                                                                        className="flex items-center justify-between py-2 border-b border-border/20 last:border-0"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <AssetIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                                                            <span className="text-xs font-medium capitalize">
                                                                                {asset.asset_type.replace('_', ' ')}
                                                                            </span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                via {asset.generator_function}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {asset.content_url && (
                                                                                <a
                                                                                    href={asset.content_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-xs text-primary hover:underline"
                                                                                    onClick={e => e.stopPropagation()}
                                                                                >
                                                                                    View
                                                                                </a>
                                                                            )}
                                                                            {asset.content_text && (
                                                                                <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                                                    {asset.content_text}
                                                                                </span>
                                                                            )}
                                                                            <span className={`text-xs ${assetStatus.color}`}>
                                                                                {asset.status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
