 import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
 
 export const FanDay1sHub = () => {
   // TODO: Fetch Day 1 records from artist_day1s table
   const hasDay1s = false;
 
   if (!hasDay1s) {
     return (
       <CharacterEmptyState
         type="favorites"
         characterId="nova"
         title="Your Day 1 Artists"
         message="Support artists early and earn your Day 1 badge when they blow up."
         actionLabel="Discover Rising Artists"
         onAction={() => {}}
       />
     );
   }
 
   return (
     <div className="space-y-6">
       <h2 className="text-xl font-semibold">Your Day 1s</h2>
       {/* Day 1 artist cards will go here */}
     </div>
   );
 };