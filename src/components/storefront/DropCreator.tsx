/**
 * DropCreator — Artist-facing UI to create a merch drop.
 * 
 * Step-by-step: Name & Vibe → Add Items → Set Launch → Preview & Go
 * 
 * This is the Supreme/KITH drop creation experience for independent artists.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Flame, Calendar, Plus, X, ChevronLeft, ChevronRight,
    Loader2, Image as ImageIcon, Sparkles, Clock, Tag, Coins, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { GlassPanel } from '@/components/crm/design';
import { useMerchDrops, type DropItem } from '@/hooks/useMerchDrops';
import {
    GARMENT_TYPES, MERCH_COLORS, MERCH_CATEGORIES,
    type GarmentType, type MerchColor,
} from '@/hooks/MerchConfig';
import { useStorefront } from '@/hooks/useStorefront';
import { useAuth } from '@/hooks/useAuth';

type Step = 'vibe' | 'items' | 'launch' | 'preview';

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'vibe', label: 'Name & Vibe', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: 'items', label: 'Add Items', icon: <Tag className="h-3.5 w-3.5" /> },
    { key: 'launch', label: 'Set Launch', icon: <Calendar className="h-3.5 w-3.5" /> },
    { key: 'preview', label: 'Preview & Go', icon: <Flame className="h-3.5 w-3.5" /> },
];

interface DropItemDraft {
    name: string;
    garment_type: GarmentType;
    price: number;
    coinz_price?: number;
    sizes: string[];
    colors: string[];
    quantity_total: number;
    limit_per_customer: number;
    image_url?: string;
}

interface DropCreatorProps {
    onClose: () => void;
    onCreated?: (dropId: string) => void;
}

export function DropCreator({ onClose, onCreated }: DropCreatorProps) {
    const { user } = useAuth();
    const { storefront } = useStorefront(user?.id);
    const { createDrop, addItem, isCreating, isAddingItem } = useMerchDrops(storefront?.id);

    const [step, setStep] = useState<Step>('vibe');
    const stepIndex = STEPS.findIndex(s => s.key === step);

    // Step 1 state — Name & Vibe
    const [dropName, setDropName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [acceptCoinz, setAcceptCoinz] = useState(true);

    // Step 2 state — Items
    const [items, setItems] = useState<DropItemDraft[]>([]);
    const [showItemForm, setShowItemForm] = useState(false);
    const [editItem, setEditItem] = useState<DropItemDraft>({
        name: '', garment_type: 'tee', price: 30, sizes: [], colors: [],
        quantity_total: 50, limit_per_customer: 3,
    });

    // Step 3 state — Launch
    const [launchDate, setLaunchDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Submitting
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags(prev => [...prev, tagInput.trim()]);
            setTagInput('');
        }
    };

    const toggleSize = (size: string) => {
        setEditItem(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
        }));
    };

    const toggleColor = (color: MerchColor) => {
        setEditItem(prev => ({
            ...prev,
            colors: prev.colors.includes(color.name)
                ? prev.colors.filter(c => c !== color.name)
                : [...prev.colors, color.name],
        }));
    };

    const addItemToDrop = () => {
        if (!editItem.name || editItem.sizes.length === 0 || editItem.colors.length === 0) return;
        setItems(prev => [...prev, { ...editItem }]);
        setEditItem({
            name: '', garment_type: 'tee', price: 30, sizes: [], colors: [],
            quantity_total: 50, limit_per_customer: 3,
        });
        setShowItemForm(false);
    };

    const removeItem = (idx: number) => {
        setItems(prev => prev.filter((_, i) => i !== idx));
    };

    const totalQuantity = items.reduce((sum, i) => sum + i.quantity_total, 0);
    const totalPotentialRevenue = items.reduce((sum, i) => sum + (i.price * i.quantity_total), 0);

    const canProceed = (): boolean => {
        switch (step) {
            case 'vibe': return dropName.trim().length > 0;
            case 'items': return items.length > 0;
            case 'launch': return launchDate.length > 0;
            case 'preview': return true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        if (!storefront?.id) return;
        setIsSubmitting(true);

        try {
            const drop = await createDrop({
                name: dropName,
                description,
                launch_date: new Date(launchDate).toISOString(),
                end_date: endDate ? new Date(endDate).toISOString() : undefined,
                accept_coinz: acceptCoinz,
                tags,
            });

            // Add items to drop
            for (const item of items) {
                await addItem({
                    dropId: drop.id,
                    input: {
                        name: item.name,
                        garment_type: item.garment_type,
                        price: item.price,
                        coinz_price: item.coinz_price,
                        sizes: item.sizes,
                        colors: item.colors,
                        quantity_total: item.quantity_total,
                        limit_per_customer: item.limit_per_customer,
                        image_url: item.image_url,
                    },
                });
            }

            onCreated?.(drop.id);
            onClose();
        } catch {
            // Error handled by mutation toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const garmentConfig = GARMENT_TYPES[editItem.garment_type];

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-[#0d0d1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-400" />
                        <h2 className="text-lg font-bold text-foreground">Create Drop</h2>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Step indicators */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s.key}>
                            <button
                                onClick={() => i <= stepIndex && setStep(s.key)}
                                className={cn(
                                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all',
                                    step === s.key
                                        ? 'bg-orange-500/20 text-orange-300 font-medium'
                                        : i < stepIndex
                                            ? 'text-green-400 cursor-pointer'
                                            : 'text-muted-foreground'
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
                        {/* ── STEP 1: Name & Vibe ── */}
                        {step === 'vibe' && (
                            <motion.div key="vibe" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Drop Name *</Label>
                                    <Input
                                        value={dropName}
                                        onChange={(e) => setDropName(e.target.value)}
                                        placeholder='e.g. "Midnight Sessions Vol. 1"'
                                        className="h-11 bg-white/5 border-white/10 text-base"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Description</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Tell your fans what this drop is about..."
                                        rows={3}
                                        className="bg-white/5 border-white/10 resize-none"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Tags</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            placeholder="streetwear, limited, etc."
                                            className="h-9 bg-white/5 border-white/10 text-sm flex-1"
                                        />
                                        <Button size="sm" variant="outline" onClick={addTag} className="h-9">Add</Button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="gap-1 text-[10px]">
                                                    {tag}
                                                    <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setTags(prev => prev.filter(t => t !== tag))} />
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Coins className="h-4 w-4 text-amber-400" />
                                        <span className="text-sm text-foreground">Accept MixxCoinz</span>
                                    </div>
                                    <Switch checked={acceptCoinz} onCheckedChange={setAcceptCoinz} />
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: Add Items ── */}
                        {step === 'items' && (
                            <motion.div key="items" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                {/* Item list */}
                                {items.map((item, idx) => {
                                    const gc = GARMENT_TYPES[item.garment_type];
                                    return (
                                        <GlassPanel key={idx} padding="p-3" accent="rgba(249, 115, 22, 0.1)">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{gc.emoji}</span>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {gc.label} · ${item.price} · {item.quantity_total} units · {item.sizes.length} sizes · {item.colors.length} colors
                                                        </p>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-red-400">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </GlassPanel>
                                    );
                                })}

                                {/* Item form */}
                                <AnimatePresence>
                                    {showItemForm && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                            <GlassPanel padding="p-4" glow accent="rgba(249, 115, 22, 0.15)">
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Item Name *</Label>
                                                        <Input
                                                            value={editItem.name}
                                                            onChange={(e) => setEditItem(prev => ({ ...prev, name: e.target.value }))}
                                                            placeholder='e.g. "Midnight Hoodie"'
                                                            className="h-9 bg-white/5 border-white/10 text-sm"
                                                        />
                                                    </div>

                                                    {/* Garment type */}
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Type</Label>
                                                        <div className="mt-1 space-y-2">
                                                            {MERCH_CATEGORIES.map((cat) => (
                                                                <div key={cat.key}>
                                                                    <p className="text-[10px] text-muted-foreground mb-1">{cat.emoji} {cat.label}</p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {cat.types.map((t) => {
                                                                            const gc = GARMENT_TYPES[t as GarmentType];
                                                                            if (!gc) return null;
                                                                            return (
                                                                                <button
                                                                                    key={gc.type}
                                                                                    onClick={() => setEditItem(prev => ({ ...prev, garment_type: gc.type, sizes: [], price: gc.priceRange[0] }))}
                                                                                    className={cn(
                                                                                        'px-2 py-1 rounded-md text-[11px] border transition-all',
                                                                                        editItem.garment_type === gc.type
                                                                                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                                                                            : 'bg-white/5 text-muted-foreground border-white/8 hover:bg-white/10'
                                                                                    )}
                                                                                >
                                                                                    {gc.emoji} {gc.label}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Sizes */}
                                                    <div>
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-xs text-muted-foreground">Sizes *</Label>
                                                            <button
                                                                className="text-[10px] text-orange-400 hover:underline"
                                                                onClick={() => setEditItem(prev => ({ ...prev, sizes: [...garmentConfig.sizeChart] }))}
                                                            >
                                                                Select all
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {garmentConfig.sizeChart.map((size) => (
                                                                <button
                                                                    key={size}
                                                                    onClick={() => toggleSize(size)}
                                                                    className={cn(
                                                                        'px-2.5 py-1 rounded-md text-xs border transition-all min-w-[36px]',
                                                                        editItem.sizes.includes(size)
                                                                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                                                            : 'bg-white/5 text-muted-foreground border-white/8'
                                                                    )}
                                                                >
                                                                    {size}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Colors */}
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Colors *</Label>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {MERCH_COLORS.map((color) => (
                                                                <button
                                                                    key={color.name}
                                                                    onClick={() => toggleColor(color)}
                                                                    title={color.name}
                                                                    className={cn(
                                                                        'w-7 h-7 rounded-full border-2 transition-all relative',
                                                                        editItem.colors.includes(color.name)
                                                                            ? 'border-orange-400 ring-2 ring-orange-400/30'
                                                                            : 'border-white/10 hover:border-white/30'
                                                                    )}
                                                                    style={{ background: color.hex }}
                                                                >
                                                                    {editItem.colors.includes(color.name) && (
                                                                        <Check className={cn('h-3 w-3 absolute inset-0 m-auto', color.textOnColor === 'white' ? 'text-white' : 'text-black')} />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Price & Quantity */}
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Price ($)</Label>
                                                            <Input
                                                                type="number"
                                                                value={editItem.price}
                                                                onChange={(e) => setEditItem(prev => ({ ...prev, price: Math.max(1, parseFloat(e.target.value) || 0) }))}
                                                                min={1}
                                                                className="h-9 bg-white/5 border-white/10 text-sm"
                                                            />
                                                            <p className="text-[9px] text-muted-foreground mt-0.5">
                                                                Range: ${garmentConfig.priceRange[0]}–${garmentConfig.priceRange[1]}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Quantity</Label>
                                                            <Input
                                                                type="number"
                                                                value={editItem.quantity_total}
                                                                onChange={(e) => setEditItem(prev => ({ ...prev, quantity_total: Math.max(1, parseInt(e.target.value) || 0) }))}
                                                                min={1}
                                                                className="h-9 bg-white/5 border-white/10 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Max/person</Label>
                                                            <Input
                                                                type="number"
                                                                value={editItem.limit_per_customer}
                                                                onChange={(e) => setEditItem(prev => ({ ...prev, limit_per_customer: Math.max(1, parseInt(e.target.value) || 0) }))}
                                                                min={1}
                                                                className="h-9 bg-white/5 border-white/10 text-sm"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={addItemToDrop}
                                                            disabled={!editItem.name || editItem.sizes.length === 0 || editItem.colors.length === 0}
                                                            className="flex-1 gap-2"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            Add to Drop
                                                        </Button>
                                                        <Button variant="outline" onClick={() => setShowItemForm(false)}>Cancel</Button>
                                                    </div>
                                                </div>
                                            </GlassPanel>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!showItemForm && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowItemForm(true)}
                                        className="w-full gap-2 border-orange-500/20 text-orange-400 hover:bg-orange-500/10 border-dashed"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Item to Drop
                                    </Button>
                                )}
                            </motion.div>
                        )}

                        {/* ── STEP 3: Set Launch ── */}
                        {step === 'launch' && (
                            <motion.div key="launch" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Launch Date & Time *</Label>
                                    <Input
                                        type="datetime-local"
                                        value={launchDate}
                                        onChange={(e) => setLaunchDate(e.target.value)}
                                        className="h-11 bg-white/5 border-white/10"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">When fans can start purchasing</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">End Date (optional)</Label>
                                    <Input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="h-11 bg-white/5 border-white/10"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Leave empty = available until sold out</p>
                                </div>

                                <GlassPanel padding="p-3" accent="rgba(249, 115, 22, 0.1)">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-orange-400" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">How drops work</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                Fans see a countdown → Drop goes live → Items sell until quantity hits zero → "SOLD OUT" 🔥
                                            </p>
                                        </div>
                                    </div>
                                </GlassPanel>
                            </motion.div>
                        )}

                        {/* ── STEP 4: Preview & Go ── */}
                        {step === 'preview' && (
                            <motion.div key="preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <GlassPanel padding="p-4" glow accent="rgba(249, 115, 22, 0.2)">
                                    <h3 className="text-lg font-bold text-foreground mb-1">{dropName}</h3>
                                    {description && <p className="text-sm text-muted-foreground mb-3">{description}</p>}

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="bg-white/5 rounded-lg p-2.5 text-center">
                                            <p className="text-xl font-bold text-orange-400">{items.length}</p>
                                            <p className="text-[10px] text-muted-foreground">Items</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2.5 text-center">
                                            <p className="text-xl font-bold text-orange-400">{totalQuantity}</p>
                                            <p className="text-[10px] text-muted-foreground">Total Units</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        {items.map((item, idx) => {
                                            const gc = GARMENT_TYPES[item.garment_type];
                                            return (
                                                <div key={idx} className="flex items-center justify-between py-1.5 px-2 bg-white/[0.03] rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <span>{gc.emoji}</span>
                                                        <span className="text-sm text-foreground">{item.name}</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-foreground">${item.price}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Potential revenue if sold out:</span>
                                        <span className="text-lg font-bold text-green-400">${totalPotentialRevenue.toLocaleString()}</span>
                                    </div>

                                    {launchDate && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            🚀 Launches {new Date(launchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                        </p>
                                    )}
                                </GlassPanel>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer navigation */}
                <div className="p-4 border-t border-white/8 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => stepIndex > 0 ? setStep(STEPS[stepIndex - 1].key) : onClose()}
                        className="gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {stepIndex === 0 ? 'Cancel' : 'Back'}
                    </Button>

                    {step === 'preview' ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Flame className="h-4 w-4" />
                            )}
                            {isSubmitting ? 'Creating Drop...' : 'Create Drop 🔥'}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setStep(STEPS[stepIndex + 1].key)}
                            disabled={!canProceed()}
                            className="gap-1"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
