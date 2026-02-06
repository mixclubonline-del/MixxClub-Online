/**
 * The Stage Door
 * 
 * Room 5: Your seat is waiting.
 * Final CTA and compact footer.
 */

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ClubRoom } from '../ClubRoom';
import { Button } from '@/components/ui/button';
import { HomeFooter } from '../HomeFooter';

interface StageDoorProps {
  onJoin: () => void;
}

export function StageDoor({ onJoin }: StageDoorProps) {
  const navigate = useNavigate();

  return (
    <ClubRoom id="stage" className="bg-background flex flex-col">
      {/* Main CTA area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* Logo glow */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 w-32 h-32 rounded-full bg-primary/30 blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          {/* Logo text */}
          <span className="relative text-5xl md:text-7xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            MIXXCLUB
          </span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-2xl md:text-3xl font-bold text-muted-foreground mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          From Bedroom to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Billboard.
          </span>
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={onJoin}
            size="lg"
            className="group text-lg px-10 py-6 h-auto"
          >
            Join the Club
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Sign in link */}
        <motion.p
          className="mt-6 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          Already a member?{' '}
          <Link 
            to="/auth?mode=login" 
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </motion.p>
      </div>

      {/* Footer */}
      <HomeFooter />
    </ClubRoom>
  );
}
