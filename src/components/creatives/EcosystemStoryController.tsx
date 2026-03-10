import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { EcosystemSceneId } from '@/hooks/useEcosystemAssets';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ArtistPainScene } from './scenes/ArtistPainScene';
import { EngineerPainScene } from './scenes/EngineerPainScene';
import { ProducerPainScene } from './scenes/ProducerPainScene';
import { FanDisconnectScene } from './scenes/FanDisconnectScene';
import { ConnectionScene } from './scenes/ConnectionScene';
import { EcosystemCycleScene } from './scenes/EcosystemCycleScene';
import { PickPathScene } from './scenes/PickPathScene';

const SCENES: EcosystemSceneId[] = [
  'artist_pain', 'engineer_pain', 'producer_pain', 'fan_disconnect',
  'connection', 'ecosystem', 'cta',
];

const AUTO_MS = 6000;

interface Props {
  assets: Record<EcosystemSceneId, { url: string; isVideo: boolean }>;
  isLoading: boolean;
}

export function EcosystemStoryController({ assets, isLoading }: Props) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const touchStart = useRef<number | null>(null);
  const { triggerHaptic } = useHapticFeedback();
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  const go = useCallback((next: number) => {
    if (next < 0 || next >= SCENES.length) return;
    setIdx(next);
    triggerHaptic('light');
  }, [triggerHaptic]);

  // Auto-advance (pause on CTA scene and reduced motion)
  useEffect(() => {
    if (prefersReducedMotion.current || idx >= SCENES.length - 1) return;
    timerRef.current = setTimeout(() => go(idx + 1), AUTO_MS);
    return () => clearTimeout(timerRef.current);
  }, [idx, go]);

  // Touch / swipe
  const onPointerDown = (e: React.PointerEvent) => { touchStart.current = e.clientY; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (touchStart.current === null) return;
    const dy = touchStart.current - e.clientY;
    touchStart.current = null;
    if (Math.abs(dy) > 40) go(dy > 0 ? idx + 1 : idx - 1);
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go(idx + 1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go(idx - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [idx, go]);

  const sceneComponents: Record<EcosystemSceneId, React.ReactNode> = {
    artist_pain: <ArtistPainScene asset={assets.artist_pain} />,
    engineer_pain: <EngineerPainScene asset={assets.engineer_pain} />,
    producer_pain: <ProducerPainScene asset={assets.producer_pain} />,
    fan_disconnect: <FanDisconnectScene asset={assets.fan_disconnect} />,
    connection: <ConnectionScene asset={assets.connection} />,
    ecosystem: <EcosystemCycleScene asset={assets.ecosystem} />,
    cta: <PickPathScene asset={assets.cta} />,
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black select-none touch-none"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* Scene layer — no AnimatePresence, direct render for reliability */}
      <div className="relative w-full h-full">
        {sceneComponents[SCENES[idx]]}
      </div>

      {/* Stories-style progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex gap-1 px-3 py-2">
        {SCENES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Scene ${i + 1}`}
            className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                i < idx ? 'bg-white w-full' : i === idx ? 'bg-white' : 'bg-transparent w-0'
              }`}
              style={
                i === idx
                  ? { animation: `progressFill ${AUTO_MS}ms linear forwards` }
                  : i < idx
                  ? { width: '100%' }
                  : { width: '0%' }
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}
