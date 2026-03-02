import { motion } from 'framer-motion';
import { useChapterStore } from '@/stores/chapterStore';
import { PricingTierCards } from '@/components/home/PricingTierCards';
import { BulkPricingSection } from '@/components/home/BulkPricingSection';
import { Button } from '@/components/ui/button';

export default function PricingChapter() {
  const next = useChapterStore((s) => s.next);

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-start px-6 py-20 bg-background">
      {/* Hero */}
      <motion.div
        className="text-center max-w-3xl mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-lg text-muted-foreground">
          Pick a tier that matches your vision. Scale up anytime.
        </p>
      </motion.div>

      <div className="max-w-6xl w-full">
        <PricingTierCards />
        <BulkPricingSection />
      </div>

      {/* CTA */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <Button size="lg" onClick={next}>
          Get Started →
        </Button>
      </motion.div>
    </div>
  );
}
