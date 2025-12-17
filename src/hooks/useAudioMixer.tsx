import { useState, useEffect, useRef, useCallback } from 'react';

export interface MixerChannel {
  id: string;
  name: string;
  volume: number;
  isMuted: boolean;
  isSolo: boolean;
  pan: number;
  level: number; // Real-time audio level (0-1)
  gainNode: GainNode | null;
  panNode: StereoPannerNode | null;
  analyserNode: AnalyserNode | null;
}

interface UseAudioMixerReturn {
  channels: Map<string, MixerChannel>;
  masterVolume: number;
  masterLevel: number;
  addChannel: (id: string, name: string, stream?: MediaStream) => void;
  removeChannel: (id: string) => void;
  setChannelVolume: (id: string, volume: number) => void;
  setChannelMute: (id: string, muted: boolean) => void;
  setChannelSolo: (id: string, solo: boolean) => void;
  setChannelPan: (id: string, pan: number) => void;
  setMasterVolume: (volume: number) => void;
  connectStreamToChannel: (id: string, stream: MediaStream) => void;
  disconnectChannel: (id: string) => void;
  getChannelLevel: (id: string) => number;
  startRecording: () => void;
  stopRecording: () => Promise<Blob | null>;
  isRecording: boolean;
}

export const useAudioMixer = (): UseAudioMixerReturn => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  
  const [channels, setChannels] = useState<Map<string, MixerChannel>>(new Map());
  const [masterVolume, setMasterVolumeState] = useState(0.8);
  const [masterLevel, setMasterLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  
  // Store source nodes separately (can't be serialized in state)
  const sourceNodesRef = useRef<Map<string, MediaStreamAudioSourceNode>>(new Map());
  const channelNodesRef = useRef<Map<string, { gain: GainNode; pan: StereoPannerNode; analyser: AnalyserNode }>>(new Map());

  // Initialize audio context and master chain
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        audioContextRef.current = new AudioContext({ sampleRate: 48000 });
        
        // Create master gain
        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.gain.value = masterVolume;
        
        // Create master analyser for level metering
        masterAnalyserRef.current = audioContextRef.current.createAnalyser();
        masterAnalyserRef.current.fftSize = 256;
        masterAnalyserRef.current.smoothingTimeConstant = 0.8;
        
        // Connect master chain
        masterGainRef.current.connect(masterAnalyserRef.current);
        masterAnalyserRef.current.connect(audioContextRef.current.destination);
        
        // Start level metering animation loop
        startLevelMetering();
        
        console.log('[AudioMixer] Initialized audio context');
      } catch (error) {
        console.error('[AudioMixer] Failed to initialize:', error);
      }
    };

    initAudioContext();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Level metering animation loop
  const startLevelMetering = useCallback(() => {
    const updateLevels = () => {
      if (!masterAnalyserRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateLevels);
        return;
      }

      // Update master level
      const masterData = new Uint8Array(masterAnalyserRef.current.frequencyBinCount);
      masterAnalyserRef.current.getByteFrequencyData(masterData);
      const masterRms = Math.sqrt(masterData.reduce((sum, val) => sum + val * val, 0) / masterData.length) / 255;
      setMasterLevel(masterRms);

      // Update channel levels
      setChannels(prev => {
        const updated = new Map(prev);
        channelNodesRef.current.forEach((nodes, id) => {
          const channel = updated.get(id);
          if (channel && nodes.analyser) {
            const data = new Uint8Array(nodes.analyser.frequencyBinCount);
            nodes.analyser.getByteFrequencyData(data);
            const rms = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / data.length) / 255;
            updated.set(id, { ...channel, level: rms });
          }
        });
        return updated;
      });

      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };

    animationFrameRef.current = requestAnimationFrame(updateLevels);
  }, []);

  // Add a new channel to the mixer
  const addChannel = useCallback((id: string, name: string, stream?: MediaStream) => {
    if (!audioContextRef.current || !masterGainRef.current) return;
    
    // Resume audio context if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Create channel nodes
    const gainNode = audioContextRef.current.createGain();
    const panNode = audioContextRef.current.createStereoPanner();
    const analyserNode = audioContextRef.current.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.8;

    // Connect channel chain: gain -> pan -> analyser -> master
    gainNode.connect(panNode);
    panNode.connect(analyserNode);
    analyserNode.connect(masterGainRef.current);

    // Store nodes
    channelNodesRef.current.set(id, { gain: gainNode, pan: panNode, analyser: analyserNode });

    // Create channel state
    const channel: MixerChannel = {
      id,
      name,
      volume: 0.8,
      isMuted: false,
      isSolo: false,
      pan: 0,
      level: 0,
      gainNode,
      panNode,
      analyserNode
    };

    setChannels(prev => new Map(prev).set(id, channel));

    // If stream provided, connect it
    if (stream) {
      connectStreamToChannel(id, stream);
    }

    console.log(`[AudioMixer] Added channel: ${name} (${id})`);
  }, []);

  // Remove a channel
  const removeChannel = useCallback((id: string) => {
    const nodes = channelNodesRef.current.get(id);
    const source = sourceNodesRef.current.get(id);

    if (source) {
      source.disconnect();
      sourceNodesRef.current.delete(id);
    }

    if (nodes) {
      nodes.gain.disconnect();
      nodes.pan.disconnect();
      nodes.analyser.disconnect();
      channelNodesRef.current.delete(id);
    }

    setChannels(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });

    console.log(`[AudioMixer] Removed channel: ${id}`);
  }, []);

  // Connect a media stream to a channel
  const connectStreamToChannel = useCallback((id: string, stream: MediaStream) => {
    if (!audioContextRef.current) return;

    const nodes = channelNodesRef.current.get(id);
    if (!nodes) {
      console.warn(`[AudioMixer] Channel ${id} not found`);
      return;
    }

    // Disconnect existing source if any
    const existingSource = sourceNodesRef.current.get(id);
    if (existingSource) {
      existingSource.disconnect();
    }

    // Create new source from stream
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(nodes.gain);
    sourceNodesRef.current.set(id, source);

    console.log(`[AudioMixer] Connected stream to channel: ${id}`);
  }, []);

  // Disconnect a channel's stream
  const disconnectChannel = useCallback((id: string) => {
    const source = sourceNodesRef.current.get(id);
    if (source) {
      source.disconnect();
      sourceNodesRef.current.delete(id);
    }
  }, []);

  // Set channel volume
  const setChannelVolume = useCallback((id: string, volume: number) => {
    const nodes = channelNodesRef.current.get(id);
    if (nodes) {
      // Apply smooth volume change
      nodes.gain.gain.setTargetAtTime(volume, audioContextRef.current?.currentTime || 0, 0.02);
    }

    setChannels(prev => {
      const updated = new Map(prev);
      const channel = updated.get(id);
      if (channel) {
        updated.set(id, { ...channel, volume });
      }
      return updated;
    });
  }, []);

  // Set channel mute
  const setChannelMute = useCallback((id: string, muted: boolean) => {
    const nodes = channelNodesRef.current.get(id);
    const channel = channels.get(id);
    
    if (nodes && channel) {
      const targetVolume = muted ? 0 : channel.volume;
      nodes.gain.gain.setTargetAtTime(targetVolume, audioContextRef.current?.currentTime || 0, 0.02);
    }

    setChannels(prev => {
      const updated = new Map(prev);
      const ch = updated.get(id);
      if (ch) {
        updated.set(id, { ...ch, isMuted: muted });
      }
      return updated;
    });
  }, [channels]);

  // Set channel solo (mute all others)
  const setChannelSolo = useCallback((id: string, solo: boolean) => {
    setChannels(prev => {
      const updated = new Map(prev);
      const targetChannel = updated.get(id);
      
      if (targetChannel) {
        updated.set(id, { ...targetChannel, isSolo: solo });
        
        // Check if any channel is soloed
        const anySoloed = Array.from(updated.values()).some(ch => ch.isSolo);
        
        // Update all channel volumes based on solo state
        updated.forEach((channel, chId) => {
          const nodes = channelNodesRef.current.get(chId);
          if (nodes) {
            if (anySoloed) {
              // Only soloed channels should be audible
              const shouldPlay = channel.isSolo && !channel.isMuted;
              nodes.gain.gain.setTargetAtTime(
                shouldPlay ? channel.volume : 0,
                audioContextRef.current?.currentTime || 0,
                0.02
              );
            } else {
              // No solo active, respect mute state
              const shouldPlay = !channel.isMuted;
              nodes.gain.gain.setTargetAtTime(
                shouldPlay ? channel.volume : 0,
                audioContextRef.current?.currentTime || 0,
                0.02
              );
            }
          }
        });
      }
      
      return updated;
    });
  }, []);

  // Set channel pan (-1 to 1)
  const setChannelPan = useCallback((id: string, pan: number) => {
    const nodes = channelNodesRef.current.get(id);
    if (nodes) {
      nodes.pan.pan.setTargetAtTime(pan, audioContextRef.current?.currentTime || 0, 0.02);
    }

    setChannels(prev => {
      const updated = new Map(prev);
      const channel = updated.get(id);
      if (channel) {
        updated.set(id, { ...channel, pan });
      }
      return updated;
    });
  }, []);

  // Set master volume
  const setMasterVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioContextRef.current?.currentTime || 0, 0.02);
    }
    setMasterVolumeState(volume);
  }, []);

  // Get channel level (for external access)
  const getChannelLevel = useCallback((id: string): number => {
    return channels.get(id)?.level || 0;
  }, [channels]);

  // Start recording the mixed output
  const startRecording = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    try {
      // Create a destination for recording
      const dest = audioContextRef.current.createMediaStreamDestination();
      masterGainRef.current.connect(dest);

      recordedChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(dest.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      console.log('[AudioMixer] Recording started');
    } catch (error) {
      console.error('[AudioMixer] Failed to start recording:', error);
    }
  }, []);

  // Stop recording and return blob
  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        recordedChunksRef.current = [];
        setIsRecording(false);
        console.log('[AudioMixer] Recording stopped, size:', blob.size);
        resolve(blob);
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  return {
    channels,
    masterVolume,
    masterLevel,
    addChannel,
    removeChannel,
    setChannelVolume,
    setChannelMute,
    setChannelSolo,
    setChannelPan,
    setMasterVolume,
    connectStreamToChannel,
    disconnectChannel,
    getChannelLevel,
    startRecording,
    stopRecording,
    isRecording
  };
};
