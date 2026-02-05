 import { useState } from 'react';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { toast } from 'sonner';
 import { Loader2, Coins, Sparkles, Star } from 'lucide-react';
 import { MixxCoin } from '@/components/economy/MixxCoin';
 
 interface CoinzPurchaseModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   dailyPurchased?: number;
 }
 
 const COINZ_PACKAGES = [
   { id: 'starter', name: 'Starter Pack', price_cents: 499, coinz: 500, bonus: 0, tag: null },
   { id: 'popular', name: 'Popular Pack', price_cents: 999, coinz: 1200, bonus: 200, tag: 'Most Popular' },
   { id: 'best_value', name: 'Best Value Pack', price_cents: 1999, coinz: 2500, bonus: 500, tag: 'Best Value' },
 ];
 
 const DAILY_LIMIT = 2000;
 
 export function CoinzPurchaseModal({ open, onOpenChange, dailyPurchased = 0 }: CoinzPurchaseModalProps) {
   const [loading, setLoading] = useState<string | null>(null);
   const { user } = useAuth();
 
   const handlePurchase = async (packageId: string) => {
     if (!user) {
       toast.error('Please sign in to purchase MixxCoinz');
       return;
     }
 
     const pkg = COINZ_PACKAGES.find(p => p.id === packageId);
     if (!pkg) return;
 
     // Check daily limit
     if (dailyPurchased + pkg.coinz > DAILY_LIMIT) {
       toast.error(`This would exceed your daily limit of ${DAILY_LIMIT} MixxCoinz`);
       return;
     }
 
     try {
       setLoading(packageId);
 
       const { data, error } = await supabase.functions.invoke('create-coinz-checkout', {
         body: { packageId }
       });
 
       if (error) throw error;
 
       if (data?.url) {
         window.open(data.url, '_blank');
         onOpenChange(false);
       }
     } catch (err) {
       console.error('Coinz checkout error:', err);
       toast.error('Failed to start checkout');
     } finally {
       setLoading(null);
     }
   };
 
   const formatPrice = (cents: number) => {
     return (cents / 100).toLocaleString('en-US', {
       style: 'currency',
       currency: 'USD',
     });
   };
 
   const remainingToday = DAILY_LIMIT - dailyPurchased;
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-md">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <Coins className="h-5 w-5 text-primary" />
             Buy MixxCoinz
           </DialogTitle>
           <DialogDescription>
             Purchase coinz to unlock premium features, tip creators, and more
           </DialogDescription>
         </DialogHeader>
 
         <div className="space-y-3 py-4">
           {COINZ_PACKAGES.map((pkg) => {
             const isDisabled = pkg.coinz > remainingToday;
             
             return (
               <div
                 key={pkg.id}
                 className={`relative border-2 rounded-lg p-4 transition-colors ${
                   isDisabled
                     ? 'opacity-50 cursor-not-allowed border-muted'
                     : 'cursor-pointer hover:border-primary/50'
                 }`}
               >
                 {pkg.tag && (
                   <Badge className="absolute -top-2 right-2 bg-primary">
                     {pkg.tag}
                   </Badge>
                 )}
                 
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                        <MixxCoin type="purchased" size="sm" />
                     </div>
                     <div>
                       <h4 className="font-semibold">{pkg.name}</h4>
                       <div className="flex items-center gap-2 text-sm">
                         <span className="font-bold text-primary">
                           {pkg.coinz.toLocaleString()} Coinz
                         </span>
                         {pkg.bonus > 0 && (
                           <span className="text-green-600 flex items-center gap-1">
                             <Sparkles className="h-3 w-3" />
                             +{pkg.bonus} bonus
                           </span>
                         )}
                       </div>
                     </div>
                   </div>
                   
                   <Button
                     size="sm"
                     disabled={isDisabled || loading === pkg.id}
                     onClick={() => handlePurchase(pkg.id)}
                   >
                     {loading === pkg.id ? (
                       <Loader2 className="h-4 w-4 animate-spin" />
                     ) : (
                       formatPrice(pkg.price_cents)
                     )}
                   </Button>
                 </div>
               </div>
             );
           })}
         </div>
 
         {/* Daily Limit Indicator */}
         <div className="bg-accent/50 rounded-lg p-3">
           <div className="flex items-center justify-between text-sm">
             <span className="text-muted-foreground">Daily limit remaining:</span>
             <span className="font-semibold">
               {remainingToday.toLocaleString()} / {DAILY_LIMIT.toLocaleString()}
             </span>
           </div>
           <div className="w-full bg-muted rounded-full h-2 mt-2">
             <div 
               className="bg-primary h-2 rounded-full transition-all"
               style={{ width: `${(remainingToday / DAILY_LIMIT) * 100}%` }}
             />
           </div>
         </div>
 
         <p className="text-xs text-center text-muted-foreground">
           Purchased coinz are non-refundable. Daily limit resets at midnight.
         </p>
       </DialogContent>
     </Dialog>
   );
 }