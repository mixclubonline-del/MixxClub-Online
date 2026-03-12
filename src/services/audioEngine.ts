/* eslint-disable @typescript-eslint/no-explicit-any */
import { VelvetCurveProcessor } from '@/audio/effects/VelvetCurveProcessor';
import { GenrePreset, GENRE_PRESETS } from '@/audio/context/GenreContext';
import { uuid } from '@/lib/uuid';

type UUID = string;

export type PluginType = "EQ" | "COMP" | "SAT" | "REV" | "DLY" | "OTHER";
export interface PluginSlot {
  id: UUID;
  type: PluginType;
  bypass: boolean;
  node: AudioNode; // GainNode or WorkletNode placeholder
}

export interface SendLevels {
  reverb?: number; // 0..1
  delay?: number; // 0..1
  [key: string]: number | undefined;
}

export interface TrackGraph {
  id: UUID;
  name: string;
  // Core nodes
  input: AudioNode; // MediaStreamAudioSourceNode or AudioBufferSourceNode (dynamic)
  preGain: GainNode;
  preAnalyser: AnalyserNode;

  // Plugin chain (ordered inserts)
  plugins: PluginSlot[];
  postAnalyser: AnalyserNode;

  // Pan + fader
  pan: StereoPannerNode;
  fader: GainNode;

  // Sends
  sendGains: Record<string, GainNode>; // e.g., { reverb: GainNode, delay: GainNode }

  // Output tap
  out: GainNode;

  // State
  bufferSource?: AudioBufferSourceNode | null; // for file playback convenience
  isArmed?: boolean;
  muted?: boolean;
  solo?: boolean;
  sendLevels: SendLevels;
}

export interface FxBus {
  id: string; // 'reverb' | 'delay' | ...
  in: GainNode;
  proc: AudioNode; // ConvolverNode / DelayNode / WorkletNode
  out: GainNode;
  returnGain: GainNode; // Return level to master
  enabled: boolean;
}

export interface MasterChain {
  input: GainNode;
  velvetCurve: VelvetCurveProcessor;
  limiter: GainNode;
  analyser: AnalyserNode;
  output: GainNode; // to destination
}

class AudioEngine {
  ctx: AudioContext;
  tracks: Map<UUID, TrackGraph> = new Map();
  submixes: Map<string, GainNode> = new Map(); // e.g., 'DRUMS', 'VOX'
  fxBuses: Map<string, FxBus> = new Map();
  master: MasterChain;

  /** 
   * PHASE 5: Integrated transport control (merged from Transport.ts)
   * Simplified architecture - single source of timing truth
   */
  
  // Transport state
  private transportState: 'stopped' | 'playing' | 'paused' = 'stopped';
  private transportStartTime = 0;
  private transportPausedAt = 0;
  public bpm = 120;
  
  /**
   * Get current transport time
   */
  get currentTime(): number {
    if (this.transportState === 'playing') {
      return this.ctx.currentTime - this.transportStartTime;
    }
    return this.transportPausedAt;
  }
  
  get isPlaying(): boolean {
    return this.transportState === 'playing';
  }
  
  /**
   * Start playback from current position
   */
  startTransport() {
    if (this.transportState === 'playing') return;
    
    const when = this.ctx.currentTime;
    this.transportStartTime = when - this.transportPausedAt;
    this.transportState = 'playing';
    
    console.debug('[AudioEngine] ▶️ Transport START from', this.transportPausedAt.toFixed(3), 's');
  }
  
  /**
   * Pause playback at current position
   */
  pauseTransport() {
    if (this.transportState !== 'playing') return;
    
    this.transportPausedAt = this.currentTime;
    this.transportState = 'paused';
    
    console.debug('[AudioEngine] ⏸ Transport PAUSE at', this.transportPausedAt.toFixed(3), 's');
  }
  
  /**
   * Stop playback and reset to beginning
   */
  stopTransport() {
    this.transportPausedAt = 0;
    this.transportState = 'stopped';
    
    console.log('[AudioEngine] ⏹ Transport STOP');
  }
  
  /**
   * Seek to specific time
   */
  seekTransport(time: number) {
    this.transportPausedAt = Math.max(0, time);
    if (this.transportState === 'playing') {
      this.transportStartTime = this.ctx.currentTime - this.transportPausedAt;
    }
    
    console.log('[AudioEngine] ⏩ Transport SEEK to', time.toFixed(3), 's');
  }

  private workletsLoaded: boolean = false;

  constructor() {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtx();

    // --- Master chain with VelvetCurve ---
    const input = this.ctx.createGain();
    const velvetCurve = new VelvetCurveProcessor(this.ctx);
    const limiter = this.ctx.createGain();
    limiter.gain.value = 0.95; // Simple safety limiter
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 2048;
    const output = this.ctx.createGain();

    // Wire: input → velvetCurve → limiter → analyser → output → destination
    input.connect(velvetCurve.getInputNode());
    velvetCurve.getOutputNode().connect(limiter);
    limiter.connect(analyser);
    analyser.connect(output);
    output.connect(this.ctx.destination);

    this.master = { input, velvetCurve, limiter, analyser, output };

    // --- Default FX buses (Reverb / Delay) ---
    this.createFxBus("reverb", this.ctx.createConvolver());
    const delay = this.ctx.createDelay(2.0);
    delay.delayTime.value = 0.38; // nice default
    this.createFxBus("delay", delay);
  }

  /** Create a shared FX bus (Send/Return) and route to master */
  createFxBus(id: string, processor: AudioNode) {
    const inGain = this.ctx.createGain();
    inGain.gain.value = 1;

    const returnGain = this.ctx.createGain();
    returnGain.gain.value = 0.25; // default return level

    const out = this.ctx.createGain();
    inGain.connect(processor);
    processor.connect(out);
    out.connect(returnGain);
    returnGain.connect(this.master.input);

    this.fxBuses.set(id, {
      id,
      in: inGain,
      proc: processor,
      out,
      returnGain,
      enabled: true,
    });
  }

  /** Create a submix / group bus (route multiple tracks into it) */
  createSubmix(id: string) {
    if (this.submixes.has(id)) return this.submixes.get(id)!;
    const g = this.ctx.createGain();
    g.connect(this.master.input);
    this.submixes.set(id, g);
    return g;
  }

  /** Utility to create a default Analyser */
  private makeAnalyser() {
    const a = this.ctx.createAnalyser();
    a.fftSize = 1024;
    a.smoothingTimeConstant = 0.6;
    return a;
  }

  /** Create a new track and connect it to master (and sends) */
  createTrack(opts: { id?: UUID; name?: string; buffer?: AudioBuffer | null; groupId?: string }): TrackGraph {
    const id: UUID = opts.id ?? uuid();
    const name = opts.name ?? "Track";

    // Input node: default to a dummy Gain as placeholder
    const input = this.ctx.createGain();
    input.gain.value = 1;

    const preGain = this.ctx.createGain();
    preGain.gain.value = 1;

    const preAnalyser = this.makeAnalyser();
    const postAnalyser = this.makeAnalyser();

    // Add metering worklet if available
    let meterWorklet: AudioWorkletNode | null = null;
    if (this.workletsLoaded) {
      try {
        meterWorklet = new AudioWorkletNode(this.ctx, 'daw-meter-processor');
        // Store meter data for this track globally for UI access
        meterWorklet.port.onmessage = (e) => {
          if (!(window as any).audioMeterData) (window as any).audioMeterData = {};
          (window as any).audioMeterData[id] = e.data;
        };
      } catch (error) {
        console.warn('[AudioEngine] Failed to create meter worklet for track', name, error);
      }
    }

    const pan = this.ctx.createStereoPanner();
    pan.pan.value = 0;

    const fader = this.ctx.createGain();
    fader.gain.value = 0.85;

    const out = this.ctx.createGain();

    // default sends
    const sendGains: Record<string, GainNode> = {};
    for (const [busId, bus] of this.fxBuses) {
      const sg = this.ctx.createGain();
      sg.gain.value = 0; // off by default
      out.connect(sg);
      sg.connect(bus.in);
      sendGains[busId] = sg;
    }

    // wire base path
    input.connect(preGain);
    preGain.connect(preAnalyser);

    // initial plugin chain (empty)
    const plugins: PluginSlot[] = [];
    // connect chain head to pan
    preAnalyser.connect(pan); // start: preAnalyser → pan (we will repatch when plugins added)

    pan.connect(fader);
    fader.connect(postAnalyser);
    
    // Insert meter worklet in chain if available
    if (meterWorklet) {
      postAnalyser.connect(meterWorklet);
      meterWorklet.connect(out);
    } else {
      postAnalyser.connect(out);
    }

    // out connects downstream based on grouping
    if (opts.groupId) {
      const group = this.createSubmix(opts.groupId);
      out.connect(group);
    } else {
      out.connect(this.master.input);
    }

    const tg: TrackGraph = {
      id,
      name,
      input,
      preGain,
      preAnalyser,
      plugins,
      postAnalyser,
      pan,
      fader,
      sendGains,
      out,
      bufferSource: null,
      isArmed: false,
      muted: false,
      solo: false,
      sendLevels: {},
    };

    // if buffer provided, auto create buffer source (stopped until play)
    if (opts.buffer) {
      this.attachBufferSource(tg, opts.buffer);
    }

    this.tracks.set(id, tg);
    this._repatchChain(tg); // ensure chain wiring is consistent
    return tg;
  }

  /** Attach an AudioBufferSource to a track input (for stems/clips) */
  attachBufferSource(track: TrackGraph, buffer: AudioBuffer) {
    if (track.bufferSource) {
      try {
        track.bufferSource.stop();
      } catch {}
      track.bufferSource.disconnect();
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = false;
    src.connect(track.input);
    track.bufferSource = src;
  }

  /** Remove track and disconnect nodes */
  removeTrack(id: UUID) {
    const t = this.tracks.get(id);
    if (!t) return;
    try {
      t.bufferSource?.stop();
    } catch {}
    t.bufferSource?.disconnect();
    t.input.disconnect();
    t.preGain.disconnect();
    t.preAnalyser.disconnect();
    t.plugins.forEach((p) => p.node.disconnect());
    t.pan.disconnect();
    t.fader.disconnect();
    t.postAnalyser.disconnect();
    t.out.disconnect();
    Object.values(t.sendGains).forEach((sg) => sg.disconnect());
    this.tracks.delete(id);
  }

  /** Insert plugin at index; simple GainNode placeholder by default */
  addPlugin(trackId: UUID, slot: { id?: UUID; type: PluginType; node?: AudioNode; bypass?: boolean }, index?: number) {
    const t = this.tracks.get(trackId);
    if (!t) return;
    const plugin: PluginSlot = {
      id: slot.id ?? uuid(),
      type: slot.type,
      bypass: !!slot.bypass,
      node: slot.node ?? this.ctx.createGain(), // replace with AudioWorkletNode for real DSP
    };
    if (index === undefined || index < 0 || index > t.plugins.length) {
      t.plugins.push(plugin);
    } else {
      t.plugins.splice(index, 0, plugin);
    }
    this._repatchChain(t);
  }

  /** Remove plugin by id */
  removePlugin(trackId: UUID, pluginId: UUID) {
    const t = this.tracks.get(trackId);
    if (!t) return;
    const idx = t.plugins.findIndex((p) => p.id === pluginId);
    if (idx >= 0) {
      try {
        t.plugins[idx].node.disconnect();
      } catch {}
      t.plugins.splice(idx, 1);
      this._repatchChain(t);
    }
  }

  /** Toggle plugin bypass (when bypassed we wire around it) */
  setPluginBypass(trackId: UUID, pluginId: UUID, bypass: boolean) {
    const t = this.tracks.get(trackId);
    if (!t) return;
    const p = t.plugins.find((p) => p.id === pluginId);
    if (!p) return;
    p.bypass = bypass;
    this._repatchChain(t);
  }

  /** Rebuild the internal wiring of one track (Input → Pre → Plugins → Pan → Fader) */
  private _repatchChain(t: TrackGraph) {
    // disconnect preAnalyser downstream
    try {
      t.preAnalyser.disconnect();
    } catch {}
    t.plugins.forEach((p) => {
      try {
        p.node.disconnect();
      } catch {}
    });
    try {
      t.pan.disconnect();
    } catch {}

    // Wire sequence respecting bypass flags
    let head: AudioNode = t.preAnalyser;
    for (const p of t.plugins) {
      if (p.bypass) continue;
      head.connect(p.node);
      head = p.node;
    }
    head.connect(t.pan);
    // everything else (pan→fader→postAnalyser→out) is static
  }

  /** Levels, pan, sends */
  setTrackGain(id: UUID, gain: number) {
    const t = this.tracks.get(id);
    if (!t) return;
    t.fader.gain.value = Math.max(0, Math.min(1.5, gain));
  }
  setTrackPan(id: UUID, pan: number) {
    const t = this.tracks.get(id);
    if (!t) return;
    t.pan.pan.value = Math.max(-1, Math.min(1, pan));
  }
  setSendLevel(id: UUID, busId: string, level: number) {
    const t = this.tracks.get(id);
    if (!t) return;
    const sg = t.sendGains[busId];
    if (!sg) return;
    sg.gain.value = Math.max(0, Math.min(1, level));
    t.sendLevels[busId] = sg.gain.value;
  }

  /** Master helpers */
  setMasterGain(v: number) {
    this.master.output.gain.value = v;
  }
  getLatency() {
    return (this.ctx.baseLatency ?? 0) * 1000;
  }

  // Removed deprecated play/pause/stop methods - use Transport and TrackScheduler instead

  /** Initialize AudioWorklet modules for professional-grade audio processing */
  async initWorklets() {
    if (this.workletsLoaded) {
      console.log('[AudioEngine] ✅ Worklets already loaded');
      return;
    }

    try {
      console.log('[AudioEngine] 🔧 Loading AudioWorklet modules...');
      await this.ctx.audioWorklet.addModule('/worklets/daw-mixer-processor.js');
      await this.ctx.audioWorklet.addModule('/worklets/daw-meter-processor.js');
      this.workletsLoaded = true;
      console.log('[AudioEngine] ✅ AudioWorklets loaded successfully');
      console.log('[AudioEngine] 🎵 Audio processing now running on dedicated audio thread');
    } catch (error) {
      console.error('[AudioEngine] ❌ Failed to load AudioWorklets:', error);
      console.warn('[AudioEngine] ⚠️ Falling back to main thread audio processing');
    }
  }

  /** Resume audio context (required by browsers) */
  async resume() {
    if (this.ctx.state !== "running") await this.ctx.resume();
  }

  /** Taps for UI meters: pre/post track, master */
  getTrackPreAnalyser(id: UUID) {
    return this.tracks.get(id)?.preAnalyser ?? null;
  }
  getTrackPostAnalyser(id: UUID) {
    return this.tracks.get(id)?.postAnalyser ?? null;
  }
  getMasterAnalyser() {
    return this.master.analyser;
  }

  /** Offline rendering for export - renders all tracks through VelvetCurve */
  async renderOffline(durationSec: number): Promise<AudioBuffer | null> {
    if (durationSec <= 0) {
      console.warn('[AudioEngine] renderOffline: Invalid duration');
      return null;
    }

    const sampleRate = 48000;
    const length = Math.ceil(durationSec * sampleRate);
    
    console.log(`[AudioEngine] 🎬 Starting offline render: ${durationSec.toFixed(2)}s @ ${sampleRate}Hz`);
    
    try {
      const offlineCtx = new OfflineAudioContext(2, length, sampleRate);
      
      // Create offline VelvetCurve processor
      const offlineVelvet = new VelvetCurveProcessor(offlineCtx as unknown as AudioContext);
      
      // Copy current settings to offline processor
      const currentSettings = this.master.velvetCurve.getSettings();
      offlineVelvet.applySettings(currentSettings);
      
      // Create limiter and connect
      const offlineLimiter = offlineCtx.createGain();
      offlineLimiter.gain.value = 0.95;
      
      offlineVelvet.getOutputNode().connect(offlineLimiter);
      offlineLimiter.connect(offlineCtx.destination);
      
      // Schedule all track sources
      let tracksScheduled = 0;
      for (const [, track] of this.tracks) {
        if (track.muted) continue;
        
        // Get audio buffer from track
        const buffer = track.bufferSource?.buffer;
        if (!buffer) continue;
        
        // Create source for offline context
        const src = offlineCtx.createBufferSource();
        src.buffer = buffer;
        
        // Apply track gain
        const gain = offlineCtx.createGain();
        gain.gain.value = track.fader.gain.value;
        
        // Apply panning
        const pan = offlineCtx.createStereoPanner();
        pan.pan.value = track.pan.pan.value;
        
        // Wire: source → gain → pan → velvetCurve
        src.connect(gain);
        gain.connect(pan);
        pan.connect(offlineVelvet.getInputNode());
        
        src.start(0);
        tracksScheduled++;
      }
      
      console.log(`[AudioEngine] 🎚️ Scheduled ${tracksScheduled} tracks for offline render`);
      
      // Render
      const renderedBuffer = await offlineCtx.startRendering();
      
      console.log(`[AudioEngine] ✅ Offline render complete: ${renderedBuffer.duration.toFixed(2)}s`);
      
      return renderedBuffer;
      
    } catch (error) {
      console.error('[AudioEngine] ❌ Offline render failed:', error);
      return null;
    }
  }

  /** Get VelvetCurve processor for UI control */
  getVelvetCurve(): VelvetCurveProcessor {
    return this.master.velvetCurve;
  }

  /** Set master genre preset */
  setMasterGenre(genre: GenrePreset): void {
    const preset = GENRE_PRESETS[genre];
    if (preset) {
      this.master.velvetCurve.applySettings(preset);
      console.log(`[AudioEngine] 🎨 Master genre set to: ${genre}`);
    }
  }

  /** Set BPM for beat-synced breathing */
  setBPM(newBpm: number): void {
    this.bpm = newBpm;
    this.master.velvetCurve.setBPM(newBpm);
  }

  /** Stub methods for compatibility with existing components */
  setSampleRate(_rate: number) {
    console.warn("setSampleRate: Sample rate is fixed at AudioContext creation");
  }

  setBufferSize(_size: number) {
    console.warn("setBufferSize: Buffer size configuration not yet implemented");
  }

  setLatencyCompensation(_enabled: boolean) {
    console.warn("setLatencyCompensation: Latency compensation not yet implemented");
  }

  startPluginPreview(_trackId: UUID, _pluginType: string) {
    console.warn("startPluginPreview: Plugin preview not yet implemented");
  }

  stopPluginPreview() {
    console.warn("stopPluginPreview: Plugin preview not yet implemented");
  }

  insertEffect(_trackId: UUID, _effect: any) {
    console.warn("insertEffect: Use addPlugin instead");
  }

  updateEffectParameter(_trackId: UUID, _effectId: UUID, _paramId: string, _value: number) {
    console.warn("updateEffectParameter: Effect parameter automation not yet implemented");
  }

  /** @deprecated - Use Transport.currentTime instead */
  getPlaybackPosition(): number {
    console.warn('[AudioEngine] getPlaybackPosition() is deprecated. Use Transport.currentTime');
    return 0;
  }

  /** @deprecated - Use Transport.stop() instead */
  stopAllTracks() {
    console.warn('[AudioEngine] stopAllTracks() is deprecated. Use Transport.stop()');
  }

  initTrack(_trackId: UUID) {
    console.warn("initTrack: Track initialization handled by createTrack");
  }

  setTrackVolume(trackId: UUID, volume: number) {
    this.setTrackGain(trackId, volume);
  }

  playTrack(_trackId: UUID) {
    console.warn("playTrack: Individual track playback - use play() for all tracks");
  }

  stopTrack(_trackId: UUID) {
    console.warn("stopTrack: Individual track stop not yet implemented");
  }
}

// Singleton export (matches your existing import style)
export const audioEngine = new AudioEngine();

/* =========================
   Optional: Worklet wiring
   =========================
   // In your app bootstrap:
   await audioEngine.ctx.audioWorklet.addModule('/worklets/mixx-eq-processor.js');
   // Then create a node:
   const eqNode = new AudioWorkletNode(audioEngine.ctx, 'mixx-eq-processor', { numberOfInputs: 1, numberOfOutputs: 1 });
   audioEngine.addPlugin(trackId, { type: 'EQ', node: eqNode });
*/
