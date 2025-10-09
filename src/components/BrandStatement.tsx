import { motion } from 'framer-motion';
import { MixxclubLogo } from '@/components/brand/MixxclubLogo';

export const BrandStatement = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-8 right-8 z-50 pointer-events-none"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-mixx-glow blur-3xl opacity-60 animate-pulse" />
        <div className="relative px-6 py-3 bg-black/90 backdrop-blur-xl border border-mixx-cyan/30 rounded-full shadow-mixx-glow">
          <MixxclubLogo variant="wordmark-only" size="sm" animated={false} />
        </div>
      </div>
    </motion.div>
  );
};
