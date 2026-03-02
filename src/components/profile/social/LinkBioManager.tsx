/**
 * LinkBioManager — Branded link-in-bio cards with categories.
 * 
 * Editor mode: add/edit/delete/reorder links.
 * Display mode: styled link cards with category icons.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus, ExternalLink, Trash2, GripVertical, Edit2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LinkCard } from './types';
import { LINK_CATEGORIES } from './types';

interface LinkBioManagerProps {
    links: LinkCard[];
    onChange?: (links: LinkCard[]) => void;
    editable?: boolean;
    accent?: string;
}

export const LinkBioManager: React.FC<LinkBioManagerProps> = ({
    links,
    onChange,
    editable = false,
    accent = '#f97316',
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newLink, setNewLink] = useState<Partial<LinkCard>>({
        title: '',
        url: '',
        category: 'other',
    });

    const addLink = () => {
        if (!newLink.title || !newLink.url || !onChange) return;
        const link: LinkCard = {
            id: Date.now().toString(),
            title: newLink.title,
            url: newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`,
            category: newLink.category || 'other',
            icon: LINK_CATEGORIES.find(c => c.value === newLink.category)?.emoji,
            clicks: 0,
        };
        onChange([...links, link]);
        setNewLink({ title: '', url: '', category: 'other' });
        setIsAdding(false);
    };

    const removeLink = (id: string) => {
        onChange?.(links.filter(l => l.id !== id));
    };

    const getCategoryInfo = (cat: LinkCard['category']) =>
        LINK_CATEGORIES.find(c => c.value === cat) || LINK_CATEGORIES[4];

    if (links.length === 0 && !editable) {
        return null;
    }

    return (
        <div className="space-y-3">
            {/* Link cards */}
            <AnimatePresence>
                {links.map((link, i) => {
                    const cat = getCategoryInfo(link.category);
                    return (
                        <motion.a
                            key={link.id}
                            href={editable ? undefined : link.url}
                            target={editable ? undefined : '_blank'}
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn(
                                'flex items-center gap-3 p-3.5 rounded-xl border transition-all',
                                'bg-white/[0.03] border-white/8',
                                !editable && 'hover:bg-white/8 hover:border-white/15 cursor-pointer group'
                            )}
                        >
                            {/* Drag handle (edit mode) */}
                            {editable && (
                                <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab flex-shrink-0" />
                            )}

                            {/* Category emoji */}
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                style={{ backgroundColor: `${accent}15` }}
                            >
                                {link.icon || cat.emoji}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">{link.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                </p>
                            </div>

                            {/* Actions */}
                            {editable ? (
                                <button
                                    onClick={(e) => { e.preventDefault(); removeLink(link.id); }}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            ) : (
                                <ExternalLink className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors flex-shrink-0" />
                            )}
                        </motion.a>
                    );
                })}
            </AnimatePresence>

            {/* Add link form */}
            {editable && (
                <AnimatePresence>
                    {isAdding ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Title</Label>
                                        <Input
                                            value={newLink.title || ''}
                                            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                                            placeholder="My Spotify"
                                            className="h-9 bg-white/5 border-white/10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">URL</Label>
                                        <Input
                                            value={newLink.url || ''}
                                            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                            placeholder="https://..."
                                            className="h-9 bg-white/5 border-white/10 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Category pills */}
                                <div className="flex flex-wrap gap-1.5">
                                    {LINK_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setNewLink({ ...newLink, category: cat.value })}
                                            className={cn(
                                                'px-2.5 py-1 rounded-full text-xs transition-all',
                                                newLink.category === cat.value
                                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                                    : 'bg-white/5 text-muted-foreground border border-white/8'
                                            )}
                                        >
                                            {cat.emoji} {cat.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                                        <X className="h-3.5 w-3.5 mr-1" /> Cancel
                                    </Button>
                                    <Button size="sm" onClick={addLink} disabled={!newLink.title || !newLink.url}>
                                        <Check className="h-3.5 w-3.5 mr-1" /> Add Link
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAdding(true)}
                            className="w-full border-dashed border-white/15 text-muted-foreground hover:text-foreground"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Link
                        </Button>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};
