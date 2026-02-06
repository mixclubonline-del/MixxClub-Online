/**
 * The Listening Room
 * 
 * Room 1: Real sound, real results.
 * Features audio transformation demos and social proof.
 */

import { motion } from 'framer-motion';
import { Volume2, Play, ChevronDown } from 'lucide-react';
import { ClubRoom } from '../ClubRoom';

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
    <ClubRoom id="listening" className="bg-background">
      <div className="container px-6 py-20 flex flex-col items-center justify-center min-h-[100svh]">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
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

        {/* Track Cards */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mb-16">
          {FEATURED_TRACKS.map((track, index) => (
            <motion.div
              key={track.title}
              className="group relative p-6 rounded-2xl bg-muted/30 border border-border/30 hover:border-primary/30 transition-all cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              {/* Waveform placeholder */}
              <div className="h-20 mb-4 flex items-end justify-around gap-0.5 px-2">
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-primary/60 rounded-full"
                    initial={{ height: '20%' }}
                    whileInView={{ height: `${30 + Math.sin(i * 0.5) * 30 + 20}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + i * 0.02 }}
                  />
                ))}
              </div>

              {/* Track info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground">{track.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {track.artist} → {track.result}
                  </p>
                </div>
                
                {/* Play button */}
                <motion.button
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-4 h-4 ml-0.5" />
                </motion.button>
              </div>

              {/* Genre tag */}
              <span className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary/80">
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
