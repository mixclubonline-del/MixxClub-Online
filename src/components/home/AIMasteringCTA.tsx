import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Zap, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrimeAvatar } from '@/components/prime/PrimeAvatar';

export const AIMasteringCTA = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Zap, label: 'Instant Results', desc: '< 60 seconds' },
    { icon: DollarSign, label: 'From $9.99', desc: 'Single track' },
    { icon: Clock, label: '24/7 Available', desc: 'Never wait' },
  ];

  return (
    <section className="min-h-screen flex items-center py-16 md:py-20 relative overflow-hidden">
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Card className="glass-morphic-strong backdrop-blur-xl border-primary/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            
            <div className="relative z-10 p-8 md:p-16">
              <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left: Content */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <PrimeAvatar size="md" />
                    <Badge className="glass-morphic backdrop-blur-xl border-primary/30 gap-2 px-4 py-2">
                      <Sparkles className="w-4 h-4" />
                      AI-Powered
                    </Badge>
                  </div>

                  <div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                      AI Mastering
                      <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">In Seconds</span>
                    </h2>
                    <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
                      Professional mastering powered by neural networks. Upload your mixed track and get radio-ready results instantly.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                      <div key={i} className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl glass-morphic backdrop-blur-xl border-primary/20 flex items-center justify-center">
                          <feature.icon className="w-8 h-8 text-primary" />
                        </div>
                        <div className="text-base font-bold">{feature.label}</div>
                        <div className="text-sm text-foreground/60">{feature.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" onClick={() => navigate('/ai-mastering')} className="gap-2 shadow-glow text-lg px-8 py-6">
                      Try AI Mastering
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('/ai-mastering#pricing')} className="glass-morphic backdrop-blur-xl border-primary/20 text-lg px-8 py-6">
                      View Pricing
                    </Button>
                  </div>
                </div>

                {/* Right: Visual */}
                <div className="relative lg:block hidden">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="space-y-6"
                  >
                    {/* Before/After Comparison */}
                    <div className="glass-morphic-card backdrop-blur-xl border-primary/20 p-8">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-base font-bold text-foreground/70">Before</span>
                        <span className="text-base font-bold text-primary">After</span>
                      </div>
                      <div className="space-y-5">
                        {[
                          { label: 'Loudness', before: 45, after: 95 },
                          { label: 'Clarity', before: 50, after: 92 },
                          { label: 'Balance', before: 55, after: 98 },
                        ].map((metric, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="font-medium">{metric.label}</span>
                              <span className="text-primary font-bold text-lg">+{metric.after - metric.before}%</span>
                            </div>
                            <div className="h-3 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
                              <motion.div
                                initial={{ width: `${metric.before}%` }}
                                whileInView={{ width: `${metric.after}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: i * 0.2 }}
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-glow-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prime Quote */}
                    <div className="glass-morphic-card backdrop-blur-xl border-primary/20 p-6">
                      <div className="flex items-start gap-4">
                        <PrimeAvatar size="sm" />
                        <div>
                          <div className="font-bold text-base mb-2">Prime says:</div>
                          <p className="text-base text-foreground/70 leading-relaxed">
                            "I've mastered over 50,000 tracks. Your music deserves to sound incredible on every platform. ✨"
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
