import { motion } from 'framer-motion';
import { SceneBackground } from './SceneBackground';

interface Props {
  asset: { url: string | null; isVideo: boolean };
}

const STEPS = ['Upload', 'Get Mixed', 'Release'];

export function AnswerScene({ asset }: Props) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <SceneBackground asset={asset} />
      <div className="relative z-10 px-6 text-center max-w-lg space-y-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-3xl sm:text-4xl font-black uppercase leading-tight text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        >
          Mixxclub connects you with real engineers who mix your sound.{' '}
          <span className="text-primary">For real.</span>
        </motion.p>

        <div className="flex items-center justify-center gap-4">
          {STEPS.map((label, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.25, duration: 0.5 }}
              className="text-sm sm:text-base font-bold uppercase text-white/90 tracking-widest"
            >
              {label}
              {i < STEPS.length - 1 && (
                <span className="ml-4 text-primary">→</span>
              )}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}
