/**
 * CampaignAssembly — Rich preview of all 6 campaign asset types
 * 
 * Renders interactive cards for beat (audio player), album art (image preview),
 * track names (copyable list), ad copy (variant cards), social posts (platform tabs),
 * and waveform (SVG visualization).
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Music, Image, FileText, Copy, Check, Play, Pause, Download,
    ExternalLink, Share2, Volume2, ChevronDown, ChevronUp,
    Instagram, Twitter, Facebook, Smartphone,
    Sparkles, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface PromoAsset {
    id: string;
    campaign_id: string;
    asset_type: string;
    generator_function: string;
    content_url: string | null;
    content_text: string | null;
    metadata: any;
    status: string;
    created_at: string;
}

interface CampaignAssemblyProps {
    assets: PromoAsset[];
    campaignName: string;
    onPublishSocial?: (selectedPosts: any[]) => void;
}

// Clipboard copy helper
function useCopyToClipboard() {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const copy = useCallback(async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    }, []);
    return { copiedId, copy };
}

export function CampaignAssembly({ assets, campaignName, onPublishSocial }: CampaignAssemblyProps) {
    const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
    const [activePlatform, setActivePlatform] = useState('all');

    // Group assets by type
    const assetMap = assets.reduce((acc, a) => {
        acc[a.asset_type] = a;
        return acc;
    }, {} as Record<string, PromoAsset>);

    const beat = assetMap['beat'];
    const albumArt = assetMap['album_art'];
    const trackName = assetMap['track_name'];
    const adCopy = assetMap['ad_copy'];
    const socialPost = assetMap['social_post'];
    const waveform = assetMap['waveform'];

    const handleTogglePost = (postKey: string) => {
        setSelectedPosts(prev => {
            const next = new Set(prev);
            if (next.has(postKey)) next.delete(postKey);
            else next.add(postKey);
            return next;
        });
    };

    const handlePublish = () => {
        if (selectedPosts.size === 0) {
            toast.error('Select at least one post to publish');
            return;
        }
        onPublishSocial?.(Array.from(selectedPosts));
    };

    return (
        <div className="space-y-4 pt-2">
            {/* Top row: Beat + Album Art side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beat && <BeatCard asset={beat} />}
                {albumArt && <AlbumArtCard asset={albumArt} />}
            </div>

            {/* Middle row: Track Names + Ad Copy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trackName && <TrackNameCard asset={trackName} />}
                {adCopy && <AdCopyCard asset={adCopy} />}
            </div>

            {/* Waveform */}
            {waveform && <WaveformCard asset={waveform} />}

            {/* Social Posts — full width with platform tabs */}
            {socialPost && (
                <SocialPostsCard
                    asset={socialPost}
                    selectedPosts={selectedPosts}
                    onTogglePost={handleTogglePost}
                    activePlatform={activePlatform}
                    onPlatformChange={setActivePlatform}
                />
            )}

            {/* Publish Action Bar */}
            {socialPost && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mg-panel p-4 flex items-center justify-between"
                    style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))',
                        borderColor: 'hsl(var(--primary) / 0.2)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <Send className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            {selectedPosts.size > 0
                                ? `${selectedPosts.size} post${selectedPosts.size > 1 ? 's' : ''} selected`
                                : 'Select posts to publish'
                            }
                        </span>
                    </div>
                    <Button
                        onClick={handlePublish}
                        disabled={selectedPosts.size === 0}
                        size="sm"
                        className="gap-2"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Publish to Social
                    </Button>
                </motion.div>
            )}
        </div>
    );
}

// ========== BEAT CARD ==========
function BeatCard({ asset }: { asset: PromoAsset }) {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioUrl = asset.content_url || asset.metadata?.audioUrl || asset.metadata?.audio_url;

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setPlaying(!playing);
    };

    return (
        <Card className="mg-panel overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Music className="w-4 h-4 text-primary" />
                    Beat
                    <Badge variant="outline" className="mg-pill text-[10px] ml-auto">
                        {asset.status}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {audioUrl ? (
                    <div className="space-y-3">
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onEnded={() => setPlaying(false)}
                            preload="metadata"
                        />
                        <div
                            className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer hover:scale-[1.01]"
                            style={{ background: 'hsl(var(--primary) / 0.08)' }}
                            onClick={togglePlay}
                        >
                            <button
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                style={{
                                    background: playing
                                        ? 'hsl(var(--primary))'
                                        : 'hsl(var(--primary) / 0.2)',
                                }}
                            >
                                {playing ? (
                                    <Pause className="w-4 h-4 text-primary-foreground" />
                                ) : (
                                    <Play className="w-4 h-4 text-primary ml-0.5" />
                                )}
                            </button>
                            <div className="flex-1">
                                <div className="h-8 flex items-end gap-[2px]">
                                    {Array.from({ length: 40 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 rounded-full transition-all"
                                            style={{
                                                height: `${20 + Math.random() * 80}%`,
                                                background: playing
                                                    ? `hsl(var(--primary) / ${0.3 + Math.random() * 0.7})`
                                                    : 'hsl(var(--muted-foreground) / 0.2)',
                                                animationDuration: playing ? `${0.3 + Math.random() * 0.5}s` : undefined,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <Volume2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={audioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                                onClick={e => e.stopPropagation()}
                            >
                                <ExternalLink className="w-3 h-3" /> Open
                            </a>
                            <a
                                href={audioUrl}
                                download
                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                                onClick={e => e.stopPropagation()}
                            >
                                <Download className="w-3 h-3" /> Download
                            </a>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">No audio generated</p>
                )}
            </CardContent>
        </Card>
    );
}

// ========== ALBUM ART CARD ==========
function AlbumArtCard({ asset }: { asset: PromoAsset }) {
    const [expanded, setExpanded] = useState(false);
    const imageUrl = asset.content_url || asset.metadata?.imageUrl || asset.metadata?.image_url;

    return (
        <Card className="mg-panel overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Image className="w-4 h-4 text-emerald-400" />
                    Album Art
                    <Badge variant="outline" className="mg-pill text-[10px] ml-auto">
                        {asset.status}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {imageUrl ? (
                    <div className="space-y-2">
                        <div
                            className="relative rounded-xl overflow-hidden cursor-pointer group"
                            onClick={() => setExpanded(!expanded)}
                        >
                            <img
                                src={imageUrl}
                                alt="Album Art"
                                className={`w-full object-cover rounded-xl transition-all duration-300 ${expanded ? 'max-h-[500px]' : 'max-h-[180px]'
                                    }`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                                <span className="text-white text-xs flex items-center gap-1">
                                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    {expanded ? 'Collapse' : 'Expand'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {!imageUrl.startsWith('data:') && (
                                <a
                                    href={imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                                >
                                    <ExternalLink className="w-3 h-3" /> Full Size
                                </a>
                            )}
                            <a
                                href={imageUrl}
                                download="album-art.png"
                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                                <Download className="w-3 h-3" /> Download
                            </a>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">No image generated</p>
                )}
            </CardContent>
        </Card>
    );
}

// ========== TRACK NAME CARD ==========
function TrackNameCard({ asset }: { asset: PromoAsset }) {
    const { copiedId, copy } = useCopyToClipboard();
    const suggestions = asset.metadata?.suggestions || [];

    return (
        <Card className="mg-panel">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Track Names
                    <Badge variant="outline" className="mg-pill text-[10px] ml-auto">
                        {suggestions.length} suggestions
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {suggestions.map((s: any, i: number) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start justify-between gap-2 p-2.5 rounded-lg hover:bg-muted/30 transition-colors group"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold">{s.name}</p>
                            {s.reason && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                    {s.reason}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => copy(s.name, `name-${i}`)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted"
                        >
                            {copiedId === `name-${i}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                        </button>
                    </motion.div>
                ))}
                {suggestions.length === 0 && (
                    <p className="text-xs text-muted-foreground">No suggestions generated</p>
                )}
            </CardContent>
        </Card>
    );
}

// ========== AD COPY CARD ==========
function AdCopyCard({ asset }: { asset: PromoAsset }) {
    const { copiedId, copy } = useCopyToClipboard();
    const variants = asset.metadata?.variants || [];

    return (
        <Card className="mg-panel">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Ad Copy
                    <Badge variant="outline" className="mg-pill text-[10px] ml-auto">
                        {variants.length} variants
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {variants.map((v: any, i: number) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-lg border border-border/30 hover:border-border/60 transition-all group"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold">{v.headline}</p>
                                {v.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {v.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => copy(`${v.headline}\n\n${v.description || ''}\n\n${v.cta || ''}`, `ad-${i}`)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted"
                            >
                                {copiedId === `ad-${i}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                        {v.cta && (
                            <Badge className="mt-2 text-[10px]" variant="secondary">
                                {v.cta}
                            </Badge>
                        )}
                    </motion.div>
                ))}
                {variants.length === 0 && (
                    <p className="text-xs text-muted-foreground">No ad copy generated</p>
                )}
            </CardContent>
        </Card>
    );
}

// ========== WAVEFORM CARD ==========
function WaveformCard({ asset }: { asset: PromoAsset }) {
    const data = asset.metadata?.waveformData || [];
    if (data.length === 0) return null;

    const width = 800;
    const height = 80;
    const barWidth = width / data.length;

    return (
        <Card className="mg-panel">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Music className="w-4 h-4 text-violet-400" />
                    Waveform
                    <Badge variant="outline" className="mg-pill text-[10px] ml-auto">
                        {data.length} samples
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-16 rounded-lg"
                    style={{ background: 'hsl(var(--muted) / 0.3)' }}
                >
                    {data.map((v: number, i: number) => {
                        const barHeight = v * height * 0.9;
                        return (
                            <rect
                                key={i}
                                x={i * barWidth}
                                y={(height - barHeight) / 2}
                                width={Math.max(barWidth - 1, 1)}
                                height={barHeight}
                                rx={1}
                                fill={`hsl(var(--primary) / ${0.3 + v * 0.7})`}
                            />
                        );
                    })}
                </svg>
            </CardContent>
        </Card>
    );
}

// ========== SOCIAL POSTS CARD ==========
const PLATFORM_CONFIG: Record<string, { icon: typeof Instagram; label: string; color: string }> = {
    instagram: { icon: Instagram, label: 'Instagram', color: '#E4405F' },
    twitter: { icon: Twitter, label: 'Twitter/X', color: '#1DA1F2' },
    tiktok: { icon: Smartphone, label: 'TikTok', color: '#00F2EA' },
    facebook: { icon: Facebook, label: 'Facebook', color: '#1877F2' },
};

function SocialPostsCard({
    asset,
    selectedPosts,
    onTogglePost,
    activePlatform,
    onPlatformChange,
}: {
    asset: PromoAsset;
    selectedPosts: Set<string>;
    onTogglePost: (key: string) => void;
    activePlatform: string;
    onPlatformChange: (p: string) => void;
}) {
    const { copiedId, copy } = useCopyToClipboard();
    const posts = asset.metadata?.posts || {};
    const platforms = Object.keys(posts);

    // Flatten for "all" view
    const allPosts = platforms.flatMap(platform =>
        (Array.isArray(posts[platform]) ? posts[platform] : []).map((post: any, i: number) => ({
            ...post,
            platform,
            key: `${platform}-${i}`,
        }))
    );

    const visiblePosts = activePlatform === 'all'
        ? allPosts
        : allPosts.filter(p => p.platform === activePlatform);

    return (
        <Card className="mg-panel">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-pink-400" />
                    Social Posts
                    <Badge variant="outline" className="mg-pill text-[10px] ml-auto">
                        {allPosts.length} posts
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Platform Tabs */}
                <div className="flex gap-1.5 flex-wrap">
                    <button
                        onClick={() => onPlatformChange('all')}
                        className={`mg-pill text-[11px] font-medium px-3 py-1 transition-all ${activePlatform === 'all' ? 'ring-2 ring-primary text-primary' : 'opacity-60 hover:opacity-100'
                            }`}
                    >
                        All ({allPosts.length})
                    </button>
                    {platforms.map(platform => {
                        const cfg = PLATFORM_CONFIG[platform];
                        const count = Array.isArray(posts[platform]) ? posts[platform].length : 0;
                        const PlatformIcon = cfg?.icon || FileText;
                        return (
                            <button
                                key={platform}
                                onClick={() => onPlatformChange(platform)}
                                className={`mg-pill text-[11px] font-medium px-3 py-1 transition-all flex items-center gap-1.5 ${activePlatform === platform ? 'ring-2' : 'opacity-60 hover:opacity-100'
                                    }`}
                                style={{
                                    ...(activePlatform === platform ? { borderColor: cfg?.color, color: cfg?.color } : {}),
                                }}
                            >
                                <PlatformIcon className="w-3 h-3" />
                                {cfg?.label || platform} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Post List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    <AnimatePresence mode="popLayout">
                        {visiblePosts.map((post, i) => {
                            const cfg = PLATFORM_CONFIG[post.platform];
                            const isSelected = selectedPosts.has(post.key);
                            const postText = post.text || post.caption || post.content || '';
                            const hashtags = post.hashtags || [];

                            return (
                                <motion.div
                                    key={post.key}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ delay: i * 0.02 }}
                                    className={`p-3 rounded-lg border transition-all group cursor-pointer ${isSelected
                                            ? 'border-primary/50 bg-primary/5'
                                            : 'border-border/30 hover:border-border/60'
                                        }`}
                                    onClick={() => onTogglePost(post.key)}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Select checkbox */}
                                        <div
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${isSelected
                                                    ? 'bg-primary border-primary'
                                                    : 'border-muted-foreground/30'
                                                }`}
                                        >
                                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Platform badge */}
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] gap-1"
                                                    style={{ borderColor: cfg?.color, color: cfg?.color }}
                                                >
                                                    {cfg?.label || post.platform}
                                                </Badge>
                                                {post.type && (
                                                    <span className="text-[10px] text-muted-foreground capitalize">
                                                        {post.type}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Post text */}
                                            <p className="text-xs leading-relaxed whitespace-pre-line">
                                                {postText}
                                            </p>

                                            {/* Hashtags */}
                                            {hashtags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {hashtags.map((tag: string, j: number) => (
                                                        <span
                                                            key={j}
                                                            className="text-[10px] text-primary/70"
                                                        >
                                                            {tag.startsWith('#') ? tag : `#${tag}`}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Copy button */}
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                const fullText = hashtags.length > 0
                                                    ? `${postText}\n\n${hashtags.join(' ')}`
                                                    : postText;
                                                copy(fullText, post.key);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted flex-shrink-0"
                                        >
                                            {copiedId === post.key ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {visiblePosts.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                        No posts for this platform
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
