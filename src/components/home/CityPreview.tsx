// ============= Full file contents =============

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, Radio, Trophy, DollarSign, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const districts = [
  { icon: Building2, name: 'MixxTech Tower', description: 'Your Command Center' },
  { icon: Radio, name: 'RSD Chamber', description: 'Where Music is Made' },
  { icon: Trophy, name: 'The Arena', description: 'Battles & Community' },
  { icon: DollarSign, name: 'Commerce District', description: '10 Revenue Streams' },
];

export const CityPreview = () => {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Stylized city background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-64">
          {/* City skyline silhouette */}
          <svg 
            viewBox="0 0 1200 200" 
            className="w-full h-full opacity-20"
            preserveAspectRatio="xMidYMax slice"
          >
            <defs>
              <linearGradient id="cityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--primary) / 0.3)" />
              </linearGradient>
            </defs>
            <path 
              d="M0,200 L0,120 L50,120 L50,100 L80,100 L80,80 L100,80 L100,60 L130,60 L130,80 L160,80 L160,100 L200,100 L200,140 L230,140 L230,90 L270,90 L270,50 L290,50 L290,30 L310,30 L310,50 L350,50 L350,100 L400,100 L400,70 L440,70 L440,40 L460,40 L460,20 L480,20 L480,40 L520,40 L520,80 L560,80 L560,120 L600,120 L600,60 L630,60 L630,40 L660,40 L660,60 L700,60 L700,100 L750,100 L750,50 L780,50 L780,30 L810,30 L810,50 L850,50 L850,90 L900,90 L900,130 L950,130 L950,80 L990,80 L990,60 L1020,60 L1020,80 L1060,80 L1060,110 L1100,110 L1100,140 L1150,140 L1150,100 L1200,100 L1200,200 Z"
              fill="url(#cityGradient)"
            />
          </svg>
        </div>
      </div>

      <div className="relative z-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Enter the Experience</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Mixxclub City
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            This is where you'll live. A city for creators.
          </p>
        </motion.div>

        {/* Districts grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {districts.map((district, index) => {
            const Icon = district.icon;
            return (
              <motion.div
                key={district.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-1">{district.name}</h3>
                  <p className="text-sm text-muted-foreground">{district.description}</p>
                </div>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link to="/auth?mode=signup">
            <Button 
              size="lg"
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
            >
              <Building2 className="mr-2 h-5 w-5" />
              Explore the City
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};