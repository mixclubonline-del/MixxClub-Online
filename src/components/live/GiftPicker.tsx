import React, { useState } from 'react';
import { Gift, Coins, Plus, Minus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLiveGifts, useUserCoins, LiveGift } from '@/hooks/useLiveStream';
import { cn } from '@/lib/utils';

interface GiftPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamId: string;
}

export const GiftPicker: React.FC<GiftPickerProps> = ({ open, onOpenChange, streamId }) => {
  const { data: gifts, isLoading: giftsLoading } = useLiveGifts();
  const { balance, sendGift } = useUserCoins();
  const [selectedGift, setSelectedGift] = useState<LiveGift | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!selectedGift) return;

    try {
      await sendGift.mutateAsync({
        streamId,
        giftId: selectedGift.id,
        quantity,
        message: message || undefined,
      });
      setSelectedGift(null);
      setQuantity(1);
      setMessage('');
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const totalCost = selectedGift ? selectedGift.coin_cost * quantity : 0;
  const canAfford = balance >= totalCost;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Send a Gift
            </span>
            <span className="flex items-center gap-1 text-sm font-normal">
              <Coins className="h-4 w-4 text-yellow-500" />
              {balance.toLocaleString()} coins
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Gift Grid */}
          <div className="grid grid-cols-4 gap-3">
            {giftsLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-muted animate-pulse"
                  />
                ))
              : gifts?.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => setSelectedGift(gift)}
                    className={cn(
                      'aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all hover:scale-105',
                      selectedGift?.id === gift.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <span className="text-3xl">{gift.emoji}</span>
                    <span className="text-xs font-medium">{gift.name}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Coins className="h-3 w-3 text-yellow-500" />
                      {gift.coin_cost}
                    </span>
                  </button>
                ))}
          </div>

          {/* Selected Gift Details */}
          {selectedGift && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedGift.emoji}</span>
                  <div>
                    <div className="font-medium">{selectedGift.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedGift.coin_cost} coins each
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={balance < selectedGift.coin_cost * (quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Optional Message */}
              <Input
                placeholder="Add a message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={100}
              />

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!canAfford || sendGift.isPending}
                className="w-full"
              >
                {sendGift.isPending ? (
                  'Sending...'
                ) : (
                  <>
                    Send {quantity}x {selectedGift.emoji} for {totalCost} coins
                  </>
                )}
              </Button>

              {!canAfford && (
                <p className="text-sm text-destructive text-center">
                  Not enough coins. You need {totalCost - balance} more.
                </p>
              )}
            </div>
          )}

          {/* Buy More Coins */}
          <Button variant="outline" className="w-full gap-2">
            <Coins className="h-4 w-4 text-yellow-500" />
            Buy More Coins
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GiftPicker;
