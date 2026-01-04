import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  audioUrl: string;
  artworkUrl?: string;
  duration: number;
  genre?: string;
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isQueueOpen: boolean;
}

interface PlayerActions {
  play: (track?: Track) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playPlaylist: (tracks: Track[], startIndex?: number) => void;
  toggleQueue: () => void;
}

type GlobalPlayerContextType = PlayerState & PlayerActions;

const GlobalPlayerContext = createContext<GlobalPlayerContextType | null>(null);

export const useGlobalPlayer = () => {
  const context = useContext(GlobalPlayerContext);
  if (!context) {
    throw new Error('useGlobalPlayer must be used within GlobalPlayerProvider');
  }
  return context;
};

export const GlobalPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    queue: [],
    history: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    isShuffled: false,
    repeatMode: 'none',
    isQueueOpen: false,
  });

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = state.volume;
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };
    
    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    };
    
    const handleEnded = () => {
      handleTrackEnd();
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const handleTrackEnd = useCallback(() => {
    setState(prev => {
      if (prev.repeatMode === 'one') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        return prev;
      }
      
      if (prev.queue.length > 0) {
        const nextTrack = prev.queue[0];
        const newQueue = prev.queue.slice(1);
        const newHistory = prev.currentTrack 
          ? [...prev.history, prev.currentTrack] 
          : prev.history;
        
        if (audioRef.current && nextTrack.audioUrl) {
          audioRef.current.src = nextTrack.audioUrl;
          audioRef.current.play();
        }
        
        return {
          ...prev,
          currentTrack: nextTrack,
          queue: newQueue,
          history: newHistory,
          isPlaying: true,
        };
      }
      
      if (prev.repeatMode === 'all' && prev.history.length > 0) {
        const allTracks = prev.currentTrack 
          ? [...prev.history, prev.currentTrack]
          : prev.history;
        const firstTrack = allTracks[0];
        const newQueue = allTracks.slice(1);
        
        if (audioRef.current && firstTrack.audioUrl) {
          audioRef.current.src = firstTrack.audioUrl;
          audioRef.current.play();
        }
        
        return {
          ...prev,
          currentTrack: firstTrack,
          queue: newQueue,
          history: [],
          isPlaying: true,
        };
      }
      
      return { ...prev, isPlaying: false };
    });
  }, []);

  const play = useCallback((track?: Track) => {
    if (track) {
      setState(prev => {
        const newHistory = prev.currentTrack 
          ? [...prev.history, prev.currentTrack] 
          : prev.history;
        
        if (audioRef.current && track.audioUrl) {
          audioRef.current.src = track.audioUrl;
          audioRef.current.play().catch(console.error);
        }
        
        return {
          ...prev,
          currentTrack: track,
          history: newHistory,
          isPlaying: true,
        };
      });
    } else if (audioRef.current && state.currentTrack) {
      audioRef.current.play().catch(console.error);
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [state.currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, pause, play]);

  const next = useCallback(() => {
    handleTrackEnd();
  }, [handleTrackEnd]);

  const previous = useCallback(() => {
    setState(prev => {
      if (prev.currentTime > 3 && audioRef.current) {
        audioRef.current.currentTime = 0;
        return prev;
      }
      
      if (prev.history.length > 0) {
        const prevTrack = prev.history[prev.history.length - 1];
        const newHistory = prev.history.slice(0, -1);
        const newQueue = prev.currentTrack 
          ? [prev.currentTrack, ...prev.queue]
          : prev.queue;
        
        if (audioRef.current && prevTrack.audioUrl) {
          audioRef.current.src = prevTrack.audioUrl;
          audioRef.current.play().catch(console.error);
        }
        
        return {
          ...prev,
          currentTrack: prevTrack,
          history: newHistory,
          queue: newQueue,
          isPlaying: true,
        };
      }
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return prev;
    });
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => {
      const newMuted = !prev.isMuted;
      if (audioRef.current) {
        audioRef.current.volume = newMuted ? 0 : prev.volume;
      }
      return { ...prev, isMuted: newMuted };
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setState(prev => {
      if (!prev.isShuffled && prev.queue.length > 1) {
        const shuffled = [...prev.queue].sort(() => Math.random() - 0.5);
        return { ...prev, isShuffled: true, queue: shuffled };
      }
      return { ...prev, isShuffled: !prev.isShuffled };
    });
  }, []);

  const setRepeatMode = useCallback((mode: 'none' | 'one' | 'all') => {
    setState(prev => ({ ...prev, repeatMode: mode }));
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setState(prev => ({ ...prev, queue: [...prev.queue, track] }));
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.filter((_, i) => i !== index),
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setState(prev => ({ ...prev, queue: [] }));
  }, []);

  const playPlaylist = useCallback((tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return;
    
    const firstTrack = tracks[startIndex];
    const queue = [...tracks.slice(startIndex + 1), ...tracks.slice(0, startIndex)];
    
    if (audioRef.current && firstTrack.audioUrl) {
      audioRef.current.src = firstTrack.audioUrl;
      audioRef.current.play().catch(console.error);
    }
    
    setState(prev => ({
      ...prev,
      currentTrack: firstTrack,
      queue: prev.isShuffled ? queue.sort(() => Math.random() - 0.5) : queue,
      history: [],
      isPlaying: true,
    }));
  }, []);

  const toggleQueue = useCallback(() => {
    setState(prev => ({ ...prev, isQueueOpen: !prev.isQueueOpen }));
  }, []);

  const value: GlobalPlayerContextType = {
    ...state,
    play,
    pause,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeatMode,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playPlaylist,
    toggleQueue,
  };

  return (
    <GlobalPlayerContext.Provider value={value}>
      {children}
    </GlobalPlayerContext.Provider>
  );
};
