/**
 * GatedContentCreator — Artist-facing UI to create coinz-gated exclusives.
 * 
 * Form to set title, type, price, and upload content URL.
 * Lists existing gated items with stats.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lock, Plus, Coins, Users, X, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GlassPanel, HubHeader } from '@/components/crm/design';
import { useGatedContent, type GatedItem } from '@/hooks/useGatedContent';
import { useAuth } from '@/hooks/useAuth';

const CONTENT_TYPES: { value: GatedItem['content_type']; label: string; emoji: string }[] = [
    { value: 'stems', label: 'Stem Pack', emoji: '🎛️' },
    { value: 'tutorial', label: 'Tutorial', emoji: '🎓' },
    { value: 'behind_scenes', label: 'Behind the Scenes', emoji: '🎬' },
    { value: 'early_access', label: 'Early Access', emoji: '🚀' },
    { value: 'sample_pack', label: 'Sample Pack', emoji: '🥁' },
    { value: 'preset', label: 'Preset Pack', emoji: '🎨' },
    { value: 'custom', label: 'Custom', emoji: '✨' },
];

export function GatedContentCreator() {
    const { user } = useAuth();
    const { items, createItem, isCreating } = useGatedContent(user?.id);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [contentType, setContentType] = useState<GatedItem['content_type']>('stems');
    const [price, setPrice] = useState(50);
    const [contentUrl, setContentUrl] = useState('');
    const [previewText, setPreviewText] = useState('');

    const handleCreate = async () => {
        if (!title || !contentUrl || price <= 0) return;
        await createItem({
            title,
            description,
            content_type: contentType,
            coinz_price: price,
            content_url: contentUrl,
            preview_text: previewText || undefined,
        });
        setTitle('');
        setDescription('');
        setPrice(50);
        setContentUrl('');
        setPreviewText('');
        setShowForm(false);
    };

    const myItems = items.filter(i => i.creator_id === user?.id);

    return (
        <div className="space-y-5">
            <HubHeader
                icon={<Lock className="h-5 w-5 text-violet-400" />}
                title="Gated Content"
                subtitle="Sell exclusive content for MixxCoinz"
                accent="rgba(139, 92, 246, 0.5)"
            />

            {/* Existing items */}
            {myItems.length > 0 && (
                <div className="space-y-2">
                    {myItems.map((item) => (
                        <GlassPanel key={item.id} padding="p-3" accent="rgba(139, 92, 246, 0.1)">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                        {CONTENT_TYPES.find(t => t.value === item.content_type)?.emoji || '✨'}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {item.coinz_price} 🪙 · {item.total_unlocks} unlocks · {item.total_revenue.toLocaleString()} earned
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <Users className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">{item.total_unlocks}</span>
                                </div>
                            </div>
                        </GlassPanel>
                    ))}
                </div>
            )}

            {/* Create button / form */}
            <AnimatePresence mode="wait">
                {showForm ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <GlassPanel padding="p-4" glow accent="rgba(139, 92, 246, 0.2)">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium text-foreground">New Gated Content</p>
                                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Title</Label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="My exclusive stem pack"
                                        className="h-9 bg-white/5 border-white/10 text-sm"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">Type</Label>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {CONTENT_TYPES.map((ct) => (
                                            <button
                                                key={ct.value}
                                                onClick={() => setContentType(ct.value)}
                                                className={cn(
                                                    'px-2.5 py-1 rounded-lg text-xs transition-all border',
                                                    contentType === ct.value
                                                        ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                                                        : 'bg-white/5 text-muted-foreground border-white/8 hover:bg-white/10'
                                                )}
                                            >
                                                {ct.emoji} {ct.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">Description</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What fans get when they unlock..."
                                        rows={2}
                                        className="bg-white/5 border-white/10 text-sm resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Price (🪙)</Label>
                                        <Input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(Math.max(1, parseInt(e.target.value) || 0))}
                                            min={1}
                                            className="h-9 bg-white/5 border-white/10 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Content URL</Label>
                                        <Input
                                            value={contentUrl}
                                            onChange={(e) => setContentUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="h-9 bg-white/5 border-white/10 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">Preview Text (shown before unlock)</Label>
                                    <Input
                                        value={previewText}
                                        onChange={(e) => setPreviewText(e.target.value)}
                                        placeholder="Get the full stems for my latest track..."
                                        className="h-9 bg-white/5 border-white/10 text-sm"
                                    />
                                </div>

                                <Button
                                    onClick={handleCreate}
                                    disabled={isCreating || !title || !contentUrl || price <= 0}
                                    className="w-full gap-2"
                                >
                                    {isCreating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Lock className="h-4 w-4" />
                                    )}
                                    Create Gated Content
                                </Button>
                            </div>
                        </GlassPanel>
                    </motion.div>
                ) : (
                    <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Button
                            onClick={() => setShowForm(true)}
                            variant="outline"
                            className="w-full gap-2 border-violet-500/20 text-violet-400 hover:bg-violet-500/10"
                        >
                            <Plus className="h-4 w-4" />
                            Create Gated Content
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
