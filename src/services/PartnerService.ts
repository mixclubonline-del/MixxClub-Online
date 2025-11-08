/**
 * Partner Service
 * Backend service for partner management, commission tracking, and payouts
 * Integrates with Supabase for database operations and Stripe for payments
 */

import { supabase } from '@/services/supabaseClient';
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
        try {
            let query = supabase.from('partners').select('*');

            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.tier) {
                query = query.eq('tier', filters.tier);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(filters?.limit || 100);

            if (error) throw error;

            return (data || []).map((partner) => ({
                id: partner.id,
                userId: partner.user_id,
                companyName: partner.company_name,
                email: partner.email,
                phone: partner.phone,
                website: partner.website,
                tier: partner.tier,
                status: partner.status,
                commissionRate: partner.commission_rate,
                affiliateCode: partner.affiliate_code,
                joinedAt: new Date(partner.joined_at),
                verifiedAt: partner.verified_at ? new Date(partner.verified_at) : undefined,
                bankDetails: partner.bank_details,
                documents: partner.documents,
                metrics: partner.metrics || { totalReferrals: 0, totalSales: 0, totalCommission: 0, activeCustomers: 0 },
                settings: partner.settings || {},
            }));
        } catch (error) {
            console.error('Error fetching partners:', error);
            throw error;
        }
    }

    /**
     * Fetch single partner
     */
    static async getPartner(partnerId: string): Promise<Partner | null> {
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .eq('id', partnerId)
                .single();

            if (error) throw error;
            if (!data) return null;

            return {
                id: data.id,
                userId: data.user_id,
                companyName: data.company_name,
                email: data.email,
                phone: data.phone,
                website: data.website,
                tier: data.tier,
                status: data.status,
                commissionRate: data.commission_rate,
                affiliateCode: data.affiliate_code,
                joinedAt: new Date(data.joined_at),
                verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
                bankDetails: data.bank_details,
                documents: data.documents,
                metrics: data.metrics || { totalReferrals: 0, totalSales: 0, totalCommission: 0, activeCustomers: 0 },
                settings: data.settings || {},
            };
        } catch (error) {
            console.error('Error fetching partner:', error);
            throw error;
        }
    }

    /**
     * Create new partner
     */
    static async createPartner(partner: Omit<Partner, 'id' | 'joinedAt'>): Promise<Partner> {
        try {
            const { data, error } = await supabase
                .from('partners')
                .insert([
                    {
                        user_id: partner.userId,
                        company_name: partner.companyName,
                        email: partner.email,
                        phone: partner.phone,
                        website: partner.website,
                        tier: partner.tier,
                        status: partner.status,
                        commission_rate: partner.commissionRate,
                        affiliate_code: partner.affiliateCode,
                        bank_details: partner.bankDetails,
                        documents: partner.documents,
                        metrics: partner.metrics,
                        settings: partner.settings,
                        joined_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                userId: data.user_id,
                companyName: data.company_name,
                email: data.email,
                phone: data.phone,
                website: data.website,
                tier: data.tier,
                status: data.status,
                commissionRate: data.commission_rate,
                affiliateCode: data.affiliate_code,
                joinedAt: new Date(data.joined_at),
                verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
                bankDetails: data.bank_details,
                documents: data.documents,
                metrics: data.metrics,
                settings: data.settings,
            };
        } catch (error) {
            console.error('Error creating partner:', error);
            throw error;
        }
    }

    /**
     * Update partner details
     */
    static async updatePartner(
        partnerId: string,
        updates: Partial<Partner>
    ): Promise<Partner> {
        try {
            const { data, error } = await supabase
                .from('partners')
                .update({
                    company_name: updates.companyName,
                    email: updates.email,
                    phone: updates.phone,
                    website: updates.website,
                    tier: updates.tier,
                    status: updates.status,
                    commission_rate: updates.commissionRate,
                    bank_details: updates.bankDetails,
                    documents: updates.documents,
                    metrics: updates.metrics,
                    settings: updates.settings,
                    verified_at: updates.verifiedAt?.toISOString(),
                })
                .eq('id', partnerId)
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                userId: data.user_id,
                companyName: data.company_name,
                email: data.email,
                phone: data.phone,
                website: data.website,
                tier: data.tier,
                status: data.status,
                commissionRate: data.commission_rate,
                affiliateCode: data.affiliate_code,
                joinedAt: new Date(data.joined_at),
                verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
                bankDetails: data.bank_details,
                documents: data.documents,
                metrics: data.metrics,
                settings: data.settings,
            };
        } catch (error) {
            console.error('Error updating partner:', error);
            throw error;
        }
    }

    /**
     * Record commission for a sale
     */
    static async recordCommission(
        partnerId: string,
        saleId: string,
        amount: number,
        rate: number
    ): Promise<Commission> {
        try {
            const { data, error } = await supabase
                .from('commissions')
                .insert([
                    {
                        partner_id: partnerId,
                        sale_id: saleId,
                        amount,
                        rate,
                        status: 'pending',
                        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                partnerId: data.partner_id,
                referralId: data.referral_id,
                saleId: data.sale_id,
                amount: data.amount,
                rate: data.rate,
                status: data.status,
                dueDate: new Date(data.due_date),
                paidDate: data.paid_date ? new Date(data.paid_date) : undefined,
                transactionId: data.transaction_id,
                notes: data.notes,
                createdAt: new Date(data.created_at),
            };
        } catch (error) {
            console.error('Error recording commission:', error);
            throw error;
        }
    }

    /**
     * Get partner commissions
     */
    static async getPartnerCommissions(
        partnerId: string,
        status?: string
    ): Promise<Commission[]> {
        try {
            let query = supabase
                .from('commissions')
                .select('*')
                .eq('partner_id', partnerId);

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map((commission) => ({
                id: commission.id,
                partnerId: commission.partner_id,
                referralId: commission.referral_id,
                saleId: commission.sale_id,
                amount: commission.amount,
                rate: commission.rate,
                status: commission.status,
                dueDate: new Date(commission.due_date),
                paidDate: commission.paid_date ? new Date(commission.paid_date) : undefined,
                transactionId: commission.transaction_id,
                notes: commission.notes,
                createdAt: new Date(commission.created_at),
            }));
        } catch (error) {
            console.error('Error fetching commissions:', error);
            throw error;
        }
    }

    /**
     * Create payout for partner
     */
    static async createPayout(
        partnerId: string,
        amount: number,
        method: Payout['method']
    ): Promise<Payout> {
        try {
            const { data, error } = await supabase
                .from('payouts')
                .insert([
                    {
                        partner_id: partnerId,
                        amount,
                        method,
                        status: 'pending',
                        start_date: new Date(new Date().setDate(1)).toISOString(),
                        end_date: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                partnerId: data.partner_id,
                amount: data.amount,
                status: data.status,
                method: data.method,
                transactionId: data.transaction_id,
                startDate: new Date(data.start_date),
                endDate: new Date(data.end_date),
                createdAt: new Date(data.created_at),
                processedAt: data.processed_at ? new Date(data.processed_at) : undefined,
                failureReason: data.failure_reason,
            };
        } catch (error) {
            console.error('Error creating payout:', error);
            throw error;
        }
    }

    /**
     * Get partner payouts
     */
    static async getPartnerPayouts(partnerId: string): Promise<Payout[]> {
        try {
            const { data, error } = await supabase
                .from('payouts')
                .select('*')
                .eq('partner_id', partnerId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map((payout) => ({
                id: payout.id,
                partnerId: payout.partner_id,
                amount: payout.amount,
                status: payout.status,
                method: payout.method,
                transactionId: payout.transaction_id,
                startDate: new Date(payout.start_date),
                endDate: new Date(payout.end_date),
                createdAt: new Date(payout.created_at),
                processedAt: payout.processed_at ? new Date(payout.processed_at) : undefined,
                failureReason: payout.failure_reason,
            }));
        } catch (error) {
            console.error('Error fetching payouts:', error);
            throw error;
        }
    }

    /**
     * Create affiliate link
     */
    static async createAffiliateLink(
        partnerId: string,
        campaign?: string
    ): Promise<AffiliateLink> {
        try {
            const code = `AFF${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const { data, error } = await supabase
                .from('affiliate_links')
                .insert([
                    {
                        partner_id: partnerId,
                        code,
                        campaign,
                        url: `https://raven-mix-ai.com?ref=${code}`,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                partnerId: data.partner_id,
                code: data.code,
                url: data.url,
                campaign: data.campaign,
                createdAt: new Date(data.created_at),
                clicks: 0,
                conversions: 0,
                revenue: 0,
            };
        } catch (error) {
            console.error('Error creating affiliate link:', error);
            throw error;
        }
    }

    /**
     * Track link click
     */
    static async trackLinkClick(linkId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('affiliate_links')
                .update({ clicks: supabase.rpc('increment_clicks', { link_id: linkId }) })
                .eq('id', linkId);

            if (error) throw error;
        } catch (error) {
            console.error('Error tracking click:', error);
            throw error;
        }
    }

    /**
     * Get partner metrics
     */
    static async getPartnerMetrics(
        partnerId: string,
        month?: string
    ): Promise<PartnerMetrics[]> {
        try {
            let query = supabase
                .from('partner_metrics')
                .select('*')
                .eq('partner_id', partnerId);

            if (month) {
                query = query.eq('month', month);
            }

            const { data, error } = await query.order('month', { ascending: false });

            if (error) throw error;

            return (data || []).map((metric) => ({
                partnerId: metric.partner_id,
                month: metric.month,
                referrals: metric.referrals,
                sales: metric.sales,
                revenue: metric.revenue,
                commission: metric.commission,
                conversionRate: metric.conversion_rate,
                averageOrderValue: metric.average_order_value,
            }));
        } catch (error) {
            console.error('Error fetching metrics:', error);
            throw error;
        }
    }

    /**
     * Calculate total commission owed
     */
    static async calculateCommissionOwed(partnerId: string): Promise<number> {
        try {
            const { data, error } = await supabase
                .from('commissions')
                .select('amount')
                .eq('partner_id', partnerId)
                .in('status', ['pending', 'earned']);

            if (error) throw error;

            return (data || []).reduce((sum, c) => sum + c.amount, 0);
        } catch (error) {
            console.error('Error calculating commission:', error);
            throw error;
        }
    }

    /**
     * Get top performing partners
     */
    static async getTopPartners(limit: number = 10): Promise<Partner[]> {
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .order('metrics->totalSales', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map((partner) => ({
                id: partner.id,
                userId: partner.user_id,
                companyName: partner.company_name,
                email: partner.email,
                phone: partner.phone,
                website: partner.website,
                tier: partner.tier,
                status: partner.status,
                commissionRate: partner.commission_rate,
                affiliateCode: partner.affiliate_code,
                joinedAt: new Date(partner.joined_at),
                verifiedAt: partner.verified_at ? new Date(partner.verified_at) : undefined,
                bankDetails: partner.bank_details,
                documents: partner.documents,
                metrics: partner.metrics,
                settings: partner.settings,
            }));
        } catch (error) {
            console.error('Error fetching top partners:', error);
            throw error;
        }
    }
}

export default PartnerService;
