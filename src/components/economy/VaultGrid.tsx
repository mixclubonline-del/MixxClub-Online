import { motion } from 'framer-motion';
import { Package, Lock, Check, Sparkles, Coins, Shield, Music, Award, Moon, Star, FastForward, Frame, Badge as BadgeIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMixxVault, VaultItemWithOwnership } from '@/hooks/useMixxVault';
import { useMixxWallet } from '@/hooks/useMixxWallet';

const ICON_MAP: Record<string, React.ElementType> = {
  Package,
  Badge: BadgeIcon,
  Frame,
  FastForward,
  Music,
  Award,
  Moon,
  Star,
  Shield,
  Sparkles,
};

const RARITY_GRADIENTS = {
  common: 'from-slate-400/20 to-slate-500/10',
  rare: 'from-blue-400/20 to-blue-500/10',
  epic: 'from-purple-400/20 to-purple-500/10',
  legendary: 'from-amber-400/20 to-amber-500/10',
} as const;

const RARITY_BORDERS = {
  common: 'border-slate-500/20',
  rare: 'border-blue-500/30',
  epic: 'border-purple-500/30',
  legendary: 'border-amber-500/40 shadow-amber-500/10 shadow-lg',
} as const;

const RARITY_TEXT = {
  common: 'text-slate-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
} as const;

interface VaultItemCardProps {
  item: VaultItemWithOwnership;
  onPurchase: (id: string) => void;
  isPurchasing: boolean;
  canAfford: boolean;
}

function VaultItemCard({ item, onPurchase, isPurchasing, canAfford }: VaultItemCardProps) {
  const Icon = ICON_MAP[item.icon_name] || Package;
  const isAvailable = !item.isOwned && (item.quantity_remaining === null || item.quantity_remaining > 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-4 relative overflow-hidden transition-all ${
        item.isOwned 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : `bg-gradient-to-br ${RARITY_GRADIENTS[item.rarity]} ${RARITY_BORDERS[item.rarity]}`
      }`}>
        {/* Rarity Glow for Legendary */}
        {item.rarity === 'legendary' && !item.isOwned && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-amber-400/10 to-amber-500/5 animate-pulse" />
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className={`p-3 rounded-xl ${
              item.isOwned ? 'bg-emerald-500/20' : 'bg-background/50'
            }`}>
              {item.isOwned ? (
                <Check className="h-6 w-6 text-emerald-400" />
              ) : (
                <Icon className={`h-6 w-6 ${RARITY_TEXT[item.rarity]}`} />
              )}
            </div>
            <Badge 
              variant="outline" 
              className={`text-[10px] uppercase tracking-wider ${RARITY_TEXT[item.rarity]} border-current`}
            >
              {item.rarity}
            </Badge>
          </div>

          {/* Content */}
          <h4 className="font-semibold mb-1">{item.name}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {item.description}
          </p>

          {/* Requirements */}
          {item.requires_earned_only && !item.isOwned && (
            <div className="flex items-center gap-1 text-xs text-emerald-400 mb-3">
              <Shield className="h-3 w-3" />
              <span>Earned coinz only</span>
            </div>
          )}

          {/* Limited quantity */}
          {item.limited_quantity !== null && !item.isOwned && (
            <div className="text-xs text-muted-foreground mb-3">
              {item.quantity_remaining} / {item.limited_quantity} remaining
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-amber-400" />
              <span className="font-bold text-amber-400">
                {item.coinz_price.toLocaleString()}
              </span>
            </div>

            {item.isOwned ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <Check className="h-3 w-3 mr-1" />
                Owned
              </Badge>
            ) : isAvailable ? (
              <Button
                size="sm"
                onClick={() => onPurchase(item.id)}
                disabled={isPurchasing || !canAfford}
                variant={canAfford ? 'default' : 'secondary'}
              >
                {isPurchasing ? (
                  'Processing...'
                ) : canAfford ? (
                  'Unlock'
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Insufficient
                  </>
                )}
              </Button>
            ) : (
              <Badge variant="destructive">Sold Out</Badge>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function VaultGrid() {
  const { 
    ownedItems, 
    availableItems,
    isLoading, 
    purchaseItem, 
    isPurchasing 
  } = useMixxVault();
  const { canAfford } = useMixxWallet();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="armory" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="armory" className="gap-2">
          <Package className="h-4 w-4" />
          Armory ({availableItems.length})
        </TabsTrigger>
        <TabsTrigger value="owned" className="gap-2">
          <Check className="h-4 w-4" />
          My Vault ({ownedItems.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="armory">
        {availableItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableItems.map((item) => (
              <VaultItemCard
                key={item.id}
                item={item}
                onPurchase={purchaseItem}
                isPurchasing={isPurchasing}
                canAfford={canAfford(item.coinz_price)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Armory Empty</h3>
            <p className="text-muted-foreground">
              You've unlocked everything! Check back for new items.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="owned">
        {ownedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownedItems.map((item) => (
              <VaultItemCard
                key={item.id}
                item={item}
                onPurchase={purchaseItem}
                isPurchasing={isPurchasing}
                canAfford={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Items Yet</h3>
            <p className="text-muted-foreground">
              Complete missions and earn coinz to unlock items from the Armory.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
