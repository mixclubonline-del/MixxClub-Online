import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';
import { ScrollRevealSection } from './ScrollRevealSection';
import { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeatureGlassCardsProps {
  badge: { icon: ReactNode; text: string };
  title: string;
  subtitle: string;
  features: Feature[];
  variant: 'artist' | 'engineer';
}

export const FeatureGlassCards = ({ 
  badge, 
  title, 
  subtitle, 
  features, 
  variant 
}: FeatureGlassCardsProps) => {
  const accentColor = variant === 'artist' ? 'primary' : 'secondary';
  
  return (
    <section className="py-24 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <ScrollRevealSection className="text-center mb-12">
          <Badge 
            variant="outline" 
            className="mb-4 bg-background/30 backdrop-blur-md border-white/20"
          >
            {badge.icon}
            <span className="ml-2">{badge.text}</span>
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </ScrollRevealSection>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollRevealSection key={index} delay={index * 0.08}>
              <motion.div
                className="p-6 rounded-2xl bg-background/40 backdrop-blur-md border border-white/10 hover:border-white/20 hover:shadow-lg transition-all group"
                whileHover={{ y: -4 }}
              >
                <feature.icon className={`w-10 h-10 text-${accentColor} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            </ScrollRevealSection>
          ))}
        </div>
      </div>
    </section>
  );
};
