import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Zap, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REVENUE_STREAMS = [
  { name: 'Mixing Services', icon: '🎛️', amount: 2450 },
  { name: 'Mastering', icon: '💿', amount: 1890 },
  { name: 'Stem Sales', icon: '🎵', amount: 780 },
  { name: 'Beat Licensing', icon: '🔊', amount: 1250 },
  { name: 'Referrals', icon: '👥', amount: 340 },
  { name: 'Courses', icon: '📚', amount: 920 },
];

export const RevenueStreamsDemo = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleStreams, setVisibleStreams] = useState<number[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const startDemo = () => {
    setIsAnimating(true);
    setVisibleStreams([]);
    setTotalRevenue(0);
  };

  useEffect(() => {
    if (isAnimating && visibleStreams.length < REVENUE_STREAMS.length) {
      const timer = setTimeout(() => {
        const newIndex = visibleStreams.length;
        setVisibleStreams(prev => [...prev, newIndex]);
        setTotalRevenue(prev => prev + REVENUE_STREAMS[newIndex].amount);
      }, 400);
      return () => clearTimeout(timer);
    } else if (visibleStreams.length >= REVENUE_STREAMS.length) {
      setIsAnimating(false);
    }
  }, [isAnimating, visibleStreams]);

  const reset = () => {
    setVisibleStreams([]);
    setTotalRevenue(0);
    setIsAnimating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-near rounded-2xl p-6 border border-[hsl(var(--glass-border))] hover:border-[hsl(var(--glass-border-glow))] transition-all overflow-hidden relative"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">10 Revenue Streams</h3>
          <p className="text-sm text-muted-foreground">Multiple ways to earn</p>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[220px]">
        {visibleStreams.length === 0 && !isAnimating ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full py-8"
          >
            <motion.div
              className="relative w-24 h-24 mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
              {/* Floating dollar signs */}
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="absolute text-xl"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [-10, -40],
                    x: [0, (i - 1) * 20],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                  }}
                  style={{ left: '50%', top: '50%' }}
                >
                  💰
                </motion.div>
              ))}
            </motion.div>
            <Button onClick={startDemo} className="glass-pill">
              <Play className="w-4 h-4 mr-2" />
              See Revenue Flow
            </Button>
          </motion.div>
        ) : (
          <div>
            {/* Total Revenue Counter */}
            <motion.div
              className="text-center mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="text-sm text-muted-foreground">This Month</div>
              <motion.div
                className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500"
                key={totalRevenue}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                ${totalRevenue.toLocaleString()}
              </motion.div>
            </motion.div>

            {/* Revenue streams list */}
            <div className="grid grid-cols-2 gap-2">
              {REVENUE_STREAMS.map((stream, index) => (
                <motion.div
                  key={stream.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: visibleStreams.includes(index) ? 1 : 0.3,
                    scale: visibleStreams.includes(index) ? 1 : 0.9,
                  }}
                  className={`glass-pill rounded-lg p-2 flex items-center gap-2 ${
                    visibleStreams.includes(index) ? '' : 'opacity-30'
                  }`}
                >
                  <span className="text-lg">{stream.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">{stream.name}</div>
                    {visibleStreams.includes(index) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-bold text-green-500"
                      >
                        +${stream.amount}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Complete state */}
            {!isAnimating && visibleStreams.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4"
              >
                <div className="flex items-center justify-center gap-2 text-green-500 mb-3">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">All streams active!</span>
                </div>
                <Button onClick={reset} variant="outline" className="w-full glass-pill text-sm">
                  Watch Again
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
