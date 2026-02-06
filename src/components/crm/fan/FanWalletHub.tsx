 import { useMixxWallet } from '@/hooks/useMixxWallet';
 import { WalletBalance, TransactionLedger } from '@/components/economy';
 import { TierProgressCard, SpendingDestinations } from '@/components/fan';
 import { Skeleton } from '@/components/ui/skeleton';
 
 export const FanWalletHub = () => {
   const { wallet, totalBalance, isLoading } = useMixxWallet();
 
   if (isLoading) {
     return (
       <div className="space-y-6">
         <Skeleton className="h-40 w-full rounded-lg" />
         <Skeleton className="h-32 w-full rounded-lg" />
       </div>
     );
   }
 
   return (
      <div className="space-y-8">
       <WalletBalance />
       <TierProgressCard totalEarned={wallet?.total_earned || 0} />
       <SpendingDestinations balance={totalBalance} />
       <TransactionLedger />
     </div>
   );
 };