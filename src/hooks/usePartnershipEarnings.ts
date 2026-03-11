/**
 * usePartnershipEarnings — Manages partnership CRUD, revenue splits,
 * collaborative projects, and earnings aggregation.
 *
 * Collaboration limit guard: createPartnership checks canUseFeature('collaborations')
 * before inserting a new partnership row and calls refreshUsage() on success.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUsageEnforcement } from './useUsageEnforcement';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { uuid } from '@/lib/uuid';

// Database types aligned with actual schema
type DbPartnership = Database['public']['Tables']['partnerships']['Row'];
type DbCollaborativeProject = Database['public']['Tables']['collaborative_projects']['Row'];
type DbRevenueSplit = Database['public']['Tables']['revenue_splits']['Row'];
type DbPaymentLink = Database['public']['Tables']['payment_links']['Row'];
type DbPartnershipMetrics = Database['public']['Tables']['partnership_metrics']['Row'];
type DbPartnershipHealth = Database['public']['Tables']['partnership_health']['Row'];

export interface EarningsSummary {
  totalEarnings: number;
  pendingPayments: number;
  activePartnerships: number;
  topPartners: {
    partnerId: string;
    partnerName: string;
    totalEarnings: number;
    projectCount: number;
  }[];
}

interface UsePartnershipEarningsResult {
  summary: EarningsSummary | null;
  partnerships: DbPartnership[];
  projects: DbCollaborativeProject[];
  revenueSplits: DbRevenueSplit[];
  paymentLinks: DbPaymentLink[];
  metrics: DbPartnershipMetrics[];
  healthScores: DbPartnershipHealth[];
  loading: boolean;
  error: string | null;
  fetchAllData: () => Promise<void>;
  fetchPartnerships: () => Promise<void>;
  fetchProjects: (partnershipId?: string) => Promise<void>;
  fetchRevenueSplits: (partnershipId?: string) => Promise<void>;
  fetchPaymentLinks: (partnershipId?: string) => Promise<void>;
  fetchMetrics: (partnershipId?: string) => Promise<void>;
  fetchHealthScores: (partnershipId?: string) => Promise<void>;
  createPartnership: (data: { partnerId: string; userSplit: number; userType: 'artist' | 'engineer' }) => Promise<DbPartnership | null>;
  acceptPartnership: (partnershipId: string) => Promise<boolean>;
  createProject: (data: { partnershipId: string; title: string; description?: string; projectType?: string }) => Promise<DbCollaborativeProject | null>;
  createPaymentLink: (data: { partnershipId: string; amount: number; projectId?: string }) => Promise<DbPaymentLink | null>;
  recordRevenue: (data: { partnershipId: string; totalAmount: number; artistPercentage: number; description?: string }) => Promise<DbRevenueSplit | null>;
}

export const usePartnershipEarnings = (): UsePartnershipEarningsResult => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [partnerships, setPartnerships] = useState<DbPartnership[]>([]);
  const [projects, setProjects] = useState<DbCollaborativeProject[]>([]);
  const [revenueSplits, setRevenueSplits] = useState<DbRevenueSplit[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<DbPaymentLink[]>([]);
  const [metrics, setMetrics] = useState<DbPartnershipMetrics[]>([]);
  const [healthScores, setHealthScores] = useState<DbPartnershipHealth[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPartnerships = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('partnerships')
        .select('*')
        .or(`artist_id.eq.${user.id},engineer_id.eq.${user.id},producer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPartnerships(data || []);
    } catch (err) {
      console.error('Error fetching partnerships:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch partnerships');
    }
  }, [user?.id]);

  const fetchProjects = useCallback(async (partnershipId?: string) => {
    if (!user?.id) return;

    try {
      let query = supabase
        .from('collaborative_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (partnershipId) {
        query = query.eq('partnership_id', partnershipId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    }
  }, [user?.id]);

  const fetchRevenueSplits = useCallback(async (partnershipId?: string) => {
    if (!user?.id) return;

    try {
      let query = supabase
        .from('revenue_splits')
        .select('*')
        .order('created_at', { ascending: false });

      if (partnershipId) {
        query = query.eq('partnership_id', partnershipId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setRevenueSplits(data || []);
    } catch (err) {
      console.error('Error fetching revenue splits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue splits');
    }
  }, [user?.id]);

  const fetchPaymentLinks = useCallback(async (partnershipId?: string) => {
    if (!user?.id) return;

    try {
      let query = supabase
        .from('payment_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (partnershipId) {
        query = query.eq('partnership_id', partnershipId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setPaymentLinks(data || []);
    } catch (err) {
      console.error('Error fetching payment links:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payment links');
    }
  }, [user?.id]);

  const fetchMetrics = useCallback(async (partnershipId?: string) => {
    if (!user?.id) return;

    try {
      let query = supabase
        .from('partnership_metrics')
        .select('*');

      if (partnershipId) {
        query = query.eq('partnership_id', partnershipId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setMetrics(data || []);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    }
  }, [user?.id]);

  const fetchHealthScores = useCallback(async (partnershipId?: string) => {
    if (!user?.id) return;

    try {
      let query = supabase
        .from('partnership_health')
        .select('*');

      if (partnershipId) {
        query = query.eq('partnership_id', partnershipId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setHealthScores(data || []);
    } catch (err) {
      console.error('Error fetching health scores:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch health scores');
    }
  }, [user?.id]);

  const calculateSummary = useCallback(() => {
    if (!partnerships.length) {
      setSummary(null);
      return;
    }

    const totalEarnings = partnerships.reduce((sum, p) => {
      const userIsArtist = p.artist_id === user?.id;
      const userIsProducer = p.producer_id === user?.id;
      if (userIsProducer) return sum + (p.producer_earnings || 0);
      return sum + (userIsArtist ? (p.artist_earnings || 0) : (p.engineer_earnings || 0));
    }, 0);

    const pendingPayments = revenueSplits
      .filter(rs => rs.status === 'pending')
      .reduce((sum, rs) => sum + rs.total_amount, 0);

    const activePartnerships = partnerships.filter(p => p.status === 'active').length;

    const topPartners = partnerships
      .map(p => {
        const userIsArtist = p.artist_id === user?.id;
        const userIsProducer = p.producer_id === user?.id;
        const userIsEngineer = p.engineer_id === user?.id;
        let partnerId = '';
        let partnerName = '';
        let myEarnings = 0;
        if (userIsProducer) {
          partnerId = p.artist_id || p.engineer_id || '';
          partnerName = p.artist_id ? 'Artist' : 'Engineer';
          myEarnings = p.producer_earnings || 0;
        } else if (userIsArtist) {
          partnerId = p.engineer_id || p.producer_id || '';
          partnerName = p.engineer_id ? 'Engineer' : 'Producer';
          myEarnings = p.artist_earnings || 0;
        } else {
          partnerId = p.artist_id || p.producer_id || '';
          partnerName = p.artist_id ? 'Artist' : 'Producer';
          myEarnings = p.engineer_earnings || 0;
        }
        return {
          partnerId,
          partnerName,
          totalEarnings: myEarnings,
          projectCount: projects.filter(proj => proj.partnership_id === p.id).length,
        };
      })
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 5);

    setSummary({
      totalEarnings,
      pendingPayments,
      activePartnerships,
      topPartners,
    });
  }, [partnerships, revenueSplits, projects, user?.id]);

  const fetchAllData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchPartnerships(),
        fetchProjects(),
        fetchRevenueSplits(),
        fetchPaymentLinks(),
        fetchMetrics(),
        fetchHealthScores(),
      ]);
    } catch (err) {
      console.error('Error fetching all data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchPartnerships, fetchProjects, fetchRevenueSplits, fetchPaymentLinks, fetchMetrics, fetchHealthScores]);

  const { canUseFeature, getFeatureUsage, refreshUsage, tier } = useUsageEnforcement();

  const createPartnership = useCallback(async (data: { partnerId: string; userSplit: number; userType: 'artist' | 'engineer' }): Promise<DbPartnership | null> => {
    if (!user?.id) return null;

    if (!canUseFeature('collaborations')) {
      const usage = getFeatureUsage('collaborations');
      toast.error(`Collaboration limit reached (${usage.current}/${usage.limit}) on your ${tier} plan. Upgrade for more.`, {
        action: { label: 'Upgrade', onClick: () => window.location.href = '/pricing?feature=collaborations' },
      });
      return null;
    }

    try {
      const insertData = data.userType === 'artist'
        ? {
          artist_id: user.id,
          engineer_id: data.partnerId,
          artist_percentage: data.userSplit,
          engineer_percentage: 100 - data.userSplit,
          status: 'pending',
        }
        : {
          artist_id: data.partnerId,
          engineer_id: user.id,
          artist_percentage: 100 - data.userSplit,
          engineer_percentage: data.userSplit,
          status: 'pending',
        };

      const { data: newPartnership, error: createError } = await supabase
        .from('partnerships')
        .insert(insertData)
        .select()
        .single();

      if (createError) throw createError;
      await fetchPartnerships();
      await refreshUsage();
      return newPartnership;
    } catch (err) {
      console.error('Error creating partnership:', err);
      setError(err instanceof Error ? err.message : 'Failed to create partnership');
      return null;
    }
  }, [user?.id, fetchPartnerships, canUseFeature, getFeatureUsage, refreshUsage, tier]);

  const acceptPartnership = useCallback(async (partnershipId: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('partnerships')
        .update({ status: 'active', accepted_at: new Date().toISOString() })
        .eq('id', partnershipId);

      if (updateError) throw updateError;
      await fetchPartnerships();
      return true;
    } catch (err) {
      console.error('Error accepting partnership:', err);
      setError(err instanceof Error ? err.message : 'Failed to accept partnership');
      return false;
    }
  }, [fetchPartnerships]);

  const createProject = useCallback(async (data: { partnershipId: string; title: string; description?: string; projectType?: string }): Promise<DbCollaborativeProject | null> => {
    if (!user?.id) return null;

    try {
      const { data: newProject, error: createError } = await supabase
        .from('collaborative_projects')
        .insert({
          partnership_id: data.partnershipId,
          title: data.title,
          description: data.description,
          project_type: data.projectType || 'track',
          status: 'planning',
        })
        .select()
        .single();

      if (createError) throw createError;
      await fetchProjects();
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    }
  }, [user?.id, fetchProjects]);

  const createPaymentLink = useCallback(async (data: { partnershipId: string; amount: number; projectId?: string }): Promise<DbPaymentLink | null> => {
    if (!user?.id) return null;

    try {
      const { data: newLink, error: createError } = await supabase
        .from('payment_links')
        .insert({
          partnership_id: data.partnershipId,
          project_id: data.projectId,
          created_by: user.id,
          amount: data.amount,
          link_url: `https://pay.mixxclub.com/${uuid().slice(0, 8)}`,
          status: 'active',
        })
        .select()
        .single();

      if (createError) throw createError;
      await fetchPaymentLinks();
      return newLink;
    } catch (err) {
      console.error('Error creating payment link:', err);
      setError(err instanceof Error ? err.message : 'Failed to create payment link');
      return null;
    }
  }, [user?.id, fetchPaymentLinks]);

  const recordRevenue = useCallback(async (data: { partnershipId: string; totalAmount: number; artistPercentage: number; description?: string }): Promise<DbRevenueSplit | null> => {
    if (!user?.id) return null;

    const artistAmount = (data.totalAmount * data.artistPercentage) / 100;
    const engineerAmount = data.totalAmount - artistAmount;

    try {
      const { data: newRevenue, error: createError } = await supabase
        .from('revenue_splits')
        .insert({
          partnership_id: data.partnershipId,
          total_amount: data.totalAmount,
          artist_amount: artistAmount,
          engineer_amount: engineerAmount,
          artist_percentage: data.artistPercentage,
          engineer_percentage: 100 - data.artistPercentage,
          description: data.description,
          status: 'pending',
        })
        .select()
        .single();

      if (createError) throw createError;
      await fetchRevenueSplits();
      return newRevenue;
    } catch (err) {
      console.error('Error recording revenue:', err);
      setError(err instanceof Error ? err.message : 'Failed to record revenue');
      return null;
    }
  }, [user?.id, fetchRevenueSplits]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    if (user?.id) {
      fetchAllData();
    }
  }, [user?.id, fetchAllData]);

  // Calculate summary when data changes
  useEffect(() => {
    calculateSummary();
  }, [calculateSummary]);

  // Real-time subscription for partnerships
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('partnership-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partnerships',
        },
        () => {
          fetchPartnerships();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'revenue_splits',
        },
        () => {
          fetchRevenueSplits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchPartnerships, fetchRevenueSplits]);

  return {
    summary,
    partnerships,
    projects,
    revenueSplits,
    paymentLinks,
    metrics,
    healthScores,
    loading,
    error,
    fetchAllData,
    fetchPartnerships,
    fetchProjects,
    fetchRevenueSplits,
    fetchPaymentLinks,
    fetchMetrics,
    fetchHealthScores,
    createPartnership,
    acceptPartnership,
    createProject,
    createPaymentLink,
    recordRevenue,
  };
};
