/**
 * EventCreator — Artist-facing UI to create ticketed events.
 * 
 * Step-by-step: Event Info → Venue → Ticket Tiers → Lineup → Preview
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Ticket, MapPin, Users, Calendar, Plus, X, ChevronLeft, ChevronRight,
    Loader2, Check, Coins, Sparkles, Music, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { GlassPanel } from '@/components/crm/design';
import { useEventTickets, type LineupEntry } from '@/hooks/useEventTickets';
import {
    EVENT_TYPES, TICKET_TIERS, VENUE_TYPES, EVENT_CATEGORIES,
    type EventType, type TicketTier, type VenueType,
} from '@/hooks/EventTicketConfig';
import { useStorefront } from '@/hooks/useStorefront';
import { useAuth } from '@/hooks/useAuth';

type Step = 'event' | 'venue' | 'tiers' | 'lineup' | 'preview';

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'event', label: 'Event Info', icon: <Calendar className="h-3.5 w-3.5" /> },
    { key: 'venue', label: 'Venue', icon: <MapPin className="h-3.5 w-3.5" /> },
    { key: 'tiers', label: 'Tickets', icon: <Ticket className="h-3.5 w-3.5" /> },
    { key: 'lineup', label: 'Lineup', icon: <Music className="h-3.5 w-3.5" /> },
    { key: 'preview', label: 'Preview', icon: <Sparkles className="h-3.5 w-3.5" /> },
];

interface TierDraft {
    tier: TicketTier;
    price: number;
    coinzPrice?: number;
    quantity: number;
    limitPerPerson: number;
}

interface EventCreatorProps {
    onClose: () => void;
    onCreated?: (eventId: string) => void;
}

export function EventCreator({ onClose, onCreated }: EventCreatorProps) {
    const { user } = useAuth();
    const { storefront } = useStorefront(user?.id);
    const { createEvent, addTier, isCreatingEvent } = useEventTickets(storefront?.id);

    const [step, setStep] = useState<Step>('event');
    const stepIndex = STEPS.findIndex(s => s.key === step);

    // Step 1: Event
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventType, setEventType] = useState<EventType>('show');
    const [eventDate, setEventDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [doorsOpen, setDoorsOpen] = useState('');
    const [ageMinimum, setAgeMinimum] = useState(0);
    const [acceptCoinz, setAcceptCoinz] = useState(true);

    // Step 2: Venue
    const [venueName, setVenueName] = useState('');
    const [venueType, setVenueType] = useState<VenueType>('club');
    const [venueAddress, setVenueAddress] = useState('');
    const [venueCity, setVenueCity] = useState('');
    const [venueState, setVenueState] = useState('');
    const [streamUrl, setStreamUrl] = useState('');
    const [capacity, setCapacity] = useState(100);

    // Step 3: Tiers
    const [tiers, setTiers] = useState<TierDraft[]>([]);
    const [showTierForm, setShowTierForm] = useState(false);
    const [editTier, setEditTier] = useState<TierDraft>({
        tier: 'general', price: 20, quantity: 50, limitPerPerson: 4,
    });

    // Step 4: Lineup
    const [lineup, setLineup] = useState<LineupEntry[]>([]);
    const [lineupName, setLineupName] = useState('');
    const [lineupRole, setLineupRole] = useState('');
    const [lineupTime, setLineupTime] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const eventConfig = EVENT_TYPES[eventType];
    const isVirtual = eventConfig.category === 'virtual';
    const totalTickets = tiers.reduce((sum, t) => sum + t.quantity, 0);
    const potentialRevenue = tiers.reduce((sum, t) => sum + (t.price * t.quantity), 0);

    const addTierToDraft = () => {
        if (editTier.quantity <= 0) return;
        setTiers(prev => [...prev, { ...editTier }]);
        setEditTier({ tier: 'general', price: 20, quantity: 50, limitPerPerson: 4 });
        setShowTierForm(false);
    };

    const addToLineup = () => {
        if (!lineupName.trim()) return;
        setLineup(prev => [...prev, { name: lineupName, role: lineupRole || undefined, set_time: lineupTime || undefined, headliner: prev.length === 0 }]);
        setLineupName(''); setLineupRole(''); setLineupTime('');
    };

    const canProceed = (): boolean => {
        switch (step) {
            case 'event': return title.trim().length > 0 && eventDate.length > 0;
            case 'venue': return venueName.trim().length > 0 && capacity > 0;
            case 'tiers': return tiers.length > 0;
            case 'lineup': return true;
            case 'preview': return true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        if (!storefront?.id) return;
        setIsSubmitting(true);
        try {
            const event = await createEvent({
                title, description, event_type: eventType,
                event_date: new Date(eventDate).toISOString(),
                end_date: endDate ? new Date(endDate).toISOString() : undefined,
                doors_open: doorsOpen || undefined,
                venue_name: venueName, venue_type: venueType,
                venue_address: venueAddress || undefined,
                venue_city: venueCity || undefined,
                venue_state: venueState || undefined,
                stream_url: isVirtual ? streamUrl : undefined,
                capacity, accept_coinz: acceptCoinz,
                age_minimum: ageMinimum, lineup, tags: [],
            });

            for (const tier of tiers) {
                const tierConfig = TICKET_TIERS[tier.tier];
                await addTier({
                    eventId: event.id,
                    input: {
                        tier: tier.tier,
                        price: tier.price,
                        coinz_price: tier.coinzPrice,
                        quantity: tier.quantity,
                        limit_per_person: tier.limitPerPerson,
                        perks: tierConfig.perks,
                    },
                });
            }

            onCreated?.(event.id);
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
                        <Ticket className="h-5 w-5 text-cyan-400" />
                        <h2 className="text-lg font-bold text-foreground">Create Event</h2>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                </div>

                {/* Steps */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s.key}>
                            <button
                                onClick={() => i <= stepIndex && setStep(s.key)}
                                className={cn(
                                    'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all',
                                    step === s.key ? 'bg-cyan-500/20 text-cyan-300 font-medium' :
                                        i < stepIndex ? 'text-green-400 cursor-pointer' : 'text-muted-foreground'
                                )}
                            >
                                {i < stepIndex ? <Check className="h-3 w-3" /> : s.icon}
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                            {i < STEPS.length - 1 && <div className={cn('h-px flex-1', i < stepIndex ? 'bg-green-500/30' : 'bg-white/5')} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <AnimatePresence mode="wait">
                        {/* ── STEP 1: Event Info ── */}
                        {step === 'event' && (
                            <motion.div key="event" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Event Name *</Label>
                                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder='e.g. "Midnight Release Party"' className="h-11 bg-white/5 border-white/10 text-base" />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Description</Label>
                                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this event about?" rows={3} className="bg-white/5 border-white/10 resize-none" />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-2 block">Event Type</Label>
                                    {EVENT_CATEGORIES.map(cat => (
                                        <div key={cat.key} className="mb-2">
                                            <p className="text-[10px] text-muted-foreground mb-1">{cat.emoji} {cat.label}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {cat.types.map(t => {
                                                    const ec = EVENT_TYPES[t as EventType];
                                                    if (!ec) return null;
                                                    return (
                                                        <button
                                                            key={ec.type}
                                                            onClick={() => { setEventType(ec.type); setCapacity(ec.capacityRange[0]); }}
                                                            className={cn(
                                                                'px-2.5 py-1.5 rounded-lg text-[11px] border transition-all',
                                                                eventType === ec.type ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-white/5 text-muted-foreground border-white/8 hover:bg-white/10'
                                                            )}
                                                        >
                                                            {ec.emoji} {ec.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Event Date & Time *</Label>
                                        <Input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="h-10 bg-white/5 border-white/10" />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">End Time</Label>
                                        <Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-10 bg-white/5 border-white/10" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Doors Open</Label>
                                        <Input type="time" value={doorsOpen} onChange={e => setDoorsOpen(e.target.value)} className="h-10 bg-white/5 border-white/10" />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Age Minimum</Label>
                                        <Input type="number" value={ageMinimum} onChange={e => setAgeMinimum(parseInt(e.target.value) || 0)} placeholder="0 = all ages" className="h-10 bg-white/5 border-white/10" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: Venue ── */}
                        {step === 'venue' && (
                            <motion.div key="venue" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-2 block">Venue Type</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {Object.values(VENUE_TYPES).map(v => (
                                            <button
                                                key={v.type}
                                                onClick={() => setVenueType(v.type)}
                                                className={cn(
                                                    'px-2.5 py-1.5 rounded-lg text-[11px] border transition-all',
                                                    venueType === v.type ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-white/5 text-muted-foreground border-white/8'
                                                )}
                                            >
                                                {v.emoji} {v.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Venue Name *</Label>
                                    <Input value={venueName} onChange={e => setVenueName(e.target.value)} placeholder="e.g. The Echo" className="h-10 bg-white/5 border-white/10" />
                                </div>
                                {!isVirtual && (
                                    <>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Address</Label>
                                            <Input value={venueAddress} onChange={e => setVenueAddress(e.target.value)} placeholder="1822 Sunset Blvd" className="h-10 bg-white/5 border-white/10" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs text-muted-foreground">City</Label>
                                                <Input value={venueCity} onChange={e => setVenueCity(e.target.value)} className="h-10 bg-white/5 border-white/10" />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">State</Label>
                                                <Input value={venueState} onChange={e => setVenueState(e.target.value)} className="h-10 bg-white/5 border-white/10" />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {isVirtual && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Stream URL</Label>
                                        <Input value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="https://..." className="h-10 bg-white/5 border-white/10" />
                                    </div>
                                )}
                                <div>
                                    <Label className="text-xs text-muted-foreground">Capacity</Label>
                                    <Input type="number" value={capacity} onChange={e => setCapacity(Math.max(1, parseInt(e.target.value) || 0))} className="h-10 bg-white/5 border-white/10" />
                                    <p className="text-[9px] text-muted-foreground mt-0.5">
                                        {eventConfig.label} typical: {eventConfig.capacityRange[0]}–{eventConfig.capacityRange[1].toLocaleString()}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 3: Ticket Tiers ── */}
                        {step === 'tiers' && (
                            <motion.div key="tiers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                                {tiers.map((t, idx) => {
                                    const tc = TICKET_TIERS[t.tier];
                                    return (
                                        <GlassPanel key={idx} padding="p-3" accent={tc.bgColor.replace('bg-', 'rgba(').replace('/10', ', 0.1)')}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{tc.emoji}</span>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{tc.label}</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            ${t.price} · {t.quantity} tickets · Max {t.limitPerPerson}/person
                                                        </p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setTiers(prev => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-red-400">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </GlassPanel>
                                    );
                                })}

                                <AnimatePresence>
                                    {showTierForm && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                            <GlassPanel padding="p-4" glow accent="rgba(6, 182, 212, 0.15)">
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Tier</Label>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {Object.values(TICKET_TIERS).map(tc => (
                                                                <button
                                                                    key={tc.tier}
                                                                    onClick={() => {
                                                                        const base = eventConfig.priceRange[0];
                                                                        setEditTier(prev => ({ ...prev, tier: tc.tier, price: Math.round(base * tc.priceMultiplier) }));
                                                                    }}
                                                                    className={cn(
                                                                        'px-2.5 py-1.5 rounded-lg text-[11px] border transition-all',
                                                                        editTier.tier === tc.tier ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-white/5 text-muted-foreground border-white/8'
                                                                    )}
                                                                >
                                                                    {tc.emoji} {tc.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <p className="text-[9px] text-muted-foreground mt-1">{TICKET_TIERS[editTier.tier].description}</p>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {TICKET_TIERS[editTier.tier].perks.map(perk => (
                                                                <span key={perk} className="text-[8px] bg-white/5 text-muted-foreground px-1.5 py-0.5 rounded-full">✓ {perk}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Price ($)</Label>
                                                            <Input type="number" value={editTier.price} onChange={e => setEditTier(prev => ({ ...prev, price: Math.max(0, parseFloat(e.target.value) || 0) }))} className="h-9 bg-white/5 border-white/10 text-sm" />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Quantity</Label>
                                                            <Input type="number" value={editTier.quantity} onChange={e => setEditTier(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 0) }))} className="h-9 bg-white/5 border-white/10 text-sm" />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Max/person</Label>
                                                            <Input type="number" value={editTier.limitPerPerson} onChange={e => setEditTier(prev => ({ ...prev, limitPerPerson: Math.max(1, parseInt(e.target.value) || 0) }))} className="h-9 bg-white/5 border-white/10 text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button onClick={addTierToDraft} disabled={editTier.quantity <= 0} className="flex-1 gap-2">
                                                            <Plus className="h-4 w-4" /> Add Tier
                                                        </Button>
                                                        <Button variant="outline" onClick={() => setShowTierForm(false)}>Cancel</Button>
                                                    </div>
                                                </div>
                                            </GlassPanel>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!showTierForm && (
                                    <Button variant="outline" onClick={() => setShowTierForm(true)} className="w-full gap-2 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 border-dashed">
                                        <Plus className="h-4 w-4" /> Add Ticket Tier
                                    </Button>
                                )}
                            </motion.div>
                        )}

                        {/* ── STEP 4: Lineup ── */}
                        {step === 'lineup' && (
                            <motion.div key="lineup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                                <p className="text-xs text-muted-foreground">Add performing artists (optional for solo events)</p>

                                {lineup.map((act, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-white/[0.03] rounded-lg">
                                        <span className="text-sm">{act.headliner ? '⭐' : '🎤'}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground">{act.name}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {[act.role, act.set_time].filter(Boolean).join(' · ') || 'Performing'}
                                            </p>
                                        </div>
                                        <button onClick={() => setLineup(prev => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
                                    </div>
                                ))}

                                <div className="flex gap-2">
                                    <Input value={lineupName} onChange={e => setLineupName(e.target.value)} placeholder="Artist name" className="h-9 bg-white/5 border-white/10 text-sm flex-1" />
                                    <Input value={lineupRole} onChange={e => setLineupRole(e.target.value)} placeholder="Role" className="h-9 bg-white/5 border-white/10 text-sm w-24" />
                                    <Input value={lineupTime} onChange={e => setLineupTime(e.target.value)} placeholder="9:00 PM" className="h-9 bg-white/5 border-white/10 text-sm w-24" />
                                    <Button size="sm" onClick={addToLineup} disabled={!lineupName.trim()} className="h-9"><Plus className="h-3.5 w-3.5" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 5: Preview ── */}
                        {step === 'preview' && (
                            <motion.div key="preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <GlassPanel padding="p-5" glow accent="rgba(6, 182, 212, 0.2)">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl">{eventConfig.emoji}</span>
                                        <Badge variant="outline" className="text-[9px] bg-cyan-500/10 text-cyan-300 border-cyan-500/20">{eventConfig.label}</Badge>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-0.5">{title}</h3>
                                    {description && <p className="text-xs text-muted-foreground mb-3">{description}</p>}

                                    <div className="space-y-1.5 text-xs mb-3">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{new Date(eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span>{venueName}{venueCity ? `, ${venueCity}` : ''}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>{capacity} capacity</span>
                                        </div>
                                    </div>

                                    {/* Tiers summary */}
                                    <div className="space-y-1.5 mb-3">
                                        {tiers.map((t, idx) => {
                                            const tc = TICKET_TIERS[t.tier];
                                            return (
                                                <div key={idx} className="flex items-center justify-between py-1.5 px-2 bg-white/[0.03] rounded-lg">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{tc.emoji}</span>
                                                        <span className="text-xs text-foreground">{tc.label}</span>
                                                        <span className="text-[9px] text-muted-foreground">× {t.quantity}</span>
                                                    </div>
                                                    <span className="text-xs font-medium text-foreground">${t.price}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Lineup */}
                                    {lineup.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-[10px] text-muted-foreground mb-1">Lineup</p>
                                            <div className="flex flex-wrap gap-1">
                                                {lineup.map((act, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-[9px] bg-white/5 border-white/10">
                                                        {act.headliner ? '⭐' : '🎤'} {act.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-lg p-2.5 text-center">
                                            <p className="text-lg font-bold text-cyan-400">{totalTickets}</p>
                                            <p className="text-[9px] text-muted-foreground">Total Tickets</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2.5 text-center">
                                            <p className="text-lg font-bold text-green-400">${potentialRevenue.toLocaleString()}</p>
                                            <p className="text-[9px] text-muted-foreground">If sold out</p>
                                        </div>
                                    </div>
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
                            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
                            {isSubmitting ? 'Creating...' : 'Create Event 🎟️'}
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
