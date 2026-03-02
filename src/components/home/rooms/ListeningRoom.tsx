/**
 * The Listening Room
 * 
 * Room 1: Real sound, real results.
 * Features audio transformation demos with glassmorphic cards and cinematic hero.
 */

import { motion } from 'framer-motion';
import { Volume2, Play, ChevronDown } from 'lucide-react';
import { ClubRoom } from '../ClubRoom';
import listeningRoomVideo from '@/assets/videos/listening_room.webp';

const FEATURED_TRACKS = [
  { title: 'Neon Dreams', artist: 'Marcus', result: 'Pro Master', genre: 'Hip-Hop' },
  { title: 'Late Night', artist: 'Sarah', result: 'Streaming Ready', genre: 'R&B' },
  { title: 'Moonlight', artist: 'Jamal', result: 'Radio Play', genre: 'Trap' },
];

interface ListeningRoomProps {
  onScrollHint: () => void;
}

export function ListeningRoom({ onScrollHint }: ListeningRoomProps) {
  return (
    <ClubRoom id="listening" className="bg-background relative overflow-hidden">
      {/* Ambient glow orbs */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--secondary) / 0.06) 0%, transparent 70%)' }}
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative container px-6 py-20 flex flex-col items-center justify-center min-h-[100svh]">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-primary" />
            <span className="text-sm uppercase tracking-widest text-primary/80">
              The Listening Room
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-4">
            Real sound.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Real results.
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            87% of bedroom tracks never get finished.{' '}
            <span className="text-foreground">These ones did.</span>
          </p>
        </motion.div>

        {/* Hero Image — Enlarged & Cinematic */}
        <motion.div
          className="w-full max-w-5xl mb-14 rounded-2xl overflow-hidden relative group"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <img
            src={listeningRoomVideo}
            alt="Professional mixing console with bouncing meters"
            className="w-full h-[280px] md:h-[340px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, transparent 30%, hsl(var(--background)) 100%)'
            }}
          />
          {/* Subtle border glow */}
          <div className="absolute inset-0 rounded-2xl border border-white/[0.06] pointer-events-none" />
        </motion.div>

        {/* Track Cards — Glassmorphic */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mb-16">
          {FEATURED_TRACKS.map((track, index) => (
            <motion.div
              key={track.title}
              className="mg-panel group cursor-pointer overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              whileHover={{ y: -6 }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{ background: 'radial-gradient(circle at 50% 80%, hsl(var(--primary) / 0.12) 0%, transparent 70%)' }}
              />

              {/* Waveform area */}
              <div className="relative h-20 mb-4 flex items-end justify-around gap-0.5 px-2">
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full"
                    style={{ background: 'hsl(var(--primary) / 0.5)' }}
                    initial={{ height: '20%' }}
                    whileInView={{ height: `${30 + Math.sin(i * 0.5) * 30 + 20}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + i * 0.02 }}
                  />
                ))}
              </div>

              {/* Track info */}
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground">{track.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {track.artist} → {track.result}
                  </p>
                </div>

                {/* Play button */}
                <motion.button
                  className="w-10 h-10 rounded-full flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity border border-primary/20"
                  style={{ background: 'hsl(var(--primary) / 0.15)' }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-4 h-4 ml-0.5" />
                </motion.button>
              </div>

              {/* Genre tag */}
              <span className="mg-pill absolute top-4 right-4 text-xs">
                {track.genre}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Scroll hint */}
        <motion.button
          onClick={onScrollHint}
          className="flex flex-col items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.button>
      </div>
    </ClubRoom>
  );
}
