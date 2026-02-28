import { motion } from 'framer-motion';
import { SceneBackground } from './SceneBackground';

interface Props {
  asset: { url: string | null; isVideo: boolean };
}

const ROLES = ['Artist', 'Producer', 'Engineer', 'Fan'];

export function CultureScene({ asset }: Props) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
      <SceneBackground asset={asset} />
      <div className="relative z-10 px-6 text-center max-w-lg">
        <div className="rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-8 space-y-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-3xl sm:text-4xl font-black uppercase leading-tight text-white tracking-tight"
          >
            Whether you make beats, mix tracks, or just love music —{' '}
            <span className="text-primary">there's a place for you.</span>
          </motion.p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {ROLES.map((role, i) => (
              <motion.span
                key={role}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.15, type: 'spring', stiffness: 200 }}
                className="text-lg sm:text-xl font-black uppercase text-white/90 tracking-widest
                  px-4 py-2 rounded-full border border-white/20 bg-white/10"
              >
                {role}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
