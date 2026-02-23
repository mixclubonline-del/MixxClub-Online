/**
 * EventDashboard — CRM view for managing events and ticket sales.
 * 
 * Shows upcoming, live, and past events with ticket sales, revenue, check-in stats.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Ticket, Plus, Calendar, Users, DollarSign,
    Radio, Clock, Archive, ScanLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassPanel, HubHeader } from '@/components/crm/design';
import { useEventTickets, type MixxEvent } from '@/hooks/useEventTickets';
import { EVENT_TYPES, EVENT_STATUS_CONFIG, type EventType, type EventStatus } from '@/hooks/EventTicketConfig';
import { useStorefront } from '@/hooks/useStorefront';
import { useAuth } from '@/hooks/useAuth';
import { EventCreator } from './EventCreator';

function EventRow({ event, onGoLive, onEnd }: {
    event: MixxEvent;
    onGoLive: (id: string) => void;
    onEnd: (id: string) => void;
}) {
    const ec = EVENT_TYPES[event.event_type as EventType] || EVENT_TYPES.show;
    const statusConfig = EVENT_STATUS_CONFIG[event.status as EventStatus] || EVENT_STATUS_CONFIG.draft;
    const soldPct = event.capacity > 0 ? Math.round((event.tickets_sold / event.capacity) * 100) : 0;
    const checkInPct = event.tickets_sold > 0 ? Math.round((event.checked_in / event.tickets_sold) * 100) : 0;
    const eventDate = new Date(event.event_date);

    return (
        <GlassPanel
            padding="p-4"
            glow={event.status === 'live'}
            accent={event.status === 'live' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.08)'}
        >
            <div className="flex items-start gap-3 mb-3">
                {/* Date badge */}
                <div className="w-12 h-14 rounded-xl bg-white/5 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[9px] text-cyan-400 uppercase">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg font-black text-foreground leading-none">{eventDate.getDate()}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-sm font-bold text-foreground truncate">{event.title}</h3>
                        <Badge variant="outline" className={cn('text-[9px] px-1.5 border-0', statusConfig.bgColor, statusConfig.color)}>
                            {statusConfig.label}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{ec.emoji} {ec.label}</span>
                        <span>·</span>
                        <span>{event.venue_name}</span>
                        <span>·</span>
                        <span>{eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <Ticket className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">{event.tickets_sold}</p>
                    <p className="text-[8px] text-muted-foreground">Sold</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <Users className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">{event.capacity}</p>
                    <p className="text-[8px] text-muted-foreground">Capacity</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <ScanLine className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">{event.checked_in}</p>
                    <p className="text-[8px] text-muted-foreground">Checked In</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <DollarSign className="h-3 w-3 mx-auto mb-0.5 text-green-400" />
                    <p className="text-sm font-bold text-green-400">${event.total_revenue.toLocaleString()}</p>
                    <p className="text-[8px] text-muted-foreground">Revenue</p>
                </div>
            </div>

            {/* Sell-through bar */}
            <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">{event.tickets_sold}/{event.capacity} tickets</span>
                    <span className={cn('font-medium', soldPct >= 80 ? 'text-red-400' : soldPct >= 50 ? 'text-amber-400' : 'text-muted-foreground')}>
                        {soldPct}% sold
                    </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className={cn('h-full rounded-full', soldPct >= 80 ? 'bg-red-500' : soldPct >= 50 ? 'bg-amber-500' : 'bg-cyan-500')}
                        initial={{ width: 0 }}
                        animate={{ width: `${soldPct}%` }}
                        transition={{ duration: 0.6 }}
                    />
                </div>
            </div>

            {/* Check-in bar for live events */}
            {event.status === 'live' && (
                <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Check-ins</span>
                        <span className="text-green-400 font-medium">{checkInPct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full bg-green-500" initial={{ width: 0 }} animate={{ width: `${checkInPct}%` }} transition={{ duration: 0.6 }} />
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-3">
                {(event.status === 'draft' || event.status === 'on_sale') && (
                    <Button size="sm" onClick={() => onGoLive(event.id)} className="flex-1 gap-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20">
                        <Radio className="h-3 w-3" /> Go Live
                    </Button>
                )}
                {event.status === 'live' && (
                    <Button size="sm" onClick={() => onEnd(event.id)} variant="outline" className="flex-1 gap-1 text-xs">
                        End Event
                    </Button>
                )}
                {event.status === 'draft' && (
                    <Button size="sm" onClick={() => onGoLive(event.id)} variant="outline" className="flex-1 gap-1 text-xs border-green-500/20 text-green-400 hover:bg-green-500/10">
                        <Ticket className="h-3 w-3" /> Open Sales
                    </Button>
                )}
            </div>
        </GlassPanel>
    );
}

export function EventDashboard() {
    const { user } = useAuth();
    const { storefront } = useStorefront(user?.id);
    const { events, upcomingEvents, liveEvents, pastEvents, updateEventStatus, isLoading } = useEventTickets(storefront?.id);
    const [showCreator, setShowCreator] = useState(false);

    const totalRevenue = events.reduce((sum, e) => sum + e.total_revenue, 0);
    const totalSold = events.reduce((sum, e) => sum + e.tickets_sold, 0);
    const totalCheckedIn = events.reduce((sum, e) => sum + e.checked_in, 0);

    const handleGoLive = async (eventId: string) => {
        const event = events.find(e => e.id === eventId);
        if (event?.status === 'draft') {
            await updateEventStatus({ eventId, status: 'on_sale' });
        } else {
            await updateEventStatus({ eventId, status: 'live' });
        }
    };
    const handleEnd = async (eventId: string) => {
        await updateEventStatus({ eventId, status: 'ended' });
    };

    return (
        <div className="space-y-5">
            <HubHeader
                icon={<Ticket className="h-5 w-5 text-cyan-400" />}
                title="Events & Tickets"
                subtitle="Shows, listening parties, workshops & more"
                accent="rgba(6, 182, 212, 0.5)"
            />

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-3">
                <GlassPanel padding="p-3" accent="rgba(6, 182, 212, 0.1)">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">{events.length}</p>
                        <p className="text-[10px] text-muted-foreground">Events</p>
                    </div>
                </GlassPanel>
                <GlassPanel padding="p-3" accent="rgba(249, 115, 22, 0.1)">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-400">{totalSold}</p>
                        <p className="text-[10px] text-muted-foreground">Tickets Sold</p>
                    </div>
                </GlassPanel>
                <GlassPanel padding="p-3" accent="rgba(0, 200, 100, 0.1)">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{totalCheckedIn}</p>
                        <p className="text-[10px] text-muted-foreground">Checked In</p>
                    </div>
                </GlassPanel>
                <GlassPanel padding="p-3" accent="rgba(34, 197, 94, 0.1)">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Revenue</p>
                    </div>
                </GlassPanel>
            </div>

            {/* Live events */}
            {liveEvents.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Radio className="h-3.5 w-3.5 text-red-400 animate-pulse" /> Live Now
                    </h3>
                    {liveEvents.map(e => <EventRow key={e.id} event={e} onGoLive={handleGoLive} onEnd={handleEnd} />)}
                </div>
            )}

            {/* Upcoming */}
            {upcomingEvents.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" /> Upcoming
                    </h3>
                    {upcomingEvents.map(e => <EventRow key={e.id} event={e} onGoLive={handleGoLive} onEnd={handleEnd} />)}
                </div>
            )}

            {/* Past */}
            {pastEvents.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Archive className="h-3.5 w-3.5 text-muted-foreground" /> Past Events
                    </h3>
                    {pastEvents.map(e => <EventRow key={e.id} event={e} onGoLive={handleGoLive} onEnd={handleEnd} />)}
                </div>
            )}

            {/* Empty */}
            {events.length === 0 && !isLoading && (
                <GlassPanel padding="p-8" accent="rgba(6, 182, 212, 0.1)">
                    <div className="text-center">
                        <Ticket className="h-12 w-12 mx-auto mb-3 text-cyan-400/40" />
                        <h3 className="text-lg font-bold text-foreground mb-1">No events yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Create your first show, listening party, or workshop</p>
                    </div>
                </GlassPanel>
            )}

            {/* Create button */}
            <Button
                onClick={() => setShowCreator(true)}
                className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white h-11"
            >
                <Plus className="h-4 w-4" />
                Create Event 🎟️
            </Button>

            {showCreator && <EventCreator onClose={() => setShowCreator(false)} />}
        </div>
    );
}
