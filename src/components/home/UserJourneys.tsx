import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getCharacter } from '@/config/characters';
import { useFlowNavigation } from '@/core/fabric/useFlow';

export const UserJourneys = () => {
  const { goToAuth } = useFlowNavigation();
  const jax = getCharacter('jax');
  const rell = getCharacter('rell');

  const journeys = [
    {
      role: 'Artists',
      character: jax,
      tagline: jax.tagline,
      quote: jax.sampleQuotes[0],
      benefits: [
        'Upload → AI analyzes in 60s',
        'Match with perfect engineer',
        'Get pro mix in 24-48hrs',
        'AI master instantly',
        'Distribute to 30+ DSPs',
      ],
      cta: 'Start as Artist',
      color: 'from-[hsl(142_76%_36%)] to-[hsl(142_76%_45%)]',
      accentColor: 'hsl(142 76% 36%)',
    },
    {
      role: 'Engineers',
      character: rell,
      tagline: rell.tagline,
      quote: rell.sampleQuotes[0],
      benefits: [
        'AI preps every session',
        'Musical DNA + stem detection',
        'Smart artist matching',
        'Real-time AI suggestions',
        'Earn while you work',
      ],
      cta: 'Start as Engineer',
      color: 'from-secondary to-secondary/80',
      accentColor: 'hsl(var(--secondary))',
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
                  {/* Character Header */}
                  <div className="mb-6 flex items-center gap-4">
                    <motion.div 
                      className="relative w-20 h-20 rounded-2xl overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      style={{
                        boxShadow: `0 0 25px ${journey.accentColor}40`,
                      }}
                    >
                      <img 
                        src={journey.character.avatarPath} 
                        alt={journey.character.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div>
                      <h3 className="text-3xl font-bold">{journey.role}</h3>
                      <p className="text-lg text-muted-foreground">{journey.tagline}</p>
                    </div>
                  </div>

                  {/* Character Quote */}
                  <div 
                    className="mb-6 p-3 rounded-lg border"
                    style={{
                      backgroundColor: `${journey.accentColor}10`,
                      borderColor: `${journey.accentColor}30`,
                    }}
                  >
                    <p className="text-sm text-muted-foreground italic">
                      <span 
                        className="font-semibold"
                        style={{ color: journey.accentColor }}
                      >
                        {journey.character.name}:
                      </span>{" "}
                      "{journey.quote}"
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3 mb-8 flex-1">
                    {journey.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${journey.accentColor}, ${journey.accentColor}80)`,
                          }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <span className="text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    size="lg"
                    onClick={() => goToAuth('signup')}
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
