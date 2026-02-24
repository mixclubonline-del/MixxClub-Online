import React, { ReactNode } from 'react';
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

export const CRMHubModule: React.FC<CRMHubModuleProps> = ({
  hubId,
  label,
  description,
  icon,
  onClick,
  delay = 0,
  userType,
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "mg-panel relative group text-left",
        "p-5 focus:outline-none focus:ring-2 focus:ring-primary/50",
        "focus:ring-offset-2 focus:ring-offset-background"
      )}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Shimmer sweep on hover */}
      <div className="mg-shimmer" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full min-h-[90px]">
        {/* Icon with glass container */}
        <div className="mg-icon mb-3">
          {icon}
        </div>

        {/* Label */}
        <h3 className="font-semibold text-foreground mb-0.5 text-sm transition-colors duration-300 group-hover:text-white">
          {label}
        </h3>

        {/* Description */}
        <p className={cn(
          "text-xs text-muted-foreground transition-all duration-300",
          "opacity-60 group-hover:opacity-100"
        )}>
          {description}
        </p>

        {/* Hover arrow indicator */}
        <motion.div
          className="absolute bottom-0 right-0"
          initial={{ opacity: 0, x: -8 }}
          whileHover={{ opacity: 0.7, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className="h-4 w-4 text-foreground/60" />
        </motion.div>
      </div>

      {/* Corner accent dot */}
      <div className="mg-dot absolute top-3 right-3" />
    </motion.button>
  );
};
