/**
 * Partner Service — Live Supabase Implementation
 * Queries the `partners` and `referrals` tables for real data.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Partner, Commission, Payout, AffiliateLink, PartnerMetrics } from '@/stores/partnerStore';

export class PartnerService {
    /**
     * Fetch all partners with filters
     */
    static async getPartners(filters?: {
        status?: string;
        tier?: string;
        limit?: number;
    }): Promise<Partner[]> {
        let query = supabase
            .from('partners')
            .select('*, profiles(full_name, email)');

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.tier) {
            query = query.eq('tier', filters.tier);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        return (data || []).map(row => PartnerService.mapPartner(row));
    }

    /**
     * Get a single partner by ID
     */
    static async getPartner(id: string): Promise<Partner | null> {
        const { data, error } = await supabase
            .from('partners')
            .select('*, profiles(full_name, email)')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data ? PartnerService.mapPartner(data) : null;
    }

    /**
     * Get partner by user ID
     */
    static async getPartnerByUserId(userId: string): Promise<Partner | null> {
        const { data, error } = await supabase
            .from('partners')
            .select('*, profiles(full_name, email)')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data ? PartnerService.mapPartner(data) : null;
    }

    /**
     * Create a new partner application
     */
    static async createPartner(data: Partial<Partner>): Promise<Partner> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Must be logged in');

        const affiliateCode = 'MIXX-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data: newPartner, error } = await supabase
            .from('partners')
            .insert({
                user_id: user.id,
                affiliate_code: affiliateCode,
                status: 'pending',
                tier: 'bronze',
                commission_rate: 10,
                total_referrals: 0,
                total_commissions: 0,
                total_revenue: 0,
                pending_commissions: 0,
            })
            .select('*, profiles(full_name, email)')
            .single();

        if (error) throw error;
        return PartnerService.mapPartner(newPartner);
    }

    /**
     * Update a partner
     */
    static async updatePartner(id: string, updates: Partial<Partner>): Promise<Partner> {
        const updateData: Record<string, unknown> = {};
        if (updates.status) updateData.status = updates.status;
        if (updates.tier) updateData.tier = updates.tier;
        if (updates.commissionRate !== undefined) updateData.commission_rate = updates.commissionRate;

        const { data, error } = await supabase
            .from('partners')
            .update(updateData)
            .eq('id', id)
            .select('*, profiles(full_name, email)')
            .single();

        if (error) throw error;
        return PartnerService.mapPartner(data);
    }

    /**
     * Get commissions for a partner (via referrals table)
     */
    static async getCommissions(partnerId: string): Promise<Commission[]> {
        // Get the partner's user_id first
        const { data: partner } = await supabase
            .from('partners')
            .select('user_id')
            .eq('id', partnerId)
            .single();

        if (!partner) return [];

        const { data, error } = await supabase
            .from('referrals')
            .select('*')
            .eq('referrer_id', partner.user_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(ref => ({
            id: ref.id,
            partnerId,
            referralId: ref.id,
            saleId: ref.id,
            amount: ref.commission_earned || 0,
            rate: 10,
            status: ref.commission_paid ? 'paid' : (ref.status === 'completed' ? 'earned' : 'pending'),
            dueDate: new Date(ref.converted_at || ref.created_at || Date.now()),
            paidDate: ref.commission_paid ? new Date(ref.converted_at || Date.now()) : undefined,
            createdAt: new Date(ref.created_at || Date.now()),
        })) as Commission[];
    }

    /**
     * Get partner metrics
     */
    static async getMetrics(): Promise<PartnerMetrics> {
        const { count: totalPartners } = await supabase
            .from('partners')
            .select('id', { count: 'exact', head: true });

        const { count: activePartners } = await supabase
            .from('partners')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'active');

        const { data: commData } = await supabase
            .from('partners')
            .select('total_commissions, total_revenue, total_referrals');

        const totalCommissions = (commData || []).reduce((s, p) => s + (p.total_commissions || 0), 0);
        const totalRevenue = (commData || []).reduce((s, p) => s + (p.total_revenue || 0), 0);
        const totalReferrals = (commData || []).reduce((s, p) => s + (p.total_referrals || 0), 0);

        return {
            totalPartners: totalPartners || 0,
            activePartners: activePartners || 0,
            totalCommissions,
            totalRevenue,
            averageCommission: totalReferrals > 0 ? totalCommissions / totalReferrals : 0,
            conversionRate: 0,
            topPerformers: [],
            recentActivity: [],
        };
    }

    /**
     * Get payouts for a partner (placeholder — payout_requests table may not exist)
     */
    static async getPayouts(_partnerId: string): Promise<Payout[]> {
        return [];
    }

    /**
     * Get affiliate links for a partner
     */
    static async getAffiliateLinks(partnerId: string): Promise<AffiliateLink[]> {
        const partner = await PartnerService.getPartner(partnerId);
        if (!partner) return [];

        // Generate default affiliate links from the partner's code
        return [
            {
                id: `${partnerId}-home`,
                partnerId,
                url: `https://mixxclub.lovable.app/?ref=${partner.affiliateCode}`,
                shortCode: partner.affiliateCode,
                campaign: 'Homepage',
                clicks: 0,
                conversions: partner.metrics.totalReferrals,
                conversionRate: 0,
                isActive: true,
                createdAt: partner.joinedAt,
            },
        ];
    }

    /**
     * Map a DB row to the Partner interface
     */
    private static mapPartner(row: any): Partner {
        const profile = row.profiles;
        return {
            id: row.id,
            userId: row.user_id,
            companyName: profile?.full_name || 'Partner',
            email: profile?.email || '',
            tier: row.tier || 'bronze',
            status: row.status || 'pending',
            commissionRate: row.commission_rate || 10,
            affiliateCode: row.affiliate_code,
            joinedAt: new Date(row.joined_at || row.created_at),
            metrics: {
                totalReferrals: row.total_referrals || 0,
                totalSales: row.total_referrals || 0,
                totalCommission: row.total_commissions || 0,
                activeCustomers: 0,
            },
            settings: {
                marketingMaterialsAccess: (row.tier === 'gold' || row.tier === 'platinum'),
                dedicatedManager: row.tier === 'platinum',
                trainingWebinars: (row.tier !== 'bronze'),
                exclusiveDeals: (row.tier === 'gold' || row.tier === 'platinum'),
            },
        };
    }
}
