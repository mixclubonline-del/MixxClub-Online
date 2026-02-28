import { create } from 'zustand';

export interface ReferralCode {
    id: string;
    code: string;
    userId: string;
    createdAt: Date;
    expiresAt?: Date;
    isActive: boolean;
    rewardType: 'credit' | 'discount' | 'subscription-month';
    rewardValue: number;
    rewardDescription: string;
}

export interface ReferralReward {
    id: string;
    referrerId: string;
    referredUserId: string;
    referralCode: string;
    rewardGiven: boolean;
    rewardType: 'credit' | 'discount' | 'subscription-month';
    rewardValue: number;
    createdAt: Date;
    rewardedAt?: Date;
}

interface ReferralStore {
    // User's own referral code
    myReferralCode: ReferralCode | null;
    referralCodes: ReferralCode[];

    // Referrals this user has made (referrer perspective)
    outgoingReferrals: ReferralReward[];

    // Referrals made to this user (referee perspective)
    incomingReferrals: ReferralReward[];

    // Statistics
    referralStats: {
        totalReferred: number;
        successfulReferrals: number;
        totalRewardsEarned: number;
        pendingRewards: number;
    };

    // Methods
    setMyReferralCode: (code: ReferralCode) => void;
    setOutgoingReferrals: (referrals: ReferralReward[]) => void;
    setIncomingReferrals: (referrals: ReferralReward[]) => void;
    generateNewReferralCode: () => Promise<ReferralCode>;
    getReferralLink: () => string;
    getReferralShareText: () => string;
    copyReferralLink: () => Promise<void>;
    calculateStats: () => void;
}

const generateCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const useReferralStore = create<ReferralStore>((set, get) => ({
    myReferralCode: null,
    referralCodes: [],
    outgoingReferrals: [],
    incomingReferrals: [],
    referralStats: {
        totalReferred: 0,
        successfulReferrals: 0,
        totalRewardsEarned: 0,
        pendingRewards: 0,
    },

    setMyReferralCode: (code) => set({ myReferralCode: code }),

    setOutgoingReferrals: (referrals) => set({ outgoingReferrals: referrals }),

    setIncomingReferrals: (referrals) => set({ incomingReferrals: referrals }),

    generateNewReferralCode: async () => {
        const code = generateCode();
        const newCode: ReferralCode = {
            id: `ref-${Date.now()}`,
            code,
            userId: '', // Will be set by caller
            createdAt: new Date(),
            isActive: true,
            rewardType: 'credit',
            rewardValue: 10, // $10 credit
            rewardDescription: '$10 credit when friend upgrades',
        };

        try {
            // Save to backend
            const response = await fetch('/api/referrals/generate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCode),
            });

            if (!response.ok) throw new Error('Failed to generate referral code');

            const savedCode = await response.json();
            set({ myReferralCode: savedCode });
            return savedCode;
        } catch (error) {
            console.error('Failed to generate referral code:', error);
            throw error;
        }
    },

    getReferralLink: () => {
        const { myReferralCode } = get();
        if (!myReferralCode) return '';
        return `${window.location.origin}/join?ref=${myReferralCode.code}`;
    },

    getReferralShareText: () => {
        const { myReferralCode } = get();
        if (!myReferralCode) return '';

        return `🎵 Join me on Mixxclub - the platform for artists & engineers to collaborate! 
Get $10 credit with my referral code: ${myReferralCode.code}
${get().getReferralLink()}`;
    },

    copyReferralLink: async () => {
        const link = get().getReferralLink();
        try {
            await navigator.clipboard.writeText(link);
        } catch (error) {
            console.error('Failed to copy referral link:', error);
            throw error;
        }
    },

    calculateStats: () => {
        const { outgoingReferrals } = get();

        const stats = {
            totalReferred: outgoingReferrals.length,
            successfulReferrals: outgoingReferrals.filter((r) => r.rewardGiven).length,
            totalRewardsEarned: outgoingReferrals
                .filter((r) => r.rewardGiven)
                .reduce((sum, r) => sum + r.rewardValue, 0),
            pendingRewards: outgoingReferrals
                .filter((r) => !r.rewardGiven)
                .reduce((sum, r) => sum + r.rewardValue, 0),
        };

        set({ referralStats: stats });
    },
}));
