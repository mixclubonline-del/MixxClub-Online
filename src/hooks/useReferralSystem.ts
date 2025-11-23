// Stubbed - Referral System will be implemented in Phase 3
export function useReferralSystem() {
  return {
    myReferralCode: null,
    referralLink: '',
    referralStats: { total: 0, active: 0, earnings: 0 },
    outgoingReferrals: [],
    incomingReferrals: [],
    loading: false,
    error: null,
    shareReferralLink: async () => ({ success: true, message: '' }),
    copyReferralLink: async () => {},
    getTotalReferralEarnings: () => 0,
    getPendingRewards: () => 0,
    generateNewReferralCode: async () => {},
  };
}
