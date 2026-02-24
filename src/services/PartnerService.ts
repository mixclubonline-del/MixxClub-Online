/**
 * Partner Service - Stubbed Implementation
 * The partners/commissions/payouts tables don't exist in the database.
 * This provides a mock implementation until the tables are created.
 */

import type { Partner, Commission, Payout, AffiliateLink, PartnerMetrics } from '@/stores/partnerStore';
import { uuid } from '@/lib/uuid';

// In-memory mock data (resets on page refresh)
const mockPartners: Partner[] = [];
const mockCommissions: Commission[] = [];
const mockPayouts: Payout[] = [];
const mockAffiliateLinks: AffiliateLink[] = [];

export class PartnerService {
    /**
     * Fetch all partners with filters
     */
    static async getPartners(filters?: {
        status?: string;
        tier?: string;
        limit?: number;
    }): Promise<Partner[]> {
        console.warn('PartnerService: Using mock data - partners table not configured');
        let result = [...mockPartners];
        
        if (filters?.status) {
            result = result.filter(p => p.status === filters.status);
        }
        if (filters?.tier) {
            result = result.filter(p => p.tier === filters.tier);
        }
        if (filters?.limit) {
            result = result.slice(0, filters.limit);
        }
        
        return result;
    }

    /**
     * Fetch single partner
     */
    static async getPartner(partnerId: string): Promise<Partner | null> {
        console.warn('PartnerService: Using mock data - partners table not configured');
        return mockPartners.find(p => p.id === partnerId) || null;
    }

    /**
     * Create new partner
     */
    static async createPartner(partner: Omit<Partner, 'id' | 'joinedAt'>): Promise<Partner> {
        console.warn('PartnerService: Using mock data - partners table not configured');
        const newPartner: Partner = {
            ...partner,
            id: uuid(),
            joinedAt: new Date(),
        };
        mockPartners.push(newPartner);
        return newPartner;
    }

    /**
     * Update partner details
     */
    static async updatePartner(
        partnerId: string,
        updates: Partial<Partner>
    ): Promise<Partner> {
        console.warn('PartnerService: Using mock data - partners table not configured');
        const index = mockPartners.findIndex(p => p.id === partnerId);
        if (index === -1) {
            throw new Error('Partner not found');
        }
        mockPartners[index] = { ...mockPartners[index], ...updates };
        return mockPartners[index];
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
        console.warn('PartnerService: Using mock data - commissions table not configured');
        const commission: Commission = {
            id: uuid(),
            partnerId,
            referralId: '',
            saleId,
            amount: amount * rate,
            rate,
            status: 'pending',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
        };
        mockCommissions.push(commission);
        return commission;
    }

    /**
     * Get partner commissions
     */
    static async getPartnerCommissions(
        partnerId: string,
        status?: string
    ): Promise<Commission[]> {
        console.warn('PartnerService: Using mock data - commissions table not configured');
        let result = mockCommissions.filter(c => c.partnerId === partnerId);
        if (status) {
            result = result.filter(c => c.status === status);
        }
        return result;
    }

    /**
     * Create payout for partner
     */
    static async createPayout(
        partnerId: string,
        amount: number,
        method: Payout['method']
    ): Promise<Payout> {
        console.warn('PartnerService: Using mock data - payouts table not configured');
        const payout: Payout = {
            id: uuid(),
            partnerId,
            amount,
            status: 'pending',
            method,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(),
            createdAt: new Date(),
        };
        mockPayouts.push(payout);
        return payout;
    }

    /**
     * Get partner payouts
     */
    static async getPartnerPayouts(partnerId: string): Promise<Payout[]> {
        console.warn('PartnerService: Using mock data - payouts table not configured');
        return mockPayouts.filter(p => p.partnerId === partnerId);
    }

    /**
     * Create affiliate link
     */
    static async createAffiliateLink(
        partnerId: string,
        campaign?: string
    ): Promise<AffiliateLink> {
        console.warn('PartnerService: Using mock data - affiliate_links table not configured');
        const code = `AFF${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const link: AffiliateLink = {
            id: uuid(),
            partnerId,
            code,
            url: `https://mixclub.com?ref=${code}`,
            campaign,
            createdAt: new Date(),
            clicks: 0,
            conversions: 0,
            revenue: 0,
        };
        mockAffiliateLinks.push(link);
        return link;
    }

    /**
     * Track link click
     */
    static async trackLinkClick(linkId: string): Promise<void> {
        console.warn('PartnerService: Using mock data - affiliate_links table not configured');
        const link = mockAffiliateLinks.find(l => l.id === linkId);
        if (link) {
            link.clicks += 1;
        }
    }

    /**
     * Get partner metrics
     */
    static async getPartnerMetrics(
        partnerId: string,
        _month?: string
    ): Promise<PartnerMetrics[]> {
        console.warn('PartnerService: Using mock data - partner_metrics table not configured');
        return [];
    }

    /**
     * Calculate total commission owed
     */
    static async calculateCommissionOwed(partnerId: string): Promise<number> {
        console.warn('PartnerService: Using mock data - commissions table not configured');
        return mockCommissions
            .filter(c => c.partnerId === partnerId && (c.status === 'pending' || c.status === 'earned'))
            .reduce((sum, c) => sum + c.amount, 0);
    }

    /**
     * Get top performing partners
     */
    static async getTopPartners(limit: number = 10): Promise<Partner[]> {
        console.warn('PartnerService: Using mock data - partners table not configured');
        return mockPartners
            .sort((a, b) => (b.metrics?.totalSales || 0) - (a.metrics?.totalSales || 0))
            .slice(0, limit);
    }
}

export default PartnerService;
