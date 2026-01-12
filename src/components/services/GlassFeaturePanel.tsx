import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface GlassFeaturePanelProps {
  icon: ReactNode;
  title: string;
  description: string;
  details: string[];
  accentColor?: string;
  delay?: number;
}

export function GlassFeaturePanel({ 
  icon, 
  title, 
  description, 
  details,
  accentColor = 'accent',
  delay = 0
}: GlassFeaturePanelProps) {
  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent/20 to-accent-blue/20 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />
      
      <div className="relative p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all duration-300">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
          <div className="text-accent">
            {icon}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          {description}
        </p>

        {/* Details list */}
        <ul className="space-y-2">
          {details.map((detail, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span className="text-foreground/80">{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
