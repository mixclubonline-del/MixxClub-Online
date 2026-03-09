import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { EcosystemSceneBackground } from './EcosystemSceneBackground';

interface Props {
  asset: { url: string; isVideo: boolean };
}

const PATHS = [
  { label: 'Artist', to: '/for-artists', color: 'from-purple-500 to-purple-700', glow: 'shadow-purple-500/40' },
  { label: 'Engineer', to: '/for-engineers', color: 'from-cyan-500 to-cyan-700', glow: 'shadow-cyan-500/40' },
  { label: 'Producer', to: '/for-producers', color: 'from-amber-500 to-amber-700', glow: 'shadow-amber-500/40' },
  { label: 'Fan', to: '/for-fans', color: 'from-pink-500 to-pink-700', glow: 'shadow-pink-500/40' },
];

export function PickPathScene({ asset }: Props) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <EcosystemSceneBackground
        asset={asset}
        fallbackGradient="bg-gradient-to-br from-gray-950 via-purple-950/40 to-black"
      />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
        <motion.p
          className="text-2xl sm:text-4xl font-bold text-white text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Pick your path.
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl w-full">
          {PATHS.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
            >
              <Link
                to={p.to}
                className={`block w-full aspect-[3/4] rounded-2xl bg-gradient-to-b ${p.color} ${p.glow} shadow-2xl flex items-end justify-center p-4 hover:scale-105 transition-transform duration-300`}
              >
                <span className="text-white font-bold text-lg sm:text-xl">{p.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Link
            to="/auth?signup=true"
            className="text-white/60 hover:text-white underline underline-offset-4 text-sm sm:text-base transition-colors"
          >
            Or create your account →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
