import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCollaborationStatus } from '@/hooks/useCollaborationStatus';
import { useMoodTheming } from '@/hooks/useMoodTheming';
import { useAudioReactivity } from '@/hooks/useAudioReactivity';

type SystemMode = 'active' | 'idle' | 'processing' | 'syncing';
type UserMood = 'energetic' | 'calm' | 'dark' | 'bright';

interface PrimeState {
  // Core AI State
  systemMode: SystemMode;
  userMood: UserMood;
  networkAwareness: {
    activeUsers: number;
    onlineEngineers: number;
    activeSessions: number;
    isLive: boolean;
  };
  
  // Visual Signals
  glowIntensity: number;
  pulseRate: number;
  accentColor: string;
  
  // Real-time Activity
  recentActivity: string[];
  currentFocus: string | null;
  
  // Audio Reactivity
  audioState: {
    isPlaying: boolean;
    amplitude: number;
    frequency: number;
    beats: number[];
  };
}

interface PrimeContextValue extends PrimeState {
  setSystemMode: (mode: SystemMode) => void;
  setUserMood: (mood: UserMood) => void;
  setCurrentFocus: (focus: string | null) => void;
  askPrime: (question: string) => Promise<string>;
}

const PrimeContext = createContext<PrimeContextValue | undefined>(undefined);

export const PrimeProvider = ({ children }: { children: ReactNode }) => {
  const { user, activeRole } = useAuth();
  const collaborationData = useCollaborationStatus();
  const { theme, updateMood } = useMoodTheming();
  const audioState = useAudioReactivity({ simulationMode: true });
  
  const [systemMode, setSystemMode] = useState<SystemMode>('active');
  const [userMood, setUserMood] = useState<UserMood>('dark');
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const [pulseRate, setPulseRate] = useState(2000);
  const [accentColor, setAccentColor] = useState('hsl(var(--accent-cyan))');

  // Sync mood with theming system
  useEffect(() => {
    updateMood(userMood);
  }, [userMood, updateMood]);

  // Dynamic glow intensity based on audio and activity
  useEffect(() => {
    const baseIntensity = 0.5;
    const audioBoost = audioState.isPlaying ? audioState.amplitude / 200 : 0;
    const activityBoost = collaborationData.isLive ? 0.2 : 0;
    setGlowIntensity(Math.min(1, baseIntensity + audioBoost + activityBoost));
  }, [audioState, collaborationData]);

  // Dynamic pulse rate based on system mode
  useEffect(() => {
    const rates: Record<SystemMode, number> = {
      active: 2000,
      idle: 4000,
      processing: 1000,
      syncing: 1500
    };
    setPulseRate(rates[systemMode]);
  }, [systemMode]);

  // Dynamic accent color based on mode and role
  useEffect(() => {
    if (systemMode === 'processing') {
      setAccentColor('hsl(var(--accent-magenta))');
    } else if (systemMode === 'syncing') {
      setAccentColor('hsl(var(--accent-cyan))');
    } else if (activeRole === 'client') {
      setAccentColor('hsl(var(--accent-magenta))');
    } else if (activeRole === 'engineer') {
      setAccentColor('hsl(var(--accent-cyan))');
    } else {
      setAccentColor('hsl(var(--accent))');
    }
  }, [systemMode, activeRole]);

  // Prime AI question handler (placeholder for future API integration)
  const askPrime = async (question: string): Promise<string> => {
    setSystemMode('processing');
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock responses based on question type
    const responses: Record<string, string> = {
      'status': `Prime 1.0 is ${systemMode}. Network: ${collaborationData.activeUsers} users online.`,
      'mood': `Current mood: ${userMood}. Adjusting interface dynamics.`,
      'audio': `Audio analysis: ${audioState.isPlaying ? 'Active' : 'Idle'}. Amplitude: ${Math.round(audioState.amplitude)}`,
      'default': `Prime 1.0 analyzing: "${question}". All systems operational.`
    };
    
    setSystemMode('active');
    
    const key = Object.keys(responses).find(k => question.toLowerCase().includes(k)) || 'default';
    return responses[key];
  };

  const value: PrimeContextValue = {
    systemMode,
    userMood,
    networkAwareness: {
      activeUsers: collaborationData.activeUsers,
      onlineEngineers: collaborationData.onlineEngineers,
      activeSessions: collaborationData.activeSessions,
      isLive: collaborationData.isLive
    },
    glowIntensity,
    pulseRate,
    accentColor,
    recentActivity: collaborationData.recentActivity,
    currentFocus,
    audioState,
    setSystemMode,
    setUserMood,
    setCurrentFocus,
    askPrime
  };

  return (
    <PrimeContext.Provider value={value}>
      {children}
    </PrimeContext.Provider>
  );
};

export const usePrime = () => {
  const context = useContext(PrimeContext);
  if (context === undefined) {
    throw new Error('usePrime must be used within a PrimeProvider');
  }
  return context;
};
