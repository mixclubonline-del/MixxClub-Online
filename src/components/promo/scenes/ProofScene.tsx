import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SceneBackground } from './SceneBackground';

interface Props {
  asset: { url: string | null; isVideo: boolean };
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame: number;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setCount(Math.floor(t * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return <>{count.toLocaleString()}{suffix}</>;
}

const STATS = [
  { value: 10000, suffix: '+', label: 'Projects' },
  { value: 500, suffix: '+', label: 'Engineers' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
];

export function ProofScene({ asset }: Props) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <SceneBackground asset={asset} />
      <div className="relative z-10 px-6 text-center max-w-lg space-y-10">
        <div className="flex items-center justify-center gap-8 sm:gap-12">
          {STATS.map(({ value, suffix, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.2, duration: 0.6 }}
              className="text-center"
            >
              <p className="text-3xl sm:text-4xl font-black text-white tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                <AnimatedCounter target={value} suffix={suffix} />
              </p>
              <p className="text-xs sm:text-sm uppercase tracking-widest text-white/70 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mx-auto max-w-sm rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-5"
        >
          <p className="text-sm text-white/90 italic leading-relaxed">
            "I uploaded my track on Monday and got a radio-ready mix back by Thursday. Mixxclub changed my whole process."
          </p>
          <p className="text-xs text-white/50 mt-3 uppercase tracking-wider">— Independent Artist, Atlanta</p>
        </motion.div>
      </div>
    </div>
  );
}
