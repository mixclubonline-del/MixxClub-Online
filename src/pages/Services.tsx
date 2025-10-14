import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import GlobalHeader from '@/components/GlobalHeader';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';
import { Music, Sparkles, Radio, Upload } from 'lucide-react';

export default function Services() {
  const { systemMode } = usePrime();

  const services = [
    {
      icon: Music,
      title: 'Mixing',
      description: 'Professional mixing services to bring balance, clarity, and depth to your tracks',
      features: ['Multi-track mixing', 'EQ & compression', 'Spatial imaging', 'Revision rounds'],
      price: 'From $200',
      link: '/services/mixing',
      gradient: 'from-accent-blue to-accent-cyan'
    },
    {
      icon: Sparkles,
      title: 'Mastering',
      description: 'Premium mastering services for radio-ready, streaming-optimized sound',
      features: ['Stereo mastering', 'Loudness optimization', 'Format delivery', 'Reference matching'],
      price: 'From $100',
      link: '/services/mastering',
      gradient: 'from-accent to-accent-blue'
    },
    {
      icon: Radio,
      title: 'AI Mastering',
      description: 'Instant AI-powered mastering using cutting-edge audio intelligence',
      features: ['Instant processing', 'Genre-optimized', 'Unlimited revisions', 'Before/after preview'],
      price: 'From $29',
      link: '/services/ai-mastering',
      gradient: 'from-accent-cyan to-accent'
    },
    {
      icon: Upload,
      title: 'Distribution',
      description: 'Get your music on all major streaming platforms worldwide',
      features: ['Spotify, Apple Music', 'YouTube, TikTok', 'Revenue tracking', 'Global delivery'],
      price: 'From $19.99/year',
      link: '/services/distribution',
      gradient: 'from-purple-500 to-accent'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Services — MixClub Online</title>
        <meta 
          name="description" 
          content="Professional audio services: mixing, mastering, AI mastering, and distribution. Transform your sound from bedroom to billboard." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a]">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <PrimeGlow intensity={0.6}>
            <div className="text-center mb-16">
              <div className="text-6xl mb-4">🎚️</div>
              <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-blue">
                Professional Services
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From mixing to distribution, we provide every service you need to elevate your music
              </p>
              <div className="text-sm font-mono text-accent-cyan mt-4">
                PRIME STATUS: {systemMode.toUpperCase()}
              </div>
            </div>
          </PrimeGlow>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {services.map((service, index) => (
              <Link
                key={index}
                to={service.link}
                className="group relative p-8 rounded-2xl bg-card/30 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--accent)/0.3)]"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative">
                  <service.icon className="w-12 h-12 mb-4 text-accent group-hover:scale-110 transition-transform" />
                  
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6">
                    {service.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-accent">
                      {service.price}
                    </span>
                    <span className="text-sm text-muted-foreground group-hover:text-accent transition-colors">
                      Learn more →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <a 
              href="/" 
              className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-accent to-accent-blue text-foreground hover:shadow-[0_0_30px_hsl(var(--accent)/0.5)] transition-all font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
