import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMixxWallet } from './useMixxWallet';

export interface VaultItem {
  id: string;
  name: string;
  description: string | null;
  category: 'tool' | 'skin' | 'access' | 'sound_engine' | 'certification' | 'badge' | 'perk';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon_name: string;
  image_url: string | null;
  coinz_price: number;
  requires_earned_only: boolean;
  tier_required: number;
  role_required: string | null;
  limited_quantity: number | null;
  quantity_remaining: number | null;
  feature_flag_key: string | null;
  asset_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface VaultOwnership {
  id: string;
  user_id: string;
  item_id: string;
  coinz_paid: number;
  purchased_at: string;
}

export interface VaultItemWithOwnership extends VaultItem {
  isOwned: boolean;
  ownership: VaultOwnership | null;
}

const RARITY_COLORS = {
  common: 'text-muted-foreground',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
} as const;

const RARITY_BG_COLORS = {
  common: 'bg-muted/50',
  rare: 'bg-blue-500/10',
  epic: 'bg-purple-500/10',
  legendary: 'bg-amber-500/10 border border-amber-500/30',
} as const;

export function useMixxVault() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { wallet, spendCoinz, canAfford } = useMixxWallet();

  // Fetch all vault items
  const itemsQuery = useQuery({
    queryKey: ['mixx-vault-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mixx_vault_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data || []) as VaultItem[];
    },
    staleTime: 60000,
  });

  // Fetch user's owned items
  const ownershipQuery = useQuery({
    queryKey: ['mixx-vault-ownership', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('mixx_vault_ownership')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []) as VaultOwnership[];
    },
    enabled: !!user?.id,
  });

  // Combine items with ownership
  const itemsWithOwnership: VaultItemWithOwnership[] = (itemsQuery.data || []).map(item => {
    const ownership = ownershipQuery.data?.find(o => o.item_id === item.id) || null;
    return {
      ...item,
      isOwned: !!ownership,
      ownership,
    };
  });

  // Purchase item mutation
  const purchaseMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const item = itemsQuery.data?.find(i => i.id === itemId);
      if (!item) throw new Error('Item not found');

      // Check if already owned
      const alreadyOwned = ownershipQuery.data?.some(o => o.item_id === itemId);
      if (alreadyOwned) throw new Error('You already own this item');

      // Check balance
      if (!canAfford(item.coinz_price)) {
        throw new Error('Insufficient MixxCoinz');
      }

      // Check earned-only requirement
      if (item.requires_earned_only && wallet) {
        if (wallet.earned_balance < item.coinz_price) {
          throw new Error('This item requires earned coinz only');
        }
      }

      // Check quantity
      if (item.limited_quantity !== null && (item.quantity_remaining || 0) <= 0) {
        throw new Error('This item is sold out');
      }

      // Spend coinz (prefer earned if requires_earned_only)
      await spendCoinz({
        amount: item.coinz_price,
        source: 'vault_purchase',
        description: `Purchased: ${item.name}`,
        preferEarned: item.requires_earned_only,
        referenceType: 'vault_item',
        referenceId: itemId,
      });

      // Record ownership
      const { error: ownershipError } = await supabase
        .from('mixx_vault_ownership')
        .insert({
          user_id: user.id,
          item_id: itemId,
          coinz_paid: item.coinz_price,
        });

      if (ownershipError) throw ownershipError;

      // Update quantity if limited
      if (item.limited_quantity !== null) {
        await supabase
          .from('mixx_vault_items')
          .update({ quantity_remaining: (item.quantity_remaining || 0) - 1 })
          .eq('id', itemId);
      }

      return { item };
    },
    onSuccess: ({ item }) => {
      queryClient.invalidateQueries({ queryKey: ['mixx-vault-ownership'] });
      queryClient.invalidateQueries({ queryKey: ['mixx-vault-items'] });
      toast({
        title: '🎉 Item Unlocked!',
        description: `"${item.name}" is now yours forever`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Purchase Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Filter items
  const ownedItems = itemsWithOwnership.filter(i => i.isOwned);
  const availableItems = itemsWithOwnership.filter(i => !i.isOwned);
  
  const itemsByCategory = {
    tools: availableItems.filter(i => i.category === 'tool'),
    skins: availableItems.filter(i => i.category === 'skin'),
    access: availableItems.filter(i => i.category === 'access'),
    soundEngines: availableItems.filter(i => i.category === 'sound_engine'),
    certifications: availableItems.filter(i => i.category === 'certification'),
    badges: availableItems.filter(i => i.category === 'badge'),
    perks: availableItems.filter(i => i.category === 'perk'),
  };

  return {
    items: itemsWithOwnership,
    ownedItems,
    availableItems,
    itemsByCategory,
    isLoading: itemsQuery.isLoading || ownershipQuery.isLoading,
    purchaseItem: purchaseMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    RARITY_COLORS,
    RARITY_BG_COLORS,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['mixx-vault-items'] });
      queryClient.invalidateQueries({ queryKey: ['mixx-vault-ownership'] });
    },
  };
}
