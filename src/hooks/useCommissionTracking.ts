/**
 * useCommissionTracking Hook
 * Manages commission recording, tracking, and payout calculations
 */

import { useState, useCallback } from 'react';
import { usePartnerStore } from '@/stores/partnerStore';
import PartnerService from '@/services/PartnerService';
import type { Commission, Payout } from '@/stores/partnerStore';

export interface UseCommissionResult {
    commissions: Commission[];
    payouts: Payout[];
    loading: boolean;
    error: Error | null;
    recordCommission: (partnerId: string, saleId: string, amount: number, rate: number) => Promise<Commission>;
    getPartnerCommissions: (partnerId: string) => Promise<Commission[]>;
    createPayout: (partnerId: string, amount: number, method: Payout['method']) => Promise<Payout>;
    getPartnerPayouts: (partnerId: string) => Promise<Payout[]>;
    calculatePayableAmount: (partnerId: string) => number;
    getEarnedCommissions: (partnerId: string) => number;
    getPendingCommissions: (partnerId: string) => number;
}

export function useCommissionTracking(): UseCommissionResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const {
        commissions,
        payouts,
        recordCommission: storeRecord,
        getCommissionsByPartner,
        getEarnedCommissions,
        getPendingCommissions,
        calculatePayableAmount,
    } = usePartnerStore();

    const recordCommission = useCallback(
        async (partnerId: string, saleId: string, amount: number, rate: number) => {
            try {
                setLoading(true);
                const commission = await PartnerService.recordCommission(partnerId, saleId, amount, rate);
                storeRecord(commission);
                setError(null);
                return commission;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to record commission');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [storeRecord]
    );

    const getPartnerCommissions = useCallback(
        async (partnerId: string) => {
            try {
                setLoading(true);
                const commissions = await PartnerService.getPartnerCommissions(partnerId);
                setError(null);
                return commissions;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to fetch commissions');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const createPayout = useCallback(
        async (partnerId: string, amount: number, method: Payout['method']) => {
            try {
                setLoading(true);
                const payout = await PartnerService.createPayout(partnerId, amount, method);
                setError(null);
                return payout;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to create payout');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getPartnerPayouts = useCallback(
        async (partnerId: string) => {
            try {
                setLoading(true);
                const payouts = await PartnerService.getPartnerPayouts(partnerId);
                setError(null);
                return payouts;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to fetch payouts');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        commissions,
        payouts,
        loading,
        error,
        recordCommission,
        getPartnerCommissions,
        createPayout,
        getPartnerPayouts,
        calculatePayableAmount,
        getEarnedCommissions,
        getPendingCommissions,
    };
}

export default useCommissionTracking;
