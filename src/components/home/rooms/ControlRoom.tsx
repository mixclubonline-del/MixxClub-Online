/**
 * The Control Room
 * 
 * Room 3: How the magic happens.
 * Progressive step reveals with count-up stats and viewport-aware video playback.
 */

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sliders, Upload, Wand2, Users2, Rocket } from 'lucide-react';
import { ClubRoom } from '../ClubRoom';
import { useCountUp } from '@/hooks/useCountUp';
import { useInView } from '@/hooks/useInView';
import artistUploadImg from '@/assets/promo/artist-upload-cloud.jpg';
import mixxtechCityVideo from '@/assets/videos/mixxtech_city_video.mp4';
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
    statValue: 2,
    statSuffix: ' min',
    statLabel: 'Average Upload',
    image: artistUploadImg,
    isVideo: false,
  },
  {
    icon: Wand2,
    title: 'Match',
    description: 'AI analyzes your genre, vibe, and goals — then finds the perfect engineer for your sound.',
    statValue: 98,
    statSuffix: '%',
    statLabel: 'Match Success',
    image: mixxtechCityVideo,
    isVideo: true,
  },
  {
    icon: Users2,
    title: 'Collaborate',
    description: 'Work together in real-time with studio-quality streaming. Give feedback, iterate, perfect.',
    statValue: 24,
    statSuffix: 'h',
    statLabel: 'Avg Delivery',
    image: primeVideo,
    isVideo: true,
  },
  {
    icon: Rocket,
    title: 'Release',
    description: 'One click to distribute across 30+ streaming platforms. Your music, everywhere.',
    statValue: 30,
    statSuffix: '+',
    statLabel: 'Platforms',
    image: novaReleaseUiImg,
    isVideo: false,
  },
];

function StepMedia({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [containerRef, isVisible] = useInView<HTMLDivElement>({ once: false, threshold: 0.3 });

  useEffect(() => {
    if (!videoRef.current || !step.isVideo) return;
    if (isVisible) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isVisible, step.isVideo]);

  return (
    <div ref={containerRef} className="w-full md:w-1/2">
      <motion.div
        className="relative aspect-[4/3] rounded-2xl overflow-hidden group border border-white/[0.06]"
        whileHover={{ scale: 1.02 }}
      >
        {step.isVideo ? (
          <video
            ref={videoRef}
            src={step.image}
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
          style={{ color: STEP_ACCENTS[index] }}
        >
          {index + 1}
        </div>

        {/* Stat overlay (desktop hover) */}
        <div className="absolute bottom-4 right-4 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="mg-panel px-4 py-2.5">
            <div className="relative z-10 text-2xl font-black" style={{ color: STEP_ACCENTS[index] }}>
              {step.statValue}{step.statSuffix}
            </div>
            <div className="relative z-10 text-xs text-muted-foreground">{step.statLabel}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AnimatedStat({ value, suffix, label, color, enabled }: { value: number; suffix: string; label: string; color: string; enabled: boolean }) {
  const { display } = useCountUp({ end: value, suffix, enabled, duration: 1500 });
  return (
    <div>
      <div className="text-3xl font-black" style={{ color }}>{display}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function ControlRoom() {
  const [statsRef, statsInView] = useInView<HTMLDivElement>({ once: true });

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

        {/* Steps with progressive reveals */}
        <div className="w-full max-w-5xl space-y-12 md:space-y-16 mb-16">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isReversed = index % 2 !== 0;

            return (
              <motion.div
                key={step.title}
                className={`flex flex-col gap-6 md:gap-10 items-center ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'}`}
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <StepMedia step={step} index={index} />

                {/* Content Side */}
                <div className="w-full md:w-1/2">
                  <motion.div
                    className="flex items-center gap-3 mb-4"
                    initial={{ opacity: 0, x: isReversed ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <motion.div
                      className="mg-icon"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">{step.title}</h3>
                  </motion.div>

                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Stat (mobile) */}
                  <div className="md:hidden flex items-center gap-3">
                    <span className="text-3xl font-black text-primary">{step.statValue}{step.statSuffix}</span>
                    <span className="text-sm text-muted-foreground">{step.statLabel}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats row with count-up animation */}
        <motion.div
          ref={statsRef}
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
            <AnimatedStat value={98} suffix="%" label="Match Success" color="hsl(var(--primary))" enabled={statsInView} />
            <AnimatedStat value={24} suffix="h" label="Avg Delivery" color="hsl(var(--secondary))" enabled={statsInView} />
            <AnimatedStat value={30} suffix="+" label="Platforms" color="hsl(var(--accent))" enabled={statsInView} />
            <AnimatedStat value={0} suffix="" label="Hidden Fees" color="hsl(var(--primary))" enabled={statsInView} />
          </div>
        </motion.div>
      </div>
    </ClubRoom>
  );
}
