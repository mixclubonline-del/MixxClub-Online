import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';

interface FoundingBannerProps {
  icon: ReactNode;
  text: string;
  highlight: string;
  badge: string;
  variant: 'artist' | 'engineer' | 'producer' | 'fan';
}

export const FoundingBanner = ({ icon, text, highlight, badge, variant }: FoundingBannerProps) => {
  const colors = variant === 'artist'
    ? {
      bg: 'from-amber-500/20 via-amber-400/10 to-amber-500/20',
      border: 'border-amber-500/30',
      text: 'text-amber-100',
      highlight: 'text-amber-300',
      badge: 'bg-amber-500/30 text-amber-100 border-amber-400/50'
    }
    : {
      bg: 'from-purple-500/20 via-purple-400/10 to-purple-500/20',
      border: 'border-purple-500/30',
      text: 'text-purple-100',
      highlight: 'text-purple-300',
      badge: 'bg-purple-500/30 text-purple-100 border-purple-400/50'
    };

  return (
    <section className={`fixed top-0 left-0 right-0 z-50 py-3 bg-gradient-to-r ${colors.bg} border-b ${colors.border} backdrop-blur-md`}>
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left"
        >
          <div className="flex items-center gap-3">
            {icon}
            <p className={`font-bold ${colors.text}`}>
              {text} <span className={colors.highlight}>{highlight}</span>
            </p>
          </div>
          <Badge className={`${colors.badge} animate-pulse`}>
            {badge}
          </Badge>
        </motion.div>
      </div>
    </section>
  );
};
