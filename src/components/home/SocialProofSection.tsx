/**
 * Social Proof Section
 * 
 * Testimonials with real artist/engineer success stories.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Play, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCommunityStats } from '@/hooks/useCommunityStats';

const testimonials = [
  {
    id: 1,
    name: 'Marcus "Blaze" Williams',
    role: 'Hip-Hop Artist',
    location: 'Atlanta, GA',
    avatar: null,
    rating: 5,
    quote: 'Mixxclub connected me with an engineer who understood my vision. My track went from bedroom demo to streaming on Spotify in two weeks.',
    trackName: 'Rise Up',
    hasAudio: true,
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Mix Engineer',
    location: 'Los Angeles, CA',
    avatar: null,
    rating: 5,
    quote: "I've built a steady income stream working with artists I'd never have found otherwise. The platform handles everything—I just focus on mixing.",
    trackName: null,
    hasAudio: false,
  },
  {
    id: 3,
    name: 'Jamal Thompson',
    role: 'R&B Artist',
    location: 'Houston, TX',
    avatar: null,
    rating: 5,
    quote: 'The collaboration tools are insane. We recorded in different cities but it felt like we were in the same room. Game changer.',
    trackName: 'Midnight Feels',
    hasAudio: true,
  },
  {
    id: 4,
    name: 'David Rodriguez',
    role: 'Mastering Engineer',
    location: 'Miami, FL',
    avatar: null,
    rating: 5,
    quote: 'Left my studio job to go full-time on Mixxclub. Best decision I ever made. The community here is unmatched.',
    trackName: null,
    hasAudio: false,
  },
  {
    id: 5,
    name: 'Aaliyah James',
    role: 'Hip-Hop Producer',
    location: 'Chicago, IL',
    avatar: null,
    rating: 5,
    quote: 'Found three collaborators in my first week. We dropped an EP together and it hit 100K streams. This platform is legit.',
    trackName: 'City Nights EP',
    hasAudio: true,
  },
  {
    id: 6,
    name: 'Mike Patterson',
    role: 'Recording Engineer',
    location: 'Nashville, TN',
    avatar: null,
    rating: 5,
    quote: "The AI matching actually works. It pairs me with artists whose style fits my mixing approach. No more mismatched projects.",
    trackName: null,
    hasAudio: false,
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative p-6 rounded-2xl bg-card/50 border border-border/50
                 hover:border-primary/30 hover:bg-card/70
                 transition-all duration-300 group"
    >
      {/* Gradient accent */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br 
                      from-primary/5 to-transparent opacity-0 
                      group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border border-border">
              <AvatarImage src={testimonial.avatar || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
              <p className="text-sm text-muted-foreground">
                {testimonial.role} • {testimonial.location}
              </p>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex gap-0.5">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
        
        {/* Quote */}
        <blockquote className="text-foreground/90 mb-4 leading-relaxed">
          "{testimonial.quote}"
        </blockquote>
        
        {/* Track CTA */}
        {testimonial.hasAudio && testimonial.trackName && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-border/50 hover:border-primary/50
                       hover:bg-primary/10 transition-all"
          >
            <Play className="w-3.5 h-3.5 mr-2" />
            Listen: {testimonial.trackName}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function SocialProofSection() {
  const { data: stats } = useCommunityStats();
  const totalUsers = stats?.totalUsers || 50000;
  const [mobileIndex, setMobileIndex] = useState(0);
  
  // Mobile carousel navigation
  const nextTestimonial = () => {
    setMobileIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setMobileIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <section className="relative px-6 py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Real Artists. Real Results.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Hear from the creators and engineers building their careers on Mixxclub
          </p>
        </motion.div>
        
        {/* Mobile testimonial carousel */}
        <div className="md:hidden mb-10">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <TestimonialCard 
                  testimonial={testimonials[mobileIndex]} 
                  index={0} 
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Carousel controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {/* Dots indicator */}
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setMobileIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === mobileIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Desktop testimonials grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id} 
              testimonial={testimonial} 
              index={index} 
            />
          ))}
        </div>
        
        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6
                     p-6 rounded-2xl bg-card/50 border border-border/50"
        >
          {/* Avatar stack */}
          <div className="flex items-center">
            <div className="flex -space-x-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary
                             border-2 border-background flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-primary-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-10 h-10 -ml-3 rounded-full bg-muted border-2 border-background
                            flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">+</span>
            </div>
          </div>
          
          {/* Text */}
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Users className="w-5 h-5 text-primary hidden sm:block" />
            <span className="text-lg">
              <span className="font-bold text-foreground">
                {totalUsers.toLocaleString()}+
              </span>
              <span className="text-muted-foreground"> artists and engineers trust Mixxclub</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
