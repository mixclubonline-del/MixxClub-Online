 import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
 
 export const ProducerCatalogHub = () => {
   // TODO: Fetch beats from producer_beats table
   const hasBeats = false;
 
   if (!hasBeats) {
     return (
       <CharacterEmptyState
         type="catalog"
         characterId="tempo"
         title="Your Beat Catalog"
         actionLabel="Upload Your First Beat"
         onAction={() => {}}
       />
     );
   }
 
   return (
     <div className="space-y-6">
       <h2 className="text-xl font-semibold">Beat Catalog</h2>
       {/* Beat grid will go here */}
     </div>
   );
 };