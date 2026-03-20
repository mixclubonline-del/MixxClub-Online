import { SEOHead } from '@/components/SEOHead';
import { generateServiceSchema } from '@/lib/seo-schema';
import { motion } from 'framer-motion';
import { Music, Sparkles, Radio, Brain, Sliders } from 'lucide-react';
import { ServicesDistrict } from '@/components/services/ServicesDistrict';
import { ServicePortal } from '@/components/services/ServicePortal';
import { DistrictWelcome } from '@/components/services/DistrictWelcome';
import { useServicesAssets } from '@/hooks/useServicesAssets';
import { FAQSection } from '@/components/seo/FAQSection';
import servicesLobbyStatic from '@/assets/services-lobby.jpg';

export default function Services() {
  // Dynamic asset with static fallback
  const { lobby: dynamicLobby, isLoading } = useServicesAssets();
  const servicesLobby = dynamicLobby || servicesLobbyStatic;

  const services = [
    {
      id: 'mixing',
      icon: <Sliders className="w-10 h-10" />,
      label: 'Mixing Studio',
      description: 'Professional mixing with real engineers and AI-powered insights',
      price: 'From $75',
      link: '/services/mixing',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'mastering',
      icon: <Sparkles className="w-10 h-10" />,
      label: 'Mastering Suite',
      description: 'Premium mastering for radio-ready, streaming-optimized sound',
      price: 'From $9.99',
      link: '/services/mastering',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'ai-mastering',
      icon: <Brain className="w-10 h-10" />,
      label: 'AI Processing',
      description: 'Instant AI-powered mastering using cutting-edge audio intelligence',
      price: 'From $29',
      link: '/services/ai-mastering',
      gradient: 'from-cyan-500 to-accent'
    },
    {
      id: 'distribution',
      icon: <Radio className="w-10 h-10" />,
      label: 'Distribution Hub',
      description: 'Get your music on all major streaming platforms worldwide',
      price: 'From $19.99/yr',
      link: '/services/distribution',
      gradient: 'from-accent to-purple-500'
    }
  ];

  return (
    <>
      <SEOHead
        title="Services District"
        description="Professional audio services: mixing, mastering, AI mastering, and distribution. Transform your sound from bedroom to billboard."
        keywords="mixing services, mastering services, AI mastering, music distribution, audio engineering"
      />

      <ServicesDistrict backgroundAsset={servicesLobby}>
        {/* Hero section with welcome */}
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
          <DistrictWelcome 
            title="Services District"
            subtitle="Professional audio services await. Choose your destination."
          />

          {/* Service portals grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              >
                <ServicePortal
                  id={service.id}
                  icon={service.icon}
                  label={service.label}
                  description={service.description}
                  price={service.price}
                  link={service.link}
                  gradient={service.gradient}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-1.5 h-3 bg-white/60 rounded-full" />
            </motion.div>
          </motion.div>
        </div>

        {/* Additional info section */}
        <div className="py-20 px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
              <Music className="w-12 h-12 text-accent mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                From Bedroom to Billboard
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Every service in the district is designed to elevate your music. 
                Real engineers, cutting-edge AI, and a community that cares about your success.
              </p>
            </div>
          </motion.div>
        </div>
      </ServicesDistrict>
    </>
  );
}
