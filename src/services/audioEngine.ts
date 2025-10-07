// Audio Engine Service - Handles playback, recording, and routing
export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private trackNodes: Map<string, {
    gainNode: GainNode;
    panNode: StereoPannerNode;
    sourceNode: AudioBufferSourceNode | null;
    recordingNode: MediaStreamAudioSourceNode | null;
    analyserNode: AnalyserNode;
  }> = new Map();
  private isPlaying = false;
  private startTime = 0;
  private pausedAt = 0;
  private animationFrameId: number | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);
    }
  }

  // Initialize track in the audio graph
  initTrack(trackId: string, audioBuffer?: AudioBuffer) {
    if (!this.audioContext || !this.masterGainNode) return;

    // Clean up existing nodes for this track
    this.cleanupTrack(trackId);

    const gainNode = this.audioContext.createGain();
    const panNode = this.audioContext.createStereoPanner();
    const analyserNode = this.audioContext.createAnalyser();
    
    analyserNode.fftSize = 2048;
    
    // Connect: gain -> pan -> analyser -> master
    gainNode.connect(panNode);
    panNode.connect(analyserNode);
    analyserNode.connect(this.masterGainNode);

    this.trackNodes.set(trackId, {
      gainNode,
      panNode,
      sourceNode: null,
      recordingNode: null,
      analyserNode,
    });
  }

  // Start playback for a specific track
  playTrack(trackId: string, audioBuffer: AudioBuffer, offset = 0) {
    if (!this.audioContext) return;

    const trackNode = this.trackNodes.get(trackId);
    if (!trackNode) {
      this.initTrack(trackId, audioBuffer);
      return this.playTrack(trackId, audioBuffer, offset);
    }

    // Stop existing source
    if (trackNode.sourceNode) {
      trackNode.sourceNode.stop();
      trackNode.sourceNode.disconnect();
    }

    // Create new source
    const sourceNode = this.audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(trackNode.gainNode);
    sourceNode.start(0, offset);

    trackNode.sourceNode = sourceNode;
    this.trackNodes.set(trackId, trackNode);
  }

  // Stop playback for a specific track
  stopTrack(trackId: string) {
    const trackNode = this.trackNodes.get(trackId);
    if (trackNode?.sourceNode) {
      try {
        trackNode.sourceNode.stop();
        trackNode.sourceNode.disconnect();
        trackNode.sourceNode = null;
      } catch (e) {
        console.warn('Error stopping track:', e);
      }
    }
  }

  // Update track volume
  setTrackVolume(trackId: string, volume: number) {
    const trackNode = this.trackNodes.get(trackId);
    if (trackNode) {
      trackNode.gainNode.gain.setValueAtTime(volume, this.audioContext?.currentTime || 0);
    }
  }

  // Update track pan
  setTrackPan(trackId: string, pan: number) {
    const trackNode = this.trackNodes.get(trackId);
    if (trackNode) {
      trackNode.panNode.pan.setValueAtTime(pan, this.audioContext?.currentTime || 0);
    }
  }

  // Set master volume
  setMasterVolume(volume: number) {
    if (this.masterGainNode) {
      this.masterGainNode.gain.setValueAtTime(volume, this.audioContext?.currentTime || 0);
    }
  }

  // Get current audio levels for a track
  getTrackLevels(trackId: string): { peak: number; rms: number } {
    const trackNode = this.trackNodes.get(trackId);
    if (!trackNode) return { peak: 0, rms: 0 };

    const analyser = trackNode.analyserNode;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    let peak = 0;
    let sum = 0;

    for (let i = 0; i < bufferLength; i++) {
      const normalized = Math.abs((dataArray[i] - 128) / 128);
      peak = Math.max(peak, normalized);
      sum += normalized * normalized;
    }

    const rms = Math.sqrt(sum / bufferLength);
    return { peak, rms };
  }

  // Start recording on a track
  async startRecording(trackId: string, stream: MediaStream) {
    if (!this.audioContext) return;

    const trackNode = this.trackNodes.get(trackId);
    if (!trackNode) {
      this.initTrack(trackId);
      return this.startRecording(trackId, stream);
    }

    // Create source from microphone stream
    const recordingNode = this.audioContext.createMediaStreamSource(stream);
    recordingNode.connect(trackNode.gainNode);
    
    trackNode.recordingNode = recordingNode;
    this.trackNodes.set(trackId, trackNode);
  }

  // Stop recording on a track
  stopRecording(trackId: string) {
    const trackNode = this.trackNodes.get(trackId);
    if (trackNode?.recordingNode) {
      trackNode.recordingNode.disconnect();
      trackNode.recordingNode = null;
    }
  }

  // Clean up track resources
  cleanupTrack(trackId: string) {
    const trackNode = this.trackNodes.get(trackId);
    if (trackNode) {
      trackNode.sourceNode?.disconnect();
      trackNode.recordingNode?.disconnect();
      trackNode.gainNode.disconnect();
      trackNode.panNode.disconnect();
      trackNode.analyserNode.disconnect();
      this.trackNodes.delete(trackId);
    }
  }

  // Resume audio context (needed for some browsers)
  async resume() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Get current audio context time
  getCurrentTime(): number {
    return this.audioContext?.currentTime || 0;
  }

  // Cleanup all resources
  destroy() {
    this.trackNodes.forEach((_, trackId) => this.cleanupTrack(trackId));
    this.trackNodes.clear();
    this.audioContext?.close();
    this.audioContext = null;
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
