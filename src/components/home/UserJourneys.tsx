import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Music, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserJourneys = () => {
  const navigate = useNavigate();

  const journeys = [
    {
      role: 'Artists',
      icon: Music,
      tagline: 'Your Vision, Perfected',
      benefits: [
        'Upload → AI analyzes in 60s',
        'Match with perfect engineer',
        'Get pro mix in 24-48hrs',
        'AI master instantly',
        'Distribute to 30+ DSPs',
      ],
      cta: 'Start Creating',
      color: 'from-blue-500 to-purple-500',
    },
    {
      role: 'Engineers',
      icon: Headphones,
      tagline: 'More Sessions, Less Prep',
      benefits: [
        'AI preps every session',
        'Musical DNA + stem detection',
        'Smart artist matching',
        'Real-time AI suggestions',
        'Earn while you work',
      ],
      cta: 'Join as Engineer',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
      <div className="container px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-4"
          >
            Built for <span className="text-primary">Everyone</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Whether you're creating or engineering, Mixclub streamlines your workflow
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {journeys.map((journey, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300 h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${journey.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                
                <div className="p-8 relative z-10 flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${journey.color} flex items-center justify-center mb-4`}>
                      <journey.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">{journey.role}</h3>
                    <p className="text-lg text-muted-foreground">{journey.tagline}</p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3 mb-8 flex-1">
                    {journey.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${journey.color} flex items-center justify-center flex-shrink-0`}>
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <span className="text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    size="lg"
                    onClick={() => navigate('/auth?signup=true')}
                    className={`w-full gap-2 bg-gradient-to-r ${journey.color} hover:opacity-90`}
                  >
                    {journey.cta}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
