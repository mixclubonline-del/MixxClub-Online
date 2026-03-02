/**
 * Auto-Earn Engine — Configuration for passive coinz earning.
 * 
 * Every engagement action has a coinz rate + daily cap.
 * This is the beating heart of the MixxCoinz economy.
 */

export interface EarnAction {
    /** Unique action key */
    action: string;
    /** Display label */
    label: string;
    /** Coinz awarded per occurrence */
    coinzPerAction: number;
    /** Max times this action earns per day (0 = unlimited) */
    dailyCap: number;
    /** Source tag for transaction tracking */
    source: string;
    /** Category for grouping */
    category: 'engagement' | 'content' | 'social' | 'community' | 'discovery';
    /** Whether this also earns for a content creator */
    creatorPayout: boolean;
    /** Coinz the creator gets (if creatorPayout is true) */
    creatorCoinz: number;
}

/**
 * Master rate table — every action that earns MixxCoinz.
 * 
 * Fan actions are cheap and high-frequency.
 * Creator payouts are higher but less frequent.
 */
export const EARN_ACTIONS: Record<string, EarnAction> = {
    // --- ENGAGEMENT (fan earns) ---
    play_track: {
        action: 'play_track',
        label: 'Listen to a track',
        coinzPerAction: 1,
        dailyCap: 50,
        source: 'auto_earn',
        category: 'engagement',
        creatorPayout: true,
        creatorCoinz: 2,
    },
    vote: {
        action: 'vote',
        label: 'Vote on a track',
        coinzPerAction: 2,
        dailyCap: 20,
        source: 'auto_earn',
        category: 'engagement',
        creatorPayout: true,
        creatorCoinz: 1,
    },
    comment: {
        action: 'comment',
        label: 'Leave a comment',
        coinzPerAction: 3,
        dailyCap: 15,
        source: 'auto_earn',
        category: 'engagement',
        creatorPayout: true,
        creatorCoinz: 2,
    },
    share: {
        action: 'share',
        label: 'Share content',
        coinzPerAction: 5,
        dailyCap: 10,
        source: 'auto_earn',
        category: 'social',
        creatorPayout: true,
        creatorCoinz: 5,
    },

    // --- SOCIAL (fan earns) ---
    follow_artist: {
        action: 'follow_artist',
        label: 'Follow an artist',
        coinzPerAction: 5,
        dailyCap: 10,
        source: 'auto_earn',
        category: 'social',
        creatorPayout: true,
        creatorCoinz: 3,
    },
    join_community: {
        action: 'join_community',
        label: 'Join a community',
        coinzPerAction: 10,
        dailyCap: 3,
        source: 'auto_earn',
        category: 'community',
        creatorPayout: false,
        creatorCoinz: 0,
    },
    reply_thread: {
        action: 'reply_thread',
        label: 'Reply in a thread',
        coinzPerAction: 2,
        dailyCap: 20,
        source: 'auto_earn',
        category: 'community',
        creatorPayout: false,
        creatorCoinz: 0,
    },

    // --- CONTENT (creator earns) ---
    upload_track: {
        action: 'upload_track',
        label: 'Upload a track',
        coinzPerAction: 25,
        dailyCap: 5,
        source: 'auto_earn',
        category: 'content',
        creatorPayout: false,
        creatorCoinz: 0,
    },
    upload_beat: {
        action: 'upload_beat',
        label: 'List a beat',
        coinzPerAction: 20,
        dailyCap: 5,
        source: 'auto_earn',
        category: 'content',
        creatorPayout: false,
        creatorCoinz: 0,
    },
    premiere_hosted: {
        action: 'premiere_hosted',
        label: 'Host a premiere',
        coinzPerAction: 50,
        dailyCap: 2,
        source: 'auto_earn',
        category: 'content',
        creatorPayout: false,
        creatorCoinz: 0,
    },

    // --- DISCOVERY (fan earns more for early support) ---
    early_supporter: {
        action: 'early_supporter',
        label: 'Support before 100 plays',
        coinzPerAction: 10,
        dailyCap: 5,
        source: 'auto_earn',
        category: 'discovery',
        creatorPayout: true,
        creatorCoinz: 5,
    },
    first_comment: {
        action: 'first_comment',
        label: 'First comment on a track',
        coinzPerAction: 8,
        dailyCap: 5,
        source: 'auto_earn',
        category: 'discovery',
        creatorPayout: true,
        creatorCoinz: 3,
    },

    // --- MARKETPLACE (earns for activity) ---
    leave_review: {
        action: 'leave_review',
        label: 'Leave a product review',
        coinzPerAction: 10,
        dailyCap: 5,
        source: 'auto_earn',
        category: 'engagement',
        creatorPayout: true,
        creatorCoinz: 3,
    },
    add_to_wishlist: {
        action: 'add_to_wishlist',
        label: 'Add to wishlist',
        coinzPerAction: 1,
        dailyCap: 20,
        source: 'auto_earn',
        category: 'engagement',
        creatorPayout: false,
        creatorCoinz: 0,
    },
};

/** Get the max daily earning potential across all actions */
export function getMaxDailyEarning(): number {
    return Object.values(EARN_ACTIONS).reduce(
        (sum, a) => sum + (a.coinzPerAction * a.dailyCap),
        0,
    );
}

/** Get earn actions by category */
export function getActionsByCategory(category: EarnAction['category']): EarnAction[] {
    return Object.values(EARN_ACTIONS).filter(a => a.category === category);
}
