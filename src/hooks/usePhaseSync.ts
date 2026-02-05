 import { useState, useEffect, useRef, useCallback } from 'react';
 
 export interface PhaseMarker {
   id: string;
   startTime: number;
   endTime: number;
 }
 
 interface UsePhaseSyncOptions {
   currentTime: number;
   isPlaying: boolean;
   phaseMarkers: PhaseMarker[];
   onPhaseChange?: (phaseIndex: number) => void;
   enabled?: boolean;
 }
 
 interface UsePhaseSyncReturn {
   currentPhaseIndex: number;
   phaseProgress: number;
   syncEnabled: boolean;
   setSyncEnabled: (enabled: boolean) => void;
 }
 
 /**
  * usePhaseSync - Synchronizes demo phases with audio timeline
  * 
  * Watches audio currentTime and triggers phase transitions based on
  * configurable timestamp markers. Handles seeking, looping, and pausing.
  */
 export function usePhaseSync({
   currentTime,
   isPlaying,
   phaseMarkers,
   onPhaseChange,
   enabled = true,
 }: UsePhaseSyncOptions): UsePhaseSyncReturn {
   const [syncEnabled, setSyncEnabled] = useState(enabled);
   const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
   const [phaseProgress, setPhaseProgress] = useState(0);
   
   const previousTimeRef = useRef<number>(0);
   const previousPhaseRef = useRef<number>(0);
 
   // Find phase index based on current time
   const findPhaseIndex = useCallback((time: number): number => {
     for (let i = phaseMarkers.length - 1; i >= 0; i--) {
       if (time >= phaseMarkers[i].startTime) {
         return i;
       }
     }
     return 0;
   }, [phaseMarkers]);
 
   // Calculate progress within current phase
   const calculateProgress = useCallback((time: number, phaseIndex: number): number => {
     const marker = phaseMarkers[phaseIndex];
     if (!marker) return 0;
     
     const duration = marker.endTime - marker.startTime;
     if (duration <= 0) return 100;
     
     const elapsed = time - marker.startTime;
     const progress = (elapsed / duration) * 100;
     
     return Math.max(0, Math.min(100, progress));
   }, [phaseMarkers]);
 
   // Main sync effect
   useEffect(() => {
     if (!syncEnabled || !isPlaying) return;
 
     // Detect audio loop (time jumps backward significantly)
     const timeDiff = currentTime - previousTimeRef.current;
     const isLooping = timeDiff < -2;
 
     if (isLooping) {
       // Audio looped, reset to phase 0
       setCurrentPhaseIndex(0);
       setPhaseProgress(0);
       previousPhaseRef.current = 0;
       previousTimeRef.current = currentTime;
       onPhaseChange?.(0);
       return;
     }
 
     // Find current phase based on audio time
     const newPhaseIndex = findPhaseIndex(currentTime);
     const newProgress = calculateProgress(currentTime, newPhaseIndex);
 
     // Update progress always
     setPhaseProgress(newProgress);
 
     // Check if phase changed
     if (newPhaseIndex !== previousPhaseRef.current) {
       console.log(`[PhaseSync] Phase transition: ${previousPhaseRef.current} → ${newPhaseIndex} at ${currentTime.toFixed(2)}s`);
       setCurrentPhaseIndex(newPhaseIndex);
       previousPhaseRef.current = newPhaseIndex;
       onPhaseChange?.(newPhaseIndex);
     }
 
     previousTimeRef.current = currentTime;
   }, [currentTime, isPlaying, syncEnabled, findPhaseIndex, calculateProgress, onPhaseChange]);
 
   // Sync enabled state with external control
   useEffect(() => {
     setSyncEnabled(enabled);
   }, [enabled]);
 
   return {
     currentPhaseIndex,
     phaseProgress,
     syncEnabled,
     setSyncEnabled,
   };
 }