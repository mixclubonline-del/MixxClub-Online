import { motion } from 'framer-motion';
import { Mic, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { usePageContent } from '@/hooks/usePageContent';

export const NetworkExplainer = () => {
  const { content: sectionTitle } = usePageContent('home', 'network_title');
  const { content: sectionSubtitle } = usePageContent('home', 'network_subtitle');
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            One Network. Infinite Connections.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            This isn't a platform. This is a network of creators. Find your people.
          </p>
        </motion.div>

        {/* Connection visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {/* Artist Node */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px hsl(var(--primary) / 0.2)',
                    '0 0 40px hsl(var(--primary) / 0.4)',
                    '0 0 20px hsl(var(--primary) / 0.2)',
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-4"
              >
                <Mic className="w-10 h-10 text-primary" />
              </motion.div>
              <h3 className="text-xl font-bold mb-1">Artist in Brooklyn</h3>
              <p className="text-sm text-muted-foreground">Uploaded at 2AM</p>
            </div>

            {/* Connection line */}
            <div className="hidden md:flex items-center gap-2">
              <motion.div 
                className="h-0.5 w-32 bg-gradient-to-r from-primary to-primary/50"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1 }}
              >
                <ArrowRight className="w-6 h-6 text-primary" />
              </motion.div>
              <motion.div 
                className="h-0.5 w-32 bg-gradient-to-r from-primary/50 to-primary"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, duration: 0.8 }}
              />
            </div>

            {/* Mobile connection */}
            <motion.div 
              className="md:hidden h-16 w-0.5 bg-gradient-to-b from-primary to-primary/50"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            />

            {/* Engineer Node */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px hsl(var(--primary) / 0.2)',
                    '0 0 40px hsl(var(--primary) / 0.4)',
                    '0 0 20px hsl(var(--primary) / 0.2)',
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-4"
              >
                <SlidersHorizontal className="w-10 h-10 text-primary" />
              </motion.div>
              <h3 className="text-xl font-bold mb-1">Engineer in Atlanta</h3>
              <p className="text-sm text-muted-foreground">First mix by sunrise</p>
            </div>
          </div>

          {/* Story text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.5 }}
            className="mt-16 text-center"
          >
            <p className="text-lg md:text-xl text-muted-foreground italic max-w-3xl mx-auto">
              "She uploaded her vocals at 2AM. By sunrise, a Grammy-winning engineer had sent her first mix."
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
