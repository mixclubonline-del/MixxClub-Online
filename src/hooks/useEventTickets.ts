/**
 * useEventTickets — Create events, sell tiered tickets, check-in, analytics.
 * 
 * Artists create events with multiple ticket tiers.
 * Fans purchase tickets, get digital tickets with QR codes.
 * Door staff scan QR to check in. Real-time analytics.
 * 
 * The Eventbrite inside every artist's profile.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { EventType, EventStatus, TicketTier, TicketStatus, VenueType } from './EventTicketConfig';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface MixxEvent {
    id: string;
    storefront_id: string;
    creator_id: string;
    /** Event title */
    title: string;
    description?: string;
    /** Flyer / poster image */
    flyer_url?: string;
    /** Gallery images */
    gallery: string[];
    event_type: EventType;
    /** Event date & time */
    event_date: string;
    /** End time (optional) */
    end_date?: string;
    /** Doors open time */
    doors_open?: string;
    /** Venue info */
    venue_name: string;
    venue_type: VenueType;
    venue_address?: string;
    venue_city?: string;
    venue_state?: string;
    /** Virtual event link */
    stream_url?: string;
    /** Total capacity */
    capacity: number;
    /** Tickets sold across all tiers */
    tickets_sold: number;
    /** Check-ins */
    checked_in: number;
    /** Revenue */
    total_revenue: number;
    /** Status */
    status: EventStatus;
    /** Accept coinz */
    accept_coinz: boolean;
    /** Minimum age (0 = all ages) */
    age_minimum: number;
    /** Performing artists (for multi-artist events) */
    lineup: LineupEntry[];
    /** Tags */
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface LineupEntry {
    name: string;
    role?: string;
    set_time?: string;
    headliner?: boolean;
}

export interface EventTicketTier {
    id: string;
    event_id: string;
    tier: TicketTier;
    /** Custom name override */
    custom_name?: string;
    price: number;
    coinz_price?: number;
    /** Quantity available for this tier */
    quantity: number;
    /** Sold for this tier */
    sold: number;
    /** Max per customer */
    limit_per_person: number;
    /** Is this tier still available */
    is_active: boolean;
    /** Sale start (for early bird / phased releases) */
    sale_start?: string;
    /** Sale end */
    sale_end?: string;
    /** Custom perks for this tier */
    perks: string[];
    sort_order: number;
}

export interface Ticket {
    id: string;
    event_id: string;
    tier_id: string;
    buyer_id: string;
    /** Unique ticket code for QR */
    ticket_code: string;
    tier: TicketTier;
    /** Buyer name for the ticket */
    attendee_name: string;
    /** Price paid */
    amount_paid: number;
    coinz_used: number;
    status: TicketStatus;
    /** Check-in timestamp */
    checked_in_at?: string;
    /** Transferred to user ID */
    transferred_to?: string;
    created_at: string;
}

interface CreateEventInput {
    title: string;
    description?: string;
    flyer_url?: string;
    event_type: EventType;
    event_date: string;
    end_date?: string;
    doors_open?: string;
    venue_name: string;
    venue_type: VenueType;
    venue_address?: string;
    venue_city?: string;
    venue_state?: string;
    stream_url?: string;
    capacity: number;
    accept_coinz?: boolean;
    age_minimum?: number;
    lineup?: LineupEntry[];
    tags?: string[];
}

interface CreateTierInput {
    tier: TicketTier;
    custom_name?: string;
    price: number;
    coinz_price?: number;
    quantity: number;
    limit_per_person?: number;
    sale_start?: string;
    sale_end?: string;
    perks?: string[];
}

interface PurchaseTicketInput {
    eventId: string;
    tierId: string;
    attendeeName: string;
    coinzUsed?: number;
}

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function useEventTickets(storefrontId?: string) {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // ── Fetch events ──────────────────

    const eventsQuery = useQuery({
        queryKey: ['events', storefrontId],
        queryFn: async () => {
            let query = supabase
                .from('mixx_events')
                .select('*')
                .order('event_date', { ascending: true });

            if (storefrontId) {
                query = query.eq('storefront_id', storefrontId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data || []) as MixxEvent[];
        },
        staleTime: 30000,
    });

    // ── Fetch tiers for an event ──────

    const useEventTiers = (eventId?: string) => useQuery({
        queryKey: ['event-tiers', eventId],
        queryFn: async () => {
            if (!eventId) return [];
            const { data, error } = await supabase
                .from('event_ticket_tiers')
                .select('*')
                .eq('event_id', eventId)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return (data || []) as EventTicketTier[];
        },
        enabled: !!eventId,
    });

    // ── Fetch my tickets ──────────────

    const myTicketsQuery = useQuery({
        queryKey: ['my-tickets', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('event_tickets')
                .select('*')
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []) as Ticket[];
        },
        enabled: !!user?.id,
    });

    // ── Create event ──────────────────

    const createEventMutation = useMutation({
        mutationFn: async (input: CreateEventInput) => {
            if (!user?.id || !storefrontId) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('mixx_events')
                .insert({
                    storefront_id: storefrontId,
                    creator_id: user.id,
                    title: input.title,
                    description: input.description,
                    flyer_url: input.flyer_url,
                    gallery: [],
                    event_type: input.event_type,
                    event_date: input.event_date,
                    end_date: input.end_date,
                    doors_open: input.doors_open,
                    venue_name: input.venue_name,
                    venue_type: input.venue_type,
                    venue_address: input.venue_address,
                    venue_city: input.venue_city,
                    venue_state: input.venue_state,
                    stream_url: input.stream_url,
                    capacity: input.capacity,
                    tickets_sold: 0,
                    checked_in: 0,
                    total_revenue: 0,
                    status: 'draft',
                    accept_coinz: input.accept_coinz ?? true,
                    age_minimum: input.age_minimum || 0,
                    lineup: input.lineup || [],
                    tags: input.tags || [],
                })
                .select()
                .single();

            if (error) throw error;
            return data as MixxEvent;
        },
        onSuccess: (event) => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast({ title: '🎟️ Event Created!', description: `"${event.title}" is ready for ticket tiers` });
        },
        onError: (error) => {
            toast({ title: 'Failed to create event', description: error.message, variant: 'destructive' });
        },
    });

    // ── Add ticket tier ──────────────

    const addTierMutation = useMutation({
        mutationFn: async ({ eventId, input }: { eventId: string; input: CreateTierInput }) => {
            const { count } = await supabase
                .from('event_ticket_tiers')
                .select('id', { count: 'exact', head: true })
                .eq('event_id', eventId);

            const { data, error } = await supabase
                .from('event_ticket_tiers')
                .insert({
                    event_id: eventId,
                    tier: input.tier,
                    custom_name: input.custom_name,
                    price: input.price,
                    coinz_price: input.coinz_price,
                    quantity: input.quantity,
                    sold: 0,
                    limit_per_person: input.limit_per_person || 4,
                    is_active: true,
                    sale_start: input.sale_start,
                    sale_end: input.sale_end,
                    perks: input.perks || [],
                    sort_order: (count || 0) + 1,
                })
                .select()
                .single();

            if (error) throw error;
            return data as EventTicketTier;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-tiers'] });
            toast({ title: '✅ Ticket tier added' });
        },
    });

    // ── Purchase ticket ──────────────

    const purchaseTicketMutation = useMutation({
        mutationFn: async (input: PurchaseTicketInput) => {
            if (!user?.id) throw new Error('Not authenticated');

            // Fetch tier
            const { data: tier, error: tierErr } = await supabase
                .from('event_ticket_tiers')
                .select('*')
                .eq('id', input.tierId)
                .single();

            if (tierErr || !tier) throw new Error('Ticket tier not found');
            if (tier.sold >= tier.quantity) throw new Error('This tier is sold out');

            // Generate unique ticket code
            const ticketCode = `MX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            const { data: ticket, error: ticketErr } = await supabase
                .from('event_tickets')
                .insert({
                    event_id: input.eventId,
                    tier_id: input.tierId,
                    buyer_id: user.id,
                    ticket_code: ticketCode,
                    tier: tier.tier,
                    attendee_name: input.attendeeName,
                    amount_paid: tier.price,
                    coinz_used: input.coinzUsed || 0,
                    status: 'valid',
                })
                .select()
                .single();

            if (ticketErr) throw ticketErr;

            // Update tier sold count
            await supabase
                .from('event_ticket_tiers')
                .update({ sold: tier.sold + 1, is_active: tier.sold + 1 < tier.quantity })
                .eq('id', input.tierId);

            // Update event totals
            const event = eventsQuery.data?.find(e => e.id === input.eventId);
            if (event) {
                const newSold = event.tickets_sold + 1;
                await supabase
                    .from('mixx_events')
                    .update({
                        tickets_sold: newSold,
                        total_revenue: event.total_revenue + tier.price,
                        status: newSold >= event.capacity ? 'sold_out' : event.status,
                    })
                    .eq('id', input.eventId);
            }

            return ticket as Ticket;
        },
        onSuccess: (ticket) => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event-tiers'] });
            queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
            toast({
                title: '🎟️ Ticket Purchased!',
                description: `Code: ${ticket.ticket_code}`,
            });
        },
        onError: (error) => {
            toast({ title: 'Purchase failed', description: error.message, variant: 'destructive' });
        },
    });

    // ── Check in (scan QR) ──────────────

    const checkInMutation = useMutation({
        mutationFn: async (ticketCode: string) => {
            const { data: ticket, error: findErr } = await supabase
                .from('event_tickets')
                .select('*')
                .eq('ticket_code', ticketCode)
                .single();

            if (findErr || !ticket) throw new Error('Ticket not found');
            if (ticket.status !== 'valid') throw new Error(`Ticket is ${ticket.status}`);

            await supabase
                .from('event_tickets')
                .update({ status: 'used', checked_in_at: new Date().toISOString() })
                .eq('id', ticket.id);

            // Update event check-in count
            const event = eventsQuery.data?.find(e => e.id === ticket.event_id);
            if (event) {
                await supabase
                    .from('mixx_events')
                    .update({ checked_in: event.checked_in + 1 })
                    .eq('id', ticket.event_id);
            }

            return ticket as Ticket;
        },
        onSuccess: (ticket) => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast({ title: '✅ Checked In!', description: `${ticket.attendee_name} — ${ticket.tier} tier` });
        },
        onError: (error) => {
            toast({ title: '❌ Check-in Failed', description: error.message, variant: 'destructive' });
        },
    });

    // ── Transfer ticket ──────────────

    const transferTicketMutation = useMutation({
        mutationFn: async ({ ticketId, toUserId }: { ticketId: string; toUserId: string }) => {
            const { error } = await supabase
                .from('event_tickets')
                .update({
                    status: 'transferred',
                    transferred_to: toUserId,
                })
                .eq('id', ticketId);

            if (error) throw error;

            // Create new ticket for recipient
            const { data: original } = await supabase
                .from('event_tickets')
                .select('*')
                .eq('id', ticketId)
                .single();

            if (original) {
                const newCode = `MX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                await supabase
                    .from('event_tickets')
                    .insert({
                        event_id: original.event_id,
                        tier_id: original.tier_id,
                        buyer_id: toUserId,
                        ticket_code: newCode,
                        tier: original.tier,
                        attendee_name: 'Transferred Ticket',
                        amount_paid: 0,
                        coinz_used: 0,
                        status: 'valid',
                    });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
            toast({ title: '🔄 Ticket Transferred!' });
        },
    });

    // ── Update event status ──────────

    const updateEventStatusMutation = useMutation({
        mutationFn: async ({ eventId, status }: { eventId: string; status: EventStatus }) => {
            const { error } = await supabase
                .from('mixx_events')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', eventId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    // ── Computed ──────────────────────

    const upcomingEvents = eventsQuery.data?.filter(e => e.status === 'on_sale' || e.status === 'draft') || [];
    const liveEvents = eventsQuery.data?.filter(e => e.status === 'live') || [];
    const pastEvents = eventsQuery.data?.filter(e => e.status === 'ended') || [];
    const soldOutEvents = eventsQuery.data?.filter(e => e.status === 'sold_out') || [];

    return {
        events: eventsQuery.data || [],
        isLoading: eventsQuery.isLoading,
        upcomingEvents,
        liveEvents,
        pastEvents,
        soldOutEvents,

        myTickets: myTicketsQuery.data || [],
        useEventTiers,

        createEvent: createEventMutation.mutateAsync,
        isCreatingEvent: createEventMutation.isPending,
        addTier: addTierMutation.mutateAsync,
        purchaseTicket: purchaseTicketMutation.mutateAsync,
        isPurchasing: purchaseTicketMutation.isPending,
        checkIn: checkInMutation.mutateAsync,
        transferTicket: transferTicketMutation.mutateAsync,
        updateEventStatus: updateEventStatusMutation.mutateAsync,
    };
}
