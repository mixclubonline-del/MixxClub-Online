import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Headphones, ArrowRight, Sparkles, Zap, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortalPreview {
  title: string;
  subtitle: string;
  icon: typeof Music;
  route: string;
  gradient: string;
  glowColor: string;
  features: { icon: typeof Sparkles; text: string }[];
  stats: { value: string; label: string }[];
}

const portals: PortalPreview[] = [
  {
    title: 'Artist Portal',
    subtitle: 'Create & Collaborate',
    icon: Music,
    route: '/auth?mode=signup&role=artist',
    gradient: 'from-[hsl(270_100%_60%)] via-[hsl(280_100%_50%)] to-[hsl(300_100%_60%)]',
    glowColor: 'hsl(270 100% 60%)',
    features: [
      { icon: Sparkles, text: 'AI Track Analysis' },
      { icon: Users, text: 'Engineer Matching' },
      { icon: Zap, text: 'Instant Mastering' },
    ],
    stats: [
      { value: '500+', label: 'Active Artists' },
      { value: '10k+', label: 'Tracks Processed' },
    ]
  },
  {
    title: 'Engineer Portal',
    subtitle: 'Build & Earn',
    icon: Headphones,
    route: '/auth?mode=signup&role=engineer',
    gradient: 'from-[hsl(185_100%_50%)] via-[hsl(200_100%_55%)] to-[hsl(220_100%_60%)]',
    glowColor: 'hsl(185 100% 55%)',
    features: [
      { icon: DollarSign, text: 'Flexible Earnings' },
      { icon: Users, text: 'Client Discovery' },
      { icon: Zap, text: 'Portfolio Showcase' },
    ],
    stats: [
      { value: '$50k+', label: 'Paid to Engineers' },
      { value: '98%', label: 'Satisfaction Rate' },
    ]
  }
];

export const RolePortals = () => {
  const [hoveredPortal, setHoveredPortal] = useState<number | null>(null);

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background glow effects */}
      <motion.div
        className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(270 100% 60%), transparent 60%)',
          filter: 'blur(120px)'
        }}
        animate={{
          scale: hoveredPortal === 0 ? 1.3 : 1,
          opacity: hoveredPortal === 0 ? 0.4 : 0.15
        }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(185 100% 55%), transparent 60%)',
          filter: 'blur(120px)'
        }}
        animate={{
          scale: hoveredPortal === 1 ? 1.3 : 1,
          opacity: hoveredPortal === 1 ? 0.4 : 0.15
        }}
        transition={{ duration: 0.5 }}
      />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Portal</h2>
          <p className="text-xl text-muted-foreground">Hover to preview what awaits</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {portals.map((portal, index) => (
            <motion.div
              key={portal.title}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              onMouseEnter={() => setHoveredPortal(index)}
              onMouseLeave={() => setHoveredPortal(null)}
              className="relative group"
            >
              <Link to={portal.route}>
                <motion.div
                  className="relative rounded-3xl overflow-hidden glass-near border transition-all duration-500"
                  style={{
                    borderColor: hoveredPortal === index ? portal.glowColor : 'hsl(var(--glass-border))'
                  }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: `0 0 80px ${portal.glowColor}40`
                  }}
                >
                  {/* Gradient header */}
                  <div className={`h-32 bg-gradient-to-br ${portal.gradient} relative overflow-hidden`}>
                    {/* Animated particles */}
                    {hoveredPortal === index && (
                      <>
                        {Array.from({ length: 10 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-white/30"
                            initial={{ y: 100, x: Math.random() * 100 + '%', opacity: 0 }}
                            animate={{ y: -20, opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                          />
                        ))}
                      </>
                    )}
                    
                    {/* Icon */}
                    <motion.div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-20 h-20 rounded-2xl bg-[hsl(var(--background))] border-4 flex items-center justify-center"
                      style={{ borderColor: portal.glowColor }}
                      animate={{
                        scale: hoveredPortal === index ? 1.1 : 1,
                        rotate: hoveredPortal === index ? [0, 5, -5, 0] : 0
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <portal.icon className="w-10 h-10" style={{ color: portal.glowColor }} />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="pt-14 pb-8 px-8 text-center">
                    <motion.p
                      className="text-sm font-mono text-muted-foreground mb-1"
                      animate={{ opacity: hoveredPortal === index ? 1 : 0.7 }}
                    >
                      {portal.subtitle}
                    </motion.p>
                    <h3 className="text-2xl font-bold mb-6">{portal.title}</h3>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {portal.features.map((feature, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center justify-center gap-3"
                          initial={{ opacity: 0.7, x: 0 }}
                          animate={{
                            opacity: hoveredPortal === index ? 1 : 0.7,
                            x: hoveredPortal === index ? [0, 5, 0] : 0
                          }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <feature.icon className="w-4 h-4" style={{ color: portal.glowColor }} />
                          <span className="text-sm">{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-8 mb-8">
                      {portal.stats.map((stat, i) => (
                        <motion.div
                          key={i}
                          className="text-center"
                          animate={{
                            scale: hoveredPortal === index ? 1.1 : 1
                          }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div 
                            className="text-2xl font-bold"
                            style={{ color: portal.glowColor }}
                          >
                            {stat.value}
                          </div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Button
                      className={`w-full group bg-gradient-to-r ${portal.gradient} hover:shadow-lg transition-all`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        Enter Portal
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
