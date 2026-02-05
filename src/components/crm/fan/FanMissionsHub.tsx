 import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
 
 export const FanMissionsHub = () => {
   // TODO: Fetch available missions
   const hasMissions = false;
 
   if (!hasMissions) {
     return (
       <CharacterEmptyState
         type="missions"
         characterId="nova"
         title="Earn MixxCoinz"
         message="Complete missions to earn MixxCoinz and unlock rewards."
         actionLabel="Check Back Soon"
         onAction={() => {}}
       />
     );
   }
 
   return (
     <div className="space-y-6">
       <h2 className="text-xl font-semibold">Missions</h2>
       {/* Mission cards will go here */}
     </div>
   );
 };