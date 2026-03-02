/**
 * SocialPublisher — Drawer for publishing selected social posts
 * 
 * Supports copy-to-clipboard workflow (immediate) and will support
 * direct API posting when social platform keys are configured.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Send, Copy, Check, Clock, Calendar, ExternalLink,
    Instagram, Twitter, Facebook, Smartphone, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SocialPost {
    key: string;
    platform: string;
    text?: string;
    caption?: string;
    content?: string;
    hashtags?: string[];
    type?: string;
}

interface SocialPublisherProps {
    open: boolean;
    onClose: () => void;
    selectedPostKeys: string[];
    allPosts: SocialPost[];
    campaignName: string;
}

const PLATFORM_CONFIG: Record<string, { icon: typeof Instagram; label: string; color: string; url: string }> = {
    instagram: { icon: Instagram, label: 'Instagram', color: '#E4405F', url: 'https://www.instagram.com' },
    twitter: { icon: Twitter, label: 'Twitter/X', color: '#1DA1F2', url: 'https://twitter.com/compose/tweet' },
    tiktok: { icon: Smartphone, label: 'TikTok', color: '#00F2EA', url: 'https://www.tiktok.com' },
    facebook: { icon: Facebook, label: 'Facebook', color: '#1877F2', url: 'https://www.facebook.com' },
};

export function SocialPublisher({ open, onClose, selectedPostKeys, allPosts, campaignName }: SocialPublisherProps) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [publishMode, setPublishMode] = useState<'copy' | 'schedule'>('copy');

    const selectedPosts = allPosts.filter(p => selectedPostKeys.includes(p.key));

    // Group by platform
    const byPlatform = selectedPosts.reduce((acc, post) => {
        if (!acc[post.platform]) acc[post.platform] = [];
        acc[post.platform].push(post);
        return acc;
    }, {} as Record<string, SocialPost[]>);

    const copyPost = async (post: SocialPost) => {
        const text = post.text || post.caption || post.content || '';
        const hashtags = post.hashtags || [];
        const fullText = hashtags.length > 0
            ? `${text}\n\n${hashtags.join(' ')}`
            : text;
        await navigator.clipboard.writeText(fullText);
        setCopiedKey(post.key);
        toast.success(`Copied ${PLATFORM_CONFIG[post.platform]?.label || post.platform} post`);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const copyAllForPlatform = async (platform: string) => {
        const posts = byPlatform[platform] || [];
        const allText = posts.map(p => {
            const text = p.text || p.caption || p.content || '';
            const hashtags = p.hashtags || [];
            return hashtags.length > 0 ? `${text}\n\n${hashtags.join(' ')}` : text;
        }).join('\n\n---\n\n');
        await navigator.clipboard.writeText(allText);
        toast.success(`Copied all ${posts.length} ${PLATFORM_CONFIG[platform]?.label} posts`);
    };

    const openPlatform = (platform: string) => {
        const cfg = PLATFORM_CONFIG[platform];
        if (cfg?.url) {
            window.open(cfg.url, '_blank');
        }
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background border-l border-border z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Send className="w-4 h-4 text-primary" />
                                    Publish to Social
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {selectedPosts.length} posts from "{campaignName}"
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Mode Toggle */}
                        <div className="px-5 pt-4 flex gap-2">
                            <button
                                onClick={() => setPublishMode('copy')}
                                className={`mg-pill text-xs font-medium px-4 py-1.5 flex items-center gap-1.5 transition-all ${publishMode === 'copy' ? 'ring-2 ring-primary text-primary' : 'opacity-60'
                                    }`}
                            >
                                <Copy className="w-3 h-3" />
                                Copy & Paste
                            </button>
                            <button
                                onClick={() => setPublishMode('schedule')}
                                className={`mg-pill text-xs font-medium px-4 py-1.5 flex items-center gap-1.5 transition-all ${publishMode === 'schedule' ? 'ring-2 ring-primary text-primary' : 'opacity-60'
                                    }`}
                            >
                                <Calendar className="w-3 h-3" />
                                Schedule
                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Soon</Badge>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {publishMode === 'copy' ? (
                                /* Copy & Paste mode */
                                Object.entries(byPlatform).map(([platform, posts]) => {
                                    const cfg = PLATFORM_CONFIG[platform];
                                    const PlatformIcon = cfg?.icon || Send;

                                    return (
                                        <div key={platform} className="space-y-3">
                                            {/* Platform header */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <PlatformIcon className="w-4 h-4" style={{ color: cfg?.color }} />
                                                    <span className="text-sm font-bold">{cfg?.label || platform}</span>
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {posts.length} post{posts.length > 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                                <div className="flex gap-1.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs gap-1"
                                                        onClick={() => copyAllForPlatform(platform)}
                                                    >
                                                        <Copy className="w-3 h-3" /> Copy All
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs gap-1"
                                                        onClick={() => openPlatform(platform)}
                                                    >
                                                        <ExternalLink className="w-3 h-3" /> Open
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Posts */}
                                            {posts.map((post) => {
                                                const text = post.text || post.caption || post.content || '';
                                                const hashtags = post.hashtags || [];
                                                const isCopied = copiedKey === post.key;

                                                return (
                                                    <motion.div
                                                        key={post.key}
                                                        className="p-3 rounded-lg border border-border/30 hover:border-border/60 transition-all group"
                                                    >
                                                        <p className="text-xs leading-relaxed whitespace-pre-line mb-2">
                                                            {text}
                                                        </p>
                                                        {hashtags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mb-2">
                                                                {hashtags.map((tag: string, j: number) => (
                                                                    <span key={j} className="text-[10px] text-primary/70">
                                                                        {tag.startsWith('#') ? tag : `#${tag}`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs gap-1 w-full"
                                                            onClick={() => copyPost(post)}
                                                        >
                                                            {isCopied ? (
                                                                <>
                                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                                    Copied!
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3 h-3" />
                                                                    Copy This Post
                                                                </>
                                                            )}
                                                        </Button>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    );
                                })
                            ) : (
                                /* Schedule mode — coming soon */
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Clock className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-bold mb-2">Scheduling Coming Soon</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs">
                                        Direct API posting and scheduling will be available once social platform API keys are configured.
                                    </p>
                                    <div className="mt-6 space-y-2 text-left">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Twitter/X API v2
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Meta Graph API (Instagram/Facebook)
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            TikTok Content Posting API
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-border flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                                Tip: Copy each post and paste directly into the platform
                            </p>
                            <Button variant="outline" size="sm" onClick={onClose}>
                                Done
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
