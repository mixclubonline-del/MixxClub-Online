import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ShowcaseStat {
  label: string;
  value: string;
}

interface ShowcaseFeatureProps {
  image: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  stats: ShowcaseStat[];
  techDetails: string[];
  reversed?: boolean;
  delay?: number;
}

export function ShowcaseFeature({
  image,
  icon: Icon,
  title,
  subtitle,
  description,
  stats,
  techDetails,
  reversed = false,
  delay = 0
}: ShowcaseFeatureProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay }}
      className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center`}
    >
      {/* Image Side with Hover Stats */}
      <div className="flex-1 w-full relative group">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-2xl">
          <img 
            src={image} 
            alt={title}
            className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Stats overlay on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-background via-background/90 to-transparent">
            <div className="flex gap-3 md:gap-4 flex-wrap">
              {stats.map((stat) => (
                <div key={stat.label} className="px-3 py-2 md:px-4 md:py-2 bg-background/95 backdrop-blur rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="text-base md:text-lg font-bold text-primary">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Floating tech badges */}
        <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 flex flex-wrap gap-2 max-w-xs">
          {techDetails.slice(0, 2).map((detail) => (
            <Badge key={detail} className="bg-primary/20 text-primary border-primary/30 text-xs shadow-lg">
              {detail}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content Side */}
      <div className="flex-1 w-full space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 md:p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <Badge variant="secondary" className="text-xs md:text-sm">{subtitle}</Badge>
        </div>
        
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">{title}</h3>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{description}</p>
        
        {/* Stats grid - visible by default on mobile, hidden on desktop (shown on hover) */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 py-2 md:py-4 lg:hidden">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-3 md:p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="text-lg md:text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Desktop stats grid */}
        <div className="hidden lg:grid grid-cols-3 gap-4 py-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Tech details */}
        <div className="flex flex-wrap gap-2">
          {techDetails.map((detail) => (
            <Badge key={detail} variant="outline" className="text-xs">{detail}</Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
