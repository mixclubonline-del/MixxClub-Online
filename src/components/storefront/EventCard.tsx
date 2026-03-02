/**
 * EventCard — Fan-facing event card with countdown, tier options, scarcity.
 * 
 * Used in storefronts, profile pages, and event discovery feeds.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Users, Ticket, Coins, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MixxEvent } from '@/hooks/useEventTickets';
import { EVENT_TYPES, EVENT_STATUS_CONFIG, VENUE_TYPES, type EventType, type VenueType, type EventStatus } from '@/hooks/EventTicketConfig';
import { DropCountdown } from './DropCountdown';

interface EventCardProps {
    event: MixxEvent;
    onSelect?: (event: MixxEvent) => void;
    className?: string;
}

export function EventCard({ event, onSelect, className }: EventCardProps) {
    const ec = EVENT_TYPES[event.event_type as EventType] || EVENT_TYPES.show;
    const vc = VENUE_TYPES[event.venue_type as VenueType] || VENUE_TYPES.other;
    const statusConfig = EVENT_STATUS_CONFIG[event.status as EventStatus] || EVENT_STATUS_CONFIG.draft;
    const isSoldOut = event.status === 'sold_out';
    const isLive = event.status === 'live';
    const isUpcoming = event.status === 'on_sale';
    const remainingPct = event.capacity > 0 ? (1 - event.tickets_sold / event.capacity) * 100 : 100;
    const timeUntil = new Date(event.event_date).getTime() - Date.now();
    const isToday = timeUntil > 0 && timeUntil < 24 * 60 * 60 * 1000;

    const eventDate = new Date(event.event_date);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => onSelect?.(event)}
            className={cn(
                'rounded-xl border transition-all cursor-pointer overflow-hidden group',
                isLive ? 'border-red-500/30 shadow-lg shadow-red-500/5' :
                    isSoldOut ? 'border-white/5 opacity-70' :
                        'border-white/10 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5',
                className
            )}
        >
            {/* Flyer / Header */}
            <div className="relative h-44 overflow-hidden">
                {event.flyer_url ? (
                    <img src={event.flyer_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-purple-500/10 flex items-center justify-center">
                        <span className="text-5xl">{ec.emoji}</span>
                    </div>
                )}

                {/* Status badge */}
                <div className="absolute top-2 right-2">
                    <Badge className={cn('text-[10px] backdrop-blur-sm', statusConfig.bgColor, statusConfig.color)}>
                        {statusConfig.label}
                    </Badge>
                </div>

                {/* Date badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg p-1.5 text-center min-w-[44px]">
                    <p className="text-[10px] text-cyan-300 font-medium uppercase">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-lg font-black text-white leading-none">{eventDate.getDate()}</p>
                </div>

                {/* Scarcity */}
                {!isSoldOut && remainingPct <= 20 && (
                    <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-medium text-center py-1 rounded-lg animate-pulse">
                            🔥 Almost sold out! {Math.round(remainingPct)}% remaining
                        </div>
                    </div>
                )}

                {isSoldOut && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-xl font-black text-amber-400 tracking-wider">SOLD OUT</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                    <Badge variant="outline" className="text-[8px] bg-cyan-500/10 text-cyan-300 border-cyan-500/20">{ec.emoji} {ec.label}</Badge>
                    {event.age_minimum > 0 && <Badge variant="outline" className="text-[8px] border-white/10 text-muted-foreground">{event.age_minimum}+</Badge>}
                </div>

                <h3 className="text-sm font-bold text-foreground line-clamp-1">{event.title}</h3>

                <div className="space-y-1 mt-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        <span>{event.venue_name}{event.venue_city ? `, ${event.venue_city}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        <span>{event.tickets_sold}/{event.capacity} attending</span>
                    </div>
                </div>

                {/* Lineup preview */}
                {event.lineup.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {event.lineup.slice(0, 3).map((act, idx) => (
                            <span key={idx} className="text-[9px] bg-white/5 text-muted-foreground px-1.5 py-0.5 rounded-full">
                                {act.headliner ? '⭐' : '🎤'} {act.name}
                            </span>
                        ))}
                        {event.lineup.length > 3 && <span className="text-[9px] text-muted-foreground">+{event.lineup.length - 3} more</span>}
                    </div>
                )}

                {/* Countdown for upcoming */}
                {isUpcoming && timeUntil > 0 && isToday && (
                    <div className="mt-2">
                        <DropCountdown launchDate={event.event_date} variant="compact" />
                    </div>
                )}

                {/* CTA */}
                {!isSoldOut && event.status !== 'ended' && event.status !== 'cancelled' && (
                    <Button
                        size="sm"
                        className="w-full mt-3 gap-1.5 text-xs bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/20"
                        onClick={(e) => { e.stopPropagation(); onSelect?.(event); }}
                    >
                        <Ticket className="h-3 w-3" />
                        {isLive ? 'Get Tickets — Live Now!' : 'Get Tickets'}
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
