/**
 * The Green Room
 * 
 * Room 2: Your people are already here.
 * Community presence, role portals, and live testimonial carousel.
 */

import { motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClubRoom } from '../ClubRoom';
import { TestimonialCarousel } from './TestimonialCarousel';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { getCharacter } from '@/config/characters';
import portalArtistImg from '@/assets/videos/portal_artist.webp';
import portalEngineerImg from '@/assets/videos/portal_engineer.webp';

export function GreenRoom() {
  const { totalOnline, onlineEngineers, onlineArtists, isLoading } = useOnlineUsers();

  const jax = getCharacter('jax');
  const rell = getCharacter('rell');

  const roles = [
    {
      character: jax,
      title: 'Artist',
      subtitle: 'Creator, Musician',
      onlineCount: onlineArtists,
      href: '/for-artists',
      glowColor: 'rgba(168, 85, 247, 0.15)',
      accentHsl: 'hsl(271, 91%, 65%)',
      portalImage: portalArtistImg,
    },
    {
      character: rell,
      title: 'Engineer',
      subtitle: 'Mixer, Producer',
      onlineCount: onlineEngineers,
      href: '/for-engineers',
      glowColor: 'rgba(249, 115, 22, 0.15)',
      accentHsl: 'hsl(25, 95%, 53%)',
      portalImage: portalEngineerImg,
    },
  ];

  return (
    <ClubRoom id="green" className="bg-background relative overflow-hidden">
      {/* Ambient orbs */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.07) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 7, repeat: Infinity }}
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
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm uppercase tracking-widest text-primary/80">
              The Green Room
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-4">
            Your people are{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              already here.
            </span>
          </h2>
        </motion.div>

        {/* Live counter */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="mg-pill px-6 py-3">
            <motion.span
              className="relative flex h-3 w-3"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </motion.span>
            <span className="text-lg font-semibold text-primary">
              {isLoading ? '...' : totalOnline.toLocaleString()} creators online now
            </span>
          </div>
        </motion.div>

        {/* Role Portals */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
          {roles.map((role, index) => (
            <Link to={role.href} key={role.title}>
              <motion.div
                className="mg-panel group overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -6, scale: 1.01 }}
              >
                {/* Portal Image Header */}
                <div className="relative h-[180px] overflow-hidden">
                  <img
                    src={role.portalImage}
                    alt={`${role.title} portal`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to bottom, transparent 20%, hsl(var(--background)) 100%)'
                    }}
                  />

                  {/* Character avatar */}
                  <motion.div
                    className="absolute -bottom-6 left-6 w-16 h-16 rounded-xl overflow-hidden border-4 border-background"
                    style={{ boxShadow: `0 0 30px ${role.glowColor}` }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <img
                      src={role.character.avatarPath}
                      alt={role.character.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>

                {/* Card content */}
                <div className="p-8 pt-10">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold">{role.title}</h3>
                    <p className="text-muted-foreground">{role.subtitle}</p>
                  </div>

                  <p className="text-muted-foreground italic mb-6">
                    "{role.character.sampleQuotes[0]}"
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {role.onlineCount} online
                    </span>
                    <span className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at center 70%, ${role.glowColor} 0%, transparent 70%)` }}
                />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Testimonial Carousel */}
        <motion.div
          className="w-full max-w-lg mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <TestimonialCarousel />
        </motion.div>

        {/* Connection tagline */}
        <motion.p
          className="text-lg text-muted-foreground text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Brooklyn ↔ Lagos.{' '}
          <span className="text-primary">Connected in 3 minutes.</span>
        </motion.p>
      </div>
    </ClubRoom>
  );
}
