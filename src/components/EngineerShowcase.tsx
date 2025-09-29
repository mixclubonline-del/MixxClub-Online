import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Award, Brain } from 'lucide-react';
import { Button } from './ui/button';

interface Engineer {
  name: string;
  specialty: string;
  aiTools: string[];
  image: string;
  rating: number;
}

const engineers: Engineer[] = [
  {
    name: "Alex Chen",
    specialty: "Hip-Hop & R&B",
    aiTools: ["Neural EQ", "AI Mastering", "Vocal Enhancement"],
    image: "👨‍🎤",
    rating: 4.9
  },
  {
    name: "Sarah Williams",
    specialty: "Electronic & Pop",
    aiTools: ["AI Stem Separation", "Dynamic Processing", "Spatial Audio"],
    image: "👩‍🎤",
    rating: 5.0
  },
  {
    name: "Mike Rodriguez",
    specialty: "Rock & Metal",
    aiTools: ["AI De-essing", "Harmonic Analysis", "Room Simulation"],
    image: "🎸",
    rating: 4.8
  },
  {
    name: "Emily Zhang",
    specialty: "Jazz & Classical",
    aiTools: ["AI Orchestration", "Reverb Matching", "Frequency Analysis"],
    image: "🎼",
    rating: 4.9
  }
];

export const EngineerShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % engineers.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const next = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % engineers.length);
  };

  const prev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + engineers.length) % engineers.length);
  };

  const current = engineers[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold text-center mb-8">
        <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
          Expert Engineers
        </span>
        {" + "}
        <span className="text-primary">AI Power</span>
      </h3>

      <div className="relative bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Engineer Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl border-2 border-primary/30">
              {current.image}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <Award className="w-3 h-3" />
              {current.rating}
            </div>
          </div>

          {/* Engineer Info */}
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-2xl font-bold text-foreground mb-2">{current.name}</h4>
            <p className="text-muted-foreground mb-4">{current.specialty}</p>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {current.aiTools.map((tool, i) => (
                <div
                  key={i}
                  className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary flex items-center gap-1"
                >
                  <Brain className="w-3 h-3" />
                  {tool}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            className="rounded-full w-10 h-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex gap-2">
            {engineers.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? 'bg-primary w-8' : 'bg-primary/30'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={next}
            className="rounded-full w-10 h-10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
