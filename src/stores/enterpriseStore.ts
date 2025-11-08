import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum EnterprisePackageType {
    LabelEssentials = 'label-essentials',
    StudioProfessional = 'studio-professional',
    UniversityEnterprise = 'university-enterprise',
    Custom = 'custom',
}

export enum AccountStatus {
    Trial = 'trial',
    Active = 'active',
    Paused = 'paused',
    Cancelled = 'cancelled',
}

export enum BillingCycle {
    Monthly = 'monthly',
    Annual = 'annual',
}

export enum SupportLevel {
    Standard = 'standard',
    Priority = 'priority',
    Dedicated = 'dedicated',
}

export enum TeamRole {
    Owner = 'owner',
    Admin = 'admin',
    Manager = 'manager',
    Member = 'member',
}

export enum ContractType {
    Service = 'service',
    Support = 'support',
    SLA = 'sla',
    Custom = 'custom',
}

export enum MemberStatus {
    Pending = 'pending',
    Active = 'active',
    Suspended = 'suspended',
    Inactive = 'inactive',
}

export interface EnterprisePackage {
    id: string;
    type: EnterprisePackageType;
    name: string;
    description: string;
    monthlyPrice: number;
    annualPrice: number;
    artistsLimit?: number;
    projectsLimit?: number;
    studentLimit?: number;
    storageGB: number;
    apiCallsPerMonth: number;
    supportLevel: SupportLevel;
    teamMembersMax: number;
    whiteLabel: boolean;
    customIntegrations: boolean;
    ssoLdap: boolean;
    studentAssessmentTools: boolean;
    features: string[];
    setupFee: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface TeamMember {
    id: string;
    accountId: string;
    email: string;
    name: string;
    role: TeamRole;
    status: MemberStatus;
    joinedAt: Date;
    lastActiveAt: Date;
    permissions: string[];
    avatar?: string;
}

export interface ContractTerm {
    duration: number;
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    noticeRequired: number;
}

export interface ServiceLevelAgreement {
    uptime: number;
    responseTime: number;
    resolutionTime: number;
    credits: number;
    escalationPath: string[];
}

export interface Contract {
    id: string;
    accountId: string;
    type: ContractType;
    packageId: string;
    packageType: EnterprisePackageType;
    status: 'draft' | 'active' | 'expired' | 'cancelled';
    terms: ContractTerm;
    sla?: ServiceLevelAgreement;
    customTerms?: Record<string, unknown>;
    signedBy: string;
    signedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface EnterpriseMetrics {
    id: string;
    accountId: string;
    month: string;
    artistsUsed?: number;
    projectsCreated?: number;
    studentsEnrolled?: number;
    storageUsedGB: number;
    apiCallsUsed: number;
    activeUsers: number;
    loginCount: number;
    exportCount: number;
    revenuGenerated: number;
    supportTicketsCreated: number;
    supportTicketsResolved: number;
    recordedAt: Date;
}

export interface CustomPricingRequest {
    id: string;
    accountId: string;
    status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired';
    requestedFeatures: string[];
    customRequirements: string;
    proposedMonthlyPrice?: number;
    proposedAnnualPrice?: number;
    setupFee?: number;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    quotedAt?: Date;
    acceptedAt?: Date;
}

export interface BillingInfo {
    billingCycle: BillingCycle;
    nextBillingDate: Date;
    monthlyAmount: number;
    annualAmount: number;
    discountPercent: number;
    taxRate: number;
    taxId?: string;
    billingEmail: string;
    invoiceFormat: 'email' | 'portal' | 'both';
    lastInvoiceDate?: Date;
    lastPaymentDate?: Date;
    lastPaymentAmount?: number;
    outstandingBalance: number;
}

export interface EnterpriseAccount {
    id: string;
    organizationName: string;
    type: EnterprisePackageType;
    status: AccountStatus;
    packageId: string;
    billingInfo: BillingInfo;
    teamMembers: TeamMember[];
    contracts: Contract[];
    metrics: EnterpriseMetrics[];
    customPricingRequests: CustomPricingRequest[];
    whiteLabel: {
        enabled: boolean;
        logoUrl?: string;
        brandColor?: string;
        customDomain?: string;
        termsUrl?: string;
        privacyUrl?: string;
    };
    contact: {
        name: string;
        email: string;
        phone?: string;
        title: string;
    };
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    trialEndsAt?: Date;
    cancelledAt?: Date;
}

export interface EnterpriseState {
    accounts: EnterpriseAccount[];
    selectedAccountId: string | null;
    packages: EnterprisePackage[];
    loading: boolean;
    error: string | null;
    addAccount: (account: Omit<EnterpriseAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    updateAccount: (id: string, updates: Partial<EnterpriseAccount>) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    selectAccount: (id: string | null) => void;
    getAccount: (id: string) => EnterpriseAccount | undefined;
    getAccountsByType: (type: EnterprisePackageType) => EnterpriseAccount[];
    getActiveAccounts: () => EnterpriseAccount[];
    getPackage: (id: string) => EnterprisePackage | undefined;
    getAllPackages: () => EnterprisePackage[];
    addTeamMember: (accountId: string, member: Omit<TeamMember, 'id' | 'joinedAt' | 'lastActiveAt'>) => Promise<string>;
    updateTeamMember: (accountId: string, memberId: string, updates: Partial<TeamMember>) => Promise<void>;
    removeTeamMember: (accountId: string, memberId: string) => Promise<void>;
    getTeamMembers: (accountId: string) => TeamMember[];
    promoteTeamMember: (accountId: string, memberId: string, newRole: TeamRole) => Promise<void>;
    disableTeamMember: (accountId: string, memberId: string) => Promise<void>;
    addContract: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    updateContract: (id: string, updates: Partial<Contract>) => Promise<void>;
    getContracts: (accountId: string) => Contract[];
    getActiveContracts: (accountId: string) => Contract[];
    renewContract: (contractId: string, newEndDate: Date) => Promise<void>;
    recordMetrics: (accountId: string, metrics: Omit<EnterpriseMetrics, 'id' | 'recordedAt'>) => Promise<void>;
    getMetrics: (accountId: string) => EnterpriseMetrics[];
    getLatestMetrics: (accountId: string) => EnterpriseMetrics | undefined;
    calculateMonthlyRevenue: (accountId: string, month: string) => number;
    createPricingRequest: (accountId: string, request: Omit<CustomPricingRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    updatePricingRequest: (id: string, updates: Partial<CustomPricingRequest>) => Promise<void>;
    getPricingRequest: (id: string) => CustomPricingRequest | undefined;
    getPendingPricingRequests: (accountId: string) => CustomPricingRequest[];
    quotePricingRequest: (requestId: string, monthlyPrice: number, annualPrice: number, setupFee: number, notes: string) => Promise<void>;
    calculateTotalCost: (accountId: string) => number;
    recordPayment: (accountId: string, amount: number, date: Date) => Promise<void>;
    getUpcomingPayments: (accountId: string) => Array<{ dueDate: Date; amount: number }>;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const PRESET_PACKAGES: EnterprisePackage[] = [
    {
        id: 'pkg-label-essentials',
        type: EnterprisePackageType.LabelEssentials,
        name: 'Label Essentials',
        description: 'Perfect for growing independent music labels',
        monthlyPrice: 299,
        annualPrice: 2990,
        artistsLimit: 50,
        storageGB: 500,
        apiCallsPerMonth: 1000000,
        supportLevel: SupportLevel.Standard,
        teamMembersMax: 5,
        whiteLabel: false,
        customIntegrations: false,
        ssoLdap: false,
        studentAssessmentTools: false,
        features: [
            '50 Artists Max',
            '500GB Storage',
            '1M API Calls/Month',
            'Standard Email Support',
            'Up to 5 Team Members',
            'Basic Analytics',
            'Royalty Tracking',
            'Music Distribution',
        ],
        setupFee: 0,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
    },
    {
        id: 'pkg-studio-professional',
        type: EnterprisePackageType.StudioProfessional,
        name: 'Studio Professional',
        description: 'Comprehensive studio management and collaboration platform',
        monthlyPrice: 499,
        annualPrice: 4990,
        storageGB: 2048,
        apiCallsPerMonth: 5000000,
        supportLevel: SupportLevel.Priority,
        teamMembersMax: 15,
        whiteLabel: true,
        customIntegrations: true,
        ssoLdap: false,
        studentAssessmentTools: false,
        features: [
            'Unlimited Projects',
            '2TB Storage',
            '5M API Calls/Month',
            'Priority Support (24/7)',
            'Up to 15 Team Members',
            'Advanced Analytics',
            'White-Label Options',
            'Custom Domain',
            'Real-Time Collaboration',
            'Advanced Mixing Tools',
            'Mastering Integration',
            'Client Portal',
        ],
        setupFee: 500,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
    },
    {
        id: 'pkg-university-enterprise',
        type: EnterprisePackageType.UniversityEnterprise,
        name: 'University Enterprise',
        description: 'Complete music education platform for universities and institutions',
        monthlyPrice: 799,
        annualPrice: 7990,
        storageGB: 5120,
        apiCallsPerMonth: 10000000,
        supportLevel: SupportLevel.Dedicated,
        teamMembersMax: 50,
        whiteLabel: true,
        customIntegrations: true,
        ssoLdap: true,
        studentAssessmentTools: true,
        features: [
            'Unlimited Students',
            '5TB Storage',
            '10M API Calls/Month',
            'Dedicated Support Team',
            'Up to 50 Team Members',
            'Full White-Label',
            'Custom Integration',
            'SSO/LDAP Support',
            'Student Assessment Tools',
            'Grade Tracking',
            'Classroom Management',
            'Assignment Distribution',
            'Advanced Reporting',
            'SLA 99.99% Uptime',
            'Multi-Institute Support',
        ],
        setupFee: 2500,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
    },
];

export const useEnterpriseStore = create<EnterpriseState>()(
    persist(
        (set, get) => ({
            accounts: [],
            selectedAccountId: null,
            packages: PRESET_PACKAGES,
            loading: false,
            error: null,

            addAccount: async (account) => {
                const id = `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const newAccount: EnterpriseAccount = {
                    ...account,
                    id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((s) => ({ ...s, accounts: [...s.accounts, newAccount] }));
                return id;
            },

            updateAccount: async (id, updates) => {
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a)),
                }));
            },

            deleteAccount: async (id) => {
                set((s) => ({
                    ...s,
                    accounts: s.accounts.filter((a) => a.id !== id),
                    selectedAccountId: s.selectedAccountId === id ? null : s.selectedAccountId,
                }));
            },

            selectAccount: (id) => set((s) => ({ ...s, selectedAccountId: id })),

            getAccount: (id) => get().accounts.find((a) => a.id === id),

            getAccountsByType: (type) => get().accounts.filter((a) => a.type === type),

            getActiveAccounts: () =>
                get().accounts.filter((a) => a.status === AccountStatus.Active || a.status === AccountStatus.Trial),

            getPackage: (id) => get().packages.find((p) => p.id === id),

            getAllPackages: () => get().packages,

            addTeamMember: async (accountId, member) => {
                const memberId = `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const newMember: TeamMember = {
                    ...member,
                    id: memberId,
                    joinedAt: new Date(),
                    lastActiveAt: new Date(),
                };
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) =>
                        a.id === accountId ? { ...a, teamMembers: [...a.teamMembers, newMember] } : a
                    ),
                }));
                return memberId;
            },

            updateTeamMember: async (accountId, memberId, updates) => {
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) =>
                        a.id === accountId
                            ? {
                                ...a,
                                teamMembers: a.teamMembers.map((m) =>
                                    m.id === memberId ? { ...m, ...updates, lastActiveAt: new Date() } : m
                                ),
                            }
                            : a
                    ),
                }));
            },

            removeTeamMember: async (accountId, memberId) => {
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) =>
                        a.id === accountId ? { ...a, teamMembers: a.teamMembers.filter((m) => m.id !== memberId) } : a
                    ),
                }));
            },

            getTeamMembers: (accountId) => {
                const a = get().accounts.find((acc) => acc.id === accountId);
                return a?.teamMembers || [];
            },

            promoteTeamMember: async (accountId, memberId, newRole) => {
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) =>
                        a.id === accountId
                            ? {
                                ...a,
                                teamMembers: a.teamMembers.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
                            }
                            : a
                    ),
                }));
            },

            disableTeamMember: async (accountId, memberId) => {
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) =>
                        a.id === accountId
                            ? {
                                ...a,
                                teamMembers: a.teamMembers.map((m) =>
                                    m.id === memberId ? { ...m, status: MemberStatus.Inactive } : m
                                ),
                            }
                            : a
                    ),
                }));
            },

            addContract: async (contract) => {
                const id = `con-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const newContract: Contract = {
                    ...contract,
                    id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) =>
                        a.id === contract.accountId ? { ...a, contracts: [...a.contracts, newContract] } : a
                    ),
                }));
                return id;
            },

            updateContract: async (id, updates) => {
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) => ({
                        ...a,
                        contracts: a.contracts.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c)),
                    })),
                }));
            },

            getContracts: (accountId) => {
                const a = get().accounts.find((acc) => acc.id === accountId);
                return a?.contracts || [];
            },

            getActiveContracts: (accountId) => {
                const a = get().accounts.find((acc) => acc.id === accountId);
                return (a?.contracts || []).filter((c) => c.status === 'active');
            },

            renewContract: async (contractId, newEndDate) => {
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) => ({
                        ...a,
                        contracts: a.contracts.map((c) =>
                            c.id === contractId
                                ? { ...c, terms: { ...c.terms, endDate: newEndDate }, updatedAt: new Date() }
                                : c
                        ),
                    })),
                }));
            },

            recordMetrics: async (accountId, metrics) => {
                const id = `met-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const newMetrics: EnterpriseMetrics = {
                    ...metrics,
                    id,
                    accountId,
                    recordedAt: new Date(),
                };
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) =>
                        a.id === accountId ? { ...a, metrics: [...a.metrics, newMetrics] } : a
                    ),
                }));
            },

            getMetrics: (accountId) => {
                const a = get().accounts.find((acc) => acc.id === accountId);
                return a?.metrics || [];
            },

            getLatestMetrics: (accountId) => {
                const a = get().accounts.find((acc) => acc.id === accountId);
                if (!a?.metrics || a.metrics.length === 0) return undefined;
                return a.metrics.sort((x, y) => new Date(y.month).getTime() - new Date(x.month).getTime())[0];
            },

            calculateMonthlyRevenue: (accountId, month) => {
                const a = get().accounts.find((acc) => acc.id === accountId);
                const m = a?.metrics.find((met) => met.month === month);
                return m?.revenuGenerated || 0;
            },

            createPricingRequest: async (accountId, request) => {
                const id = `pri-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const newRequest: CustomPricingRequest = {
                    ...request,
                    id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) =>
                        a.id === accountId ? { ...a, customPricingRequests: [...a.customPricingRequests, newRequest] } : a
                    ),
                }));
                return id;
            },

            updatePricingRequest: async (id, updates) => {
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) => ({
                        ...a,
                        customPricingRequests: a.customPricingRequests.map((r) =>
                            r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
                        ),
                    })),
                }));
            },

            getPricingRequest: (id) => {
                for (const a of get().accounts) {
                    const r = a.customPricingRequests.find((req) => req.id === id);
                    if (r) return r;
                }
                return undefined;
            },

            getPendingPricingRequests: (accountId) => {
                const a = get().accounts.find((acc) => acc.id === accountId);
                return (a?.customPricingRequests || []).filter((r) => r.status === 'pending');
            },

            quotePricingRequest: async (requestId, monthlyPrice, annualPrice, setupFee, notes) => {
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) => ({
                        ...a,
                        customPricingRequests: a.customPricingRequests.map((r) =>
                            r.id === requestId
                                ? {
                                    ...r,
                                    status: 'quoted',
                                    proposedMonthlyPrice: monthlyPrice,
                                    proposedAnnualPrice: annualPrice,
                                    setupFee,
                                    notes,
                                    quotedAt: new Date(),
                                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                                    updatedAt: new Date(),
                                }
                                : r
                        ),
                    })),
                }));
            },

            calculateTotalCost: (accountId) => {
                const a = get().accounts.find((acc) => acc.id === accountId);
                if (!a) return 0;
                const baseAmount =
                    a.billingInfo.billingCycle === BillingCycle.Monthly
                        ? a.billingInfo.monthlyAmount
                        : a.billingInfo.annualAmount;
                const discountedAmount = baseAmount * (1 - a.billingInfo.discountPercent / 100);
                const taxAmount = discountedAmount * (a.billingInfo.taxRate / 100);
                return discountedAmount + taxAmount;
            },

            recordPayment: async (accountId, amount, date) => {
                set((s) => ({
                    ...s,
                    accounts: s.accounts.map((a) =>
                        a.id === accountId
                            ? {
                                ...a,
                                billingInfo: {
                                    ...a.billingInfo,
                                    lastPaymentAmount: amount,
                                    lastPaymentDate: date,
                                    outstandingBalance: Math.max(0, a.billingInfo.outstandingBalance - amount),
                                },
                            }
                            : a
                    ),
                }));
            },

            getUpcomingPayments: (accountId) => {
                const a = get().accounts.find((acc) => acc.id === accountId);
                if (!a) return [];
                const nextDate = new Date(a.billingInfo.nextBillingDate);
                const upcomingPayments: Array<{ dueDate: Date; amount: number }> = [];
                for (let i = 0; i < 6; i++) {
                    const amount =
                        a.billingInfo.billingCycle === BillingCycle.Monthly
                            ? a.billingInfo.monthlyAmount
                            : a.billingInfo.annualAmount / 12;
                    upcomingPayments.push({ dueDate: new Date(nextDate), amount });
                    nextDate.setMonth(nextDate.getMonth() + 1);
                }
                return upcomingPayments;
            },

            setLoading: (loading) => set((s) => ({ ...s, loading })),

            setError: (error) => set((s) => ({ ...s, error })),

            reset: () =>
                set((s) => ({
                    ...s,
                    accounts: [],
                    selectedAccountId: null,
                    packages: PRESET_PACKAGES,
                    loading: false,
                    error: null,
                })),
        }),
        {
            name: 'enterprise-store',
            version: 1,
        }
    )
);

export default useEnterpriseStore;
