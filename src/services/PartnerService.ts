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
            user_id: data.user_id || 'unknown',
            status: 'pending',
            tier: 'bronze',
            commission_rate: 10,
            total_referrals: 0,
            total_earnings: 0,
            ...data
        };
        
        mockPartners.push(newPartner);
        return newPartner;
    }

    /**
     * Generate an affiliate link
     */
    static async generateLink(partnerId: string, campaign?: string): Promise<AffiliateLink> {
        console.warn('PartnerService: Generating mock link');
        const newLink: AffiliateLink = {
            id: uuid(),
            partner_id: partnerId,
            code: Math.random().toString(36).substring(7),
            url: 'https://mixxclub.com?ref=8a7b6c5d',
            campaign: campaign || 'default',
            clicks: 0,
            conversions: 0,
            created_at: new Date().toISOString()
        };
        
        mockAffiliateLinks.push(newLink);
        return newLink;
    }

    /**
     * Get partner metrics
     */
    static async getMetrics(partnerId: string): Promise<PartnerMetrics> {
        return {
            clicks: 1250,
            referrals: 45,
            conversion_rate: 3.6,
            pending_payout: 320.50,
            last_payout: '2024-03-15',
            tier_progress: 75
        };
    }
}