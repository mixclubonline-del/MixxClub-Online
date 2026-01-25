/**
 * Hallway Audio Component
 * 
 * Generates rhythmic "sonic bleed" (muffled sub-bass thumps) from recording studios.
 * Uses the TR808Engine for authentic low-end synthesis.
 * 
 * Synchronized with visual kinetics (120BPM).
 */

import { useEffect, useRef } from 'react';
import { useStudios } from '@/hooks/useSceneSystem';
import { TR808Engine } from '@/audio/synth/TR808Engine';

export function HallwayAudio() {
  const { activeStudios } = useStudios();
  const engineRef = useRef<TR808Engine | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize audio on mount
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Create a low-pass filter to simulate "through the wall" sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150; // Muffled sub-bass only
    filter.Q.value = 5;
    filter.connect(ctx.destination);
    filterRef.current = filter;

    // Initialize 808 engine
    const engine = new TR808Engine(ctx, filter);
    engine.setPreset('atlanta-trap');
    engine.setVolume(0.3); // Subtle background bleed
    engineRef.current = engine;

    // Start 120BPM rhythm loop (500ms)
    // We use a simple interval for background ambience tracking
    const interval = window.setInterval(() => {
      const isAnyRecording = activeStudios.some(s => s.state === 'recording');
      
      if (isAnyRecording && engineRef.current && audioCtxRef.current?.state === 'running') {
        const freq = TR808Engine.midiToFreq(36); // C1 - deep sub
        engineRef.current.trigger(freq, 0.8);
      }
    }, 500);

    intervalRef.current = interval;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, [activeStudios]);

  // We need to resume the context on user interaction since browsers block auto-play audio
  useEffect(() => {
    const handleInteraction = () => {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };

    window.addEventListener('mousedown', handleInteraction);
    return () => window.removeEventListener('mousedown', handleInteraction);
  }, []);

  return null; // Side-effect only component
}
