import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Music, TrendingUp, Award, Zap, Users, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  target?: number;
  trend?: number;
  color: string;
  delay: number;
}

const StatCard = ({ icon, label, value, target, trend, color, delay }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const progress = target ? (value / target) * 100 : 0;

  // Animated counter
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-background to-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all cursor-pointer group">
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        {/* Glow Effect */}
        <motion.div
          className={`absolute -inset-1 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
        />

        <CardContent className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-br ${color}`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {icon}
            </motion.div>
            
            {trend !== undefined && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`flex items-center gap-1 text-xs font-medium ${
                  trend >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(trend)}%
              </motion.div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <motion.span
                key={displayValue}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold"
              >
                {displayValue}
              </motion.span>
              {target && (
                <span className="text-sm text-muted-foreground">/ {target}</span>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground font-medium">{label}</p>

            {target && (
              <div className="space-y-1">
                <Progress value={progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  {progress.toFixed(0)}% complete
                </p>
              </div>
            )}
          </div>

          {/* Sparkline placeholder */}
          <div className="mt-3 h-8 flex items-end gap-0.5 opacity-30">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-current rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${Math.random() * 100}%` }}
                transition={{ delay: delay + i * 0.05 }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const SmartStatsGrid = () => {
  const stats = [
    {
      icon: <Music className="w-5 h-5 text-white" />,
      label: 'Active Projects',
      value: 12,
      target: 15,
      trend: 23,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Zap className="w-5 h-5 text-white" />,
      label: 'XP Earned',
      value: 2450,
      target: 3000,
      trend: 15,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Users className="w-5 h-5 text-white" />,
      label: 'Collaborations',
      value: 8,
      target: 10,
      trend: 33,
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Award className="w-5 h-5 text-white" />,
      label: 'Achievements',
      value: 24,
      target: 50,
      trend: 9,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} {...stat} delay={index * 0.1} />
      ))}
    </div>
  );
};