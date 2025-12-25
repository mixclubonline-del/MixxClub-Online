import { motion } from 'framer-motion';
import { useState } from 'react';
import { AudioReactiveConnectionTriangle } from '@/components/waitlist/AudioReactiveConnectionTriangle';
import { AudioReactiveParticles } from '@/components/waitlist/AudioReactiveParticles';
import { FloatingAudioControls } from '@/components/waitlist/FloatingAudioControls';
import { ThreeStories } from '@/components/waitlist/ThreeStories';
import { PremierePromise } from '@/components/waitlist/PremierePromise';
import { WaitlistSignupForm } from '@/components/waitlist/WaitlistSignupForm';
import { SocialProofCounter } from '@/components/waitlist/SocialProofCounter';
import { AudioVisualizer } from '@/components/demo/AudioVisualizer';
import { useInsiderAudio } from '@/hooks/useInsiderAudio';
import { Helmet } from 'react-helmet-async';

export default function LaunchWaitlist() {
  const { 
    isPlaying, 
    isLoading, 
    analysis, 
    toggle, 
    setVolume 
  } = useInsiderAudio();
  
  const [volume, setVolumeState] = useState(0.7);

  const handleVolumeChange = (v: number) => {
    setVolumeState(v);
    setVolume(v);
  };

  // Audio values for reactivity
  const { bass, mid, high, amplitude, beats } = analysis;

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
        {/* Audio-reactive background gradients */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div 
            className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: `hsl(var(--primary) / ${0.05 + (bass / 255) * 0.15})`,
            }}
            animate={{
              scale: isPlaying ? 1 + (bass / 255) * 0.2 : 1,
            }}
            transition={{ duration: 0.1 }}
          />
          <motion.div 
            className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: `hsl(var(--accent-magenta) / ${0.05 + (mid / 255) * 0.1})`,
            }}
            animate={{
              scale: isPlaying ? 1 + (mid / 255) * 0.15 : 1,
            }}
            transition={{ duration: 0.1 }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px]"
            style={{
              background: `hsl(var(--accent-blue) / ${0.03 + (high / 255) * 0.08})`,
            }}
            animate={{
              scale: isPlaying ? 1 + (high / 255) * 0.1 : 1,
            }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Audio-reactive particles */}
        <AudioReactiveParticles 
          amplitude={amplitude}
          bass={bass}
          high={high}
          isPlaying={isPlaying}
        />

        {/* Floating audio controls */}
        <FloatingAudioControls
          isPlaying={isPlaying}
          isLoading={isLoading}
          volume={volume}
          onToggle={toggle}
          onVolumeChange={handleVolumeChange}
          amplitude={amplitude}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            {/* Logo/Brand with audio-reactive pulse */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.p 
                className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2"
                animate={{
                  opacity: isPlaying ? 0.6 + (amplitude / 255) * 0.4 : 1,
                }}
              >
                Something's Connecting
              </motion.p>
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold"
                animate={{
                  scale: isPlaying ? 1 + (bass / 255) * 0.02 : 1,
                }}
                transition={{ duration: 0.1 }}
              >
                <span className="bg-gradient-to-r from-primary via-accent-magenta to-accent-blue bg-clip-text text-transparent">
                  MixClub
                </span>
                <span className="text-foreground"> Online</span>
              </motion.h1>
            </motion.div>

            {/* Audio-reactive Triangle Animation */}
            <motion.div
              className="w-full mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <AudioReactiveConnectionTriangle 
                bass={bass}
                mid={mid}
                high={high}
                amplitude={amplitude}
                isPlaying={isPlaying}
              />
            </motion.div>

            {/* Scroll indicator with beat sync */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              animate={{ 
                y: isPlaying ? [0, 10 + (bass / 255) * 5, 0] : [0, 10, 0] 
              }}
              transition={{ duration: isPlaying ? 0.5 : 2, repeat: Infinity }}
            >
              <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
                <motion.div
                  className="w-1 h-2 rounded-full bg-muted-foreground/50"
                  animate={{ 
                    y: isPlaying ? [0, 8 + (bass / 255) * 4, 0] : [0, 8, 0],
                    backgroundColor: isPlaying && bass > 150 
                      ? 'hsl(var(--primary))' 
                      : 'hsl(var(--muted-foreground) / 0.5)'
                  }}
                  transition={{ duration: isPlaying ? 0.5 : 2, repeat: Infinity }}
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

          {/* Audio Visualizer at bottom */}
          {isPlaying && (
            <motion.div
              className="fixed bottom-0 left-0 right-0 h-16 z-40 pointer-events-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              <AudioVisualizer 
                beats={beats}
                amplitude={amplitude}
                bass={bass}
                variant="wave"
                className="absolute bottom-0 left-0 right-0 h-12 opacity-50"
              />
            </motion.div>
          )}

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
