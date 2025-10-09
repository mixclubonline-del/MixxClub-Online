/**
 * TrackScheduler - Just-in-time audio region scheduling
 * 
 * ARCHITECTURE PATTERN: Scheduler Layer (BandLab/Soundtrap Pattern)
 * 
 * CRITICAL WEB AUDIO API RULE:
 * AudioBufferSourceNode is ONE-TIME-USE ONLY
 * - Once .start() is called, the node cannot be reused
 * - Must create fresh instances for every playback
 * - This is a fundamental Web Audio API limitation
 * 
 * RESPONSIBILITY:
 * - Creates fresh AudioBufferSourceNode instances just-in-time
 * - Calculates precise timing for region-based playback
 * - Handles buffer offset calculations for mid-region playback
 * - Manages source lifecycle (creation → scheduling → cleanup)
 * - Connects sources to AudioEngine's TrackGraph for routing
 * 
 * TIMING CALCULATIONS:
 * When user seeks to 5.0s and region starts at 3.0s:
 * - scheduleTime = audioContext.currentTime + (3.0 - 5.0) = currentTime - 2.0s
 * - offsetInBuffer = 5.0 - 3.0 = 2.0s (start 2 seconds into the buffer)
 * - Result: Audio plays from correct position, perfectly in sync
 * 
 * USAGE:
 * ```typescript
 * const scheduler = new TrackScheduler(audioContext, trackGraphs);
 * const count = scheduler.scheduleAll(currentTime, tracks);
 * // Creates fresh sources for all regions that should be playing
 * ```
 */

import type { Track, AudioRegion } from '@/stores/aiStudioStore';
import type { TrackGraph } from './audioEngine';

interface ScheduledSource {
  source: AudioBufferSourceNode;
  trackId: string;
  regionId: string;
  startTime: number;
  endTime: number;
}

export class TrackScheduler {
  private audioContext: AudioContext;
  private scheduledSources: ScheduledSource[] = [];
  private trackGraphs: Map<string, TrackGraph>;

  constructor(audioContext: AudioContext, trackGraphs: Map<string, TrackGraph>) {
    this.audioContext = audioContext;
    this.trackGraphs = trackGraphs;
  }

  /**
   * Schedule all tracks to play from a given offset time
   * @param offsetSec - Playback start time in seconds
   * @param tracks - Array of tracks with regions
   * @returns Number of sources scheduled
   */
  scheduleAll(offsetSec: number, tracks: Track[]): number {
    // Clear any previously scheduled sources
    this.clearAll();

    const when = this.audioContext.currentTime;
    let scheduledCount = 0;

    console.log('[TrackScheduler] 🎬 Scheduling from', offsetSec.toFixed(3), 's');

    for (const track of tracks) {
      const graph = this.trackGraphs.get(track.id);
      if (!graph) {
        console.warn('[TrackScheduler] No graph found for track:', track.name);
        continue;
      }

      const regions = track.regions || [];
      console.log('[TrackScheduler] Track:', track.name, '| Regions:', regions.length);

      if (regions.length > 0) {
        // Schedule each region
        for (let idx = 0; idx < regions.length; idx++) {
          const region = regions[idx];
          const scheduled = this.scheduleRegion(region, offsetSec, when, graph, idx + 1);
          if (scheduled) scheduledCount++;
        }
      } else if (track.audioBuffer) {
        // Fallback: single-buffer playback (legacy mode)
        const scheduled = this.scheduleTrackBuffer(track, offsetSec, when, graph);
        if (scheduled) scheduledCount++;
      }
    }

    console.log('[TrackScheduler] ✅ Scheduled', scheduledCount, 'sources');
    return scheduledCount;
  }

  /**
   * Schedule a single region
   */
  private scheduleRegion(
    region: AudioRegion,
    offsetSec: number,
    when: number,
    graph: TrackGraph,
    regionNum: number
  ): boolean {
    const regionEnd = region.startTime + region.duration;

    // Skip regions that end before playback offset
    if (regionEnd <= offsetSec) {
      console.log(`  Region ${regionNum}: Skipped (ends at ${regionEnd.toFixed(2)}s, offset is ${offsetSec.toFixed(2)}s)`);
      return false;
    }

    // Calculate timing
    const startInEngine = Math.max(0, region.startTime - offsetSec);
    const offsetInBuffer = Math.max(0, offsetSec - region.startTime) + (region.sourceStartOffset || 0);
    const durationToPlay = region.duration - Math.max(0, offsetSec - region.startTime);

    // Get buffer (prefer region, fallback to track graph buffer if attached)
    const buffer = region.audioBuffer || graph.bufferSource?.buffer || null;
    if (!buffer) {
      console.log(`  Region ${regionNum}: ❌ No buffer available (region and track missing)`);
      return false;
    }

    // Create fresh source (AudioBufferSourceNode is one-time-use only!)
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(graph.input);

    const scheduleTime = when + startInEngine;
    source.start(scheduleTime, offsetInBuffer, durationToPlay);

    // Auto-cleanup when source finishes
    source.onended = () => {
      this.removeSource(source);
    };

    // Track this source
    this.scheduledSources.push({
      source,
      trackId: graph.id,
      regionId: region.id,
      startTime: region.startTime,
      endTime: regionEnd,
    });

    console.log(`  Region ${regionNum}: ✅ Scheduled | start:${region.startTime.toFixed(2)}s | offset:${offsetInBuffer.toFixed(2)}s | duration:${durationToPlay.toFixed(2)}s | scheduleTime:${scheduleTime.toFixed(2)}s`);
    return true;
  }

  /**
   * Schedule a track's single buffer (legacy mode for tracks without regions)
   */
  private scheduleTrackBuffer(
    track: Track,
    offsetSec: number,
    when: number,
    graph: TrackGraph
  ): boolean {
    if (!track.audioBuffer) return false;

    // Create fresh source
    const source = this.audioContext.createBufferSource();
    source.buffer = track.audioBuffer;
    source.connect(graph.input);
    source.start(when, offsetSec);

    // Auto-cleanup when source finishes
    source.onended = () => {
      this.removeSource(source);
    };

    // Track this source
    this.scheduledSources.push({
      source,
      trackId: track.id,
      regionId: 'legacy',
      startTime: 0,
      endTime: track.audioBuffer.duration,
    });

    console.log('  Track: Using single buffer (legacy mode)');
    return true;
  }

  /**
   * Stop all scheduled sources immediately
   */
  stopAll() {
    console.log('[TrackScheduler] ⏸️ Stopping', this.scheduledSources.length, 'sources');
    
    for (const scheduled of this.scheduledSources) {
      try {
        scheduled.source.stop();
        scheduled.source.disconnect();
      } catch (e) {
        // Source may have already stopped naturally
      }
    }

    this.scheduledSources = [];
  }

  /**
   * Clear all scheduled sources (called before scheduling new playback)
   */
  private clearAll() {
    if (this.scheduledSources.length > 0) {
      console.log('[TrackScheduler] 🧹 Clearing', this.scheduledSources.length, 'old sources');
      this.stopAll();
    }
  }

  /**
   * Remove a specific source from tracking
   */
  private removeSource(source: AudioBufferSourceNode) {
    const index = this.scheduledSources.findIndex(s => s.source === source);
    if (index > -1) {
      this.scheduledSources.splice(index, 1);
      console.log('[TrackScheduler] Source auto-removed,', this.scheduledSources.length, 'remaining');
    }
  }

  /**
   * Get count of currently active sources
   */
  getActiveSourceCount(): number {
    return this.scheduledSources.length;
  }

  /**
   * Get active sources for a specific track
   */
  getTrackSources(trackId: string): ScheduledSource[] {
    return this.scheduledSources.filter(s => s.trackId === trackId);
  }
}
