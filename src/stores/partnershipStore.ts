/**
 * Partnership Store - Zustand State Management
 * 
 * Manages all partnership-related state including partnerships,
 * collaborative projects, revenue splits, and earnings data.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    Partnership,
    CollaborativeProject,
    RevenueSplit,
    PaymentLink,
    PartnershipMetrics,
    PartnershipHealth,
    CollaborativeEarningsSummary,
    PartnershipEarnings,
} from '@/types/partnership';

interface PartnershipStore {
    // Data State
    partnerships: Partnership[];
    projects: CollaborativeProject[];
    revenueSplits: RevenueSplit[];
    paymentLinks: PaymentLink[];
    metrics: PartnershipMetrics[];
    healthScores: PartnershipHealth[];

    // UI State
    loading: boolean;
    error: string | null;
    selectedPartnershipId: string | null;
    filterStatus: string;

    // Actions - Partnerships
    setPartnerships: (partnerships: Partnership[]) => void;
    addPartnership: (partnership: Partnership) => void;
    updatePartnership: (id: string, partnership: Partial<Partnership>) => void;
    deletePartnership: (id: string) => void;
    getPartnershipById: (id: string) => Partnership | undefined;
    getPartnershipsByUser: (userId: string) => Partnership[];
    selectPartnership: (id: string | null) => void;

    // Actions - Projects
    setProjects: (projects: CollaborativeProject[]) => void;
    addProject: (project: CollaborativeProject) => void;
    updateProject: (id: string, project: Partial<CollaborativeProject>) => void;
    deleteProject: (id: string) => void;
    getProjectsByPartnership: (partnershipId: string) => CollaborativeProject[];
    getProjectById: (id: string) => CollaborativeProject | undefined;

    // Actions - Revenue
    setRevenueSplits: (splits: RevenueSplit[]) => void;
    addRevenueSplit: (split: RevenueSplit) => void;
    getTotalRevenue: (partnershipId: string) => number;
    getUserEarnings: (userId: string) => number;

    // Actions - Payment Links
    setPaymentLinks: (links: PaymentLink[]) => void;
    addPaymentLink: (link: PaymentLink) => void;
    updatePaymentLink: (id: string, link: Partial<PaymentLink>) => void;
    deletePaymentLink: (id: string) => void;
    getPaymentLinksByPartnership: (partnershipId: string) => PaymentLink[];

    // Actions - Metrics & Health
    setMetrics: (metrics: PartnershipMetrics[]) => void;
    getPartnershipMetrics: (partnershipId: string) => PartnershipMetrics | undefined;
    setHealthScores: (scores: PartnershipHealth[]) => void;
    getPartnershipHealth: (partnershipId: string) => PartnershipHealth | undefined;

    // Actions - Summary
    getCollaborativeEarningsSummary: (userId: string) => CollaborativeEarningsSummary;
    getTopPartners: (userId: string, limit?: number) => PartnershipEarnings[];

    // Actions - UI
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setFilterStatus: (status: string) => void;

    // Reset
    reset: () => void;
}

const initialState = {
    partnerships: [],
    projects: [],
    revenueSplits: [],
    paymentLinks: [],
    metrics: [],
    healthScores: [],
    loading: false,
    error: null,
    selectedPartnershipId: null,
    filterStatus: 'active',
};

export const usePartnershipStore = create<PartnershipStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            // Partnership Actions
            setPartnerships: (partnerships) => set({ partnerships }),
            addPartnership: (partnership) =>
                set((state) => ({
                    partnerships: [...state.partnerships, partnership],
                })),
            updatePartnership: (id, updates) =>
                set((state) => ({
                    partnerships: state.partnerships.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                })),
            deletePartnership: (id) =>
                set((state) => ({
                    partnerships: state.partnerships.filter((p) => p.id !== id),
                    selectedPartnershipId:
                        state.selectedPartnershipId === id ? null : state.selectedPartnershipId,
                })),
            getPartnershipById: (id) => {
                const state = get();
                return state.partnerships.find((p) => p.id === id);
            },
            getPartnershipsByUser: (userId) => {
                const state = get();
                return state.partnerships.filter(
                    (p) => p.artist_id === userId || p.engineer_id === userId
                );
            },
            selectPartnership: (id) => set({ selectedPartnershipId: id }),

            // Project Actions
            setProjects: (projects) => set({ projects }),
            addProject: (project) =>
                set((state) => ({
                    projects: [...state.projects, project],
                })),
            updateProject: (id, updates) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                })),
            deleteProject: (id) =>
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id),
                })),
            getProjectsByPartnership: (partnershipId) => {
                const state = get();
                return state.projects.filter((p) => p.partnership_id === partnershipId);
            },
            getProjectById: (id) => {
                const state = get();
                return state.projects.find((p) => p.id === id);
            },

            // Revenue Actions
            setRevenueSplits: (splits) => set({ revenueSplits: splits }),
            addRevenueSplit: (split) =>
                set((state) => ({
                    revenueSplits: [...state.revenueSplits, split],
                })),
            getTotalRevenue: (partnershipId) => {
                const state = get();
                return state.revenueSplits
                    .filter(
                        (s) =>
                            s.partnership_id === partnershipId &&
                            (s.split_status === 'completed' || s.split_status === 'processing')
                    )
                    .reduce((sum, s) => sum + s.total_amount, 0);
            },
            getUserEarnings: (userId) => {
                const state = get();
                const userPartnerships = state.partnerships.filter(
                    (p) => p.artist_id === userId || p.engineer_id === userId
                );
                return state.revenueSplits
                    .filter(
                        (s) =>
                            userPartnerships.some((p) => p.id === s.partnership_id) &&
                            (s.split_status === 'completed' || s.split_status === 'processing')
                    )
                    .reduce((sum, s) => {
                        const partnership = state.partnerships.find(
                            (p) => p.id === s.partnership_id
                        );
                        if (!partnership) return sum;
                        if (partnership.artist_id === userId) {
                            return sum + s.artist_amount;
                        } else {
                            return sum + s.engineer_amount;
                        }
                    }, 0);
            },

            // Payment Link Actions
            setPaymentLinks: (links) => set({ paymentLinks: links }),
            addPaymentLink: (link) =>
                set((state) => ({
                    paymentLinks: [...state.paymentLinks, link],
                })),
            updatePaymentLink: (id, updates) =>
                set((state) => ({
                    paymentLinks: state.paymentLinks.map((l) =>
                        l.id === id ? { ...l, ...updates } : l
                    ),
                })),
            deletePaymentLink: (id) =>
                set((state) => ({
                    paymentLinks: state.paymentLinks.filter((l) => l.id !== id),
                })),
            getPaymentLinksByPartnership: (partnershipId) => {
                const state = get();
                return state.paymentLinks.filter(
                    (l) => l.partnership_id === partnershipId && l.status !== 'completed'
                );
            },

            // Metrics & Health Actions
            setMetrics: (metrics) => set({ metrics }),
            getPartnershipMetrics: (partnershipId) => {
                const state = get();
                return state.metrics.find((m) => m.partnership_id === partnershipId);
            },
            setHealthScores: (scores) => set({ healthScores: scores }),
            getPartnershipHealth: (partnershipId) => {
                const state = get();
                return state.healthScores.find((h) => h.partnership_id === partnershipId);
            },

            // Summary Actions
            getCollaborativeEarningsSummary: (userId) => {
                const state = get();
                const partnerships = state.partnerships.filter(
                    (p) => p.artist_id === userId || p.engineer_id === userId
                );
                const activePartnerships = partnerships.filter(
                    (p) => p.status === 'active' || p.status === 'accepted'
                );

                const totalRevenue = state.revenueSplits
                    .filter(
                        (s) =>
                            partnerships.some((p) => p.id === s.partnership_id) &&
                            (s.split_status === 'completed' || s.split_status === 'processing')
                    )
                    .reduce((sum, s) => sum + s.total_amount, 0);

                const pendingPayments = state.revenueSplits
                    .filter(
                        (s) =>
                            partnerships.some((p) => p.id === s.partnership_id) &&
                            s.split_status === 'pending'
                    )
                    .reduce((sum, s) => {
                        const p = state.partnerships.find((pp) => pp.id === s.partnership_id);
                        if (!p) return sum;
                        return sum + (p.artist_id === userId ? s.artist_amount : s.engineer_amount);
                    }, 0);

                const topPartners = state.partnerships
                    .filter((p) => p.artist_id === userId || p.engineer_id === userId)
                    .map((p) => {
                        const earnings = state.revenueSplits
                            .filter((s) => s.partnership_id === p.id)
                            .reduce((sum, s) => sum + s.total_amount, 0);
                        const partnerUserId = p.artist_id === userId ? p.engineer_id : p.artist_id;
                        const partnerData = p.artist_id === userId ? p.engineer : p.artist;

                        return {
                            partnership_id: p.id,
                            partner_name: partnerData?.display_name || 'Unknown',
                            partner_avatar: partnerData?.avatar_url,
                            partner_type: p.artist_id === userId ? 'engineer' : 'artist',
                            this_month: 0,
                            last_month: 0,
                            year_to_date: earnings,
                            active_projects: state.projects.filter(
                                (proj) =>
                                    proj.partnership_id === p.id && proj.status === 'in_progress'
                            ).length,
                            pending_payments: state.revenueSplits
                                .filter(
                                    (s) =>
                                        s.partnership_id === p.id && s.split_status === 'pending'
                                )
                                .reduce((sum, s) => sum + s.total_amount, 0),
                            health_score: state.healthScores.find(
                                (h) => h.partnership_id === p.id
                            )?.health_score || 0,
                            last_activity: p.accepted_at || p.created_at,
                        } as PartnershipEarnings;
                    })
                    .sort((a, b) => b.year_to_date - a.year_to_date);

                const recentProjects = state.projects
                    .filter((p) => partnerships.some((pp) => pp.id === p.partnership_id))
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5);

                return {
                    total_partnership_revenue: totalRevenue,
                    active_partnerships: activePartnerships.length,
                    pending_payments_total: pendingPayments,
                    top_partners: topPartners,
                    recent_projects: recentProjects,
                    month_over_month_growth: 0,
                    average_partnership_value:
                        partnerships.length > 0
                            ? totalRevenue / partnerships.length
                            : 0,
                    total_milestone_revenue: 0,
                };
            },
            getTopPartners: (userId, limit = 5) => {
                const state = get();
                const summary = state.getCollaborativeEarningsSummary(userId);
                return summary.top_partners.slice(0, limit);
            },

            // UI Actions
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),
            setFilterStatus: (status) => set({ filterStatus: status }),

            // Reset
            reset: () => set(initialState),
        }),
        {
            name: 'partnership-store',
        }
    )
);
