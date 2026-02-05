 /**
  * Scene Flow Store
  * 
  * Zustand state machine for homepage scene transitions.
  * Manages: HALLWAY → DEMO → INFO with dissolve phases.
  */
 
 import { create } from 'zustand';
 import { hubEventBus } from '@/lib/hubEventBus';
 
 export type SceneId = 'HALLWAY' | 'DEMO' | 'INFO';
 export type TransitionPhase = 'IDLE' | 'DISSOLVE_OUT' | 'DISSOLVE_IN';
 
 interface SceneFlowState {
   scene: SceneId;
   phase: TransitionPhase;
   toScene: SceneId | null;
   lastScene: SceneId | null;
   dissolveMs: number;
 
   // Actions
   go: (next: SceneId) => void;
   back: () => void;
   setDissolveMs: (ms: number) => void;
 }
 
 export const useSceneFlowStore = create<SceneFlowState>((set, get) => ({
   scene: 'HALLWAY',
   phase: 'IDLE',
   toScene: null,
   lastScene: null,
   dissolveMs: 950,
 
   go: (next) => {
     const { scene, phase, dissolveMs } = get();
     
     // Guard: no double-fire or same-scene transitions
     if (phase !== 'IDLE' || next === scene) return;
 
     // Publish transition start event
     hubEventBus.publish('energy:transition_started', { from: scene, to: next }, 'sceneFlow');
 
     set({ phase: 'DISSOLVE_OUT', toScene: next, lastScene: scene });
 
     // After dissolve out, swap scene and dissolve in
     window.setTimeout(() => {
       const { toScene } = get();
       if (!toScene) return;
 
       set({ scene: toScene, phase: 'DISSOLVE_IN' });
 
       // Publish scene changed event
       hubEventBus.publish('energy:changed', { scene: toScene }, 'sceneFlow');
 
       // After fade-in, return to idle
       const fadeInDuration = Math.max(200, dissolveMs * 0.55);
       window.setTimeout(() => {
         set({ phase: 'IDLE', toScene: null });
         
         // Publish transition complete event
         hubEventBus.publish('energy:transition_completed', { scene: get().scene }, 'sceneFlow');
       }, fadeInDuration);
     }, dissolveMs);
   },
 
   back: () => {
     const { lastScene, phase } = get();
     if (phase !== 'IDLE' || !lastScene) return;
     get().go(lastScene);
   },
 
   setDissolveMs: (ms) => set({ dissolveMs: Math.max(350, ms) }),
 }));