import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreamGifts, StreamGift } from '@/hooks/useLiveStream';

interface GiftAnimationProps {
  streamId: string;
}

const FloatAnimation: React.FC<{ gift: StreamGift }> = ({ gift }) => (
  <motion.div
    initial={{ opacity: 0, y: 100, x: Math.random() * 200 - 100 }}
    animate={{ opacity: 1, y: -200 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 2, ease: 'easeOut' }}
    className="absolute bottom-20 left-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg"
  >
    <span className="text-2xl">{gift.gift?.emoji}</span>
    {gift.quantity > 1 && (
      <span className="font-bold text-primary">x{gift.quantity}</span>
    )}
    <span className="text-sm font-medium">{gift.sender?.full_name}</span>
  </motion.div>
);

const BurstAnimation: React.FC<{ gift: StreamGift }> = ({ gift }) => {
  const emojis = Array.from({ length: 8 });

  return (
    <>
      {emojis.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 2,
            x: Math.cos((i / 8) * Math.PI * 2) * 150,
            y: Math.sin((i / 8) * Math.PI * 2) * 150 - 100,
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 text-4xl pointer-events-none"
        >
          {gift.gift?.emoji}
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute left-1/2 top-1/3 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-center"
      >
        <div className="text-3xl mb-1">{gift.gift?.emoji}</div>
        <div className="font-bold">{gift.sender?.full_name}</div>
        <div className="text-sm text-muted-foreground">
          sent {gift.quantity}x {gift.gift?.name}!
        </div>
      </motion.div>
    </>
  );
};

const RainAnimation: React.FC<{ gift: StreamGift }> = ({ gift }) => {
  const drops = Array.from({ length: 20 });

  return (
    <>
      {drops.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, y: -50, x: Math.random() * window.innerWidth }}
          animate={{ opacity: 0, y: window.innerHeight }}
          transition={{
            duration: 2 + Math.random(),
            delay: Math.random() * 0.5,
            ease: 'linear',
          }}
          className="absolute top-0 text-3xl pointer-events-none"
        >
          {gift.gift?.emoji}
        </motion.div>
      ))}
    </>
  );
};

const SpecialAnimation: React.FC<{ gift: StreamGift }> = ({ gift }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.5 }}
    transition={{ duration: 0.5, type: 'spring' }}
    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-sm"
  >
    <div className="text-center">
      <motion.div
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: 3 }}
        className="text-8xl mb-4"
      >
        {gift.gift?.emoji}
      </motion.div>
      <div className="text-2xl font-bold text-foreground">
        {gift.sender?.full_name}
      </div>
      <div className="text-lg text-muted-foreground">
        sent {gift.quantity}x {gift.gift?.name}!
      </div>
      {gift.message && (
        <div className="mt-2 text-lg italic">"{gift.message}"</div>
      )}
    </div>
  </motion.div>
);

export const GiftAnimation: React.FC<GiftAnimationProps> = ({ streamId }) => {
  const gifts = useStreamGifts(streamId);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {gifts.map((gift) => {
          const animationType = gift.gift?.animation_type || 'float';

          switch (animationType) {
            case 'burst':
              return <BurstAnimation key={gift.id} gift={gift} />;
            case 'rain':
              return <RainAnimation key={gift.id} gift={gift} />;
            case 'special':
              return <SpecialAnimation key={gift.id} gift={gift} />;
            default:
              return <FloatAnimation key={gift.id} gift={gift} />;
          }
        })}
      </AnimatePresence>
    </div>
  );
};

export default GiftAnimation;
