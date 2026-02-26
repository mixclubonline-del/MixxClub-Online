import { motion } from 'framer-motion';
import { useChapterStore } from '@/stores/chapterStore';
import { Brain, Users, UserCheck, Cloud, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Brain, title: 'AI-Powered Analysis', description: 'Instant feedback on your mix with spectral analysis, loudness metering, and genre-aware suggestions.' },
  { icon: Users, title: 'Real-Time Collaboration', description: 'Work with engineers and artists simultaneously — shared playback, comments, and version control.' },
  { icon: UserCheck, title: 'Pro Engineer Matching', description: 'Our algorithm pairs you with the right engineer based on genre, style, and budget.' },
  { icon: Cloud, title: 'Secure Cloud Storage', description: 'All stems, sessions, and masters stored safely with unlimited revision history.' },
  { icon: FileText, title: 'Smart Contracts', description: 'Transparent split sheets, licensing, and payment terms — handled automatically.' },
  { icon: Calendar, title: 'Community & Events', description: 'Battles, workshops, listening sessions, and networking built right into the platform.' },
];

export default function FeaturesChapter() {
  const next = useChapterStore((s) => s.next);

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-start px-6 py-20 bg-background">
      {/* Hero */}
      <motion.div
        className="text-center max-w-3xl mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">What You Get</h2>
        <p className="text-lg text-muted-foreground">
          Everything you need to create, collaborate, and release — in one platform.
        </p>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mb-16">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="group p-6 rounded-2xl bg-background/40 backdrop-blur-md border border-white/10 hover:border-white/20 hover:shadow-lg transition-all"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            whileHover={{ y: -4 }}
          >
            <f.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <Button size="lg" onClick={next}>
          See Pricing →
        </Button>
      </motion.div>
    </div>
  );
}
