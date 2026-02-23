/**
 * PortfolioGrid — Masonry-style visual grid for cover art, studio shots, etc.
 * 
 * Responsive columns (2 on mobile, 3 on md, 4 on lg). Click to expand.
 * Supports category filtering.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, ZoomIn, Image as ImageIcon, Filter } from 'lucide-react';
import type { PortfolioItem } from './types';

interface PortfolioGridProps {
    items: PortfolioItem[];
    className?: string;
}

const CATEGORIES = [
    { value: 'all', label: 'All' },
    { value: 'cover-art', label: 'Cover Art' },
    { value: 'studio', label: 'Studio' },
    { value: 'live', label: 'Live' },
    { value: 'promo', label: 'Promo' },
] as const;

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({ items, className }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');

    const filteredItems = filter === 'all'
        ? items
        : items.filter((item) => item.category === filter);

    const selectedItem = items.find((i) => i.id === selectedId);

    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No portfolio items yet</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Filter tabs */}
            {items.some((i) => i.category) && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mr-1" />
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setFilter(cat.value)}
                            className={cn(
                                'px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                                filter === cat.value
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'bg-white/5 text-muted-foreground border border-white/8 hover:bg-white/10'
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Grid */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
                <AnimatePresence>
                    {filteredItems.map((item, i) => (
                        <motion.div
                            key={item.id}
                            layoutId={`portfolio-${item.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className="break-inside-avoid group cursor-pointer"
                            onClick={() => setSelectedId(item.id)}
                        >
                            <div className="relative rounded-xl overflow-hidden border border-white/8 bg-white/[0.03]">
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{item.title}</p>
                                        {item.caption && (
                                            <p className="text-[11px] text-white/60 truncate">{item.caption}</p>
                                        )}
                                    </div>
                                    <ZoomIn className="h-4 w-4 text-white/60 flex-shrink-0" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setSelectedId(null)}
                    >
                        <motion.div
                            layoutId={`portfolio-${selectedItem.id}`}
                            className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedItem.imageUrl}
                                alt={selectedItem.title}
                                className="w-full h-full object-contain rounded-2xl"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <h3 className="text-lg font-bold text-white">{selectedItem.title}</h3>
                                {selectedItem.caption && (
                                    <p className="text-sm text-white/60 mt-1">{selectedItem.caption}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <X className="h-4 w-4 text-white" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
