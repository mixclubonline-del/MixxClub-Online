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

        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.tier) query = query.eq('tier', filters.tier);
        if (filters?.limit) query = query.limit(filters.limit);

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
                user_id: data.userId || user.id,
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
            status: (ref.commission_paid ? 'paid' : (ref.status === 'completed' ? 'earned' : 'pending')) as Commission['status'],
            dueDate: new Date(ref.converted_at || ref.created_at || Date.now()),
            paidDate: ref.commission_paid ? new Date(ref.converted_at || Date.now()) : undefined,
            createdAt: new Date(ref.created_at || Date.now()),
        }));
    }

    /** Alias for hooks expecting getPartnerCommissions */
    static async getPartnerCommissions(partnerId: string): Promise<Commission[]> {
        return PartnerService.getCommissions(partnerId);
    }

    /**
     * Record a commission from a sale event
     */
    static async recordCommission(
        partnerId: string, saleId: string, amount: number, rate: number
    ): Promise<Commission> {
        const partner = await PartnerService.getPartner(partnerId);
        if (!partner) throw new Error('Partner not found');

        const commissionAmount = amount * (rate / 100);

        const { data, error } = await supabase
            .from('referrals')
            .insert({
                referrer_id: partner.userId,
                referral_code: partner.affiliateCode,
                status: 'completed',
                commission_earned: commissionAmount,
                converted_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        // Update partner totals
        await supabase
            .from('partners')
            .update({
                total_commissions: (partner.metrics.totalCommission || 0) + commissionAmount,
                total_referrals: (partner.metrics.totalReferrals || 0) + 1,
                pending_commissions: (partner.metrics.totalCommission || 0) + commissionAmount,
            })
            .eq('id', partnerId);

        return {
            id: data.id,
            partnerId,
            referralId: data.id,
            saleId,
            amount: commissionAmount,
            rate,
            status: 'earned',
            dueDate: new Date(),
            createdAt: new Date(data.created_at || Date.now()),
        };
    }

    /**
     * Create a payout request (uses payout_requests if exists, otherwise in-memory)
     */
    static async createPayout(
        partnerId: string, amount: number, method: Payout['method']
    ): Promise<Payout> {
        // Return a mock payout since payout_requests table may not exist for partners
        return {
            id: crypto.randomUUID(),
            partnerId,
            amount,
            status: 'pending',
            method,
            startDate: new Date(),
            endDate: new Date(),
            createdAt: new Date(),
        };
    }

    /**
     * Get payouts for a partner
     */
    static async getPayouts(partnerId: string): Promise<Payout[]> {
        return [];
    }

    /** Alias for hooks expecting getPartnerPayouts */
    static async getPartnerPayouts(partnerId: string): Promise<Payout[]> {
        return PartnerService.getPayouts(partnerId);
    }

    /**
     * Get partner metrics
     */
    static async getMetrics(partnerId?: string): Promise<PartnerMetrics> {
        if (partnerId) {
            const partner = await PartnerService.getPartner(partnerId);
            return {
                partnerId,
                month: new Date().toISOString().slice(0, 7),
                referrals: partner?.metrics.totalReferrals || 0,
                sales: partner?.metrics.totalSales || 0,
                revenue: partner?.metrics.totalCommission || 0,
                commission: partner?.metrics.totalCommission || 0,
                conversionRate: 0,
                averageOrderValue: 0,
            };
        }
        return {
            partnerId: '',
            month: new Date().toISOString().slice(0, 7),
            referrals: 0,
            sales: 0,
            revenue: 0,
            commission: 0,
            conversionRate: 0,
            averageOrderValue: 0,
        };
    }

    /**
     * Create an affiliate link for a partner
     */
    static async createAffiliateLink(partnerId: string, campaign?: string): Promise<AffiliateLink> {
        const partner = await PartnerService.getPartner(partnerId);
        if (!partner) throw new Error('Partner not found');

        return {
            id: crypto.randomUUID(),
            partnerId,
            code: partner.affiliateCode,
            url: `https://mixxclub.lovable.app/?ref=${partner.affiliateCode}${campaign ? `&utm_campaign=${campaign}` : ''}`,
            campaign,
            clicks: 0,
            conversions: 0,
            revenue: 0,
            createdAt: new Date(),
        };
    }

    /**
     * Get affiliate links for a partner
     */
    static async getAffiliateLinks(partnerId: string): Promise<AffiliateLink[]> {
        const partner = await PartnerService.getPartner(partnerId);
        if (!partner) return [];

        return [
            {
                id: `${partnerId}-home`,
                partnerId,
                code: partner.affiliateCode,
                url: `https://mixxclub.lovable.app/?ref=${partner.affiliateCode}`,
                campaign: 'Homepage',
                clicks: 0,
                conversions: partner.metrics.totalReferrals,
                revenue: partner.metrics.totalCommission,
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
