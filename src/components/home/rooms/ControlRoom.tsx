/**
 * The Control Room
 * 
 * Room 3: How the magic happens.
 * Alternating image+content showcase layout.
 */

import { motion } from 'framer-motion';
import { Sliders, Upload, Wand2, Users2, Rocket } from 'lucide-react';
import { ClubRoom } from '../ClubRoom';
import artistUploadImg from '@/assets/promo/artist-upload-cloud.jpg';
import aiNeuralImg from '@/assets/promo/ai-neural-network.jpg';
import mixingFeedbackImg from '@/assets/promo/mixing-realtime-feedback.jpg';
import artistDeliveryImg from '@/assets/promo/artist-delivery.jpg';

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
    image: aiNeuralImg,
  },
  {
    icon: Users2,
    title: 'Collaborate',
    description: 'Work together in real-time with studio-quality streaming. Give feedback, iterate, perfect.',
    stat: '24h',
    statLabel: 'Avg Delivery',
    image: mixingFeedbackImg,
  },
  {
    icon: Rocket,
    title: 'Release',
    description: 'One click to distribute across 30+ streaming platforms. Your music, everywhere.',
    stat: '30+',
    statLabel: 'Platforms',
    image: artistDeliveryImg,
  },
];

export function ControlRoom() {
  return (
    <ClubRoom id="control" className="bg-background">
      <div className="container px-6 py-20 flex flex-col items-center justify-center min-h-[100svh]">
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

        {/* Alternating Image+Content Steps */}
        <div className="w-full max-w-5xl space-y-12 md:space-y-16 mb-16">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isReversed = index % 2 !== 0;

            return (
              <motion.div
                key={step.title}
                className={`flex flex-col gap-6 md:gap-10 items-center ${
                  isReversed ? 'md:flex-row-reverse' : 'md:flex-row'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Image Side */}
                <div className="w-full md:w-1/2">
                  <motion.div
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"
                    />
                    
                    {/* Step number overlay */}
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </div>

                    {/* Stat overlay (desktop hover) */}
                    <div className="absolute bottom-4 right-4 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/20">
                        <div className="text-2xl font-black text-primary">{step.stat}</div>
                        <div className="text-xs text-muted-foreground">{step.statLabel}</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
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

        {/* Stats row — Glassmorphic */}
        <motion.div
          className="rounded-2xl bg-background/60 backdrop-blur-md border border-border/20 p-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-black text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Match Success</div>
            </div>
            <div>
              <div className="text-3xl font-black text-secondary">24h</div>
              <div className="text-sm text-muted-foreground">Avg Delivery</div>
            </div>
            <div>
              <div className="text-3xl font-black text-accent">30+</div>
              <div className="text-sm text-muted-foreground">Platforms</div>
            </div>
            <div>
              <div className="text-3xl font-black text-primary">0</div>
              <div className="text-sm text-muted-foreground">Hidden Fees</div>
            </div>
          </div>
        </motion.div>
      </div>
    </ClubRoom>
  );
}
