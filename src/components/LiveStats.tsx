import { useEffect, useState } from 'react';
import { Activity, Zap, Brain, Users } from 'lucide-react';

interface StatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  suffix?: string;
  delay?: number;
}

const AnimatedStat = ({ icon, value, label, suffix = '', delay = 0 }: StatProps) => {
  const [displayValue, setDisplayValue] = useState('0');
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
      const duration = 2000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current).toString());
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-primary">
        {displayValue}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

export const LiveStats = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
      <AnimatedStat
        icon={<Brain className="w-6 h-6 text-primary" />}
        value="15"
        label="AI Models Active"
        delay={0}
      />
      <AnimatedStat
        icon={<Zap className="w-6 h-6 text-primary" />}
        value="2.1"
        suffix="s"
        label="Avg Processing"
        delay={200}
      />
      <AnimatedStat
        icon={<Activity className="w-6 h-6 text-primary" />}
        value="847"
        label="Tracks Mixed Today"
        delay={400}
      />
      <AnimatedStat
        icon={<Users className="w-6 h-6 text-primary" />}
        value="3200"
        suffix="+"
        label="Active Users"
        delay={600}
      />
    </div>
  );
};
