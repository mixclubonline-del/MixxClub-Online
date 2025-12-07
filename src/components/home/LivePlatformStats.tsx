import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TrendingUp, Users, Music, DollarSign } from 'lucide-react';
import { useDemoData } from '@/hooks/useDemoData';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 2 }: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: 'easeOut',
    });

    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, motionValue, rounded, duration]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

export const LivePlatformStats = () => {
  const { data, isLoading } = useDemoData('stats');
  const stats = data?.stats;

  const statItems = [
    {
      icon: Users,
      label: 'Active Engineers',
      value: stats?.totalEngineers || 247,
      color: 'from-primary to-purple-400',
      suffix: '+'
    },
    {
      icon: Music,
      label: 'Active Sessions',
      value: stats?.activeSession || 18,
      color: 'from-green-400 to-emerald-500',
      suffix: ''
    },
    {
      icon: TrendingUp,
      label: 'Projects Completed',
      value: stats?.projectsCompleted || 3847,
      color: 'from-blue-400 to-cyan-500',
      suffix: '+'
    },
    {
      icon: DollarSign,
      label: 'Total Earned',
      value: stats?.totalEarnings || 892450,
      color: 'from-yellow-400 to-orange-500',
      prefix: '$',
      suffix: ''
    }
  ];

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      
      <div className="container relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {isLoading ? (
                  <div className="h-10 w-24 bg-muted/30 rounded animate-pulse mx-auto" />
                ) : (
                  <AnimatedCounter 
                    value={stat.value} 
                    prefix={stat.prefix || ''}
                    suffix={stat.suffix}
                  />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
