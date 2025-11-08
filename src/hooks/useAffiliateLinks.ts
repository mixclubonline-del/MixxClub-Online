/**
 * useAffiliateLinks Hook
 * Manages affiliate link creation, tracking, and analytics
 */

import { useState, useCallback } from 'react';
import { usePartnerStore } from '@/stores/partnerStore';
import PartnerService from '@/services/PartnerService';
import type { AffiliateLink } from '@/stores/partnerStore';

export interface UseAffiliateResult {
    affiliateLinks: AffiliateLink[];
    loading: boolean;
    error: Error | null;
    createAffiliateLink: (partnerId: string, campaign?: string) => Promise<AffiliateLink>;
    trackLinkClick: (linkId: string) => void;
    trackConversion: (linkId: string, amount: number) => void;
    getPartnerLinks: (partnerId: string) => AffiliateLink[];
    getTopPerformingLinks: (partnerId: string, limit?: number) => AffiliateLink[];
}

export function useAffiliateLinks(): UseAffiliateResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const {
        affiliateLinks,
        createAffiliateLink: storeCreate,
        trackLinkClick: storeTrack,
        trackConversion: storeConversion,
        getPartnerLinks,
    } = usePartnerStore();

    const createAffiliateLink = useCallback(
        async (partnerId: string, campaign?: string) => {
            try {
                setLoading(true);
                const link = await PartnerService.createAffiliateLink(partnerId, campaign);
                storeCreate(partnerId, campaign);
                setError(null);
                return link;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to create affiliate link');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [storeCreate]
    );

    const trackLinkClick = useCallback((linkId: string) => {
        storeTrack(linkId);
    }, [storeTrack]);

    const trackConversion = useCallback(
        (linkId: string, amount: number) => {
            storeConversion(linkId, amount);
        },
        [storeConversion]
    );

    const getTopPerformingLinks = useCallback(
        (partnerId: string, limit: number = 5) => {
            const links = getPartnerLinks(partnerId);
            return links
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, limit);
        },
        [getPartnerLinks]
    );

    return {
        affiliateLinks,
        loading,
        error,
        createAffiliateLink,
        trackLinkClick,
        trackConversion,
        getPartnerLinks,
        getTopPerformingLinks,
    };
}

export default useAffiliateLinks;
