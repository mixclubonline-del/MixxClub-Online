import Navigation from '@/components/Navigation';
import { PrimeWelcome } from '@/components/prime/PrimeWelcome';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Upload, Zap, DollarSign, Check, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

const AIMastering = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const packages = [
    {
      name: 'Single Track',
      price: 9.99,
      features: [
        '1 mastered track',
        'Unlimited revisions',
        'All platform formats',
        'Instant delivery',
      ],
    },
    {
      name: 'EP Package',
      price: 34.99,
      features: [
        'Up to 5 tracks',
        'Consistent sound',
        'Unlimited revisions',
        'All platform formats',
        'Priority processing',
      ],
      popular: true,
    },
    {
      name: 'Album Package',
      price: 79.99,
      features: [
        'Up to 15 tracks',
        'Album flow optimization',
        'Unlimited revisions',
        'All platform formats',
        'Dedicated support',
      ],
    },
  ];

  const beforeAfterMetrics = [
    { label: 'Loudness (LUFS)', before: '-14', after: '-9', target: 'Streaming optimized' },
    { label: 'Dynamic Range', before: '6 dB', after: '8 dB', target: 'Balanced punch' },
    { label: 'Frequency Balance', before: '65%', after: '95%', target: 'Crystal clear' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container px-6 py-12">
        {/* Hero */}
        <div className="max-w-4xl mx-auto mb-20">
          <PrimeWelcome 
            userName={user?.user_metadata?.full_name}
            userRole="artist"
            onGetStarted={() => navigate('#pricing')}
            onDismiss={() => {}}
          />
        </div>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-4xl font-black text-center mb-12">
            How <span className="text-primary">AI Mastering</span> Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Upload, title: 'Upload', desc: 'Drop your mixed track' },
              { icon: Sparkles, title: 'AI Analyzes', desc: 'Neural network processing' },
              { icon: Zap, title: 'Instant Master', desc: 'Ready in 60 seconds' },
              { icon: Music, title: 'Download', desc: 'All platform formats' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-elegant transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Before/After */}
        <section className="mb-20 max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-12">
            The <span className="text-primary">Difference</span>
          </h2>
          
          <Card className="p-8 bg-card/50 backdrop-blur">
            <div className="space-y-6">
              {beforeAfterMetrics.map((metric, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{metric.label}</span>
                    <Badge variant="secondary">{metric.target}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Before</div>
                      <div className="text-lg font-bold">{metric.before}</div>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">After AI Mastering</div>
                      <div className="text-lg font-bold text-primary">{metric.after}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mb-20">
          <h2 className="text-4xl font-black text-center mb-4">
            Simple <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Professional mastering at a fraction of traditional studio costs
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`relative overflow-hidden ${pkg.popular ? 'border-primary shadow-elegant' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-black">${pkg.price}</span>
                      <span className="text-muted-foreground ml-2">USD</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => navigate(user ? '/artist-crm?tab=business' : '/auth?signup=true')}
                      className="w-full"
                      variant={pkg.popular ? 'default' : 'outline'}
                    >
                      {user ? 'Get Started' : 'Sign Up to Master'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-12">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'How does AI mastering compare to human mastering?',
                a: 'Our AI has been trained on over 100,000 professionally mastered tracks. It delivers consistent, high-quality results instantly. For specialized needs, you can always work with our human engineers.',
              },
              {
                q: 'What file formats do you accept?',
                a: 'We accept WAV, AIFF, FLAC, and MP3 files. For best results, upload high-quality WAV or AIFF files at 24-bit/44.1kHz or higher.',
              },
              {
                q: 'Can I get revisions?',
                a: 'Absolutely! All packages include unlimited revisions. Just adjust your settings and remaster instantly.',
              },
              {
                q: 'What platforms are the masters optimized for?',
                a: 'We optimize for all major platforms: Spotify, Apple Music, YouTube, SoundCloud, Tidal, and more. You\'ll receive files ready for each platform.',
              },
            ].map((faq, i) => (
              <Card key={i} className="p-6">
                <h3 className="font-bold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AIMastering;
