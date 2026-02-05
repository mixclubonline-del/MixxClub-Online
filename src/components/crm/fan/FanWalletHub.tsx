 import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
 
 export const FanWalletHub = () => {
   // TODO: Fetch wallet balance from mixx_wallets
   const hasBalance = false;
 
   if (!hasBalance) {
     return (
       <CharacterEmptyState
         type="wallet"
         characterId="nova"
         title="Your MixxCoinz Wallet"
         message="Start earning MixxCoinz by completing missions and supporting artists."
         actionLabel="Start Earning"
         onAction={() => {}}
       />
     );
   }
 
   return (
     <div className="space-y-6">
       <h2 className="text-xl font-semibold">Your Wallet</h2>
       {/* Wallet balance and history will go here */}
     </div>
   );
 };