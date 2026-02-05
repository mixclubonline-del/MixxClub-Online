 /**
  * Scene Stage
  * 
  * Dissolve veil wrapper with "dissolve into light" effect.
  * Syncs opacity, scale, and bloom overlay to transition phase.
  */
 
 import React from 'react';
 import { useSceneFlowStore, TransitionPhase } from '@/stores/sceneFlowStore';
 
 interface SceneStageProps {
   children: React.ReactNode;
 }
 
 function getContentStyles(phase: TransitionPhase, dissolveMs: number): React.CSSProperties {
   const transitionDuration = `${dissolveMs}ms`;
   
   switch (phase) {
     case 'DISSOLVE_OUT':
       return {
         opacity: 0,
         transform: 'scale(0.98)',
         filter: 'blur(2px)',
         transition: `all ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1)`,
       };
     case 'DISSOLVE_IN':
       return {
         opacity: 1,
         transform: 'scale(1)',
         filter: 'blur(0px)',
         transition: `all ${Math.max(200, dissolveMs * 0.55)}ms cubic-bezier(0.4, 0, 0.2, 1)`,
       };
     default:
       return {
         opacity: 1,
         transform: 'scale(1)',
         filter: 'blur(0px)',
         transition: 'none',
       };
   }
 }
 
 function getVeilStyles(phase: TransitionPhase, dissolveMs: number): React.CSSProperties {
   const transitionDuration = `${dissolveMs}ms`;
   
   switch (phase) {
     case 'DISSOLVE_OUT':
       return {
         opacity: 1,
         transition: `opacity ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1)`,
       };
     case 'DISSOLVE_IN':
       return {
         opacity: 0,
         transition: `opacity ${Math.max(200, dissolveMs * 0.55)}ms cubic-bezier(0.4, 0, 0.2, 1)`,
       };
     default:
       return {
         opacity: 0,
         transition: 'none',
       };
   }
 }
 
 export function SceneStage({ children }: SceneStageProps) {
   const phase = useSceneFlowStore((s) => s.phase);
   const dissolveMs = useSceneFlowStore((s) => s.dissolveMs);
 
   const contentStyles = getContentStyles(phase, dissolveMs);
   const veilStyles = getVeilStyles(phase, dissolveMs);
 
   return (
     <div className="relative w-full h-[100svh] overflow-hidden bg-background">
       {/* Content wrapper with dissolve effects */}
       <div 
         className="relative w-full h-full"
         style={contentStyles}
       >
         {children}
       </div>
 
       {/* Dissolve veil - the "light pass" bloom effect */}
       <div 
         className="pointer-events-none fixed inset-0 z-50"
         style={veilStyles}
         aria-hidden="true"
       >
         {/* Radial light bloom from center */}
         <div 
           className="absolute inset-0"
           style={{
             background: 'radial-gradient(ellipse at center, hsl(var(--background)) 0%, hsl(var(--background) / 0.95) 40%, hsl(var(--background) / 0.8) 100%)',
           }}
         />
         {/* Subtle light sweep accent */}
         <div 
           className="absolute inset-0"
           style={{
             background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, transparent 50%, hsl(var(--primary) / 0.05) 100%)',
           }}
         />
       </div>
     </div>
   );
 }