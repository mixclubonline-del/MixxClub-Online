import { motion } from 'framer-motion';
import { ConnectionTriangle } from '@/components/waitlist/ConnectionTriangle';
import { ThreeStories } from '@/components/waitlist/ThreeStories';
import { PremierePromise } from '@/components/waitlist/PremierePromise';
import { WaitlistSignupForm } from '@/components/waitlist/WaitlistSignupForm';
import { SocialProofCounter } from '@/components/waitlist/SocialProofCounter';
import { Helmet } from 'react-helmet-async';

// Floating particles component
function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}

export default function LaunchWaitlist() {
  return (
    <>
      <Helmet>
        <title>MixClub Online - Coming Soon | The Artist-Engineer-Fan Connection</title>
        <meta 
          name="description" 
          content="MixClub Online is where artists find world-class engineers, engineers discover new talent, and fans experience premieres. Join the waitlist for early access." 
        />
        <meta property="og:title" content="MixClub Online - Coming Soon" />
        <meta property="og:description" content="The connection between Artists, Engineers, and Fans. Join the waitlist." />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background gradients */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-magenta/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-blue/3 rounded-full blur-[150px]" />
        </div>

        <FloatingParticles />

        {/* Content */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            {/* Logo/Brand */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
                Something's Connecting
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-primary via-accent-magenta to-accent-blue bg-clip-text text-transparent">
                  MixClub
                </span>
                <span className="text-foreground"> Online</span>
              </h1>
            </motion.div>

            {/* Triangle Animation */}
            <motion.div
              className="w-full mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <ConnectionTriangle />
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
                <motion.div
                  className="w-1 h-2 rounded-full bg-muted-foreground/50"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </section>

          {/* Three Stories Section */}
          <section className="min-h-screen flex items-center justify-center px-4 py-20">
            <ThreeStories />
          </section>

          {/* Premiere Promise Section */}
          <section className="py-20 px-4">
            <PremierePromise />
          </section>

          {/* Signup Section */}
          <section className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Ready to Join?
              </h2>
              <p className="text-muted-foreground text-sm">
                Be among the first to experience the connection.
              </p>
            </motion.div>

            <WaitlistSignupForm />

            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <SocialProofCounter />
            </motion.div>
          </section>

          {/* Footer */}
          <footer className="py-8 px-4 text-center border-t border-border/20">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MixClub Online. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
