/**
 * useStepSequencer - Bridge between Step Sequencer UI and Audio Engine
 * Schedules sample playback with groove and pattern support
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { audioEngine } from '@/services/audioEngine';
import { GrooveEngine, GrooveTemplate } from '@/audio/analysis/GrooveEngine';

export interface SequencerStep {
  active: boolean;
  velocity: number;
  pitch?: number;
  slide?: boolean;
}

export interface SequencerPattern {
  id: string;
  name: string;
  steps: SequencerStep[];
  sampleUrl?: string;
  sampleBuffer?: AudioBuffer;
}

export interface UseStepSequencerOptions {
  steps?: number;
  bpm?: number;
  groove?: GrooveTemplate;
}

export function useStepSequencer(options: UseStepSequencerOptions = {}) {
  const { steps: stepCount = 16, bpm: initialBpm = 120, groove: initialGroove } = options;
  
  // State
  const [steps, setSteps] = useState<SequencerStep[]>(
    Array(stepCount).fill(null).map(() => ({ active: false, velocity: 100 }))
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(initialBpm);
  const [swing, setSwing] = useState(0);
  const [groove, setGroove] = useState<GrooveTemplate | undefined>(initialGroove);
  const [patterns, setPatterns] = useState<SequencerPattern[]>([]);
  const [activePatternId, setActivePatternId] = useState<string | null>(null);
  
  // Refs for scheduling
  const schedulerRef = useRef<number | null>(null);
  const nextStepTimeRef = useRef(0);
  const lookAhead = 0.1; // seconds to schedule ahead
  const scheduleInterval = 25; // ms between scheduler runs
  
  // Audio nodes
  const sampleBufferRef = useRef<AudioBuffer | null>(null);
  
  /**
   * Calculate step duration in seconds
   */
  const getStepDuration = useCallback(() => {
    // 16 steps = 4 beats, so each step is 1/4 beat
    const beatsPerSecond = bpm / 60;
    const stepsPerBeat = stepCount / 4; // 4 beats per pattern
    return 1 / (beatsPerSecond * stepsPerBeat);
  }, [bpm, stepCount]);
  
  /**
   * Apply swing/groove to step time
   */
  const applyGroove = useCallback((stepIndex: number, time: number): number => {
    if (groove) {
      return GrooveEngine.applyGroove(time, bpm, groove);
    }
    
    if (swing > 0) {
      // Simple swing: delay odd steps
      if (stepIndex % 2 === 1) {
        const swingAmount = (swing / 100) * getStepDuration() * 0.5;
        return time + swingAmount;
      }
    }
    
    return time;
  }, [groove, swing, bpm, getStepDuration]);
  
  /**
   * Play a sample at specific time with velocity
   */
  const playSample = useCallback((time: number, velocity: number, pitch?: number) => {
    if (!sampleBufferRef.current) return;
    
    const source = audioEngine.ctx.createBufferSource();
    source.buffer = sampleBufferRef.current;
    
    // Apply pitch shift if specified
    if (pitch) {
      source.playbackRate.value = Math.pow(2, pitch / 12);
    }
    
    // Velocity -> gain
    const gain = audioEngine.ctx.createGain();
    gain.gain.value = velocity / 127;
    
    source.connect(gain);
    gain.connect(audioEngine.master.input);
    
    source.start(time);
  }, []);
  
  /**
   * The scheduler loop
   */
  const scheduler = useCallback(() => {
    const now = audioEngine.ctx.currentTime;
    const stepDuration = getStepDuration();
    
    while (nextStepTimeRef.current < now + lookAhead) {
      const stepIndex = currentStep % stepCount;
      const step = steps[stepIndex];
      
      if (step.active) {
        const groovedTime = applyGroove(stepIndex, nextStepTimeRef.current);
        playSample(groovedTime, step.velocity, step.pitch);
      }
      
      // Move to next step
      nextStepTimeRef.current += stepDuration;
      setCurrentStep((prev) => (prev + 1) % stepCount);
    }
  }, [steps, stepCount, currentStep, getStepDuration, applyGroove, playSample]);
  
  /**
   * Start playback
   */
  const start = useCallback(async () => {
    await audioEngine.resume();
    
    nextStepTimeRef.current = audioEngine.ctx.currentTime;
    setCurrentStep(0);
    setIsPlaying(true);
    
    // Start scheduler loop
    const runScheduler = () => {
      scheduler();
      schedulerRef.current = window.setTimeout(runScheduler, scheduleInterval);
    };
    runScheduler();
  }, [scheduler]);
  
  /**
   * Stop playback
   */
  const stop = useCallback(() => {
    if (schedulerRef.current) {
      clearTimeout(schedulerRef.current);
      schedulerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);
  
  /**
   * Toggle step active state
   */
  const toggleStep = useCallback((index: number) => {
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index ? { ...step, active: !step.active } : step
      )
    );
  }, []);
  
  /**
   * Set step velocity
   */
  const setStepVelocity = useCallback((index: number, velocity: number) => {
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index ? { ...step, velocity: Math.max(0, Math.min(127, velocity)) } : step
      )
    );
  }, []);
  
  /**
   * Set step pitch
   */
  const setStepPitch = useCallback((index: number, pitch: number) => {
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index ? { ...step, pitch } : step
      )
    );
  }, []);
  
  /**
   * Load a sample for playback
   */
  const loadSample = useCallback(async (urlOrBuffer: string | AudioBuffer) => {
    if (typeof urlOrBuffer === 'string') {
      const response = await fetch(urlOrBuffer);
      const arrayBuffer = await response.arrayBuffer();
      sampleBufferRef.current = await audioEngine.ctx.decodeAudioData(arrayBuffer);
    } else {
      sampleBufferRef.current = urlOrBuffer;
    }
  }, []);
  
  /**
   * Save current pattern
   */
  const savePattern = useCallback((name: string): SequencerPattern => {
    const pattern: SequencerPattern = {
      id: `pattern-${Date.now()}`,
      name,
      steps: [...steps],
      sampleBuffer: sampleBufferRef.current ?? undefined,
    };
    
    setPatterns((prev) => [...prev, pattern]);
    return pattern;
  }, [steps]);
  
  /**
   * Load a pattern
   */
  const loadPattern = useCallback((patternId: string) => {
    const pattern = patterns.find((p) => p.id === patternId);
    if (pattern) {
      setSteps([...pattern.steps]);
      setActivePatternId(patternId);
      if (pattern.sampleBuffer) {
        sampleBufferRef.current = pattern.sampleBuffer;
      }
    }
  }, [patterns]);
  
  /**
   * Clear all steps
   */
  const clearSteps = useCallback(() => {
    setSteps(Array(stepCount).fill(null).map(() => ({ active: false, velocity: 100 })));
  }, [stepCount]);
  
  /**
   * Set all steps from pattern data
   */
  const setPattern = useCallback((newSteps: SequencerStep[]) => {
    setSteps(newSteps.slice(0, stepCount));
  }, [stepCount]);
  
  /**
   * Randomize pattern
   */
  const randomize = useCallback((density: number = 0.5) => {
    setSteps(
      Array(stepCount)
        .fill(null)
        .map(() => ({
          active: Math.random() < density,
          velocity: 60 + Math.floor(Math.random() * 68),
        }))
    );
  }, [stepCount]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (schedulerRef.current) {
        clearTimeout(schedulerRef.current);
      }
    };
  }, []);
  
  return {
    // State
    steps,
    currentStep,
    isPlaying,
    bpm,
    swing,
    groove,
    patterns,
    activePatternId,
    
    // Actions
    start,
    stop,
    toggleStep,
    setStepVelocity,
    setStepPitch,
    loadSample,
    setBpm,
    setSwing,
    setGroove,
    savePattern,
    loadPattern,
    clearSteps,
    setPattern,
    randomize,
    
    // Computed
    stepDuration: getStepDuration(),
  };
}
