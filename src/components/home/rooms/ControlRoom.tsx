/**
 * The Control Room
 * 
 * Room 3: How the magic happens.
 * Simple step-by-step workflow visualization.
 */

import { motion } from 'framer-motion';
import { Sliders, Upload, Wand2, Users2, Rocket } from 'lucide-react';
import { ClubRoom } from '../ClubRoom';

const STEPS = [
  {
    icon: Upload,
    title: 'Create',
    description: 'Upload your track',
    stat: '2 min',
  },
  {
    icon: Wand2,
    title: 'Match',
    description: 'AI finds your engineer',
    stat: '98%',
  },
  {
    icon: Users2,
    title: 'Collaborate',
    description: 'Work in real-time',
    stat: '24h',
  },
  {
    icon: Rocket,
    title: 'Release',
    description: 'Distribute everywhere',
    stat: '30+',
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

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 w-full max-w-5xl mb-16">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              className="flex items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              {/* Step card */}
              <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-muted/20 border border-border/30 w-40">
                {/* Step number */}
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                
                {/* Icon */}
                <motion.div
                  className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <step.icon className="w-6 h-6 text-primary" />
                </motion.div>
                
                {/* Title */}
                <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{step.description}</p>
                
                {/* Stat */}
                <span className="text-lg font-black text-primary">{step.stat}</span>
              </div>

              {/* Connector arrow (not on last item) */}
              {index < STEPS.length - 1 && (
                <motion.div
                  className="hidden md:block w-8 h-0.5 bg-gradient-to-r from-primary/50 to-primary/20 mx-2"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.2 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
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
        </motion.div>
      </div>
    </ClubRoom>
  );
}
