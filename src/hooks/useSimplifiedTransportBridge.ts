/**
 * PHASE 5: Simplified Transport Bridge
 * 
 * Merges Transport functionality directly into audioEngine
 * - Single source of timing truth
 * - Removed redundant Transport layer
 * - Direct audioEngine control
 * - Simpler architecture, same functionality
 */

"use client";

import { useEffect, useRef } from "react";
import { useAIStudioStore } from "@/stores/aiStudioStore";
import { audioEngine } from "@/services/audioEngine";
import { TrackScheduler } from "@/services/TrackScheduler";

// Singleton scheduler
let scheduler: TrackScheduler | null = null;

/**
 * Simplified Transport Bridge (PHASE 5)
 * Direct audioEngine transport control - no separate Transport layer
 */
export function useSimplifiedTransportBridge() {
  const tracks = useAIStudioStore((s) => s.tracks);
  const isPlaying = useAIStudioStore((s) => s.isPlaying);
  const currentTime = useAIStudioStore((s) => s.currentTime);
  const setCurrentTime = useAIStudioStore((s) => s.setCurrentTime);
  const setPlaying = useAIStudioStore((s) => s.setPlaying);

  const prevPlayingRef = useRef(isPlaying);
  const prevTimeRef = useRef(currentTime);

  // ===== Initialize Scheduler (once) =====
  useEffect(() => {
    if (!scheduler) {
      scheduler = new TrackScheduler(audioEngine.ctx, audioEngine.tracks);
      console.log('[SimplifiedBridge] ✅ Scheduler created');
    }

    audioEngine.resume().catch(() => void 0);

    return () => {
      scheduler?.stopAll();
    };
  }, []);

  // ===== Sync store state to audioEngine transport =====
  // CRITICAL SYNC RULES:
  // 1. User clicks Play → store.isPlaying=true → start audio from 0 → playhead follows audio
  // 2. User clicks timeline/seeks → store.currentTime changes → audio seeks → playhead jumps
  // 3. Audio plays → audioEngine.currentTime updates → (separate effect below) → store.currentTime updates → playhead moves
  useEffect(() => {
    if (!scheduler) return;

    const wasPlaying = prevPlayingRef.current;
    const prevTime = prevTimeRef.current;
    const timeDelta = Math.abs(currentTime - prevTime);

    // Playback state changed
    if (isPlaying !== wasPlaying) {
      if (isPlaying) {
        // START playback from zero (always)
        // Audio → playhead → timeline sync starts here
        const startAt = 0;
        scheduler.stopAll();
        audioEngine.seekTransport(startAt);
        scheduler.scheduleAll(startAt, tracks);
        audioEngine.startTransport();
        setCurrentTime(startAt);
        prevTimeRef.current = startAt;
        console.log('[SimplifiedBridge] ▶️ START from 0s (playhead will follow audio)');
      } else {
        // PAUSE/STOP
        // Timeline → audio sync: freeze audio where playhead is
        scheduler.stopAll();
        audioEngine.pauseTransport();
        console.log('[SimplifiedBridge] ⏸ PAUSE (playhead frozen at', currentTime.toFixed(3), 's)');
      }
      prevPlayingRef.current = isPlaying;
    }
    
    // Time changed significantly (user dragged playhead or clicked timeline)
    // Timeline → audio sync: make audio follow the playhead position
    else if (timeDelta > 0.2 && !isPlaying) {
      // Seek while paused
      audioEngine.seekTransport(currentTime);
      console.log('[SimplifiedBridge] ⏩ SEEK to', currentTime.toFixed(3), 's (audio follows timeline)');
      prevTimeRef.current = currentTime;
    }
    
    // Time changed while playing (user seek during playback)
    // Timeline → audio sync: audio must jump to new position
    else if (timeDelta > 0.2 && isPlaying) {
      scheduler.stopAll();
      audioEngine.seekTransport(currentTime);
      scheduler.scheduleAll(currentTime, tracks);
      console.log('[SimplifiedBridge] ⏩ SEEK while playing to', currentTime.toFixed(3), 's (audio follows timeline)');
      prevTimeRef.current = currentTime;
    }

  }, [isPlaying, currentTime, tracks]);

  // ===== Sync audioEngine transport time back to store (drives playhead & timeline) =====
  // CRITICAL: This creates the audio → playhead → timeline sync loop
  // While playing, continuously read audioEngine.currentTime and push to store
  // Store updates trigger EnhancedDAWTimeline to move playhead and auto-scroll
  useEffect(() => {
    if (!isPlaying) return;

    let raf = 0;
    const syncLoop = () => {
      const engineTime = audioEngine.currentTime;
      
      // Update store's currentTime to drive UI playhead
      // This triggers: audioEngine → store → EnhancedDAWTimeline playhead → timeline scroll
      if (Math.abs(engineTime - prevTimeRef.current) > 0.01) {
        setCurrentTime(engineTime);
        prevTimeRef.current = engineTime;
      }
      
      raf = requestAnimationFrame(syncLoop);
    };

    raf = requestAnimationFrame(syncLoop);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, setCurrentTime]);

  // ===== Keep store.isPlaying honest if context suspends =====
  useEffect(() => {
    const onState = () => {
      if (audioEngine.ctx.state !== "running" && isPlaying) {
        setPlaying(false);
      }
    };
    audioEngine.ctx.addEventListener?.("statechange", onState as any);
    return () => {
      audioEngine.ctx.removeEventListener?.("statechange", onState as any);
    };
  }, [isPlaying, setPlaying]);
}
