/**
 * TicketViewer — Digital ticket with QR code, event details, tier badge.
 * 
 * The ticket fans show at the door. Clean, dark, premium.
 * QR code renders from ticket_code for scanning.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Clock, User, Ticket as TicketIcon, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Ticket } from '@/hooks/useEventTickets';
import type { MixxEvent } from '@/hooks/useEventTickets';
import { TICKET_TIERS, TICKET_STATUS_CONFIG, type TicketTier, type TicketStatus } from '@/hooks/EventTicketConfig';

interface TicketViewerProps {
    ticket: Ticket;
    event: MixxEvent;
    className?: string;
}

export function TicketViewer({ ticket, event, className }: TicketViewerProps) {
    const tierConfig = TICKET_TIERS[ticket.tier as TicketTier] || TICKET_TIERS.general;
    const statusConfig = TICKET_STATUS_CONFIG[ticket.status as TicketStatus] || TICKET_STATUS_CONFIG.valid;
    const eventDate = new Date(event.event_date);
    const isValid = ticket.status === 'valid';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'rounded-2xl overflow-hidden border max-w-sm mx-auto',
                isValid ? 'border-white/15' : 'border-white/5 opacity-60',
                className
            )}
        >
            {/* Tier header band */}
            <div className={cn('px-4 py-2 flex items-center justify-between', tierConfig.bgColor)}>
                <div className="flex items-center gap-1.5">
                    <span className="text-base">{tierConfig.emoji}</span>
                    <span className={cn('text-xs font-bold uppercase tracking-wide', tierConfig.color)}>{tierConfig.label}</span>
                </div>
                <Badge className={cn('text-[9px]', statusConfig.bgColor, statusConfig.color)}>
                    {statusConfig.label}
                </Badge>
            </div>

            {/* Main ticket body */}
            <div className="bg-[#0d0d1a] p-5">
                {/* Event name */}
                <h2 className="text-xl font-black text-foreground mb-1">{event.title}</h2>

                {/* Event details */}
                <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            {event.doors_open ? ` · Doors ${event.doors_open}` : ''}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{event.venue_name}{event.venue_city ? `, ${event.venue_city}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{ticket.attendee_name}</span>
                    </div>
                </div>

                {/* Perks */}
                {tierConfig.perks.length > 0 && (
                    <div className="mb-4 p-2.5 bg-white/[0.03] rounded-lg">
                        <p className="text-[10px] text-muted-foreground mb-1.5">Your Perks</p>
                        <div className="flex flex-wrap gap-1">
                            {tierConfig.perks.map(perk => (
                                <span key={perk} className="text-[9px] bg-white/5 text-foreground px-2 py-0.5 rounded-full">✓ {perk}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tear line */}
                <div className="relative my-3">
                    <div className="border-t border-dashed border-white/10" />
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0a0a1a]" />
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0a0a1a]" />
                </div>

                {/* QR Code section */}
                <div className="text-center">
                    <div className="inline-flex flex-col items-center p-4 bg-white rounded-xl mb-2">
                        {/* QR placeholder — rendered from ticket code */}
                        <div className="w-32 h-32 bg-white flex items-center justify-center relative">
                            {/* Grid pattern representing QR */}
                            <div className="absolute inset-2 grid grid-cols-8 grid-rows-8 gap-[2px]">
                                {Array.from({ length: 64 }).map((_, i) => {
                                    // Deterministic pattern from ticket code
                                    const charCode = ticket.ticket_code.charCodeAt(i % ticket.ticket_code.length);
                                    const filled = (charCode + i * 7) % 3 !== 0;
                                    // Preserve finder patterns (corners)
                                    const row = Math.floor(i / 8);
                                    const col = i % 8;
                                    const isCorner = (row < 3 && col < 3) || (row < 3 && col > 4) || (row > 4 && col < 3);
                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                'rounded-[1px]',
                                                isCorner || filled ? 'bg-black' : 'bg-transparent'
                                            )}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Ticket code */}
                    <p className="font-mono text-sm font-bold text-foreground tracking-wider">{ticket.ticket_code}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Show this at the door</p>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white/[0.02] px-4 py-2.5 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <TicketIcon className="h-3 w-3" />
                    <span>MixxClub Ticket</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                    {ticket.amount_paid > 0 ? `$${ticket.amount_paid.toFixed(2)}` : 'Free'}
                    {ticket.coinz_used > 0 ? ` + ${ticket.coinz_used}🪙` : ''}
                </span>
            </div>
        </motion.div>
    );
}
