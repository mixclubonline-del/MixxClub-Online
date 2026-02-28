import { motion } from 'framer-motion';
import { SceneBackground } from './SceneBackground';

interface Props {
  asset: { url: string | null; isVideo: boolean };
}

export function HookScene({ asset }: Props) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <SceneBackground asset={asset} />
      <div className="relative z-10 px-6 text-center max-w-lg">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-4xl sm:text-5xl font-black uppercase leading-tight text-white tracking-tight"
        >
          87% of independent artists{' '}
          <span className="text-primary">never</span> get their music
          professionally mixed.
        </motion.p>
      </div>
      <motion.img
        src="/mixxclub-logo.png"
        alt="Mixxclub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-16 z-10 h-6 object-contain"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    </div>
  );
}
