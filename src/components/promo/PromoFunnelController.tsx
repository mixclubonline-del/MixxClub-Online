import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PromoSceneId } from '@/hooks/usePromoAssets';
import { HookScene } from './scenes/HookScene';
import { AnswerScene } from './scenes/AnswerScene';
import { ProofScene } from './scenes/ProofScene';
import { CultureScene } from './scenes/CultureScene';
import { SignupScene } from './scenes/SignupScene';

const SCENES: PromoSceneId[] = ['hook', 'answer', 'proof', 'culture', 'cta'];
const AUTO_MS = 8000;

interface Props {
  assets: Record<PromoSceneId, { url: string | null; isVideo: boolean }>;
  isLoading: boolean;
  trackStep: (step: string, data?: Record<string, unknown>) => void;
}

export function PromoFunnelController({ assets, isLoading, trackStep }: Props) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const touchStart = useRef<number | null>(null);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  const go = useCallback((next: number) => {
    if (next < 0 || next >= SCENES.length) return;
    setDirection(next > idx ? 1 : -1);
    setIdx(next);
    if (next > 0 && next < SCENES.length - 1) {
      trackStep(`scene_${next + 1}` as any);
    }
  }, [idx, trackStep]);

  // Auto-advance (pause on last scene and when reduced motion)
  useEffect(() => {
    if (prefersReducedMotion.current || idx >= SCENES.length - 1) return;
    timerRef.current = setTimeout(() => go(idx + 1), AUTO_MS);
    return () => clearTimeout(timerRef.current);
  }, [idx, go]);

  // Touch / swipe handling
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

  const variants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const sceneComponents: Record<PromoSceneId, React.ReactNode> = {
    hook: <HookScene asset={assets.hook} />,
    answer: <AnswerScene asset={assets.answer} />,
    proof: <ProofScene asset={assets.proof} />,
    culture: <CultureScene asset={assets.culture} />,
    cta: <SignupScene asset={assets.cta} trackStep={trackStep} />,
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
      className="fixed inset-0 bg-black overflow-hidden select-none touch-none"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={SCENES[idx]}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: prefersReducedMotion.current ? 0 : 0.4 }}
          className="absolute inset-0"
        >
          {sceneComponents[SCENES[idx]]}
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {SCENES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Scene ${i + 1}`}
            className={`w-3 h-3 rounded-full transition-all duration-300 ring-1 ring-white/30 ${
              i === idx ? 'bg-primary scale-125 ring-primary/50' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
