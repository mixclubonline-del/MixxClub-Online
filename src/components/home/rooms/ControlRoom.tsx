/**
 * The Control Room
 * 
 * Room 3: How the magic happens.
 * Alternating image+content showcase with glassmorphic cards and role-aware accents.
 */

import { motion } from 'framer-motion';
import { Sliders, Upload, Wand2, Users2, Rocket } from 'lucide-react';
import { ClubRoom } from '../ClubRoom';
import artistUploadImg from '@/assets/promo/artist-upload-cloud.jpg';
import mixxtechCityImg from '@/assets/promo/mixxtech_city_hub.png';
import mixxtechCityVideo from '@/assets/videos/mixxtech_city_video.mp4';
import primeImg from '@/assets/characters/prime_original.png';
import primeVideo from '@/assets/videos/prime_hero_video.mp4';
import novaReleaseUiImg from '@/assets/promo/nova-ui.png';

const STEP_ACCENTS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--primary))',
];

const STEPS = [
  {
    icon: Upload,
    title: 'Create',
    description: 'Upload your track with a few taps. Add vision notes so your engineer knows your sound.',
    stat: '2 min',
    statLabel: 'Average Upload',
    image: artistUploadImg,
  },
  {
    icon: Wand2,
    title: 'Match',
    description: 'AI analyzes your genre, vibe, and goals — then finds the perfect engineer for your sound.',
    stat: '98%',
    statLabel: 'Match Success',
    image: mixxtechCityVideo, // Upgraded to video
  },
  {
    icon: Users2,
    title: 'Collaborate',
    description: 'Work together in real-time with studio-quality streaming. Give feedback, iterate, perfect.',
    stat: '24h',
    statLabel: 'Avg Delivery',
    image: primeVideo, // Upgraded to video
  },
  {
    icon: Rocket,
    title: 'Release',
    description: 'One click to distribute across 30+ streaming platforms. Your music, everywhere.',
    stat: '30+',
    statLabel: 'Platforms',
    image: novaReleaseUiImg,
  },
];

export function ControlRoom() {
  return (
    <ClubRoom id="control" className="bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative container px-6 py-20 flex flex-col items-center justify-center min-h-[100svh]">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-primary" />
            <span className="text-sm uppercase tracking-widest text-primary/80">
              The Control Room
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-4">
            How the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              magic
            </span>{' '}
            happens.
          </h2>
        </motion.div>

        {/* Alternating Steps — Glassmorphic */}
        <div className="w-full max-w-5xl space-y-12 md:space-y-16 mb-16">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isReversed = index % 2 !== 0;
            const accent = STEP_ACCENTS[index];

            return (
              <motion.div
                key={step.title}
                className={`flex flex-col gap-6 md:gap-10 items-center ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'
                  }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Image Side — with glassmorphic overlay */}
                <div className="w-full md:w-1/2">
                  <motion.div
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden group border border-white/[0.06]"
                    whileHover={{ scale: 1.02 }}
                  >
                    {step.image.endsWith('.mp4') ? (
                      <video
                        src={step.image}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />

                    {/* Step number */}
                    <div
                      className="absolute top-4 left-4 mg-pill font-bold text-sm"
                      style={{ color: accent }}
                    >
                      {index + 1}
                    </div>

                    {/* Stat overlay (desktop hover) */}
                    <div className="absolute bottom-4 right-4 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="mg-panel px-4 py-2.5">
                        <div className="relative z-10 text-2xl font-black" style={{ color: accent }}>{step.stat}</div>
                        <div className="relative z-10 text-xs text-muted-foreground">{step.statLabel}</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      className="mg-icon"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">{step.title}</h3>
                  </div>

                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Stat (mobile) */}
                  <div className="md:hidden flex items-center gap-3">
                    <span className="text-3xl font-black text-primary">{step.stat}</span>
                    <span className="text-sm text-muted-foreground">{step.statLabel}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats row — Enhanced Glassmorphic */}
        <motion.div
          className="rounded-2xl border p-8 w-full max-w-5xl"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 0 80px -30px hsl(var(--primary) / 0.1)',
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '98%', label: 'Match Success', color: 'text-primary' },
              { value: '24h', label: 'Avg Delivery', color: 'text-secondary' },
              { value: '30+', label: 'Platforms', color: 'text-accent' },
              { value: '0', label: 'Hidden Fees', color: 'text-primary' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </ClubRoom>
  );
}
