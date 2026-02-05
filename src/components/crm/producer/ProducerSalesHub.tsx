 import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
 import { useProducerSales } from '@/hooks/useProducerSales';
 import { SalesOverview } from '@/components/producer/SalesOverview';
 import { SalesTable } from '@/components/producer/SalesTable';
 
 export const ProducerSalesHub = () => {
   const { sales, analytics, isLoading } = useProducerSales();
 
   if (!isLoading && sales.length === 0) {
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
       <SalesOverview analytics={analytics} isLoading={isLoading} />
       <SalesTable sales={sales} isLoading={isLoading} />
     </div>
   );
 };