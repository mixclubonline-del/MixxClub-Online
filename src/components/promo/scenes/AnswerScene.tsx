import { motion } from 'framer-motion';
import { SceneBackground } from './SceneBackground';
import funnelAnswerBg from '@/assets/promo/funnel-answer-bg.jpg';

interface Props {
  asset: { url: string | null; isVideo: boolean };
}

const PAIN_POINTS = [
  { stat: '$1,200', desc: 'average cost of a single professional mix' },
  { stat: '3 weeks', desc: 'typical turnaround from most engineers' },
  { stat: '0 feedback', desc: 'until you get the final file back' },
  { stat: '72%', desc: 'of artists release unfinished music' },
];

export function AnswerScene({ asset }: Props) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
      <SceneBackground asset={asset} fallbackSrc={funnelAnswerBg} />
      <div className="relative z-10 px-6 text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-8 space-y-6"
        >
          <p className="text-2xl sm:text-3xl font-black uppercase leading-tight text-white tracking-tight">
            The system is{' '}
            <span className="text-primary">broken.</span>
          </p>

          <div className="space-y-3">
            {PAIN_POINTS.map(({ stat, desc }, i) => (
              <motion.div
                key={stat}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.3, duration: 0.5 }}
                className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3 text-left"
              >
                <span className="shrink-0 text-xl sm:text-2xl font-black text-primary min-w-[80px]">
                  {stat}
                </span>
                <span className="text-xs sm:text-sm text-white/60 leading-snug">
                  {desc}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.6 }}
            className="text-sm font-bold text-white/80"
          >
            Mixxclub was built to{' '}
            <span className="text-primary">fix this.</span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
