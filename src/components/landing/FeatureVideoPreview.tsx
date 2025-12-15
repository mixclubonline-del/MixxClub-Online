import { motion } from 'framer-motion';
import { useState } from 'react';
import { Play, Zap, Users, DollarSign, Wand2 } from 'lucide-react';

interface FeaturePreview {
  id: string;
  title: string;
  description: string;
  icon: typeof Zap;
  color: string;
  animation: 'mastering' | 'matching' | 'earning' | 'collaboration';
}

const features: FeaturePreview[] = [
  {
    id: 'mastering',
    title: 'AI Mastering',
    description: 'Upload → Analyze → Master in seconds',
    icon: Wand2,
    color: 'hsl(270 100% 60%)',
    animation: 'mastering'
  },
  {
    id: 'matching',
    title: 'Smart Matching',
    description: 'AI finds your perfect engineer',
    icon: Users,
    color: 'hsl(210 100% 60%)',
    animation: 'matching'
  },
  {
    id: 'earning',
    title: 'Revenue Streams',
    description: '10 ways to monetize your talent',
    icon: DollarSign,
    color: 'hsl(145 100% 50%)',
    animation: 'earning'
  },
  {
    id: 'collab',
    title: 'Live Collaboration',
    description: 'Work together in real-time',
    icon: Zap,
    color: 'hsl(185 100% 55%)',
    animation: 'collaboration'
  }
];

const AnimatedPreview = ({ type, isActive }: { type: string; isActive: boolean }) => {
  if (!isActive) return null;

  switch (type) {
    case 'mastering':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Waveform animation */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))] rounded-full"
                animate={{
                  height: [10, 30 + Math.sin(i * 0.5) * 20, 10],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.05
                }}
              />
            ))}
          </div>
          {/* Processing indicator */}
          <motion.div
            className="absolute bottom-4 left-4 right-4 h-1 bg-[hsl(var(--muted))] rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))]"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </div>
      );

    case 'matching':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Profile cards matching */}
          <div className="relative w-full h-full">
            <motion.div
              className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-20 rounded-lg glass-mid border border-[hsl(var(--border))]"
              animate={{ x: [0, 30, 0], opacity: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] mx-auto mt-2" />
            </motion.div>
            
            <motion.div
              className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-20 rounded-lg glass-mid border border-[hsl(var(--border))]"
              animate={{ x: [0, -30, 0], opacity: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(210_100%_60%)] mx-auto mt-2" />
            </motion.div>

            {/* Connection spark */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-8 h-8 text-[hsl(var(--primary))]" />
            </motion.div>
          </div>
        </div>
      );

    case 'earning':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Revenue ticker */}
          <div className="text-center">
            <motion.div
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(145_100%_50%)] to-[hsl(185_100%_55%)]"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              $
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0, 1] }}
                    transition={{ delay: i * 0.3, duration: 0.3 }}
                  >
                    {Math.floor(Math.random() * 10)}
                  </motion.span>
                ))}
              </motion.span>
            </motion.div>
            <motion.div
              className="text-xs text-muted-foreground mt-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Streaming revenue this month
            </motion.div>
          </div>
        </div>
      );

    case 'collaboration':
      return (
        <div className="absolute inset-0 flex items-center justify-center gap-4 px-4">
          {/* Split screen view */}
          <motion.div
            className="flex-1 h-24 rounded-lg glass-mid border border-[hsl(var(--primary)/0.3)] overflow-hidden"
            animate={{ borderColor: ['hsl(var(--primary) / 0.3)', 'hsl(var(--primary) / 0.8)', 'hsl(var(--primary) / 0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="p-2 text-xs text-muted-foreground">Artist View</div>
            <div className="flex gap-0.5 px-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-[hsl(var(--primary))] rounded-full"
                  animate={{ height: [5, 15, 5] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          </motion.div>
          
          <motion.div
            className="flex-1 h-24 rounded-lg glass-mid border border-[hsl(var(--accent-cyan)/0.3)] overflow-hidden"
            animate={{ borderColor: ['hsl(var(--accent-cyan) / 0.3)', 'hsl(var(--accent-cyan) / 0.8)', 'hsl(var(--accent-cyan) / 0.3)'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <div className="p-2 text-xs text-muted-foreground">Engineer View</div>
            <div className="flex gap-0.5 px-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-[hsl(var(--accent-cyan))] rounded-full"
                  animate={{ height: [5, 15, 5] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 + 0.1 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      );

    default:
      return null;
  }
};

export const FeatureVideoPreview = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Watch The Magic Happen
          </h2>
          <p className="text-xl text-muted-foreground">Hover to preview each feature in action</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setActiveFeature(feature.id)}
              onMouseLeave={() => setActiveFeature(null)}
              className="relative group cursor-pointer"
            >
              <motion.div
                className="aspect-video rounded-2xl glass-near border border-[hsl(var(--glass-border))] overflow-hidden transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  borderColor: feature.color,
                  boxShadow: `0 0 40px ${feature.color}40`
                }}
              >
                {/* Preview animation */}
                <AnimatedPreview 
                  type={feature.animation} 
                  isActive={activeFeature === feature.id}
                />

                {/* Static state */}
                {activeFeature !== feature.id && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-2"
                      style={{ background: `${feature.color}20` }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                    </motion.div>
                    <Play className="w-5 h-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </motion.div>

              <div className="mt-4 text-center">
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
