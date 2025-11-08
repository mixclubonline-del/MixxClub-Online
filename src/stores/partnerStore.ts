/**
 * Partner Program Store
 * Manages partner/reseller data, commissions, payouts, and affiliate tracking
 * Uses Zustand for state management with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Partner {
    id: string;
    userId: string;
    companyName: string;
    email: string;
    phone?: string;
    website?: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    status: 'pending' | 'active' | 'suspended' | 'inactive';
    commissionRate: number; // 10-30%
    affiliateCode: string; // unique affiliate code
    joinedAt: Date;
    verifiedAt?: Date;
    bankDetails?: {
        accountHolderName: string;
        accountNumber: string;
        routingNumber: string;
        bankName: string;
    };
    documents?: {
        businessLicense: string;
        taxId: string;
        agreement: string;
    };
    metrics: {
        totalReferrals: number;
        totalSales: number;
        totalCommission: number;
        activeCustomers: number;
    };
    settings: {
        marketingMaterialsAccess: boolean;
        dedicatedManager: boolean;
        trainingWebinars: boolean;
        exclusiveDeals: boolean;
    };
}

export interface Commission {
    id: string;
    partnerId: string;
    referralId: string;
    saleId: string;
    amount: number;
    rate: number; // percentage
    status: 'pending' | 'earned' | 'paid' | 'reversed';
    dueDate: Date;
    paidDate?: Date;
    transactionId?: string;
    notes?: string;
    createdAt: Date;
}

export interface Payout {
    id: string;
    partnerId: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    method: 'bank_transfer' | 'paypal' | 'check';
    transactionId?: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    processedAt?: Date;
    failureReason?: string;
}

export interface AffiliateLink {
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

export interface PartnerMetrics {
    partnerId: string;
    month: string;
    referrals: number;
    sales: number;
    revenue: number;
    commission: number;
    conversionRate: number;
    averageOrderValue: number;
}

export interface PartnerTierBenefits {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    baseCommissionRate: number;
    minMonthlyReferrals: number;
    marketingMaterials: boolean;
    dedicatedManager: boolean;
    trainingWebinars: boolean;
    exclusiveDeals: boolean;
    bonusPerformanceIncentive: boolean;
    coMarketingBudget: number;
}

interface PartnerState {
    // Partners
    partners: Partner[];
    selectedPartner: Partner | null;
    partnerSearch: string;
    partnerFilter: 'all' | 'active' | 'pending' | 'suspended';

    // Commissions
    commissions: Commission[];
    affiliateLinks: AffiliateLink[];

    // Payouts
    payouts: Payout[];
    pendingPayouts: Payout[];

    // Metrics
    partnerMetrics: PartnerMetrics[];
    tierBenefits: Record<string, PartnerTierBenefits>;

    // Actions - Partner Management
    addPartner: (partner: Partner) => void;
    updatePartner: (partnerId: string, updates: Partial<Partner>) => void;
    deletePartner: (partnerId: string) => void;
    selectPartner: (partner: Partner | null) => void;
    searchPartners: (query: string) => void;
    filterPartners: (filter: 'all' | 'active' | 'pending' | 'suspended') => void;
    approvePartner: (partnerId: string) => void;
    suspendPartner: (partnerId: string, reason: string) => void;
    reactivatePartner: (partnerId: string) => void;

    // Actions - Commissions
    recordCommission: (commission: Commission) => void;
    updateCommissionStatus: (commissionId: string, status: Commission['status']) => void;
    getCommissionsByPartner: (partnerId: string) => Commission[];
    getEarnedCommissions: (partnerId: string) => number;
    getPendingCommissions: (partnerId: string) => number;

    // Actions - Affiliate Links
    createAffiliateLink: (partnerId: string, campaign?: string) => AffiliateLink;
    trackLinkClick: (linkId: string) => void;
    trackConversion: (linkId: string, amount: number) => void;
    getPartnerLinks: (partnerId: string) => AffiliateLink[];

    // Actions - Payouts
    createPayout: (partnerId: string, commissionIds: string[]) => Payout;
    updatePayoutStatus: (payoutId: string, status: Payout['status'], transactionId?: string) => void;
    getPartnerPayouts: (partnerId: string) => Payout[];
    getPendingPayouts: () => Payout[];
    calculatePayableAmount: (partnerId: string) => number;

    // Actions - Metrics
    getPartnerMetrics: (partnerId: string) => PartnerMetrics[];
    getTopPerformers: (limit: number) => Partner[];
    calculateTierQualification: (partner: Partner) => 'bronze' | 'silver' | 'gold' | 'platinum';
    upgradeTier: (partnerId: string, newTier: Partner['tier']) => void;

    // Filters
    getFilteredPartners: () => Partner[];
}

const defaultTierBenefits: Record<string, PartnerTierBenefits> = {
    bronze: {
        tier: 'bronze',
        baseCommissionRate: 10,
        minMonthlyReferrals: 0,
        marketingMaterials: true,
        dedicatedManager: false,
        trainingWebinars: false,
        exclusiveDeals: false,
        bonusPerformanceIncentive: false,
        coMarketingBudget: 0,
    },
    silver: {
        tier: 'silver',
        baseCommissionRate: 15,
        minMonthlyReferrals: 5,
        marketingMaterials: true,
        dedicatedManager: false,
        trainingWebinars: true,
        exclusiveDeals: false,
        bonusPerformanceIncentive: false,
        coMarketingBudget: 500,
    },
    gold: {
        tier: 'gold',
        baseCommissionRate: 20,
        minMonthlyReferrals: 15,
        marketingMaterials: true,
        dedicatedManager: true,
        trainingWebinars: true,
        exclusiveDeals: true,
        bonusPerformanceIncentive: true,
        coMarketingBudget: 2000,
    },
    platinum: {
        tier: 'platinum',
        baseCommissionRate: 30,
        minMonthlyReferrals: 50,
        marketingMaterials: true,
        dedicatedManager: true,
        trainingWebinars: true,
        exclusiveDeals: true,
        bonusPerformanceIncentive: true,
        coMarketingBudget: 5000,
    },
};

export const usePartnerStore = create<PartnerState>()(
    persist(
        (set, get) => ({
            partners: [],
            selectedPartner: null,
            partnerSearch: '',
            partnerFilter: 'all',
            commissions: [],
            affiliateLinks: [],
            payouts: [],
            pendingPayouts: [],
            partnerMetrics: [],
            tierBenefits: defaultTierBenefits,

            // Partner Management
            addPartner: (partner) =>
                set((state) => ({
                    partners: [...state.partners, partner],
                })),

            updatePartner: (partnerId, updates) =>
                set((state) => ({
                    partners: state.partners.map((p) => (p.id === partnerId ? { ...p, ...updates } : p)),
                    selectedPartner:
                        state.selectedPartner?.id === partnerId
                            ? { ...state.selectedPartner, ...updates }
                            : state.selectedPartner,
                })),

            deletePartner: (partnerId) =>
                set((state) => ({
                    partners: state.partners.filter((p) => p.id !== partnerId),
                    selectedPartner: state.selectedPartner?.id === partnerId ? null : state.selectedPartner,
                })),

            selectPartner: (partner) => set({ selectedPartner: partner }),

            searchPartners: (query) => set({ partnerSearch: query }),

            filterPartners: (filter) => set({ partnerFilter: filter }),

            approvePartner: (partnerId) =>
                set((state) => ({
                    partners: state.partners.map((p) =>
                        p.id === partnerId
                            ? { ...p, status: 'active' as const, verifiedAt: new Date() }
                            : p
                    ),
                })),

            suspendPartner: (partnerId, reason) =>
                set((state) => ({
                    partners: state.partners.map((p) =>
                        p.id === partnerId ? { ...p, status: 'suspended' as const } : p
                    ),
                })),

            reactivatePartner: (partnerId) =>
                set((state) => ({
                    partners: state.partners.map((p) =>
                        p.id === partnerId ? { ...p, status: 'active' as const } : p
                    ),
                })),

            // Commissions
            recordCommission: (commission) =>
                set((state) => ({
                    commissions: [...state.commissions, commission],
                })),

            updateCommissionStatus: (commissionId, status) =>
                set((state) => ({
                    commissions: state.commissions.map((c) =>
                        c.id === commissionId ? { ...c, status } : c
                    ),
                })),

            getCommissionsByPartner: (partnerId) => {
                const state = get();
                return state.commissions.filter((c) => c.partnerId === partnerId);
            },

            getEarnedCommissions: (partnerId) => {
                const state = get();
                return state.commissions
                    .filter((c) => c.partnerId === partnerId && (c.status === 'earned' || c.status === 'paid'))
                    .reduce((sum, c) => sum + c.amount, 0);
            },

            getPendingCommissions: (partnerId) => {
                const state = get();
                return state.commissions
                    .filter((c) => c.partnerId === partnerId && c.status === 'pending')
                    .reduce((sum, c) => sum + c.amount, 0);
            },

            // Affiliate Links
            createAffiliateLink: (partnerId, campaign) => {
                const link: AffiliateLink = {
                    id: `link_${Date.now()}`,
                    partnerId,
                    code: `AFF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    url: `https://raven-mix-ai.com?ref=${Math.random().toString(36).substr(2, 9)}`,
                    campaign,
                    createdAt: new Date(),
                    clicks: 0,
                    conversions: 0,
                    revenue: 0,
                };
                set((state) => ({
                    affiliateLinks: [...state.affiliateLinks, link],
                }));
                return link;
            },

            trackLinkClick: (linkId) =>
                set((state) => ({
                    affiliateLinks: state.affiliateLinks.map((l) =>
                        l.id === linkId ? { ...l, clicks: l.clicks + 1 } : l
                    ),
                })),

            trackConversion: (linkId, amount) =>
                set((state) => ({
                    affiliateLinks: state.affiliateLinks.map((l) =>
                        l.id === linkId
                            ? { ...l, conversions: l.conversions + 1, revenue: l.revenue + amount }
                            : l
                    ),
                })),

            getPartnerLinks: (partnerId) => {
                const state = get();
                return state.affiliateLinks.filter((l) => l.partnerId === partnerId);
            },

            // Payouts
            createPayout: (partnerId, commissionIds) => {
                const state = get();
                const commissions = state.commissions.filter((c) =>
                    commissionIds.includes(c.id)
                );
                const amount = commissions.reduce((sum, c) => sum + c.amount, 0);

                const payout: Payout = {
                    id: `payout_${Date.now()}`,
                    partnerId,
                    amount,
                    status: 'pending',
                    method: 'bank_transfer',
                    startDate: new Date(new Date().setDate(1)),
                    endDate: new Date(),
                    createdAt: new Date(),
                };

                set((state) => ({
                    payouts: [...state.payouts, payout],
                    pendingPayouts: [...state.pendingPayouts, payout],
                }));

                return payout;
            },

            updatePayoutStatus: (payoutId, status, transactionId) =>
                set((state) => ({
                    payouts: state.payouts.map((p) =>
                        p.id === payoutId
                            ? { ...p, status, transactionId, processedAt: new Date() }
                            : p
                    ),
                    pendingPayouts: state.pendingPayouts.filter((p) => p.id !== payoutId),
                })),

            getPartnerPayouts: (partnerId) => {
                const state = get();
                return state.payouts.filter((p) => p.partnerId === partnerId);
            },

            getPendingPayouts: () => {
                const state = get();
                return state.pendingPayouts;
            },

            calculatePayableAmount: (partnerId) => {
                const state = get();
                const earned = state.commissions
                    .filter(
                        (c) =>
                            c.partnerId === partnerId &&
                            (c.status === 'earned' || c.status === 'pending')
                    )
                    .reduce((sum, c) => sum + c.amount, 0);

                const alreadyPaid = state.commissions
                    .filter((c) => c.partnerId === partnerId && c.status === 'paid')
                    .reduce((sum, c) => sum + c.amount, 0);

                return Math.max(0, earned - alreadyPaid);
            },

            // Metrics
            getPartnerMetrics: (partnerId) => {
                const state = get();
                return state.partnerMetrics.filter((m) => m.partnerId === partnerId);
            },

            getTopPerformers: (limit) => {
                const state = get();
                return state.partners
                    .sort((a, b) => b.metrics.totalSales - a.metrics.totalSales)
                    .slice(0, limit);
            },

            calculateTierQualification: (partner) => {
                const monthlyReferrals =
                    partner.metrics.totalReferrals > 0
                        ? partner.metrics.totalReferrals / 12
                        : 0;

                if (monthlyReferrals >= 50) return 'platinum';
                if (monthlyReferrals >= 15) return 'gold';
                if (monthlyReferrals >= 5) return 'silver';
                return 'bronze';
            },

            upgradeTier: (partnerId, newTier) =>
                set((state) => {
                    const newCommissionRate = state.tierBenefits[newTier]?.baseCommissionRate || 10;
                    return {
                        partners: state.partners.map((p) =>
                            p.id === partnerId
                                ? { ...p, tier: newTier, commissionRate: newCommissionRate }
                                : p
                        ),
                    };
                }),

            // Filters
            getFilteredPartners: () => {
                const state = get();
                let filtered = state.partners;

                if (state.partnerFilter !== 'all') {
                    filtered = filtered.filter((p) => p.status === state.partnerFilter);
                }

                if (state.partnerSearch) {
                    const query = state.partnerSearch.toLowerCase();
                    filtered = filtered.filter(
                        (p) =>
                            p.companyName.toLowerCase().includes(query) ||
                            p.email.toLowerCase().includes(query) ||
                            p.affiliateCode.toLowerCase().includes(query)
                    );
                }

                return filtered;
            },
        }),
        {
            name: 'partner-store',
            version: 1,
        }
    )
);

export default usePartnerStore;
