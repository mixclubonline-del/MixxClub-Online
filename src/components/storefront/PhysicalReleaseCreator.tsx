/**
 * PhysicalReleaseCreator — Artist-facing UI to create physical music releases.
 * 
 * Step-by-step: Album Info → Format & Packaging → Tracklist → Pricing & Edition → Preview
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Disc3, Plus, X, ChevronLeft, ChevronRight, Loader2, Check,
    Music, Package, ListMusic, DollarSign, Eye, Coins, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { GlassPanel } from '@/components/crm/design';
import { usePhysicalOrders, type TrackEntry } from '@/hooks/usePhysicalOrders';
import {
    PHYSICAL_FORMATS, PACKAGING_TIERS, VINYL_COLORS, FORMAT_CATEGORIES,
    type PhysicalFormat, type PackagingTier,
} from '@/hooks/PhysicalMediaConfig';
import { useStorefront } from '@/hooks/useStorefront';
import { useAuth } from '@/hooks/useAuth';

type Step = 'album' | 'format' | 'tracklist' | 'pricing' | 'preview';

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'album', label: 'Album Info', icon: <Music className="h-3.5 w-3.5" /> },
    { key: 'format', label: 'Format', icon: <Disc3 className="h-3.5 w-3.5" /> },
    { key: 'tracklist', label: 'Tracklist', icon: <ListMusic className="h-3.5 w-3.5" /> },
    { key: 'pricing', label: 'Pricing', icon: <DollarSign className="h-3.5 w-3.5" /> },
    { key: 'preview', label: 'Preview', icon: <Eye className="h-3.5 w-3.5" /> },
];

interface PhysicalReleaseCreatorProps {
    onClose: () => void;
    onCreated?: (id: string) => void;
}

export function PhysicalReleaseCreator({ onClose, onCreated }: PhysicalReleaseCreatorProps) {
    const { user } = useAuth();
    const { storefront } = useStorefront(user?.id);
    const { createRelease, isCreating } = usePhysicalOrders(storefront?.id);

    const [step, setStep] = useState<Step>('album');
    const stepIndex = STEPS.findIndex(s => s.key === step);

    // Step 1: Album Info
    const [title, setTitle] = useState('');
    const [artistName, setArtistName] = useState('');
    const [description, setDescription] = useState('');

    // Step 2: Format
    const [format, setFormat] = useState<PhysicalFormat>('vinyl_standard');
    const [packaging, setPackaging] = useState<PackagingTier>('standard');
    const [vinylColor, setVinylColor] = useState('Classic Black');

    // Step 3: Tracklist
    const [tracks, setTracks] = useState<TrackEntry[]>([
        { number: 1, title: '', side: 'A' },
    ]);

    // Step 4: Pricing & Edition
    const [price, setPrice] = useState(30);
    const [coinzPrice, setCoinzPrice] = useState<number | undefined>();
    const [editionSize, setEditionSize] = useState(100);
    const [isNumbered, setIsNumbered] = useState(true);
    const [isSigned, setIsSigned] = useState(false);
    const [isPreorder, setIsPreorder] = useState(true);
    const [releaseDate, setReleaseDate] = useState('');
    const [shipDate, setShipDate] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatConfig = PHYSICAL_FORMATS[format];
    const packagingConfig = PACKAGING_TIERS[packaging];
    const isVinyl = formatConfig.category === 'vinyl';

    const addTrack = () => {
        const lastTrack = tracks[tracks.length - 1];
        const newSide = isVinyl && tracks.length >= 5 ? 'B' : lastTrack?.side || 'A';
        setTracks(prev => [...prev, { number: prev.length + 1, title: '', side: newSide as 'A' | 'B' }]);
    };

    const updateTrack = (idx: number, field: keyof TrackEntry, value: string) => {
        setTracks(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
    };

    const removeTrack = (idx: number) => {
        setTracks(prev => prev.filter((_, i) => i !== idx).map((t, i) => ({ ...t, number: i + 1 })));
    };

    const totalPrice = price + packagingConfig.priceAdd;
    const potentialRevenue = totalPrice * editionSize;

    const canProceed = (): boolean => {
        switch (step) {
            case 'album': return title.trim().length > 0 && artistName.trim().length > 0;
            case 'format': return true;
            case 'tracklist': return tracks.some(t => t.title.trim().length > 0);
            case 'pricing': return price > 0 && editionSize >= formatConfig.minRun && releaseDate.length > 0;
            case 'preview': return true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        if (!storefront?.id) return;
        setIsSubmitting(true);
        try {
            const release = await createRelease({
                title,
                artist_name: artistName,
                description,
                format,
                packaging,
                vinyl_color: isVinyl ? vinylColor : undefined,
                tracklist: tracks.filter(t => t.title.trim()),
                price: totalPrice,
                coinz_price: coinzPrice,
                edition_size: editionSize,
                is_numbered: isNumbered,
                is_signed: isSigned,
                is_preorder: isPreorder,
                release_date: new Date(releaseDate).toISOString(),
                ship_date: shipDate ? new Date(shipDate).toISOString() : undefined,
            });
            onCreated?.(release.id);
            onClose();
        } catch {
            // Error handled by mutation
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-2xl bg-[#0d0d1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Disc3 className="h-5 w-5 text-violet-400" />
                        <h2 className="text-lg font-bold text-foreground">Create Physical Release</h2>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                </div>

                {/* Step indicators */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s.key}>
                            <button
                                onClick={() => i <= stepIndex && setStep(s.key)}
                                className={cn(
                                    'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all',
                                    step === s.key ? 'bg-violet-500/20 text-violet-300 font-medium' :
                                        i < stepIndex ? 'text-green-400 cursor-pointer' : 'text-muted-foreground'
                                )}
                            >
                                {i < stepIndex ? <Check className="h-3 w-3" /> : s.icon}
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={cn('h-px flex-1', i < stepIndex ? 'bg-green-500/30' : 'bg-white/5')} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <AnimatePresence mode="wait">
                        {/* ── STEP 1: Album Info ── */}
                        {step === 'album' && (
                            <motion.div key="album" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Album / EP / Single Title *</Label>
                                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder='e.g. "Midnight Chronicles"' className="h-11 bg-white/5 border-white/10 text-base" />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Artist Name *</Label>
                                    <Input value={artistName} onChange={e => setArtistName(e.target.value)} placeholder="Your artist name" className="h-11 bg-white/5 border-white/10" />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Description</Label>
                                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell your fans about this release..." rows={3} className="bg-white/5 border-white/10 resize-none" />
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: Format & Packaging ── */}
                        {step === 'format' && (
                            <motion.div key="format" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                {/* Format picker */}
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-2 block">Format</Label>
                                    {FORMAT_CATEGORIES.map(cat => (
                                        <div key={cat.key} className="mb-3">
                                            <p className="text-[10px] text-muted-foreground mb-1.5">{cat.emoji} {cat.label}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {cat.formats.map(fKey => {
                                                    const fc = PHYSICAL_FORMATS[fKey as PhysicalFormat];
                                                    if (!fc) return null;
                                                    return (
                                                        <button
                                                            key={fc.format}
                                                            onClick={() => { setFormat(fc.format); setPrice(fc.priceRange[0]); }}
                                                            className={cn(
                                                                'px-2.5 py-1.5 rounded-lg text-[11px] border transition-all',
                                                                format === fc.format
                                                                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                                                                    : 'bg-white/5 text-muted-foreground border-white/8 hover:bg-white/10'
                                                            )}
                                                        >
                                                            {fc.emoji} {fc.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-[9px] text-muted-foreground">{formatConfig.specs}</p>
                                </div>

                                {/* Vinyl color */}
                                {isVinyl && format !== 'vinyl_standard' && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground mb-2 block">Vinyl Color — {vinylColor}</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {VINYL_COLORS.map(vc => (
                                                <button
                                                    key={vc.name}
                                                    onClick={() => setVinylColor(vc.name)}
                                                    title={`${vc.name} (${vc.type})`}
                                                    className={cn(
                                                        'w-8 h-8 rounded-full border-2 transition-all relative',
                                                        vinylColor === vc.name
                                                            ? 'border-violet-400 ring-2 ring-violet-400/30 scale-110'
                                                            : 'border-white/10 hover:border-white/30'
                                                    )}
                                                    style={{ background: vc.hex }}
                                                >
                                                    {vinylColor === vc.name && <Check className="h-3 w-3 absolute inset-0 m-auto text-white" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Packaging */}
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-2 block">Packaging</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.values(PACKAGING_TIERS).map(pkg => (
                                            <button
                                                key={pkg.tier}
                                                onClick={() => setPackaging(pkg.tier)}
                                                className={cn(
                                                    'p-3 rounded-xl border text-left transition-all',
                                                    packaging === pkg.tier ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.03] border-white/8 hover:bg-white/5'
                                                )}
                                            >
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span>{pkg.emoji}</span>
                                                    <span className="text-xs font-medium text-foreground">{pkg.label}</span>
                                                    {pkg.priceAdd > 0 && <span className="text-[9px] text-violet-400">+${pkg.priceAdd}</span>}
                                                </div>
                                                <p className="text-[9px] text-muted-foreground">{pkg.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 3: Tracklist ── */}
                        {step === 'tracklist' && (
                            <motion.div key="tracklist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                                {isVinyl && <p className="text-[10px] text-muted-foreground">Side A / Side B — toggle per track for vinyl layout</p>}

                                {tracks.map((track, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground w-6 text-right">{track.number}.</span>
                                        {isVinyl && (
                                            <button
                                                onClick={() => updateTrack(idx, 'side', track.side === 'A' ? 'B' : 'A')}
                                                className={cn(
                                                    'px-1.5 py-0.5 rounded text-[9px] font-mono border',
                                                    track.side === 'A' ? 'bg-violet-500/15 text-violet-300 border-violet-500/20' : 'bg-amber-500/15 text-amber-300 border-amber-500/20'
                                                )}
                                            >
                                                {track.side}
                                            </button>
                                        )}
                                        <Input
                                            value={track.title}
                                            onChange={e => updateTrack(idx, 'title', e.target.value)}
                                            placeholder="Track title"
                                            className="h-8 bg-white/5 border-white/10 text-sm flex-1"
                                        />
                                        <Input
                                            value={track.duration || ''}
                                            onChange={e => updateTrack(idx, 'duration', e.target.value)}
                                            placeholder="3:45"
                                            className="h-8 bg-white/5 border-white/10 text-sm w-16"
                                        />
                                        {tracks.length > 1 && (
                                            <button onClick={() => removeTrack(idx)} className="text-muted-foreground hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
                                        )}
                                    </div>
                                ))}

                                <Button variant="outline" size="sm" onClick={addTrack} className="gap-1 border-dashed border-white/15 text-muted-foreground">
                                    <Plus className="h-3.5 w-3.5" /> Add Track
                                </Button>
                            </motion.div>
                        )}

                        {/* ── STEP 4: Pricing & Edition ── */}
                        {step === 'pricing' && (
                            <motion.div key="pricing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Base Price ($)</Label>
                                        <Input type="number" value={price} onChange={e => setPrice(Math.max(1, parseFloat(e.target.value) || 0))} className="h-10 bg-white/5 border-white/10" />
                                        <p className="text-[9px] text-muted-foreground mt-0.5">
                                            + ${packagingConfig.priceAdd} ({packagingConfig.label}) = **${totalPrice}**
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Edition Size</Label>
                                        <Input type="number" value={editionSize} onChange={e => setEditionSize(Math.max(formatConfig.minRun, parseInt(e.target.value) || 0))} className="h-10 bg-white/5 border-white/10" />
                                        <p className="text-[9px] text-muted-foreground mt-0.5">Min: {formatConfig.minRun} copies</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">Release Date *</Label>
                                    <Input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} className="h-10 bg-white/5 border-white/10" />
                                </div>

                                {isPreorder && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Expected Ship Date</Label>
                                        <Input type="date" value={shipDate} onChange={e => setShipDate(e.target.value)} className="h-10 bg-white/5 border-white/10" />
                                        <p className="text-[9px] text-muted-foreground mt-0.5">Lead time: ~{formatConfig.leadTimeWeeks} weeks for {formatConfig.label}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {formatConfig.supportsNumbered && (
                                        <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                                            <div>
                                                <p className="text-sm text-foreground">Numbered Edition</p>
                                                <p className="text-[10px] text-muted-foreground">Each copy gets a unique number (e.g. #42 of 300)</p>
                                            </div>
                                            <Switch checked={isNumbered} onCheckedChange={setIsNumbered} />
                                        </div>
                                    )}
                                    {formatConfig.supportsSigned && (
                                        <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                                            <div>
                                                <p className="text-sm text-foreground">Signed Edition</p>
                                                <p className="text-[10px] text-muted-foreground">Personally signed by the artist</p>
                                            </div>
                                            <Switch checked={isSigned} onCheckedChange={setIsSigned} />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                                        <div>
                                            <p className="text-sm text-foreground">Pre-Order</p>
                                            <p className="text-[10px] text-muted-foreground">Accept orders before production is complete</p>
                                        </div>
                                        <Switch checked={isPreorder} onCheckedChange={setIsPreorder} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                                        <div className="flex items-center gap-2">
                                            <Coins className="h-4 w-4 text-amber-400" />
                                            <div>
                                                <p className="text-sm text-foreground">Accept MixxCoinz</p>
                                                <p className="text-[10px] text-muted-foreground">Set a coinz price alongside USD</p>
                                            </div>
                                        </div>
                                        <Input
                                            type="number"
                                            value={coinzPrice || ''}
                                            onChange={e => setCoinzPrice(parseInt(e.target.value) || undefined)}
                                            placeholder="e.g. 2500"
                                            className="w-24 h-8 bg-white/5 border-white/10 text-sm text-right"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 5: Preview ── */}
                        {step === 'preview' && (
                            <motion.div key="preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <GlassPanel padding="p-5" glow accent="rgba(139, 92, 246, 0.2)">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-3xl">
                                            {formatConfig.emoji}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">{title}</h3>
                                            <p className="text-sm text-muted-foreground">{artistName}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Badge variant="outline" className="text-[9px] bg-violet-500/10 text-violet-300 border-violet-500/20">
                                                    {formatConfig.label}
                                                </Badge>
                                                <Badge variant="outline" className="text-[9px] bg-white/5 text-muted-foreground border-white/10">
                                                    {packagingConfig.emoji} {packagingConfig.label}
                                                </Badge>
                                                {isNumbered && <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20">#Numbered</Badge>}
                                                {isSigned && <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20">✍️ Signed</Badge>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tracklist preview */}
                                    {tracks.filter(t => t.title.trim()).length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs text-muted-foreground mb-1.5">Tracklist</p>
                                            <div className="space-y-0.5">
                                                {tracks.filter(t => t.title.trim()).map(t => (
                                                    <div key={t.number} className="flex items-center gap-2 py-1 px-2 bg-white/[0.02] rounded">
                                                        {isVinyl && <span className="text-[9px] font-mono text-violet-400">{t.side}</span>}
                                                        <span className="text-[10px] text-muted-foreground">{t.number}.</span>
                                                        <span className="text-xs text-foreground">{t.title}</span>
                                                        {t.duration && <span className="text-[10px] text-muted-foreground ml-auto">{t.duration}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div className="bg-white/5 rounded-lg p-2.5 text-center">
                                            <p className="text-lg font-bold text-foreground">${totalPrice}</p>
                                            <p className="text-[9px] text-muted-foreground">Per copy</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2.5 text-center">
                                            <p className="text-lg font-bold text-violet-400">{editionSize}</p>
                                            <p className="text-[9px] text-muted-foreground">Edition size</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2.5 text-center">
                                            <p className="text-lg font-bold text-green-400">${potentialRevenue.toLocaleString()}</p>
                                            <p className="text-[9px] text-muted-foreground">If sold out</p>
                                        </div>
                                    </div>

                                    {isVinyl && vinylColor !== 'Classic Black' && (
                                        <p className="text-xs text-muted-foreground">
                                            🎨 Vinyl: {vinylColor}
                                        </p>
                                    )}
                                    {isPreorder && shipDate && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            📦 Ships ~{new Date(shipDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                    )}
                                </GlassPanel>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/8 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => stepIndex > 0 ? setStep(STEPS[stepIndex - 1].key) : onClose()} className="gap-1">
                        <ChevronLeft className="h-4 w-4" />
                        {stepIndex === 0 ? 'Cancel' : 'Back'}
                    </Button>

                    {step === 'preview' ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Disc3 className="h-4 w-4" />}
                            {isSubmitting ? 'Creating...' : isPreorder ? 'Open Pre-Orders 🎵' : 'Publish Release 🎵'}
                        </Button>
                    ) : (
                        <Button onClick={() => setStep(STEPS[stepIndex + 1].key)} disabled={!canProceed()} className="gap-1">
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
