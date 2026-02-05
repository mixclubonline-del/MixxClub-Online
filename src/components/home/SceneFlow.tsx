 /**
  * Scene Flow Controller
  * 
  * Manages the immersive scene-based homepage experience.
  * Dissolves between: Hallway (Intrigue) → Demo (Energy) → Information (Clarity)
  * 
  * Uses Zustand state machine for transitions and keyboard navigation.
  */
 
 import { useEffect, useCallback } from 'react';
 import { useSceneFlowStore } from '@/stores/sceneFlowStore';
 import { SceneStage } from '@/components/scene/SceneStage';
import { StudioHallway } from '@/components/scene/StudioHallway';
import { InsiderDemoExperience } from '@/components/demo/InsiderDemoExperience';
import { InformationScene } from '@/components/home/InformationScene';

export function SceneFlow() {
   const scene = useSceneFlowStore((s) => s.scene);
   const go = useSceneFlowStore((s) => s.go);
   const back = useSceneFlowStore((s) => s.back);

   // Keyboard navigation
   useEffect(() => {
     const onKeyDown = (e: KeyboardEvent) => {
       // Ignore if user is typing in an input
       if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
         return;
       }

       if (e.key === 'Enter' && scene === 'HALLWAY') {
         e.preventDefault();
         go('DEMO');
       }
       
       if (e.key === 'Escape') {
         e.preventDefault();
         back();
       }
     };

     window.addEventListener('keydown', onKeyDown);
     return () => window.removeEventListener('keydown', onKeyDown);
   }, [scene, go, back]);
 
   const handleEnterDemo = useCallback(() => go('DEMO'), [go]);
   const handleLearnMore = useCallback(() => go('INFO'), [go]);
   const handleBackToHallway = useCallback(() => go('HALLWAY'), [go]);
   const handleBackToDemo = useCallback(() => go('DEMO'), [go]);

  return (
     <SceneStage>
       {scene === 'HALLWAY' && (
         <StudioHallway fullscreen onEnter={handleEnterDemo} />
       )}
 
       {scene === 'DEMO' && (
         <InsiderDemoExperience 
           embedded 
           onLearnMore={handleLearnMore}
           onBack={handleBackToHallway}
         />
       )}
 
       {scene === 'INFO' && (
         <InformationScene onBack={handleBackToDemo} />
       )}
     </SceneStage>
  );
}
