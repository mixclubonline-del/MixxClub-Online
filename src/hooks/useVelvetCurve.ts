/**
 * useVelvetCurve - React hook for controlling the Velvet Curve processor
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { VelvetCurveProcessor } from '@/audio/effects/VelvetCurveProcessor';
import { FourAnchorsAnalyzer } from '@/audio/analysis/FourAnchors';
import { GenrePreset, VelvetSettings, DEFAULT_VELVET_SETTINGS, GENRE_PRESETS } from '@/audio/context/GenreContext';
import { audioEngine } from '@/services/audioEngine';

interface UseVelvetCurveReturn {
  // Settings
  settings: VelvetSettings;
  setParameter: (param: keyof VelvetSettings, value: number) => void;
  setVelvetAmount: (amount: number) => void;
  
  // Genre presets
  currentGenre: GenrePreset;
  applyGenrePreset: (genre: GenrePreset) => void;
  availableGenres: GenrePreset[];
  
  // Beat sync
  isBreathingEnabled: boolean;
  toggleBreathing: () => void;
  beatPhase: number;
  
  // Analysis
  fourAnchors: { body: number; soul: number; silk: number; air: number };
  gainReduction: number;
  
  // Status
  isActive: boolean;
  toggleActive: () => void;
  
  // Cleanup
  cleanup: () => void;
}

export const useVelvetCurve = (): UseVelvetCurveReturn => {
  const processorRef = useRef<VelvetCurveProcessor | null>(null);
  const analyzerRef = useRef<FourAnchorsAnalyzer | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [settings, setSettings] = useState<VelvetSettings>(DEFAULT_VELVET_SETTINGS);
  const [currentGenre, setCurrentGenre] = useState<GenrePreset>('default');
  const [isBreathingEnabled, setIsBreathingEnabled] = useState(false);
  const [beatPhase, setBeatPhase] = useState(0);
  const [fourAnchors, setFourAnchors] = useState({ body: 0, soul: 0, silk: 0, air: 0 });
  const [gainReduction, setGainReduction] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  // Initialize processor on mount
  useEffect(() => {
    const ctx = audioEngine.ctx;
    
    // Create Velvet Curve processor
    processorRef.current = new VelvetCurveProcessor(ctx);
    
    // Create Four Anchors analyzer
    analyzerRef.current = new FourAnchorsAnalyzer(ctx);
    
    // Connect to master chain
    // Note: In production, this would wire into the master chain
    // For now, we'll use it standalone and connect manually if needed
    
    console.log('[VelvetCurve] Initialized');
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      processorRef.current?.destroy();
      analyzerRef.current?.destroy();
      console.log('[VelvetCurve] Cleaned up');
    };
  }, []);
  
  // Animation loop for UI updates
  useEffect(() => {
    const updateUI = () => {
      if (processorRef.current) {
        setBeatPhase(processorRef.current.getBeatPhase());
        setGainReduction(processorRef.current.getGainReduction());
      }
      
      if (analyzerRef.current) {
        setFourAnchors(analyzerRef.current.getVisualData());
      }
      
      animationRef.current = requestAnimationFrame(updateUI);
    };
    
    if (isActive) {
      animationRef.current = requestAnimationFrame(updateUI);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);
  
  // Set individual parameter
  const setParameter = useCallback((param: keyof VelvetSettings, value: number) => {
    if (processorRef.current) {
      processorRef.current.setParameter(param, value);
      setSettings(prev => ({ ...prev, [param]: value }));
    }
  }, []);
  
  // Set Velvet amount (master control)
  const setVelvetAmount = useCallback((amount: number) => {
    setParameter('velvetAmount', amount);
  }, [setParameter]);
  
  // Apply genre preset
  const applyGenrePreset = useCallback((genre: GenrePreset) => {
    if (processorRef.current) {
      processorRef.current.applyGenrePreset(genre);
      setCurrentGenre(genre);
      setSettings(GENRE_PRESETS[genre]);
    }
  }, []);
  
  // Toggle beat-synced breathing
  const toggleBreathing = useCallback(() => {
    if (processorRef.current) {
      if (isBreathingEnabled) {
        processorRef.current.stopBreathing();
      } else {
        processorRef.current.setBPM(audioEngine.bpm);
        processorRef.current.startBreathing(audioEngine.ctx.currentTime);
      }
      setIsBreathingEnabled(!isBreathingEnabled);
    }
  }, [isBreathingEnabled]);
  
  // Toggle processor active state
  const toggleActive = useCallback(() => {
    setIsActive(!isActive);
    // In a full implementation, this would bypass the processor in the audio chain
  }, [isActive]);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    processorRef.current?.destroy();
    analyzerRef.current?.destroy();
  }, []);
  
  // Available genres
  const availableGenres: GenrePreset[] = [
    'trap', 'drill', 'rnb', 'reggaeton', 'afrobeat', 'amapiano', 'melodic-trap', 'default'
  ];
  
  return {
    settings,
    setParameter,
    setVelvetAmount,
    currentGenre,
    applyGenrePreset,
    availableGenres,
    isBreathingEnabled,
    toggleBreathing,
    beatPhase,
    fourAnchors,
    gainReduction,
    isActive,
    toggleActive,
    cleanup,
  };
};
