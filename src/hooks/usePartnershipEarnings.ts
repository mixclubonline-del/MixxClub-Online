/**
 * usePartnershipEarnings Hook
 * 
 * Manages partnership earnings data, real-time updates, and calculations.
 * Handles fetching partnerships, projects, revenue splits, and metrics.
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePartnershipStore } from '@/stores/partnershipStore';
import { toast } from 'sonner';
import type {
    Partnership,
    CollaborativeProject,
    RevenueSplit,
    PaymentLink,
    PartnershipMetrics,
    PartnershipHealth,
    CollaborativeEarningsSummary,
} from '@/types/partnership';

interface UsePartnershipEarningsOptions {
    autoSubscribe?: boolean;
    refreshInterval?: number;
}

export const usePartnershipEarnings = (options: UsePartnershipEarningsOptions = {}) => {
    const { user } = useAuth();
    const { autoSubscribe = true, refreshInterval = 30000 } = options;

    const {
        setPartnerships,
        setProjects,
        setRevenueSplits,
        setPaymentLinks,
        setMetrics,
        setHealthScores,
        getCollaborativeEarningsSummary,
        loading,
        error,
        setLoading,
        setError,
    } = usePartnershipStore();

    const [summary, setSummary] = useState<CollaborativeEarningsSummary | null>(null);

    /**
     * Fetch partnerships for current user
     */
    const fetchPartnerships = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const { data, error: err } = await supabase
                .from('partnerships')
                .select(
                    `
                    *,
                    artist:profiles!partnerships_artist_id_fkey(*),
                    engineer:profiles!partnerships_engineer_id_fkey(*)
                    `
                )
                .or(`artist_id.eq.${user.id},engineer_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (err) throw err;
            setPartnerships((data || []) as Partnership[]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch partnerships';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [user?.id, setPartnerships, setLoading, setError]);

    /**
     * Fetch collaborative projects for partnerships
     */
    const fetchProjects = useCallback(async () => {
        if (!user?.id) return;

        try {
            const { data, error: err } = await supabase
                .from('collaborative_projects')
                .select('*')
                .or(`created_by_artist.eq.${user.id},created_by_engineer.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (err) throw err;
            setProjects((data || []) as CollaborativeProject[]);
        } catch (err) {
            console.error('Error fetching projects:', err);
        }
    }, [user?.id, setProjects]);

    /**
     * Fetch revenue splits for partnerships
     */
    const fetchRevenueSplits = useCallback(async () => {
        if (!user?.id) return;

        try {
            const { data, error: err } = await supabase
                .from('revenue_splits')
                .select('*')
                .order('split_date', { ascending: false });

            if (err) throw err;
            setRevenueSplits((data || []) as RevenueSplit[]);
        } catch (err) {
            console.error('Error fetching revenue splits:', err);
        }
    }, [user?.id, setRevenueSplits]);

    /**
     * Fetch payment links for user
     */
    const fetchPaymentLinks = useCallback(async () => {
        if (!user?.id) return;

        try {
            const { data, error: err } = await supabase
                .from('payment_links')
                .select('*')
                .or(`creator_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (err) throw err;
            setPaymentLinks((data || []) as PaymentLink[]);
        } catch (err) {
            console.error('Error fetching payment links:', err);
        }
    }, [user?.id, setPaymentLinks]);

    /**
     * Fetch partnership metrics
     */
    const fetchMetrics = useCallback(async () => {
        if (!user?.id) return;

        try {
            const { data, error: err } = await supabase
                .rpc('get_partnership_metrics', { user_id: user.id });

            if (err) throw err;
            setMetrics((data || []) as PartnershipMetrics[]);
        } catch (err) {
            console.error('Error fetching metrics:', err);
        }
    }, [user?.id, setMetrics]);

    /**
     * Fetch partnership health scores
     */
    const fetchHealthScores = useCallback(async () => {
        if (!user?.id) return;

        try {
            const { data, error: err } = await supabase
                .rpc('get_partnership_health_scores', { user_id: user.id });

            if (err) throw err;
            setHealthScores((data || []) as PartnershipHealth[]);
        } catch (err) {
            console.error('Error fetching health scores:', err);
        }
    }, [user?.id, setHealthScores]);

    /**
     * Fetch all data
     */
    const fetchAllData = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            await Promise.all([
                fetchPartnerships(),
                fetchProjects(),
                fetchRevenueSplits(),
                fetchPaymentLinks(),
                fetchMetrics(),
                fetchHealthScores(),
            ]);

            // Update summary
            const newSummary = getCollaborativeEarningsSummary(user.id);
            setSummary(newSummary);
        } catch (err) {
            console.error('Error fetching all data:', err);
        } finally {
            setLoading(false);
        }
    }, [
        user?.id,
        fetchPartnerships,
        fetchProjects,
        fetchRevenueSplits,
        fetchPaymentLinks,
        fetchMetrics,
        fetchHealthScores,
        getCollaborativeEarningsSummary,
        setLoading,
    ]);

    /**
     * Create new partnership
     */
    const createPartnership = useCallback(
        async (engineerId: string, artistSplit: number = 50, engineerSplit: number = 50) => {
            if (!user?.id) return;

            try {
                const { data, error: err } = await supabase
                    .from('partnerships')
                    .insert([
                        {
                            artist_id: user.id,
                            engineer_id: engineerId,
                            status: 'proposed',
                            revenue_split: 'equal',
                            artist_split: artistSplit,
                            engineer_split: engineerSplit,
                            total_earnings: 0,
                            artist_earnings: 0,
                            engineer_earnings: 0,
                        },
                    ])
                    .select();

                if (err) throw err;
                toast.success('Partnership created successfully');
                await fetchPartnerships();
                return data?.[0];
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to create partnership';
                setError(message);
                toast.error(message);
            }
        },
        [user?.id, setError, fetchPartnerships]
    );

    /**
     * Accept partnership
     */
    const acceptPartnership = useCallback(
        async (partnershipId: string) => {
            try {
                const { error: err } = await supabase
                    .from('partnerships')
                    .update({
                        status: 'active',
                        accepted_at: new Date().toISOString(),
                    })
                    .eq('id', partnershipId);

                if (err) throw err;
                toast.success('Partnership accepted');
                await fetchPartnerships();
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to accept partnership';
                setError(message);
                toast.error(message);
            }
        },
        [setError, fetchPartnerships]
    );

    /**
     * Create collaborative project
     */
    const createProject = useCallback(
        async (
            partnershipId: string,
            title: string,
            projectType: string,
            description?: string
        ) => {
            try {
                const { data, error: err } = await supabase
                    .from('collaborative_projects')
                    .insert([
                        {
                            partnership_id: partnershipId,
                            title,
                            description,
                            project_type: projectType,
                            status: 'draft',
                            total_revenue: 0,
                            artist_earnings: 0,
                            engineer_earnings: 0,
                        },
                    ])
                    .select();

                if (err) throw err;
                toast.success('Project created');
                await fetchProjects();
                return data?.[0];
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to create project';
                setError(message);
                toast.error(message);
            }
        },
        [setError, fetchProjects]
    );

    /**
     * Create payment link
     */
    const createPaymentLink = useCallback(
        async (
            recipientId: string,
            amount: number,
            description: string,
            partnershipId?: string,
            projectId?: string
        ) => {
            if (!user?.id) return;

            try {
                const token = Math.random().toString(36).substring(2, 15);
                const url = `${window.location.origin}/payment-link/${token}`;

                const { data, error: err } = await supabase
                    .from('payment_links')
                    .insert([
                        {
                            creator_id: user.id,
                            recipient_id: recipientId,
                            partnership_id: partnershipId,
                            project_id: projectId,
                            amount,
                            description,
                            currency: 'USD',
                            payment_method: 'stripe',
                            status: 'pending',
                            token,
                            url,
                        },
                    ])
                    .select();

                if (err) throw err;
                toast.success('Payment link created');
                await fetchPaymentLinks();
                return data?.[0];
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to create payment link';
                setError(message);
                toast.error(message);
            }
        },
        [user?.id, setError, fetchPaymentLinks]
    );

    /**
     * Set up real-time subscriptions
     */
    useEffect(() => {
        if (!autoSubscribe || !user?.id) return;

        // Initial fetch
        fetchAllData();

        // Subscribe to partnerships changes
        const partnershipsChannel = supabase
            .channel(`partnerships:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    table: 'partnerships',
                    filter: `or(artist_id.eq.${user.id},engineer_id.eq.${user.id})`,
                },
                () => fetchPartnerships()
            )
            .subscribe();

        // Subscribe to revenue splits changes
        const revenueSplitsChannel = supabase
            .channel(`revenue_splits:${user.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', table: 'revenue_splits' },
                () => {
                    fetchRevenueSplits();
                    fetchMetrics();
                }
            )
            .subscribe();

        // Set up refresh interval
        const interval = setInterval(fetchAllData, refreshInterval);

        return () => {
            partnershipsChannel.unsubscribe();
            revenueSplitsChannel.unsubscribe();
            clearInterval(interval);
        };
    }, [autoSubscribe, user?.id, fetchAllData, fetchPartnerships, fetchRevenueSplits, fetchMetrics, refreshInterval]);

    return {
        // State
        summary,
        loading,
        error,

        // Data Fetching
        fetchAllData,
        fetchPartnerships,
        fetchProjects,
        fetchRevenueSplits,
        fetchPaymentLinks,
        fetchMetrics,
        fetchHealthScores,

        // Actions
        createPartnership,
        acceptPartnership,
        createProject,
        createPaymentLink,
    };
};
