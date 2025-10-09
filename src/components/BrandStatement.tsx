import { motion } from 'framer-motion';

export const BrandStatement = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-8 right-8 z-50 pointer-events-none"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent-blue to-primary blur-2xl opacity-50 animate-pulse" />
        <div className="relative px-6 py-3 bg-black/90 backdrop-blur-xl border border-primary/30 rounded-full">
          <span className="font-black text-2xl tracking-widest bg-gradient-to-r from-primary via-accent-blue to-primary bg-clip-text text-transparent">
            MIXXCLUB
          </span>
        </div>
      </div>
    </motion.div>
  );
};
