 import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
 
 export const FanFeedHub = () => {
   // TODO: Fetch personalized feed
   const hasFeed = false;
 
   if (!hasFeed) {
     return (
       <CharacterEmptyState
         type="feed"
         characterId="nova"
         title="Your Discovery Feed"
         actionLabel="Find Artists to Follow"
         onAction={() => {}}
       />
     );
   }
 
   return (
     <div className="space-y-6">
       <h2 className="text-xl font-semibold">Your Feed</h2>
       {/* Feed items will go here */}
     </div>
   );
 };