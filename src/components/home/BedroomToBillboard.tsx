import { motion, useScroll, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Sparkles, 
  Users, 
  Share2,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

export const BedroomToBillboard = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  const journey = [
    {
      step: 1,
      icon: Upload,
      title: "Create",
      description: "Upload your track or record directly in our studio. Start from anywhere, any setup.",
      stat: "2.3s",
      statLabel: "Upload Time",
      color: "from-primary to-primary-glow"
    },
    {
      step: 2,
      icon: Users,
      title: "Collaborate",
      description: "Get matched with the perfect engineer through AI. Work together in real-time with video chat and live audio.",
      stat: "98%",
      statLabel: "Match Rate",
      color: "from-accent to-accent-cyan"
    },
    {
      step: 3,
      icon: Sparkles,
      title: "Master",
      description: "AI analyzes your track and assists the mixing process. Get radio-ready, streaming-optimized results.",
      stat: "24h",
      statLabel: "Delivery",
      color: "from-primary-glow to-accent"
    },
    {
      step: 4,
      icon: Share2,
      title: "Launch",
      description: "Distribute to 30+ platforms instantly. Spotify, Apple Music, and beyond - all from one place.",
      stat: "30+",
      statLabel: "Platforms",
      color: "from-accent-cyan to-primary"
    }
  ];

  return (
    <section ref={containerRef} className="min-h-screen flex items-center py-16 md:py-24 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              scale: Math.random() * 2
            }}
            animate={{
              y: [null, Math.random() * -20 + "%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <motion.div 
          style={{ opacity, scale }}
          className="text-center mb-16 md:mb-20"
        >
          <Badge className="glass-morphic backdrop-blur-xl border-primary/30 mb-6 gap-2 py-2 px-5 text-base">
            <Zap className="w-4 h-4" />
            The Complete Journey
          </Badge>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            From Bedroom to
            <span className="block bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
              Billboard
            </span>
          </h2>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Four simple steps. One powerful platform. Transform your music into a professional release.
          </p>
        </motion.div>

        {/* Journey Steps */}
        <div className="max-w-6xl mx-auto space-y-8">
          {journey.map((item, index) => {
            const Icon = item.icon;
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="glass-morphic-card backdrop-blur-xl border-primary/20 relative overflow-hidden group">
                  {/* Gradient Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.color}`} />
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-500" />

                  <div className="p-6 md:p-10 grid md:grid-cols-[auto_1fr] gap-8 items-center">
                    {/* Step Number & Icon */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-glow`}>
                          <Icon className="w-12 h-12 text-white drop-shadow-lg" />
                        </div>
                        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center text-base font-bold shadow-lg">
                          {item.step}
                        </div>
                      </div>
                      
                      {/* Stat Badge */}
                      <div className="text-center">
                        <div className={`text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                          {item.stat}
                        </div>
                        <div className="text-sm text-foreground/60 font-medium">{item.statLabel}</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
                        {item.title}
                      </h3>
                      <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 md:mt-20"
        >
          <Card className="glass-morphic-strong backdrop-blur-xl border-primary/30 max-w-3xl mx-auto p-8 md:p-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-lg text-foreground/70 mb-8 max-w-xl mx-auto">
              Join 12,000+ artists who've transformed their bedroom tracks into professional releases
            </p>
            <Button 
              size="lg" 
              className="gap-2 shadow-glow text-lg px-10 py-6"
              onClick={() => navigate('/auth?signup=true')}
            >
              Start Creating Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
