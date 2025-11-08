/**
 * usePartnerManagement Hook
 * Manages partner CRUD operations, verification, and tier management
 */

import { useState, useCallback, useEffect } from 'react';
import { usePartnerStore } from '@/stores/partnerStore';
import PartnerService from '@/services/PartnerService';
import type { Partner } from '@/stores/partnerStore';

export interface UsePartnerResult {
    partners: Partner[];
    selectedPartner: Partner | null;
    loading: boolean;
    error: Error | null;
    fetchPartners: (filters?: { status?: string; tier?: string }) => Promise<void>;
    getPartner: (partnerId: string) => Promise<Partner | null>;
    createPartner: (partner: Omit<Partner, 'id' | 'joinedAt'>) => Promise<Partner>;
    updatePartner: (partnerId: string, updates: Partial<Partner>) => Promise<void>;
    approvePartner: (partnerId: string) => Promise<void>;
    suspendPartner: (partnerId: string, reason: string) => Promise<void>;
    reactivatePartner: (partnerId: string) => Promise<void>;
    selectPartner: (partner: Partner | null) => void;
    getFilteredPartners: () => Partner[];
    searchPartners: (query: string) => void;
    filterPartners: (filter: 'all' | 'active' | 'pending' | 'suspended') => void;
}

export function usePartnerManagement(): UsePartnerResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const {
        partners,
        selectedPartner,
        addPartner,
        updatePartner: storeUpdate,
        selectPartner,
        approvePartner: storeApprove,
        suspendPartner: storeSuspend,
        reactivatePartner: storeReactivate,
        searchPartners,
        filterPartners,
        getFilteredPartners,
    } = usePartnerStore();

    // Fetch partners on mount
    useEffect(() => {
        const initialize = async () => {
            try {
                setLoading(true);
                const fetchedPartners = await PartnerService.getPartners({ limit: 100 });
                fetchedPartners.forEach((p) => addPartner(p));
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch partners'));
            } finally {
                setLoading(false);
            }
        };

        if (partners.length === 0) {
            initialize();
        }
    }, [addPartner, partners.length]);

    const fetchPartners = useCallback(
        async (filters?: { status?: string; tier?: string }) => {
            try {
                setLoading(true);
                const fetchedPartners = await PartnerService.getPartners(filters);
                fetchedPartners.forEach((p) => addPartner(p));
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch partners'));
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [addPartner]
    );

    const getPartner = useCallback(
        async (partnerId: string) => {
            try {
                setLoading(true);
                const partner = await PartnerService.getPartner(partnerId);
                if (partner) {
                    selectPartner(partner);
                }
                setError(null);
                return partner;
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch partner'));
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [selectPartner]
    );

    const createPartner = useCallback(
        async (partner: Omit<Partner, 'id' | 'joinedAt'>) => {
            try {
                setLoading(true);
                const newPartner = await PartnerService.createPartner(partner);
                addPartner(newPartner);
                setError(null);
                return newPartner;
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to create partner'));
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [addPartner]
    );

    const updatePartner = useCallback(
        async (partnerId: string, updates: Partial<Partner>) => {
            try {
                setLoading(true);
                const updated = await PartnerService.updatePartner(partnerId, updates);
                storeUpdate(partnerId, updates);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to update partner'));
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [storeUpdate]
    );

    const approvePartner = useCallback(
        async (partnerId: string) => {
            try {
                setLoading(true);
                await PartnerService.updatePartner(partnerId, {
                    status: 'active',
                    verifiedAt: new Date(),
                });
                storeApprove(partnerId);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to approve partner'));
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [storeApprove]
    );

    const suspendPartner = useCallback(
        async (partnerId: string, reason: string) => {
            try {
                setLoading(true);
                await PartnerService.updatePartner(partnerId, {
                    status: 'suspended',
                });
                storeSuspend(partnerId, reason);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to suspend partner'));
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [storeSuspend]
    );

    const reactivatePartner = useCallback(
        async (partnerId: string) => {
            try {
                setLoading(true);
                await PartnerService.updatePartner(partnerId, {
                    status: 'active',
                });
                storeReactivate(partnerId);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to reactivate partner'));
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [storeReactivate]
    );

    return {
        partners,
        selectedPartner,
        loading,
        error,
        fetchPartners,
        getPartner,
        createPartner,
        updatePartner,
        approvePartner,
        suspendPartner,
        reactivatePartner,
        selectPartner,
        getFilteredPartners,
        searchPartners,
        filterPartners,
    };
}

export default usePartnerManagement;
