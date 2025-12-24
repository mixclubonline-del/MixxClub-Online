import { motion } from 'framer-motion';
import { Play, Sparkles, Users } from 'lucide-react';

export function PremierePromise() {
  return (
    <div className="relative w-full max-w-4xl mx-auto text-center">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-primary/10 via-transparent to-transparent rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Stage Icon */}
        <div className="inline-flex items-center justify-center mb-6">
          <motion.div
            className="relative"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent-magenta to-accent-blue p-[2px]">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <Play className="w-8 h-8 text-primary ml-1" />
              </div>
            </div>
            
            {/* Sparkle decorations */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-accent-magenta" />
            </motion.div>
          </motion.div>
        </div>

        {/* Main Statement */}
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
          <span className="text-foreground">Music mixed here,</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-accent-magenta to-accent-blue bg-clip-text text-transparent">
            gets premiered here.
          </span>
        </h2>

        {/* Subtext */}
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-8">
          This isn't just a platform. It's a stage. When artists and engineers create together on MixClub, fans experience it first—right here, together.
        </p>

        {/* The MixClub Difference */}
        <motion.div
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Users className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground uppercase tracking-wider">
            The MixClub Difference
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
