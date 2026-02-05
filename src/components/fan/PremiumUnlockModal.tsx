import { useState } from 'react';
import { motion } from 'framer-motion';
import { Unlock, Lock, Check, Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMixxWallet } from '@/hooks/useMixxWallet';
import { MixxCoin } from '@/components/economy/MixxCoin';
import { toast } from 'sonner';

interface UnlockableItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'content' | 'feature' | 'badge';
  preview?: string;
  isUnlocked?: boolean;
}

// Mock unlockables - in production these would come from database
const UNLOCKABLES: UnlockableItem[] = [
  {
    id: 'early-access',
    name: 'Early Access Pass',
    description: 'Get 24-hour early access to new releases',
    price: 500,
    category: 'feature',
    isUnlocked: false,
  },
  {
    id: 'exclusive-badge',
    name: 'Supporter Badge',
    description: 'Show your dedication with an exclusive profile badge',
    price: 250,
    category: 'badge',
    isUnlocked: false,
  },
  {
    id: 'bts-content',
    name: 'Behind the Scenes',
    description: 'Access exclusive behind-the-scenes content',
    price: 300,
    category: 'content',
    isUnlocked: false,
  },
  {
    id: 'custom-theme',
    name: 'Premium Theme Pack',
    description: 'Unlock exclusive UI themes for your profile',
    price: 400,
    category: 'feature',
    isUnlocked: false,
  },
];

interface PremiumUnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumUnlockModal({ open, onOpenChange }: PremiumUnlockModalProps) {
  const [isUnlocking, setIsUnlocking] = useState<string | null>(null);
  const { totalBalance, spendCoinz, canAfford } = useMixxWallet();

  const handleUnlock = async (item: UnlockableItem) => {
    if (!canAfford(item.price)) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setIsUnlocking(item.id);

      await spendCoinz({
        amount: item.price,
        source: 'premium_unlock',
        description: `Unlocked: ${item.name}`,
        referenceType: 'unlockable',
        referenceId: item.id,
      });

      // In production: Record the unlock in database
      // await supabase.from('user_unlocks').insert({ ... });

      toast.success(`${item.name} unlocked! 🎉`);
    } catch (error) {
      toast.error('Failed to unlock item');
    } finally {
      setIsUnlocking(null);
    }
  };

  const getCategoryColor = (category: UnlockableItem['category']) => {
    switch (category) {
      case 'content':
        return 'bg-purple-500/20 text-purple-400';
      case 'feature':
        return 'bg-blue-500/20 text-blue-400';
      case 'badge':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5 text-amber-400" />
            Premium Unlocks
          </DialogTitle>
          <DialogDescription>
            Unlock exclusive content and features forever
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 px-3 bg-accent/50 rounded-lg mb-4">
          <span className="text-sm text-muted-foreground">Your Balance</span>
          <div className="flex items-center gap-2">
            <MixxCoin type="earned" size="sm" animated />
            <span className="font-bold">{totalBalance.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {UNLOCKABLES.map((item, i) => {
            const affordable = canAfford(item.price);
            const unlocking = isUnlocking === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-lg border transition-all ${
                  item.isUnlocked
                    ? 'bg-green-500/10 border-green-500/20'
                    : affordable
                    ? 'bg-accent/30 border-border hover:border-primary/50'
                    : 'bg-muted/30 border-border opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {item.isUnlocked ? (
                      <Badge className="bg-green-500/20 text-green-400">
                        <Check className="h-3 w-3 mr-1" />
                        Owned
                      </Badge>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          <MixxCoin type="earned" size="sm" />
                          <span className="font-bold">{item.price}</span>
                        </div>
                        <Button
                          size="sm"
                          disabled={!affordable || unlocking}
                          onClick={() => handleUnlock(item)}
                        >
                          {unlocking ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : affordable ? (
                            <>
                              <Unlock className="h-3 w-3 mr-1" />
                              Unlock
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="pt-3 mt-2 border-t border-border/50">
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            Unlocks are permanent - once purchased, they're yours forever
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
