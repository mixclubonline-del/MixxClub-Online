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
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      <div className="container relative z-10 px-6">
        <div className="max-w-5xl mx-auto">
          <Card className="relative overflow-hidden border-primary/20 bg-card/50 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            
            <div className="relative z-10 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left: Content */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <PrimeAvatar size="md" />
                    <Badge variant="secondary" className="gap-2">
                      <Sparkles className="w-3 h-3" />
                      AI-Powered
                    </Badge>
                  </div>

                  <div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4">
                      AI Mastering
                      <span className="block text-primary">In Seconds</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Professional mastering powered by neural networks. Upload your mixed track and get radio-ready results instantly.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {features.map((feature, i) => (
                      <div key={i} className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-sm font-semibold">{feature.label}</div>
                        <div className="text-xs text-muted-foreground">{feature.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button size="lg" onClick={() => navigate('/ai-mastering')} className="gap-2 shadow-glow">
                      Try AI Mastering
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('/ai-mastering#pricing')}>
                      View Pricing
                    </Button>
                  </div>
                </div>

                {/* Right: Visual */}
                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    {/* Before/After Comparison */}
                    <div className="bg-background/80 backdrop-blur rounded-lg p-6 border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-muted-foreground">Before</span>
                        <span className="text-sm font-semibold text-primary">After</span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: 'Loudness', before: 45, after: 95 },
                          { label: 'Clarity', before: 50, after: 92 },
                          { label: 'Balance', before: 55, after: 98 },
                        ].map((metric, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{metric.label}</span>
                              <span className="text-primary font-bold">+{metric.after - metric.before}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: `${metric.before}%` }}
                                whileInView={{ width: `${metric.after}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: i * 0.2 }}
                                className="h-full bg-gradient-to-r from-primary to-primary-glow"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prime Quote */}
                    <div className="bg-primary/10 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <PrimeAvatar size="sm" />
                        <div>
                          <div className="font-semibold text-sm mb-1">Prime says:</div>
                          <p className="text-sm text-muted-foreground">
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
