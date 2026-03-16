/**
 * TestimonialCarousel — Glassmorphic auto-rotating testimonial cards.
 * Pulls from hardcoded community testimonials with avatar fallbacks.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const TESTIMONIALS = [
  {
    name: 'Marcus "Blaze" Williams',
    role: 'Hip-Hop Artist',
    location: 'Atlanta, GA',
    quote: 'Mixxclub connected me with an engineer who understood my vision. My track went from bedroom demo to streaming on Spotify in two weeks.',
    initials: 'MW',
  },
  {
    name: 'Sarah Chen',
    role: 'Mix Engineer',
    location: 'Los Angeles, CA',
    quote: "I've built a steady income stream working with artists I'd never have found otherwise. The platform handles everything—I just focus on mixing.",
    initials: 'SC',
  },
  {
    name: 'Jamal Thompson',
    role: 'R&B Artist',
    location: 'Houston, TX',
    quote: 'The collaboration tools are insane. We recorded in different cities but it felt like we were in the same room. Game changer.',
    initials: 'JT',
  },
  {
    name: 'Aaliyah James',
    role: 'Hip-Hop Producer',
    location: 'Chicago, IL',
    quote: 'Found three collaborators in my first week. We dropped an EP together and it hit 100K streams. This platform is legit.',
    initials: 'AJ',
  },
  {
    name: 'David Rodriguez',
    role: 'Mastering Engineer',
    location: 'Miami, FL',
    quote: 'Left my studio job to go full-time on Mixxclub. Best decision I ever made. The community here is unmatched.',
    initials: 'DR',
  },
];

const INTERVAL = 5000;

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  const t = TESTIMONIALS[current];

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative overflow-hidden mg-panel p-6 md:p-8 min-h-[220px] flex flex-col justify-between">
        {/* Quote icon */}
        <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/15" />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {/* Quote text */}
            <p className="text-foreground/90 text-base leading-relaxed mb-6 italic">
              "{t.quote}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 mt-auto">
              <Avatar className="w-10 h-10 border border-primary/20">
                <AvatarFallback className="text-xs font-bold" style={{ background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>
                  {t.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role} · {t.location}</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          style={{ background: 'hsl(var(--muted) / 0.5)' }}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          style={{ background: 'hsl(var(--muted) / 0.5)' }}
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-primary w-4' : 'bg-muted-foreground/30'}`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
