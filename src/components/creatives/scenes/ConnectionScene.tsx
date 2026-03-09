import { motion } from 'framer-motion';
import { EcosystemSceneBackground } from './EcosystemSceneBackground';

interface Props {
  asset: { url: string; isVideo: boolean };
}

export function ConnectionScene({ asset }: Props) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <EcosystemSceneBackground
        asset={asset}
        fallbackGradient="bg-gradient-to-br from-purple-700 via-cyan-800 to-amber-900"
      />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
        <motion.p
          className="text-4xl sm:text-6xl lg:text-8xl font-black text-white text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          What if everyone ate?
        </motion.p>
      </div>
    </div>
  );
}
