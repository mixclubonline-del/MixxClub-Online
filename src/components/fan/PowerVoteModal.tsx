import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Star, Loader2, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useMixxWallet } from '@/hooks/useMixxWallet';
import { useFanStats } from '@/hooks/useFanStats';
import { MixxCoin } from '@/components/economy/MixxCoin';
import { toast } from 'sonner';

interface PowerVoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId?: string;
  targetName?: string;
  targetType?: 'premiere' | 'battle';
}

const MULTIPLIER_COSTS = {
  2: 25,
  5: 50,
  10: 100,
};

export function PowerVoteModal({ 
  open, 
  onOpenChange, 
  targetId,
  targetName = 'Current Battle',
  targetType = 'battle'
}: PowerVoteModalProps) {
  const [multiplier, setMultiplier] = useState<2 | 5 | 10>(2);
  const [isVoting, setIsVoting] = useState(false);

  const { totalBalance, spendCoinz, canAfford } = useMixxWallet();
  const { incrementStat } = useFanStats();

  const cost = MULTIPLIER_COSTS[multiplier];
  const affordable = canAfford(cost);

  const handlePowerVote = async () => {
    if (!affordable) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setIsVoting(true);

      // Spend coinz for power vote
      await spendCoinz({
        amount: cost,
        source: 'power_vote',
        description: `${multiplier}x Power Vote for ${targetName}`,
        referenceType: targetType,
        referenceId: targetId,
      });

      // Update fan stats with boosted vote count
      await incrementStat({ stat: 'total_votes', amount: multiplier });

      toast.success(`${multiplier}x Power Vote cast! ⚡`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to cast power vote');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-400" />
            Power Vote
          </DialogTitle>
          <DialogDescription>
            Boost your vote with MixxCoinz to make a bigger impact
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Target */}
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              {targetType === 'battle' ? '🎤 Battle' : '🎵 Premiere'}
            </Badge>
            <h3 className="font-semibold text-lg">{targetName}</h3>
          </div>

          {/* Multiplier Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Vote Power</span>
              <Badge className="bg-orange-500/20 text-orange-400 text-lg px-3 py-1">
                {multiplier}x
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {([2, 5, 10] as const).map((m) => {
                const mCost = MULTIPLIER_COSTS[m];
                const mAffordable = canAfford(mCost);
                const isSelected = multiplier === m;

                return (
                  <Button
                    key={m}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`flex flex-col h-auto py-3 ${
                      !mAffordable && !isSelected ? 'opacity-50' : ''
                    }`}
                    onClick={() => setMultiplier(m)}
                    disabled={!mAffordable}
                  >
                    <span className="text-lg font-bold">{m}x</span>
                    <div className="flex items-center gap-1 text-xs">
                      <MixxCoin type="earned" size="sm" />
                      {mCost}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Cost & Balance */}
          <div className="bg-accent/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cost</span>
              <div className="flex items-center gap-2">
                <MixxCoin type="earned" size="sm" />
                <span className="font-bold text-lg">{cost}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Balance</span>
              <span className={affordable ? 'text-green-400' : 'text-red-400'}>
                {totalBalance.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">After</span>
              <span className="text-muted-foreground">
                {(totalBalance - cost).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Impact Preview */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span>Your vote will count as <strong className="text-foreground">{multiplier} votes</strong></span>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handlePowerVote}
          disabled={!affordable || isVoting}
        >
          {isVoting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Cast {multiplier}x Power Vote
        </Button>
      </DialogContent>
    </Dialog>
  );
}
