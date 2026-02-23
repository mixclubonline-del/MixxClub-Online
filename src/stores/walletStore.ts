import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface MixxWallet {
  id: string;
  user_id: string;
  earned_balance: number;
  purchased_balance: number;
  total_earned: number;
  total_purchased: number;
  total_spent: number;
  total_gifted: number;
  total_received: number;
  daily_purchased: number;
  daily_purchased_reset_at: string;
}

export interface MixxTransaction {
  id: string;
  user_id: string;
  transaction_type: 'EARN' | 'SPEND' | 'PURCHASE' | 'GIFT_SENT' | 'GIFT_RECEIVED' | 'CASHOUT' | 'REFUND';
  source: string;
  amount: number;
  balance_type: 'earned' | 'purchased';
  reference_type?: string;
  reference_id?: string;
  counterparty_id?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

interface WalletState {
  wallet: MixxWallet | null;
  transactions: MixxTransaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWallet: (userId: string) => Promise<void>;
  fetchTransactions: (userId: string, limit?: number) => Promise<void>;
  earnCoinz: (userId: string, amount: number, source: string, description?: string, referenceType?: string, referenceId?: string) => Promise<boolean>;
  spendCoinz: (userId: string, amount: number, source: string, description?: string, preferEarned?: boolean, referenceType?: string, referenceId?: string) => Promise<boolean>;
  getTotalBalance: () => number;
  canAfford: (amount: number) => boolean;
  refreshWallet: (userId: string) => Promise<void>;
}

const DAILY_PURCHASE_LIMIT = 2000;

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  transactions: [],
  isLoading: false,
  error: null,

  fetchWallet: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Use the helper function to get or create wallet
      const { data, error } = await supabase
        .rpc('get_or_create_wallet', { p_user_id: userId });

      if (error) throw error;
      set({ wallet: data as MixxWallet, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchTransactions: async (userId: string, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('mixx_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      set({ transactions: (data || []) as MixxTransaction[] });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  },

  earnCoinz: async (userId, amount, source, description, referenceType, referenceId) => {
    try {
      // Atomic RPC — all math + locking in Postgres
      const { data, error } = await (supabase.rpc as any)('earn_coinz', {
        p_user_id: userId,
        p_amount: amount,
        p_source: source,
        p_description: description || null,
        p_reference_type: referenceType || null,
        p_reference_id: referenceId || null,
      });

      if (error) throw error;

      // Refresh wallet state from DB
      await get().fetchWallet(userId);
      return true;
    } catch (error) {
      console.error('Failed to earn coinz:', error);
      return false;
    }
  },

  spendCoinz: async (userId, amount, source, description, preferEarned = true, referenceType, referenceId) => {
    const { canAfford } = get();
    if (!canAfford(amount)) return false;

    try {
      // Atomic RPC — balance check + math + locking + transactions all in Postgres
      const { data, error } = await (supabase.rpc as any)('spend_coinz', {
        p_user_id: userId,
        p_amount: amount,
        p_source: source,
        p_description: description || null,
        p_prefer_earned: preferEarned,
        p_reference_type: referenceType || null,
        p_reference_id: referenceId || null,
      });

      if (error) throw error;

      // Refresh wallet state from DB
      await get().fetchWallet(userId);
      return true;
    } catch (error) {
      console.error('Failed to spend coinz:', error);
      return false;
    }
  },

  getTotalBalance: () => {
    const { wallet } = get();
    if (!wallet) return 0;
    return wallet.earned_balance + wallet.purchased_balance;
  },

  canAfford: (amount: number) => {
    return get().getTotalBalance() >= amount;
  },

  refreshWallet: async (userId: string) => {
    await Promise.all([
      get().fetchWallet(userId),
      get().fetchTransactions(userId),
    ]);
  },
}));

export { DAILY_PURCHASE_LIMIT };
