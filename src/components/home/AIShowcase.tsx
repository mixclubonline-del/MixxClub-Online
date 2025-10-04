import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Activity, Target, TrendingUp, Zap, Music } from 'lucide-react';
import { PrimeAvatar } from '@/components/prime/PrimeAvatar';

export const AIShowcase = () => {
  const features = [
    {
      icon: Brain,
      title: 'Musical DNA Analysis',
      description: 'AI analyzes tempo, key, genre, mood, and complexity in seconds',
      stat: '99.2% Accuracy',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Activity,
      title: 'Stem Detection',
      description: 'Automatically identifies vocals, drums, bass, and instruments',
      stat: '8-track max',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Target,
      title: 'Smart Engineer Matching',
      description: 'Match with engineers who specialize in your exact sound',
      stat: '95% Match Rate',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: TrendingUp,
      title: 'Mix Suggestions',
      description: 'Real-time AI suggestions during sessions for optimal results',
      stat: '40% Faster',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container relative z-10 px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <PrimeAvatar size="lg" />
            <div className="text-left">
              <div className="text-sm text-muted-foreground">Meet Prime</div>
              <div className="text-xl font-bold">Your AI Session Assistant</div>
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-4"
          >
            AI That Actually <span className="text-primary">Helps</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Prime analyzes every upload, preps engineers before sessions, and helps you achieve studio-quality results faster
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300 h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className="p-8 relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge variant="secondary" className="mt-2">{feature.stat}</Badge>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Example Analysis Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-8 bg-card/50 backdrop-blur border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Real-Time Analysis Example</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Genre Classification</div>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Hip-Hop / Trap</span>
                  <Badge variant="outline" className="ml-auto">92%</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Key Signature</div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-semibold">A Minor</span>
                  <Badge variant="outline" className="ml-auto">98%</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Tempo</div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-semibold">140 BPM</span>
                  <Badge variant="outline" className="ml-auto">100%</Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <div className="flex items-start gap-3">
                <PrimeAvatar size="sm" />
                <div className="flex-1">
                  <div className="font-semibold mb-1">Prime's Suggestion</div>
                  <p className="text-sm text-muted-foreground">
                    Based on your track's vibe, I recommend engineers who specialize in modern trap production. They'll enhance your 808s and keep that hard-hitting energy. 🔥
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
