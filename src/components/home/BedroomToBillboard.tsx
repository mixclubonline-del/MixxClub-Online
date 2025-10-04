import { motion, useScroll, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Sparkles, 
  Users, 
  Video, 
  Music2, 
  Share2,
  ArrowRight,
  Check,
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
      title: "Upload Your Track",
      description: "Start with your bedroom recording. No matter your setup.",
      stat: "2.3s",
      statLabel: "Upload Time",
      color: "from-blue-500 to-cyan-500"
    },
    {
      step: 2,
      icon: Sparkles,
      title: "AI Session Prep",
      description: "Prime analyzes genre, key, tempo, and suggests mixing techniques instantly.",
      stat: "94%",
      statLabel: "Accuracy",
      color: "from-purple-500 to-pink-500"
    },
    {
      step: 3,
      icon: Users,
      title: "Perfect Engineer Match",
      description: "Our AI finds the ideal engineer for your sound and genre.",
      stat: "2,500+",
      statLabel: "Engineers",
      color: "from-orange-500 to-red-500"
    },
    {
      step: 4,
      icon: Video,
      title: "Live Collaboration",
      description: "Work together in real-time. Watch, listen, chat, and create.",
      stat: "24/7",
      statLabel: "Available",
      color: "from-green-500 to-emerald-500"
    },
    {
      step: 5,
      icon: Music2,
      title: "Professional Master",
      description: "Receive your radio-ready, streaming-optimized final master.",
      stat: "24h",
      statLabel: "Delivery",
      color: "from-yellow-500 to-amber-500"
    },
    {
      step: 6,
      icon: Share2,
      title: "Distribute Everywhere",
      description: "Push to 30+ DSPs directly from the platform. Spotify, Apple, and beyond.",
      stat: "30+",
      statLabel: "Platforms",
      color: "from-indigo-500 to-violet-500"
    }
  ];

  return (
    <section ref={containerRef} className="py-32 relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
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

      <div className="container px-6 relative z-10">
        {/* Section Header */}
        <motion.div 
          style={{ opacity, scale }}
          className="text-center mb-20"
        >
          <Badge variant="secondary" className="mb-4 gap-2 py-2 px-4">
            <Zap className="w-4 h-4" />
            The Complete Journey
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            From Bedroom to
            <span className="block bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
              Billboard
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch your track transform from a rough idea into a professional release. 
            All in one platform, guided by AI and human expertise.
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
                <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-500">
                  {/* Gradient Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-500" />

                  <div className={`p-8 md:p-12 grid md:grid-cols-[auto_1fr_auto] gap-8 items-center ${isEven ? '' : 'md:grid-flow-col-dense'}`}>
                    {/* Step Number & Icon */}
                    <div className={`flex flex-col items-center gap-4 ${isEven ? '' : 'md:col-start-3'}`}>
                      <div className="relative">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm font-bold">
                          {item.step}
                        </div>
                      </div>
                      
                      {/* Stat Badge */}
                      <div className="text-center">
                        <div className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                          {item.stat}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.statLabel}</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={isEven ? '' : 'md:col-start-2'}>
                      <h3 className="text-3xl font-bold mb-3 flex items-center gap-3">
                        {item.title}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                        >
                          <Check className="w-6 h-6 text-success" />
                        </motion.div>
                      </h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Visual Indicator */}
                    {index < journey.length - 1 && (
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: "100%" }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className={`hidden md:block absolute ${isEven ? 'left-[10%]' : 'right-[10%]'} top-full w-1 h-8 bg-gradient-to-b from-primary/50 to-transparent`}
                      />
                    )}
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
          className="text-center mt-20"
        >
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-primary via-accent to-primary-glow">
            <div className="bg-background rounded-xl p-8">
              <h3 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Join 12,000+ artists who've transformed their bedroom tracks into professional releases
              </p>
              <Button 
                size="lg" 
                className="gap-2 shadow-glow text-lg px-8"
                onClick={() => navigate('/auth?signup=true')}
              >
                Start Creating Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
