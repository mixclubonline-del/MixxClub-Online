// Cinematic urban+studio backgrounds v2
import { motion } from 'framer-motion';
import { SceneBackground } from './SceneBackground';
import funnelCultureBg from '@/assets/promo/funnel-culture-bg.jpg';

interface Props {
  asset: { url: string | null; isVideo: boolean };
}

const MANIFESTO_LINES = [
  { text: 'Artists', rest: 'who never got a fair shake.' },
  { text: 'Producers', rest: 'tired of the type-beat grind.' },
  { text: 'Engineers', rest: 'with gear collecting dust.' },
];

export function CultureScene({ asset }: Props) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
      <SceneBackground asset={asset} fallbackSrc={funnelCultureBg} />
      <div className="relative z-10 px-6 text-center max-w-lg">
        <div className="rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-8 space-y-8">
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl sm:text-4xl font-black uppercase leading-tight text-white tracking-tight"
          >
            For us. By us.{' '}
            <span className="text-primary">From the ground up.</span>
          </motion.h2>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-base sm:text-lg text-white/70 font-medium"
          >
            For the first time — not from a boardroom.{' '}
            <span className="text-white">From the booth.</span>
          </motion.p>

          {/* Manifesto lines */}
          <div className="space-y-4 text-left">
            {MANIFESTO_LINES.map((line, i) => (
              <motion.p
                key={line.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + i * 0.3, duration: 0.5 }}
                className="text-sm sm:text-base text-white/80"
              >
                <span className="font-black text-primary uppercase tracking-wide">
                  {line.text}
                </span>{' '}
                {line.rest}
              </motion.p>
            ))}

            {/* Final line */}
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 + MANIFESTO_LINES.length * 0.3, duration: 0.5 }}
              className="text-sm sm:text-base text-white/80"
            >
              <span className="font-black text-primary uppercase tracking-wide">
                Hip-hop's future.
              </span>{' '}
              Finally, in our hands.
            </motion.p>
          </div>

          {/* Closing */}
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.4, duration: 0.6, type: 'spring' }}
            className="text-2xl sm:text-3xl font-black uppercase text-primary tracking-tight"
          >
            This is ours.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
