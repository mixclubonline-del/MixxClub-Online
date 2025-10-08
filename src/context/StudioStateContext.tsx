import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface StudioState {
  isPlaying: boolean;
  isRecording: boolean;
  masterVolume: number;
  aiActive: boolean;
  primeTalking: boolean;
  updateState: (updates: Partial<StudioState>) => void;
}

const defaultState: StudioState = {
  isPlaying: false,
  isRecording: false,
  masterVolume: 0.8,
  aiActive: false,
  primeTalking: false,
  updateState: () => {},
};

const StudioStateContext = createContext<StudioState>(defaultState);

export const StudioStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    let pulseInterval: NodeJS.Timeout | null = null;
    if (state.isPlaying) {
      pulseInterval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          masterVolume: 0.7 + Math.random() * 0.3,
        }));
      }, 500);
    } else if (pulseInterval) {
      clearInterval(pulseInterval);
    }
    return () => {
      if (pulseInterval) clearInterval(pulseInterval);
    };
  }, [state.isPlaying]);

  const updateState = (updates: Partial<StudioState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <StudioStateContext.Provider value={{ ...state, updateState }}>
      {children}
    </StudioStateContext.Provider>
  );
};

export const useStudioState = () => useContext(StudioStateContext);
