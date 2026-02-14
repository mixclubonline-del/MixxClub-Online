/**
 * Hallway Ambient Audio — Muffled Bass Hum from Active Studios
 * 
 * Pure Web Audio API synthesis. No audio files needed.
 * Each active room gets: OscillatorNode → BiquadFilter (lowpass) → GainNode → MasterGain → destination
 * Recording rooms add an LFO on the gain for a pulsing heartbeat-like throb.
 * Hover ramps gain smoothly via linearRampToValueAtTime.
 */

import { useEffect, useRef, useCallback } from 'react';
import type { StudioRoom } from '@/types/scene';

interface RoomAudioNode {
  oscillator: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
}

const IDLE_GAIN = 0.015;
const HOVER_GAIN = 0.08;
const RAMP_TIME = 0.3; // seconds
const MASTER_VOLUME = 0.5;

function getRoomFrequency(index: number): number {
  return 40 + (index * 7);
}

function getFilterCutoff(index: number): number {
  return 100 + (index * 8); // slight variation per room
}

export function useHallwayAmbience(
  studios: StudioRoom[],
  hoveredRoomId: string | null
) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<Map<string, RoomAudioNode>>(new Map());
  const startedRef = useRef(false);

  // Create or resume AudioContext on first user gesture
  const startAmbience = useCallback(() => {
    if (startedRef.current) {
      // Already started — just resume if suspended
      if (ctxRef.current?.state === 'suspended') {
        ctxRef.current.resume().catch(() => {});
      }
      return;
    }
    startedRef.current = true;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = MASTER_VOLUME;
      master.connect(ctx.destination);
      masterGainRef.current = master;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch (e) {
      // Graceful degradation — hallway works fine without audio
      console.warn('Hallway ambience: Web Audio API unavailable', e);
    }
  }, []);

  // Sync oscillator nodes with active studios
  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master || ctx.state === 'closed') return;

    const activeRoomIds = new Set<string>();

    studios.forEach((room, index) => {
      const isActive = room.state !== 'idle' && room.state !== 'waiting';
      if (!isActive) return;

      activeRoomIds.add(room.id);

      // Already have nodes for this room
      if (nodesRef.current.has(room.id)) return;

      try {
        // Oscillator — sine wave at room-specific frequency
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = getRoomFrequency(index);

        // Lowpass filter — "wall muffling"
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = getFilterCutoff(index);
        filter.Q.value = 1;

        // Gain node — controls per-room volume
        const gain = ctx.createGain();
        gain.gain.value = IDLE_GAIN;

        // Chain: osc → filter → gain → master
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        const node: RoomAudioNode = { oscillator: osc, filter, gain };

        // Recording rooms: add LFO modulation for pulsing bass
        if (room.state === 'recording') {
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.5; // 0.5Hz pulse

          const lfoGain = ctx.createGain();
          lfoGain.gain.value = IDLE_GAIN * 0.6; // modulation depth

          lfo.connect(lfoGain);
          lfoGain.connect(gain.gain as any);
          lfo.start();

          node.lfo = lfo;
          node.lfoGain = lfoGain;
        }

        osc.start();
        nodesRef.current.set(room.id, node);
      } catch (e) {
        // Individual room audio failure — skip silently
      }
    });

    // Remove nodes for rooms that are no longer active
    nodesRef.current.forEach((node, roomId) => {
      if (!activeRoomIds.has(roomId)) {
        try {
          node.oscillator.stop();
          node.oscillator.disconnect();
          node.filter.disconnect();
          node.gain.disconnect();
          node.lfo?.stop();
          node.lfo?.disconnect();
          node.lfoGain?.disconnect();
        } catch {}
        nodesRef.current.delete(roomId);
      }
    });
  }, [studios]);

  // Handle hover — smooth gain ramp
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state === 'closed') return;

    const now = ctx.currentTime;

    nodesRef.current.forEach((node, roomId) => {
      const targetGain = roomId === hoveredRoomId ? HOVER_GAIN : IDLE_GAIN;
      try {
        node.gain.gain.cancelScheduledValues(now);
        node.gain.gain.setValueAtTime(node.gain.gain.value, now);
        node.gain.gain.linearRampToValueAtTime(targetGain, now + RAMP_TIME);

        // Also scale LFO depth on hover for recording rooms
        if (node.lfoGain) {
          const lfoDepth = roomId === hoveredRoomId ? HOVER_GAIN * 0.5 : IDLE_GAIN * 0.6;
          node.lfoGain.gain.cancelScheduledValues(now);
          node.lfoGain.gain.setValueAtTime(node.lfoGain.gain.value, now);
          node.lfoGain.gain.linearRampToValueAtTime(lfoDepth, now + RAMP_TIME);
        }
      } catch {}
    });
  }, [hoveredRoomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nodesRef.current.forEach((node) => {
        try {
          node.oscillator.stop();
          node.oscillator.disconnect();
          node.filter.disconnect();
          node.gain.disconnect();
          node.lfo?.stop();
          node.lfo?.disconnect();
          node.lfoGain?.disconnect();
        } catch {}
      });
      nodesRef.current.clear();

      try {
        masterGainRef.current?.disconnect();
        ctxRef.current?.close();
      } catch {}
    };
  }, []);

  return { startAmbience };
}
