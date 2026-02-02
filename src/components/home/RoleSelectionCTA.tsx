import { motion } from 'framer-motion';
import { Music, Headphones, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export const RoleSelectionCTA = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'artist',
      title: 'Artist',
      subtitle: 'Create & Collaborate',
      description: 'Upload your tracks, find the perfect engineer, and bring your music to life with professional quality.',
      icon: Music,
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      features: ['AI-Powered Matching', 'Real-Time Collaboration', 'Secure File Sharing'],
      cta: 'Start as Artist'
    },
    {
      id: 'engineer',
      title: 'Engineer',
      subtitle: 'Mix & Earn',
      description: 'Monetize your skills, work with artists worldwide, and build your audio engineering business.',
      icon: Headphones,
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      features: ['Set Your Rates', 'Build Your Portfolio', 'Earn From Home'],
      cta: 'Join as Engineer'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Choose Your Path</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Which Side Are <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">You On?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're creating music or engineering sound, MixClub has a place for you
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="group relative overflow-hidden p-8 h-full border-2 border-border hover:border-primary/50 transition-all duration-500 bg-card/50 backdrop-blur-sm">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <role.icon className="w-10 h-10 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-3xl font-bold mb-2">{role.title}</h3>
                  <p className="text-primary font-medium mb-4">{role.subtitle}</p>
                  <p className="text-muted-foreground mb-6">{role.description}</p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${role.gradient}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')}
                    className={`w-full gap-2 group/btn bg-gradient-to-r ${role.gradient} hover:opacity-90 text-white border-0`}
                  >
                    {role.cta}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
