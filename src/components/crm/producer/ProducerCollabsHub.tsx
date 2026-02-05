 import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
 
 export const ProducerCollabsHub = () => {
   // TODO: Fetch collaboration requests
   const hasCollabs = false;
 
   if (!hasCollabs) {
     return (
       <CharacterEmptyState
         type="collabs"
         characterId="tempo"
         title="Artist Collaborations"
         actionLabel="Find Artists"
         onAction={() => {}}
       />
     );
   }
 
   return (
     <div className="space-y-6">
       <h2 className="text-xl font-semibold">Collaborations</h2>
       {/* Collab requests will go here */}
     </div>
   );
 };