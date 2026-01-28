/**
 * Path Preview Card Component
 * 
 * Glassmorphic card showing what awaits on each path.
 * Displays features, icons, and social proof.
 */

import { motion } from 'framer-motion';
import { 
  Upload, 
  Sparkles, 
  Share2, 
  Users, 
  Sliders, 
  UserCheck, 
  DollarSign, 
  Star 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PathPreviewCardProps {
  role: 'artist' | 'engineer';
  isVisible: boolean;
  className?: string;
}

const artistFeatures = [
  { icon: Upload, label: 'Upload Tracks' },
  { icon: Sparkles, label: 'AI Mixing' },
  { icon: Share2, label: 'Distribution' },
  { icon: Users, label: 'Build Fanbase' },
];

const engineerFeatures = [
  { icon: Sliders, label: 'Studio Tools' },
  { icon: UserCheck, label: 'Client CRM' },
  { icon: DollarSign, label: 'Revenue Streams' },
  { icon: Star, label: 'Reputation' },
];

export function PathPreviewCard({
  role,
  isVisible,
  className,
}: PathPreviewCardProps) {
  const features = role === 'artist' ? artistFeatures : engineerFeatures;
  const socialProof = role === 'artist' 
    ? 'Join 2.4K artists building their sound'
    : 'Join 800+ engineers getting paid';
  
  const accentColor = role === 'artist'
    ? 'from-purple-500/20 to-pink-500/20'
    : 'from-cyan-500/20 to-blue-500/20';
  
  const iconColor = role === 'artist'
    ? 'text-purple-400'
    : 'text-cyan-400';

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        "absolute z-30 w-[280px] md:w-[320px]",
        "bg-background/80 backdrop-blur-xl",
        "border border-white/10 rounded-2xl",
        "p-5 shadow-2xl",
        className
      )}
    >
      {/* Gradient accent */}
      <div className={cn(
        "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50",
        accentColor
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <h4 className="text-lg font-bold text-foreground mb-1">
          {role === 'artist' ? 'Artist Journey' : 'Engineer Journey'}
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          {role === 'artist' 
            ? 'Create, collaborate, and grow your career'
            : 'Mix, master, and build your business'}
        </p>
        
        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5"
            >
              <feature.icon className={cn("w-4 h-4", iconColor)} />
              <span className="text-xs text-foreground/80">{feature.label}</span>
            </motion.div>
          ))}
        </div>
        
        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 pt-3 border-t border-white/10"
        >
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-muted to-muted-foreground/30 border-2 border-background"
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{socialProof}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
