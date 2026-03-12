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
    }

    audioEngine.resume().catch(() => void 0);

    return () => {
      scheduler?.stopAll();
    };
  }, []);

  // ===== Sync store state to audioEngine transport =====
  useEffect(() => {
    if (!scheduler) return;

    const wasPlaying = prevPlayingRef.current;
    const prevTime = prevTimeRef.current;
    const timeDelta = Math.abs(currentTime - prevTime);

    // Playback state changed
    if (isPlaying !== wasPlaying) {
      if (isPlaying) {
        const startAt = 0;
        scheduler.stopAll();
        audioEngine.seekTransport(startAt);
        scheduler.scheduleAll(startAt, tracks);
        audioEngine.startTransport();
        setCurrentTime(startAt);
        prevTimeRef.current = startAt;
      } else {
        scheduler.stopAll();
        audioEngine.pauseTransport();
      }
      prevPlayingRef.current = isPlaying;
    }
    
    // Time changed significantly (user dragged playhead or clicked timeline)
    else if (timeDelta > 0.2 && !isPlaying) {
      audioEngine.seekTransport(currentTime);
      prevTimeRef.current = currentTime;
    }
    
    // Time changed while playing (user seek during playback)
    else if (timeDelta > 0.2 && isPlaying) {
      scheduler.stopAll();
      audioEngine.seekTransport(currentTime);
      scheduler.scheduleAll(currentTime, tracks);
      prevTimeRef.current = currentTime;
    }

  }, [isPlaying, currentTime, tracks]);

  // ===== Sync audioEngine transport time back to store (drives playhead & timeline) =====
  useEffect(() => {
    if (!isPlaying) return;

    let raf = 0;
    const syncLoop = () => {
      const engineTime = audioEngine.currentTime;
      
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
