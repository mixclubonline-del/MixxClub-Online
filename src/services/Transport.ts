/**
 * Transport - Central timing and playback control
 * 
 * ARCHITECTURE PATTERN: Industry-standard Transport Layer
 * Inspired by: Tone.js Transport, BandLab, Soundtrap, Pro Tools
 * 
 * RESPONSIBILITY:
 * - Single source of truth for playback time and state
 * - Precise timing using AudioContext.currentTime (microsecond precision)
 * - Event-based notifications to listeners (TrackScheduler, UI, etc.)
 * - Does NOT handle audio playback directly - only timing control
 * 
 * KEY PRINCIPLE:
 * Separation of Concerns - Transport knows WHEN to play, not HOW to play
 * The TrackScheduler handles the HOW (creating AudioBufferSourceNode instances)
 * 
 * USAGE:
 * ```typescript
 * const transport = new Transport(audioContext);
 * transport.addListener({
 *   onStart: (time) => scheduler.scheduleAll(time, tracks),
 *   onPause: () => scheduler.stopAll()
 * });
 * transport.start(); // Triggers onStart callback
 * ```
 */

type TransportState = 'stopped' | 'playing' | 'paused';

interface TransportListener {
  onStart?: (time: number) => void;
  onStop?: (time: number) => void;
  onPause?: (time: number) => void;
  onSeek?: (time: number) => void;
}

export class Transport {
  private audioContext: AudioContext;
  private state: TransportState = 'stopped';
  private _currentTime = 0; // In seconds
  private startedAt = 0; // AudioContext time when play was pressed
  private pausedAt = 0; // Position when paused
  private listeners: Set<TransportListener> = new Set();
  private syncInterval: number | null = null;
  
  public bpm = 120;
  public loop = false;
  public loopStart = 0;
  public loopEnd = 0;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * Current transport time in seconds
   */
  get currentTime(): number {
    if (this.state === 'playing') {
      return this.audioContext.currentTime - this.startedAt;
    }
    return this.pausedAt;
  }

  /**
   * Transport state
   */
  get isPlaying(): boolean {
    return this.state === 'playing';
  }

  get isPaused(): boolean {
    return this.state === 'paused';
  }

  get isStopped(): boolean {
    return this.state === 'stopped';
  }

  /**
   * Start playback from current position
   */
  start() {
    if (this.state === 'playing') return;

    const when = this.audioContext.currentTime;
    this.startedAt = when - this.pausedAt;
    this.state = 'playing';

    console.debug('[Transport] START from', this.pausedAt.toFixed(3), 's');

    // Notify all listeners
    this.listeners.forEach(listener => {
      listener.onStart?.(this.pausedAt);
    });

    // Start sync loop for real-time updates
    this.startSyncLoop();
  }

  /**
   * Pause playback at current position
   */
  pause() {
    if (this.state !== 'playing') return;

    const now = this.audioContext.currentTime;
    this.pausedAt = now - this.startedAt;
    this.state = 'paused';

    console.log('[Transport] ⏸️ PAUSE at', this.pausedAt.toFixed(3), 's');

    // Notify all listeners
    this.listeners.forEach(listener => {
      listener.onPause?.(this.pausedAt);
    });

    this.stopSyncLoop();
  }

  /**
   * Stop playback and return to zero
   */
  stop() {
    const wasPlaying = this.state === 'playing';
    this.state = 'stopped';
    this.pausedAt = 0;
    this.startedAt = 0;

    console.log('[Transport] ⏹️ STOP');

    if (wasPlaying) {
      this.listeners.forEach(listener => {
        listener.onStop?.(0);
      });
    }

    this.stopSyncLoop();
  }

  /**
   * Seek to a specific time
   */
  seek(time: number) {
    const wasPlaying = this.state === 'playing';
    
    // Clamp to valid range
    time = Math.max(0, time);
    
    console.log('[Transport] ⏩ SEEK to', time.toFixed(3), 's (was playing:', wasPlaying, ')');

    if (wasPlaying) {
      // If playing, restart from new position
      this.pausedAt = time;
      this.startedAt = this.audioContext.currentTime - time;
    } else {
      // If stopped/paused, just update position
      this.pausedAt = time;
    }

    // Notify all listeners
    this.listeners.forEach(listener => {
      listener.onSeek?.(time);
    });
  }

  /**
   * Toggle play/pause
   */
  toggle() {
    if (this.state === 'playing') {
      this.pause();
    } else {
      this.start();
    }
  }

  /**
   * Register a listener for transport events
   */
  addListener(listener: TransportListener) {
    this.listeners.add(listener);
  }

  /**
   * Unregister a listener
   */
  removeListener(listener: TransportListener) {
    this.listeners.delete(listener);
  }

  /**
   * Start real-time sync loop (for UI updates)
   */
  private startSyncLoop() {
    if (this.syncInterval !== null) return;

    // Update at ~60fps for smooth UI
    this.syncInterval = window.setInterval(() => {
      // Just trigger a state check - consumers use currentTime getter
      // which automatically calculates correct time
    }, 16);
  }

  /**
   * Stop real-time sync loop
   */
  private stopSyncLoop() {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.stopSyncLoop();
    this.listeners.clear();
  }
}
