"use client";

import { useEffect, useRef } from "react";
import { useAIStudioStore } from "@/stores/aiStudioStore";
import { audioEngine } from "@/services/audioEngine";
import { Transport } from "@/services/Transport";
import { TrackScheduler } from "@/services/TrackScheduler";

// Singleton transport and scheduler
let transport: Transport | null = null;
let scheduler: TrackScheduler | null = null;

/**
 * useTransportBridge - Bridge Layer between UI State and Audio Engine
 * 
 * ARCHITECTURE PATTERN: State-to-Audio Bridge (Modern DAW Pattern)
 * 
 * RESPONSIBILITY:
 * - Syncs Zustand store state (isPlaying, currentTime) → Transport → Scheduler
 * - Syncs Transport time updates → back to Zustand store → UI re-renders
 * - Detects meaningful changes (play/pause/seek) and triggers appropriate actions
 * - Manages Transport and Scheduler lifecycle (singleton pattern)
 * 
 * DATA FLOW (Play Button Click):
 * 1. User clicks Play → Component calls setPlaying(true)
 * 2. Store updates: isPlaying = true
 * 3. useTransportBridge detects change (line 53)
 * 4. Calls scheduler.stopAll() to clear old sources
 * 5. Calls transport.seek(currentTime) to set start position
 * 6. Calls scheduler.scheduleAll(currentTime, tracks) → creates fresh AudioBufferSourceNodes
 * 7. Calls transport.start() → audio plays!
 * 8. Transport updates position in real-time
 * 9. Bridge syncs position back to store (line 134)
 * 10. Store update triggers UI re-render with moving playhead
 * 
 * WHY SINGLETON?
 * - AudioContext should be shared across entire app
 * - Multiple Transport instances would conflict
 * - Scheduler needs stable reference to trackGraphs
 * 
 * SMART CHANGE DETECTION:
 * - Only triggers reschedule if time changed by >0.2s (avoids feedback loops)
 * - Distinguishes between seek-while-playing vs seek-while-paused
 * - Prevents unnecessary audio restarts during position sync loop
 */
export function useTransportBridge() {
  // Store selectors
  const tracks = useAIStudioStore((s) => s.tracks);
  const isPlaying = useAIStudioStore((s) => s.isPlaying);
  const currentTime = useAIStudioStore((s) => s.currentTime);
  const setCurrentTime = useAIStudioStore((s) => s.setCurrentTime);
  const setPlaying = useAIStudioStore((s) => s.setPlaying);

  // Track previous values for smart change detection
  const prevPlayingRef = useRef(isPlaying);
  const prevTimeRef = useRef(currentTime);

  // ===== Initialize Transport and Scheduler (once) =====
  useEffect(() => {
    if (!transport) {
      transport = new Transport(audioEngine.ctx);
      console.log('[TransportBridge] ✅ Transport created');
    }
    if (!scheduler) {
      scheduler = new TrackScheduler(audioEngine.ctx, audioEngine.tracks);
      console.log('[TransportBridge] ✅ Scheduler created');
    }

    audioEngine.resume().catch(() => void 0);

    return () => {
      // Cleanup on unmount
      transport?.dispose();
      scheduler?.stopAll();
    };
  }, []);

  // ===== Sync store state to Transport =====
  useEffect(() => {
    if (!transport || !scheduler) return;

    const playStateChanged = isPlaying !== prevPlayingRef.current;
    const timeChanged = Math.abs(currentTime - prevTimeRef.current) > 0.2;

    if (playStateChanged) {
      // Play/pause button clicked
      if (isPlaying) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[TransportBridge] ▶️ PLAY requested');
        console.log('[TransportBridge] Starting from:', currentTime.toFixed(3), 's');
        console.log('[TransportBridge] Tracks to play:', tracks.length);

        // Stop any previous playback
        scheduler.stopAll();
        
        // Seek transport to current time
        transport.seek(currentTime);
        
        // Schedule all tracks
        const scheduledCount = scheduler.scheduleAll(currentTime, tracks);
        console.log('[TransportBridge] Scheduled', scheduledCount, 'sources');
        
        // Start transport
        transport.start();
        
        console.log('[TransportBridge] ✅ Playback started');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } else {
        console.log('[TransportBridge] ⏸️ PAUSE requested');
        
        // Stop playback
        scheduler.stopAll();
        transport.pause();
        
        console.log('[TransportBridge] ✅ Paused at', transport.currentTime.toFixed(3), 's');
      }
    } else if (isPlaying && timeChanged) {
      // User seeked while playing - restart from new position
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[TransportBridge] ⏩ SEEK during playback');
      console.log('[TransportBridge] From:', prevTimeRef.current.toFixed(3), 's');
      console.log('[TransportBridge] To:', currentTime.toFixed(3), 's');
      
      // Stop current playback
      scheduler.stopAll();
      
      // Seek transport
      transport.seek(currentTime);
      
      // Reschedule from new position
      const scheduledCount = scheduler.scheduleAll(currentTime, tracks);
      console.log('[TransportBridge] Rescheduled', scheduledCount, 'sources');
      
      console.log('[TransportBridge] ✅ Restarted from new position');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else if (!isPlaying && timeChanged) {
      // User seeked while paused
      console.log('[TransportBridge] ⏩ SEEK while paused to', currentTime.toFixed(3), 's');
      transport.seek(currentTime);
    }

    prevPlayingRef.current = isPlaying;
    prevTimeRef.current = currentTime;
  }, [isPlaying, currentTime, tracks]);

  // ===== Sync Transport time back to store (when playing) =====
  useEffect(() => {
    if (!transport || !isPlaying) return;

    console.log('[TransportBridge] 🔄 Starting position sync loop');
    let raf = 0;
    let frameCount = 0;

    const syncPosition = () => {
      const pos = transport.currentTime;

      // Log every 30 frames (~0.5s at 60fps)
      if (frameCount % 30 === 0) {
        console.log('[TransportBridge] ⏱️ Position:', pos.toFixed(3), 's');
      }
      frameCount++;

      setCurrentTime(pos);
      raf = requestAnimationFrame(syncPosition);
    };

    raf = requestAnimationFrame(syncPosition);
    return () => {
      console.log('[TransportBridge] 🛑 Stopping position sync loop');
      cancelAnimationFrame(raf);
    };
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
