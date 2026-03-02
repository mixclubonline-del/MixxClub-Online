/**
 * MerchLookbook — Photo gallery of styled merch shots.
 * 
 * Masonry-style grid of lookbook images with lightbox.
 * Artists upload photos of their merch being worn in real life.
 * This sells the vibe, not just the product.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight, Camera, Image as ImageIcon } from 'lucide-react';

interface MerchLookbookProps {
    images: string[];
    title?: string;
    className?: string;
}

export function MerchLookbook({ images, title = 'Lookbook', className }: MerchLookbookProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    if (images.length === 0) return null;

    const navigate = (dir: 1 | -1) => {
        if (lightboxIndex === null) return;
        const next = (lightboxIndex + dir + images.length) % images.length;
        setLightboxIndex(next);
    };

    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-3">
                <Camera className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded-full">
                    {images.length} photos
                </span>
            </div>

            {/* Masonry grid */}
            <div className="columns-2 sm:columns-3 gap-2 space-y-2">
                {images.map((img, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="break-inside-avoid cursor-pointer group"
                        onClick={() => setLightboxIndex(i)}
                    >
                        <div className="rounded-xl overflow-hidden relative">
                            <img
                                src={img}
                                alt={`Lookbook ${i + 1}`}
                                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-white/0 group-hover:text-white/80 transition-all duration-300" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center"
                        onClick={() => setLightboxIndex(null)}
                    >
                        {/* Close */}
                        <button
                            onClick={() => setLightboxIndex(null)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 z-10"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Nav arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 z-10"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(1); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 z-10"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        )}

                        {/* Image */}
                        <motion.img
                            key={lightboxIndex}
                            src={images[lightboxIndex]}
                            alt=""
                            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Counter */}
                        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/60 font-mono">
                            {lightboxIndex + 1} / {images.length}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
