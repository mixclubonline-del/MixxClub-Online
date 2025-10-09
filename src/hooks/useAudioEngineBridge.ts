"use client";

import { useEffect, useRef } from "react";
import { useAIStudioStore } from "@/stores/aiStudioStore";
import { audioEngine } from "@/services/audioEngine";

/**
 * Bridges Zustand store <-> audioEngine graph.
 * - Creates/removes engine tracks when store.tracks change
 * - Applies gain/pan/sends/effects
 * - Streams analyser values back into store (track peak/rms + master)
 * - Controls transport (play/pause) and master volume
 *
 * Usage:
 *   In ProStudio.tsx (top-level):
 *     import { useAudioEngineBridge } from '@/hooks/useAudioEngineBridge';
 *     ...
 *     useAudioEngineBridge();
 */
export function useAudioEngineBridge() {
  // ===== Store selectors (keep them granular to avoid rerenders) =====
  const tracks = useAIStudioStore((s) => s.tracks);
  const isPlaying = useAIStudioStore((s) => s.isPlaying);
  const masterVolume = useAIStudioStore((s) => s.masterVolume);
  const setPlaying = useAIStudioStore((s) => s.setPlaying);
  const updateTrack = useAIStudioStore((s) => s.updateTrack);
  const updateMasterLevels = useAIStudioStore((s) => s.updateMasterLevels);

  // Engine track existence map to avoid recreation churn
  const attachedRef = useRef<Set<string>>(new Set());

  // ===== One-time engine resume =====
  useEffect(() => {
    audioEngine.resume().catch(() => void 0);
  }, []);

  // ===== Mirror master volume into engine =====
  useEffect(() => {
    audioEngine.setMasterGain(masterVolume ?? 1);
  }, [masterVolume]);

  // ===== Create / remove tracks in engine when store.tracks changes =====
  useEffect(() => {
    const existing = attachedRef.current;

    // Add any new tracks not yet attached
    for (const t of tracks) {
      if (!existing.has(t.id)) {
        const g = audioEngine.createTrack({
          id: t.id,
          name: t.name,
          buffer: t.audioBuffer ?? undefined,
          groupId: t.busGroupId,
        });

        // Initial params
        audioEngine.setTrackGain(g.id, t.volume ?? 0.85);
        audioEngine.setTrackPan(g.id, t.pan ?? 0);

        // Sends
        if (t.sends) {
          for (const [busId, send] of Object.entries(t.sends)) {
            audioEngine.setSendLevel(g.id, busId, send.amount ?? 0);
          }
        }

        // Effects (insert chain)
        (t.effects ?? [])
          .sort((a, b) => (a.rackPosition ?? 0) - (b.rackPosition ?? 0))
          .forEach((fx) => {
            audioEngine.addPlugin(g.id, {
              type: mapEffectTypeToPlugin(fx.type),
              bypass: !fx.enabled,
            });
          });

        existing.add(t.id);
      }
    }

    // Remove engine tracks that no longer exist in store
    for (const id of Array.from(existing)) {
      if (!tracks.find((t) => t.id === id)) {
        audioEngine.removeTrack(id);
        existing.delete(id);
      }
    }
  }, [tracks]);

  // ===== Incremental param sync (gain/pan/sends/effects/buffer changes) =====
  useEffect(() => {
    for (const t of tracks) {
      // Gain & Pan
      audioEngine.setTrackGain(t.id, clamp(t.volume ?? 0.85, 0, 1.5));
      audioEngine.setTrackPan(t.id, clamp(t.pan ?? 0, -1, 1));

      // Sends
      if (t.sends) {
        for (const [busId, send] of Object.entries(t.sends)) {
          audioEngine.setSendLevel(t.id, busId, clamp(send.amount ?? 0, 0, 1));
        }
      }

      // Buffer changes (e.g., user imported/replaced audio)
      if (t.audioBuffer) {
        const graph = audioEngine.tracks.get(t.id);
        if (graph?.bufferSource?.buffer !== t.audioBuffer) {
          audioEngine.attachBufferSource(graph!, t.audioBuffer);
        }
      }

      // Effects (simple reconcile: ensure count & bypass flags align)
      // NOTE: For full fidelity, you can diff by effect.id → add/remove/move specific plugins.
      const graph = audioEngine.tracks.get(t.id);
      if (graph) {
        // If counts mismatch, rebuild plugins (conservative approach)
        const storeActiveCount = (t.effects ?? []).filter((e) => e.enabled).length;
        const engineCount = (graph.plugins ?? []).length;
        if (storeActiveCount !== engineCount) {
          // Remove all plugins then re-add in order
          for (const p of [...graph.plugins]) {
            audioEngine.removePlugin(t.id, p.id);
          }
          (t.effects ?? [])
            .sort((a, b) => (a.rackPosition ?? 0) - (b.rackPosition ?? 0))
            .forEach((fx) => {
              audioEngine.addPlugin(t.id, {
                type: mapEffectTypeToPlugin(fx.type),
                bypass: !fx.enabled,
              });
            });
        } else {
          // Sync bypass flags only
          // (Assumes order/rackPosition stable.)
          const enabledList = (t.effects ?? [])
            .sort((a, b) => (a.rackPosition ?? 0) - (b.rackPosition ?? 0))
            .map((fx) => fx.enabled);

          graph.plugins.forEach((p, i) => {
            const shouldBypass = enabledList[i] === false;
            if (p.bypass !== shouldBypass) {
              audioEngine.setPluginBypass(t.id, p.id, shouldBypass);
            }
          });
        }
      }
    }
  }, [tracks]);

  // ===== Transport: follow store.isPlaying =====
  useEffect(() => {
    (async () => {
      await audioEngine.resume();
      if (isPlaying) {
        audioEngine.play();
      } else {
        audioEngine.pause();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // ===== RAF Metering Loop (per-track + master) =====
  useEffect(() => {
    let raf = 0;

    const tmpTime = new Uint8Array(1024);

    const loop = () => {
      // Per-track post analyser → update peak/rms into store
      for (const t of tracks) {
        const a = audioEngine.getTrackPostAnalyser(t.id);
        if (!a) continue;

        const size = Math.min(tmpTime.length, a.fftSize);
        const buf = size === tmpTime.length ? tmpTime : new Uint8Array(a.fftSize);
        a.getByteTimeDomainData(buf);

        // Rough peak/rms
        let max = 0;
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          const av = Math.abs(v);
          if (av > max) max = av;
          sum += v * v;
        }
        const rmsLin = Math.sqrt(sum / buf.length);
        const pkDb = linToDb(max);
        const rmDb = linToDb(rmsLin);

        // Write back to store (debounced by RAF rate)
        updateTrack(t.id, {
          peakLevel: pkDb,
          rmsLevel: rmDb,
        });
      }

      // Master analyser → updateMasterLevels(peak)
      const master = audioEngine.getMasterAnalyser();
      if (master) {
        const mbuf = new Uint8Array(master.fftSize);
        master.getByteTimeDomainData(mbuf);
        let mmax = 0;
        for (let i = 0; i < mbuf.length; i++) {
          const v = Math.abs((mbuf[i] - 128) / 128);
          if (v > mmax) mmax = v;
        }
        updateMasterLevels(linToDb(mmax));
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.length]);

  // ===== Keep store.isPlaying honest if user agent suspends/resumes context =====
  useEffect(() => {
    const onState = () => {
      // If the context was suspended externally, reflect that
      if (audioEngine.ctx.state !== "running" && isPlaying) {
        setPlaying(false);
      }
    };
    audioEngine.ctx.addEventListener?.("statechange", onState as any);
    return () => {
      audioEngine.ctx.removeEventListener?.("statechange", onState as any);
    };
  }, [isPlaying, setPlaying]);
}

/* ============================
   Helpers
   ============================ */

function mapEffectTypeToPlugin(t: string) {
  // Store → Engine type mapping
  // store: 'eq' | 'compressor' | 'reverb' | 'delay' | 'limiter' | 'saturator' | 'mixxtune'
  switch (t) {
    case "eq":
      return "EQ";
    case "compressor":
      return "COMP";
    case "reverb":
      return "REV";
    case "delay":
      return "DLY";
    case "limiter":
      return "OTHER";
    case "saturator":
      return "SAT";
    case "mixxtune":
      return "OTHER";
    default:
      return "OTHER";
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function linToDb(x: number) {
  const y = Math.max(x, 1e-6);
  return 20 * Math.log10(y);
}
