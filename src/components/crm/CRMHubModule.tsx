import React, { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface CRMHubModuleProps {
  hubId: string;
  label: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  delay?: number;
  userType: 'artist' | 'engineer' | 'producer' | 'fan' | 'admin';
}

// Role-specific accent configurations
const ROLE_ACCENTS: Record<string, {
  glow: string;
  gradient: string;
  iconBg: string;
  borderHover: string;
}> = {
  artist: {
    glow: 'rgba(168, 85, 247, 0.35)',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)',
    iconBg: 'bg-purple-500/15 text-purple-400',
    borderHover: 'rgba(168, 85, 247, 0.5)',
  },
  engineer: {
    glow: 'rgba(249, 115, 22, 0.35)',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(234, 88, 12, 0.06) 100%)',
    iconBg: 'bg-orange-500/15 text-orange-400',
    borderHover: 'rgba(249, 115, 22, 0.5)',
  },
  producer: {
    glow: 'rgba(234, 179, 8, 0.35)',
    gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(202, 138, 4, 0.06) 100%)',
    iconBg: 'bg-yellow-500/15 text-yellow-400',
    borderHover: 'rgba(234, 179, 8, 0.5)',
  },
  fan: {
    glow: 'rgba(236, 72, 153, 0.35)',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(219, 39, 119, 0.06) 100%)',
    iconBg: 'bg-pink-500/15 text-pink-400',
    borderHover: 'rgba(236, 72, 153, 0.5)',
  },
  admin: {
    glow: 'rgba(56, 189, 248, 0.35)',
    gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(14, 165, 233, 0.06) 100%)',
    iconBg: 'bg-cyan-500/15 text-cyan-400',
    borderHover: 'rgba(56, 189, 248, 0.5)',
  },
};

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
  const accent = ROLE_ACCENTS[userType] || ROLE_ACCENTS.artist;

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative group overflow-hidden",
        "backdrop-blur-2xl rounded-2xl",
        "p-5 text-left transition-all duration-500",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
      )}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={{
        background: isHovered ? accent.gradient : 'rgba(var(--background-rgb, 0, 0, 0), 0.35)',
        border: `1px solid ${isHovered ? accent.borderHover : 'rgba(255, 255, 255, 0.08)'}`,
        boxShadow: isHovered
          ? `0 20px 50px -10px ${accent.glow}, 0 0 80px -30px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
          : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px -8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top-edge highlight line */}
      <div 
        className="absolute top-0 left-4 right-4 h-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent.borderHover}, transparent)`,
          opacity: isHovered ? 1 : 0.3,
        }}
      />

      {/* Frosted inner glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${accent.glow} 0%, transparent 60%)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full min-h-[90px]">
        {/* Icon with glass container */}
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center mb-3",
          "backdrop-blur-md border border-white/10",
          "transition-all duration-500",
          accent.iconBg,
          isHovered && "scale-110 shadow-lg"
        )}
        style={{
          boxShadow: isHovered ? `0 8px 24px -4px ${accent.glow}` : 'none',
        }}
        >
          {icon}
        </div>
        
        {/* Label */}
        <h3 className="font-semibold text-foreground mb-0.5 text-sm transition-colors duration-300 group-hover:text-white">
          {label}
        </h3>
        
        {/* Description */}
        <p className={cn(
          "text-xs text-muted-foreground transition-all duration-300",
          isHovered ? "opacity-100" : "opacity-60"
        )}>
          {description}
        </p>

        {/* Hover arrow indicator */}
        <motion.div 
          className="absolute bottom-5 right-5"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: isHovered ? 0.7 : 0, x: isHovered ? 0 : -8 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className="h-4 w-4 text-foreground/60" />
        </motion.div>
      </div>
      
      {/* Corner accent dot */}
      <motion.div
        className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: accent.borderHover }}
        animate={{
          opacity: isHovered ? [0.4, 1, 0.4] : 0.3,
          scale: isHovered ? [1, 1.3, 1] : 1,
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.button>
  );
};
