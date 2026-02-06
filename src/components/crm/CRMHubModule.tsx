import React, { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CRMHubModuleProps {
  hubId: string;
  label: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  delay?: number;
   userType: 'artist' | 'engineer' | 'producer' | 'fan' | 'admin';
}

export const CRMHubModule: React.FC<CRMHubModuleProps> = ({
  hubId,
  label,
  description,
  icon,
  onClick,
  delay = 0,
  userType,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
   const glowColors: Record<string, string> = {
     artist: 'rgba(168, 85, 247, 0.4)',
     engineer: 'rgba(249, 115, 22, 0.4)',
     producer: 'rgba(234, 179, 8, 0.4)',
     fan: 'rgba(236, 72, 153, 0.4)',
     admin: 'rgba(56, 189, 248, 0.4)',
   };
   const glowColor = glowColors[userType] || 'rgba(168, 85, 247, 0.4)';

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative group",
        "backdrop-blur-xl bg-background/30 border border-border/40 rounded-2xl",
        "p-6 text-left transition-all duration-300",
        "hover:bg-background/50 hover:border-primary/50",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      style={{
        boxShadow: isHovered 
          ? `0 20px 40px -10px ${glowColor}, 0 0 60px -20px ${glowColor}`
          : 'none',
      }}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 70%)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
          "bg-primary/10 text-primary",
          "group-hover:bg-primary/20 transition-colors duration-300"
        )}>
          {icon}
        </div>
        
        {/* Label */}
        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
          {label}
        </h3>
        
        {/* Description - shows on hover */}
        <motion.p
          className="text-xs text-muted-foreground"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: isHovered ? 1 : 0.7 }}
        >
          {description}
        </motion.p>
      </div>
      
      {/* Subtle border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-primary/0 pointer-events-none"
        animate={{ 
          borderColor: isHovered ? 'hsl(var(--primary) / 0.5)' : 'transparent'
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};
