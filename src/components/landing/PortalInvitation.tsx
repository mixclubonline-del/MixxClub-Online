import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ScrollRevealSection } from './ScrollRevealSection';

interface PortalInvitationProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  cta: {
    text: string;
    href: string;
  };
  variant: 'artist' | 'engineer';
  disclaimer?: string;
}

export const PortalInvitation = ({ 
  icon, 
  title, 
  subtitle, 
  cta, 
  variant,
  disclaimer 
}: PortalInvitationProps) => {
  const navigate = useNavigate();
  const [isEntering, setIsEntering] = useState(false);
  const accentColor = variant === 'artist' ? 'primary' : 'secondary';

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      navigate(cta.href);
    }, 800);
  };

  return (
    <section className="py-24 px-6 relative">
      <ScrollRevealSection className="container mx-auto max-w-4xl">
        <motion.div
          className={`relative text-center p-12 rounded-3xl border-2 border-${accentColor}/30 overflow-hidden`}
          animate={isEntering ? { scale: 1.05, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Glass Background */}
          <div className="absolute inset-0 bg-background/50 backdrop-blur-xl" />
          
          {/* Glowing Border Effect */}
          <motion.div
            className={`absolute inset-0 rounded-3xl border-2 border-${accentColor}/50`}
            animate={{
              boxShadow: [
                `0 0 20px hsl(var(--${accentColor})/0.2)`,
                `0 0 40px hsl(var(--${accentColor})/0.4)`,
                `0 0 20px hsl(var(--${accentColor})/0.2)`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              className={`w-20 h-20 mx-auto mb-6 rounded-full bg-${accentColor}/20 flex items-center justify-center text-${accentColor}`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {icon}
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {subtitle}
            </p>

            <Button
              size="lg"
              onClick={handleEnter}
              disabled={isEntering}
              className={`gap-2 text-lg px-12 py-6 ${
                variant === 'engineer' ? 'bg-secondary hover:bg-secondary/90' : ''
              }`}
            >
              {cta.text}
              <motion.div
                animate={isEntering ? { x: 10 } : { x: 0 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Button>

            {disclaimer && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-sm text-muted-foreground">{disclaimer}</p>
              </div>
            )}
          </div>
        </motion.div>
      </ScrollRevealSection>
    </section>
  );
};
