/**
 * Partner Program - Complete Exports
 * All partner program related hooks, services, components, and types
 * 
 * System #10 of 11 (Partner Program - Reseller Network)
 */

// ============================================================================
// Stores
// ============================================================================
export { usePartnerStore, type Partner, type Commission, type Payout, type AffiliateLink, type PartnerMetrics, type PartnerTierBenefits } from '@/stores/partnerStore';

// ============================================================================
// Services
// ============================================================================
export { default as PartnerService } from '@/services/PartnerService';

// ============================================================================
// Hooks
// ============================================================================
export { usePartnerManagement, type UsePartnerResult } from '@/hooks/usePartnerManagement';
export { useCommissionTracking, type UseCommissionResult } from '@/hooks/useCommissionTracking';
export { useAffiliateLinks, type UseAffiliateResult } from '@/hooks/useAffiliateLinks';

// ============================================================================
// Components
// ============================================================================
export { PartnerDashboard } from '@/components/partners/PartnerDashboard';
export { CommissionTracker } from '@/components/partners/CommissionTracker';
export { PayoutUI } from '@/components/partners/PayoutUI';
export { AffiliateLinksManager } from '@/components/partners/AffiliateLinksManager';

// ============================================================================
// Quick Start Guide
// ============================================================================
/**
 * Partner Program Implementation Quick Start
 * 
 * 1. PARTNER MANAGEMENT
 * 
 *   // Fetch all partners with filtering
 *   const { partners, fetchPartners, createPartner, approvePartner } = usePartnerManagement();
 *   
 *   useEffect(() => {
 *     fetchPartners({ status: 'active', tier: 'gold' });
 *   }, []);
 * 
 * 2. COMMISSION TRACKING
 * 
 *   // Record a new commission
 *   const { recordCommission, getPartnerCommissions } = useCommissionTracking();
 *   
 *   const commission = await recordCommission(partnerId, saleId, 1500, 15);
 *   const commissions = await getPartnerCommissions(partnerId);
 * 
 * 3. PAYOUT MANAGEMENT
 * 
 *   // Create a payout
 *   const { createPayout, getPartnerPayouts } = useCommissionTracking();
 *   
 *   const payout = await createPayout(partnerId, 5000, 'bank_transfer');
 *   const payouts = await getPartnerPayouts(partnerId);
 * 
 * 4. AFFILIATE LINKS
 * 
 *   // Generate affiliate links
 *   const { createAffiliateLink, getPartnerLinks } = useAffiliateLinks();
 *   
 *   const link = await createAffiliateLink(partnerId, 'summer_2024');
 *   const links = getPartnerLinks(partnerId);
 * 
 * 5. COMPONENTS
 * 
 *   // Use dashboard components
 *   <PartnerDashboard />           // Admin partner management
 *   <CommissionTracker />          // Commission tracking & analytics
 *   <PayoutUI />                   // Payout requests & management
 *   <AffiliateLinksManager />      // Link creation & analytics
 */

// ============================================================================
// Data Models & Types
// ============================================================================
/**
 * Partner - Main partner profile
 */
export interface IPartner {
    id: string;
    userId: string;
    companyName: string;
    email: string;
    phone?: string;
    website?: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    status: 'pending' | 'active' | 'suspended' | 'inactive';
    commissionRate: number; // 10-30%
    affiliateCode: string;
    joinedAt: Date;
    verifiedAt?: Date;
    bankDetails?: {
        accountName: string;
        accountNumber: string;
        routingNumber: string;
        bankName: string;
    };
    documents?: {
        taxId: string;
        businessLicense?: string;
        bankStatement?: string;
    };
    metrics: {
        totalReferrals: number;
        totalSales: number;
        totalCommission: number;
        conversionRate: number;
        averageOrderValue: number;
    };
    settings: {
        payoutFrequency: 'weekly' | 'biweekly' | 'monthly';
        autoPayouts: boolean;
        emailNotifications: boolean;
        minPayoutAmount: number;
    };
}

/**
 * Commission - Sale commission record
 */
export interface ICommission {
    id: string;
    partnerId: string;
    referralId: string;
    saleId: string;
    amount: number;
    rate: number; // Commission rate
    status: 'pending' | 'earned' | 'paid' | 'reversed';
    dueDate: Date;
    paidDate?: Date;
    transactionId?: string;
}

/**
 * Payout - Partner payout
 */
export interface IPayout {
    id: string;
    partnerId: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    method: 'bank_transfer' | 'paypal' | 'check';
    transactionId?: string;
    createdAt: Date;
    processedAt?: Date;
    failureReason?: string;
}

/**
 * AffiliateLink - Tracking link for partners
 */
export interface IAffiliateLink {
    id: string;
    partnerId: string;
    code: string;
    url: string;
    campaign?: string;
    createdAt: Date;
    clicks: number;
    conversions: number;
    revenue: number;
}

// ============================================================================
// API Integration Guide
// ============================================================================
/**
 * Backend API Endpoints Expected:
 * 
 * GET    /api/partners - List partners
 * GET    /api/partners/:id - Get partner
 * POST   /api/partners - Create partner
 * PUT    /api/partners/:id - Update partner
 * DELETE /api/partners/:id - Delete partner
 * 
 * GET    /api/commissions - List commissions
 * POST   /api/commissions - Record commission
 * PUT    /api/commissions/:id - Update commission
 * 
 * GET    /api/payouts - List payouts
 * POST   /api/payouts - Create payout
 * PUT    /api/payouts/:id - Update payout
 * 
 * GET    /api/affiliate-links - List links
 * POST   /api/affiliate-links - Create link
 * POST   /api/affiliate-links/:id/click - Track click
 * POST   /api/affiliate-links/:id/conversion - Track conversion
 * 
 * GET    /api/partners/:id/metrics - Get partner metrics
 * GET    /api/partners/:id/performance - Performance analytics
 */

// ============================================================================
// Database Schema
// ============================================================================
/**
 * Required Database Tables:
 * 
 * CREATE TABLE partners (
 *   id UUID PRIMARY KEY,
 *   user_id UUID NOT NULL,
 *   company_name TEXT NOT NULL,
 *   email TEXT NOT NULL UNIQUE,
 *   tier TEXT DEFAULT 'bronze',
 *   status TEXT DEFAULT 'pending',
 *   commission_rate NUMERIC DEFAULT 15,
 *   affiliate_code TEXT UNIQUE,
 *   verified_at TIMESTAMP,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * CREATE TABLE commissions (
 *   id UUID PRIMARY KEY,
 *   partner_id UUID NOT NULL REFERENCES partners,
 *   sale_id TEXT NOT NULL,
 *   amount NUMERIC NOT NULL,
 *   rate NUMERIC NOT NULL,
 *   status TEXT DEFAULT 'pending',
 *   due_date DATE,
 *   paid_date DATE,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * CREATE TABLE payouts (
 *   id UUID PRIMARY KEY,
 *   partner_id UUID NOT NULL REFERENCES partners,
 *   amount NUMERIC NOT NULL,
 *   status TEXT DEFAULT 'pending',
 *   method TEXT,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * CREATE TABLE affiliate_links (
 *   id UUID PRIMARY KEY,
 *   partner_id UUID NOT NULL REFERENCES partners,
 *   code TEXT UNIQUE NOT NULL,
 *   campaign TEXT,
 *   clicks INT DEFAULT 0,
 *   conversions INT DEFAULT 0,
 *   revenue NUMERIC DEFAULT 0,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 */

export const PARTNER_PROGRAM_VERSION = '1.0.0';

export const PARTNER_TIERS = {
    bronze: { minReferrals: 0, commission: 10, features: ['basic_dashboard', 'affiliate_links'] },
    silver: { minReferrals: 10, commission: 15, features: ['basic_dashboard', 'affiliate_links', 'analytics'] },
    gold: { minReferrals: 50, commission: 20, features: ['basic_dashboard', 'affiliate_links', 'analytics', 'co_marketing'] },
    platinum: { minReferrals: 200, commission: 30, features: ['all'] },
} as const;

export const PAYOUT_METHODS = {
    bank_transfer: 'Bank Transfer (2-5 business days)',
    paypal: 'PayPal (1-2 business days)',
    check: 'Check (5-7 business days)',
} as const;

export const COMMISSION_STATUS = {
    pending: 'Awaiting customer payment',
    earned: 'Commission earned, ready for payout',
    paid: 'Commission paid to partner',
    reversed: 'Commission refunded/reversed',
} as const;
