import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAfter, setShowAfter] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  // Generate demo waveform data
  const generateWaveformBars = (count: number, isMastered: boolean) => {
    return Array.from({ length: count }, (_, i) => {
      const base = isMastered ? 0.6 : 0.3;
      const variance = isMastered ? 0.2 : 0.5;
      return base + Math.random() * variance;
    });
  };

  const beforeBars = generateWaveformBars(64, false);
  const afterBars = generateWaveformBars(64, true);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Hear the Future Instantly
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI + Human Mastering in one flow. Experience MIXXCLUB's signature clarity.
          </p>
        </motion.div>

        {/* Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative p-8 md:p-12 rounded-3xl backdrop-blur-xl border border-primary/20 bg-card/50"
        >
          {/* Before/After Slider */}
          <div className="relative h-64 mb-8 rounded-2xl bg-background/50 overflow-hidden">
            {/* Before Waveform */}
            <div 
              className="absolute inset-0 flex items-end justify-around px-4 pb-4 gap-1"
              style={{ 
                clipPath: `polygon(0 0, ${sliderValue}% 0, ${sliderValue}% 100%, 0 100%)`,
              }}
            >
              {beforeBars.map((height, i) => (
                <motion.div
                  key={`before-${i}`}
                  className="flex-1 bg-red-400 rounded-t"
                  style={{ height: `${height * 100}%` }}
                  animate={isPlaying ? {
                    height: [`${height * 100}%`, `${height * 90}%`, `${height * 100}%`]
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.02
                  }}
                />
              ))}
            </div>

            {/* After Waveform */}
            <div 
              className="absolute inset-0 flex items-end justify-around px-4 pb-4 gap-1"
              style={{ 
                clipPath: `polygon(${sliderValue}% 0, 100% 0, 100% 100%, ${sliderValue}% 100%)`,
              }}
            >
              {afterBars.map((height, i) => (
                <motion.div
                  key={`after-${i}`}
                  className="flex-1 bg-cyan-400 rounded-t"
                  style={{ height: `${height * 100}%` }}
                  animate={isPlaying ? {
                    height: [`${height * 100}%`, `${height * 95}%`, `${height * 100}%`]
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.02
                  }}
                />
              ))}
            </div>

            {/* Slider Handle */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
            />
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-white/50 pointer-events-none z-20"
              style={{ left: `${sliderValue}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                <Volume2 size={16} className="text-background" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-500/80 backdrop-blur-sm text-xs font-bold text-white">
              BEFORE
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-cyan-500/80 backdrop-blur-sm text-xs font-bold text-white">
              AFTER (AI MASTERED)
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            <Button
              onClick={togglePlay}
              size="lg"
              className="gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? 'Pause Demo' : 'Play Demo'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-primary/50 hover:bg-primary/10"
            >
              <Upload size={20} />
              Upload Your Clip
            </Button>
          </div>

          {/* Metrics Comparison */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Loudness', before: '-14 LUFS', after: '-9 LUFS' },
              { label: 'Clarity', before: '62%', after: '95%' },
              { label: 'Stereo Width', before: '45%', after: '78%' },
              { label: 'Frequency Balance', before: 'Poor', after: 'Excellent' },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-4 rounded-xl bg-background/50 border border-border"
              >
                <div className="text-xs text-muted-foreground mb-2">{metric.label}</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-400">{metric.before}</span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-sm text-cyan-400 font-bold">{metric.after}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Sign up to process your full track with AI + Human mastering
            </p>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              Get Started Free
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
