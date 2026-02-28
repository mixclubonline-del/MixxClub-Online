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
     * Get a single partner by ID
     */
    static async getPartner(id: string): Promise<Partner | null> {
        console.warn('PartnerService: Using mock data');
        return mockPartners.find(p => p.id === id) || null;
    }

    /**
     * Create a new partner application
     */
    static async createPartner(data: Partial<Partner>): Promise<Partner> {
        console.warn('PartnerService: Creating mock partner');
        const newPartner: Partner = {
            id: uuid(),
            userId: data.userId || 'unknown',
            companyName: data.companyName || 'New Partner',
            email: data.email || '',
            status: 'pending',
            tier: 'bronze',
            commissionRate: 10,
            affiliateCode: `MIXX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            joinedAt: new Date(),
            metrics: {
                totalReferrals: 0,
                totalSales: 0,
                totalCommission: 0,
                activeCustomers: 0,
            },
            settings: {
                marketingMaterialsAccess: true,
                dedicatedManager: false,
                trainingWebinars: false,
                exclusiveDeals: false,
            },
            ...data,
        };
        
        mockPartners.push(newPartner);
        return newPartner;
    }

    /**
     * Update a partner
     */
    static async updatePartner(id: string, updates: Partial<Partner>): Promise<Partner> {
        const index = mockPartners.findIndex(p => p.id === id);
        if (index >= 0) {
            mockPartners[index] = { ...mockPartners[index], ...updates };
            return mockPartners[index];
        }
        throw new Error('Partner not found');
    }

    /**
     * Generate an affiliate link
     */
    static async generateLink(partnerId: string, campaign?: string): Promise<AffiliateLink> {
        console.warn('PartnerService: Generating mock link');
        const newLink: AffiliateLink = {
            id: uuid(),
            partnerId: partnerId,
            code: Math.random().toString(36).substring(7),
            url: 'https://mixxclub.com?ref=' + Math.random().toString(36).substring(2, 10),
            campaign: campaign || 'default',
            clicks: 0,
            conversions: 0,
            revenue: 0,
            createdAt: new Date(),
        };
        
        mockAffiliateLinks.push(newLink);
        return newLink;
    }

    /**
     * Create an affiliate link (alias for generateLink)
     */
    static async createAffiliateLink(partnerId: string, campaign?: string): Promise<AffiliateLink> {
        return PartnerService.generateLink(partnerId, campaign);
    }

    /**
     * Record a commission
     */
    static async recordCommission(partnerId: string, saleId: string, amount: number, rate: number): Promise<Commission> {
        const commission: Commission = {
            id: uuid(),
            partnerId,
            referralId: uuid(),
            saleId,
            amount: amount * (rate / 100),
            rate,
            status: 'pending',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
        };
        mockCommissions.push(commission);
        return commission;
    }

    /**
     * Get commissions for a partner
     */
    static async getPartnerCommissions(partnerId: string): Promise<Commission[]> {
        return mockCommissions.filter(c => c.partnerId === partnerId);
    }

    /**
     * Create a payout
     */
    static async createPayout(partnerId: string, amount: number, method: Payout['method']): Promise<Payout> {
        const payout: Payout = {
            id: uuid(),
            partnerId,
            amount,
            status: 'pending',
            method,
            startDate: new Date(new Date().setDate(1)),
            endDate: new Date(),
            createdAt: new Date(),
        };
        mockPayouts.push(payout);
        return payout;
    }

    /**
     * Get payouts for a partner
     */
    static async getPartnerPayouts(partnerId: string): Promise<Payout[]> {
        return mockPayouts.filter(p => p.partnerId === partnerId);
    }

    /**
     * Get partner metrics
     */
    static async getMetrics(partnerId: string): Promise<PartnerMetrics> {
        return {
            partnerId,
            month: new Date().toISOString().slice(0, 7),
            referrals: 45,
            sales: 12,
            revenue: 3200,
            commission: 320.50,
            conversionRate: 3.6,
            averageOrderValue: 266.67,
        };
    }
}
