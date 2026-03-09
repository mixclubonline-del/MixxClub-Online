import { motion } from 'framer-motion';
import { EcosystemSceneBackground } from './EcosystemSceneBackground';

interface Props {
  asset: { url: string; isVideo: boolean };
}

export function ProducerPainScene({ asset }: Props) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <EcosystemSceneBackground
        asset={asset}
        tint="from-amber-900/50 via-amber-900/20"
        fallbackGradient="bg-gradient-to-br from-amber-700 via-amber-900 to-stone-950"
      />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 sm:pb-32 px-6">
        <motion.p
          className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-center leading-tight max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          347 type beats. 12 subscribers.
        </motion.p>
        <motion.p
          className="text-lg sm:text-2xl text-white/70 text-center mt-4 max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          No one's calling.
        </motion.p>
      </div>
    </div>
  );
}
