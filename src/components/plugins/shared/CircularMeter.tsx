import { motion } from 'framer-motion';

interface CircularMeterProps {
  value: number;
  max?: number;
  size?: number;
  label?: string;
  unit?: string;
  className?: string;
}

export const CircularMeter = ({ 
  value, 
  max = 100, 
  size = 120,
  label = '',
  unit = '',
  className = '' 
}: CircularMeterProps) => {
  const percentage = Math.min(100, (value / max) * 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <defs>
            <linearGradient id="circular-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF70D0" />
              <stop offset="50%" stopColor="#C5A3FF" />
              <stop offset="100%" stopColor="#70E6FF" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            fill="none"
            stroke="rgba(197,163,255,0.1)"
            strokeWidth="8"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            fill="none"
            stroke="url(#circular-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(197,163,255,0.6))',
            }}
          />
        </svg>
        
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-3xl font-bold text-white">
              {value.toFixed(1)}
            </div>
            {unit && (
              <div className="text-xs text-mixx-cyan uppercase tracking-wider">
                {unit}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      {label && (
        <div className="text-sm text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      )}
    </div>
  );
};
