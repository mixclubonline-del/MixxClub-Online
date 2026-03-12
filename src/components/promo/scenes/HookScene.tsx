import { motion } from 'framer-motion';
import { SceneBackground } from './SceneBackground';
import funnelHookBg from '@/assets/promo/funnel-hook-bg.jpg';

interface Props {
  asset: { url: string | null; isVideo: boolean };
}

export function HookScene({ asset }: Props) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
      <SceneBackground asset={asset} fallbackSrc={funnelHookBg} />
      <div className="relative z-10 px-6 text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-8"
        >
          <p className="text-4xl sm:text-5xl font-black uppercase leading-tight text-white tracking-tight">
            87% of independent artists{' '}
            <span className="text-primary">never</span> get their music
            professionally mixed.
          </p>
        </motion.div>
      </div>
      <motion.img
        src="/mixxclub-logo.png"
        alt="Mixxclub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-16 z-10 h-6 object-contain"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    </div>
  );
}
