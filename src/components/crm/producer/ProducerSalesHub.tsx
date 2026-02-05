 import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
 
 export const ProducerSalesHub = () => {
   // TODO: Fetch sales data
   const hasSales = false;
 
   if (!hasSales) {
     return (
       <CharacterEmptyState
         type="sales"
         characterId="tempo"
         title="Your Sales Dashboard"
         actionLabel="Upload Beats to Start Selling"
         onAction={() => {}}
       />
     );
   }
 
   return (
     <div className="space-y-6">
       <h2 className="text-xl font-semibold">Sales</h2>
       {/* Sales table will go here */}
     </div>
   );
 };