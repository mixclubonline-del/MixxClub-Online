import { motion } from "framer-motion";
import { ArrowRight, Volume2, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const processingSteps = [
  { name: "EQ", icon: "📊", active: false },
  { name: "Compress", icon: "📉", active: false },
  { name: "Saturate", icon: "🔥", active: false },
  { name: "Master", icon: "✨", active: false },
];

export function TransformationDemo() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [beforeLufs, setBeforeLufs] = useState(-24);
  const [afterLufs, setAfterLufs] = useState(-24);
  const [isTransforming, setIsTransforming] = useState(false);

  // Auto-play transformation loop
  useEffect(() => {
    const runTransformation = () => {
      setIsTransforming(true);
      setCurrentStep(-1);
      setBeforeLufs(-24);
      setAfterLufs(-24);

      // Step through processing chain
      const steps = [0, 1, 2, 3, 4];
      steps.forEach((step, index) => {
        setTimeout(() => {
          setCurrentStep(step);
          // Gradually increase LUFS
          setAfterLufs(-24 + (index + 1) * 2.5);
        }, (index + 1) * 800);
      });

      // Reset after completion
      setTimeout(() => {
        setIsTransforming(false);
      }, 5000);
    };

    runTransformation();
    const interval = setInterval(runTransformation, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-muted/20" />
      
      <div className="container px-6 relative z-10">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Transformation
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            This is What We{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Do
            </span>{" "}
            to Your Music
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From bedroom demo to billboard-ready in seconds.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="p-8 glass-mid border-border/50">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Before */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-muted-foreground">Before</h3>
                  <Badge variant="outline" className="font-mono">
                    {beforeLufs.toFixed(1)} LUFS
                  </Badge>
                </div>
                
                {/* Waveform visualization - messy/quiet */}
                <div className="h-32 bg-muted/30 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-around px-2">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-muted-foreground/40 rounded-full"
                        style={{
                          height: `${15 + Math.random() * 25}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
                    Unbalanced · Muddy · Quiet
                  </div>
                </div>

                {/* Spectrum - unbalanced */}
                <div className="h-16 bg-muted/20 rounded-lg flex items-end justify-around p-2">
                  {[40, 25, 60, 45, 30, 20, 15, 10].map((height, i) => (
                    <div
                      key={i}
                      className="w-4 bg-muted-foreground/30 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Processing Chain Arrow */}
              <div className="hidden md:flex flex-col items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="flex flex-col items-center gap-2 bg-background/80 backdrop-blur-sm rounded-xl p-4">
                  {processingSteps.map((step, index) => (
                    <motion.div
                      key={step.name}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                        currentStep >= index
                          ? "bg-primary/20 text-primary"
                          : "bg-muted/50 text-muted-foreground"
                      }`}
                      animate={{
                        scale: currentStep === index ? 1.1 : 1,
                      }}
                    >
                      <span>{step.icon}</span>
                      <span>{step.name}</span>
                      {currentStep >= index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Zap className="w-3 h-3" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* After */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary">After</h3>
                  <motion.div
                    key={afterLufs}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    <Badge className="font-mono bg-primary/20 text-primary border-primary/30">
                      {afterLufs.toFixed(1)} LUFS
                    </Badge>
                  </motion.div>
                </div>
                
                {/* Waveform visualization - clean/loud */}
                <div className="h-32 bg-muted/30 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-around px-2">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-primary rounded-full"
                        animate={{
                          height: currentStep >= 3
                            ? `${40 + Math.sin(i * 0.3) * 20 + Math.random() * 10}%`
                            : `${20 + Math.sin(i * 0.3) * 10 + Math.random() * 5}%`,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs text-primary">
                    Balanced · Clear · Professional
                  </div>
                </div>

                {/* Spectrum - balanced */}
                <div className="h-16 bg-muted/20 rounded-lg flex items-end justify-around p-2">
                  {[50, 55, 60, 58, 55, 50, 45, 40].map((height, i) => (
                    <motion.div
                      key={i}
                      className="w-4 bg-primary rounded-t"
                      animate={{
                        height: currentStep >= 2 ? `${height}%` : `${height * 0.5}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">+10 dB</div>
                  <div className="text-sm text-muted-foreground">Loudness Gain</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">-6 dB</div>
                  <div className="text-sm text-muted-foreground">Mud Reduction</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">+40%</div>
                  <div className="text-sm text-muted-foreground">Clarity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">2.3s</div>
                  <div className="text-sm text-muted-foreground">Processing Time</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <p className="text-center mt-8 text-lg text-muted-foreground">
          From bedroom to billboard.{" "}
          <span className="text-primary font-semibold">Every time.</span>
        </p>
      </div>
    </section>
  );
}
