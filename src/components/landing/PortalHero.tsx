import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

interface PortalHeroProps {
  badge: {
    icon: ReactNode;
    text: string;
  };
  title: string;
  subtitle: string;
  stats: Array<{ value: string; label: string }>;
  primaryAction: {
    text: string;
    icon: ReactNode;
    href: string;
  };
  secondaryAction?: {
    text: string;
    icon: ReactNode;
    href: string;
  };
  variant: 'artist' | 'engineer';
}

export const PortalHero = ({
  badge,
  title,
  subtitle,
  stats,
  primaryAction,
  secondaryAction,
  variant
}: PortalHeroProps) => {
  const accentColor = variant === 'artist' ? 'primary' : 'secondary';
  
  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 relative pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Glass Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Badge 
            variant="outline" 
            className="mb-6 text-base px-6 py-3 bg-background/30 backdrop-blur-md border-white/20"
          >
            {badge.icon}
            <span className="ml-2">{badge.text}</span>
          </Badge>
        </motion.div>

        {/* Title with Glass Backdrop */}
        <motion.div
          className="relative inline-block mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute inset-0 -m-4 rounded-2xl bg-background/20 backdrop-blur-sm" />
          <h1 className={`relative text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-${accentColor} to-foreground bg-clip-text text-transparent`}>
            {title}
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-3xl mx-auto drop-shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {subtitle}
        </motion.p>

        {/* Stats Bar - Glass Panel */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12 p-6 rounded-2xl bg-background/30 backdrop-blur-md border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className={`text-2xl md:text-3xl font-bold text-${accentColor}`}>
                {stat.value}
              </div>
              <div className="text-sm text-foreground/70">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link to={primaryAction.href}>
            <Button 
              size="lg" 
              className={`gap-2 text-lg px-8 py-6 ${
                variant === 'engineer' ? 'bg-secondary hover:bg-secondary/90' : ''
              }`}
            >
              {primaryAction.icon}
              {primaryAction.text}
            </Button>
          </Link>
          {secondaryAction && (
            <Link to={secondaryAction.href}>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 text-lg px-8 py-6 bg-background/30 backdrop-blur-sm border-white/20 hover:bg-background/50"
              >
                {secondaryAction.icon}
                {secondaryAction.text}
              </Button>
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-foreground/50"
        >
          <span className="text-xs uppercase tracking-widest">Explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};
