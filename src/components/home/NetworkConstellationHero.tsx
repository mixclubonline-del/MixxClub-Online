import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mic, Music, SlidersHorizontal, Heart, Radio, Users, Headphones, Guitar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NetworkNode {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  icon: typeof Mic;
  label: string;
  size: number;
}

const nodeTypes = [
  { icon: Mic, label: 'Rapper' },
  { icon: Music, label: 'Producer' },
  { icon: SlidersHorizontal, label: 'Engineer' },
  { icon: Heart, label: 'Fan' },
  { icon: Radio, label: 'DJ' },
  { icon: Users, label: 'Collaborator' },
  { icon: Headphones, label: 'Listener' },
  { icon: Guitar, label: 'Musician' },
];

const typewriterTexts = [
  "47 songs on your laptop...",
  "They deserve to be heard.",
  "This is where they come to life."
];

export const NetworkConstellationHero = () => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [pulse, setPulse] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Initialize nodes
  useEffect(() => {
    const initialNodes: NetworkNode[] = [];
    for (let i = 0; i < 25; i++) {
      const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
      initialNodes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        icon: type.icon,
        label: type.label,
        size: 0.8 + Math.random() * 0.6,
      });
    }
    setNodes(initialNodes);
  }, []);

  // Animate nodes
  useEffect(() => {
    const animate = () => {
      setNodes(prev => prev.map(node => {
        let newX = node.x + node.vx;
        let newY = node.y + node.vy;
        let newVx = node.vx;
        let newVy = node.vy;

        // Bounce off edges
        if (newX < 5 || newX > 95) newVx = -newVx;
        if (newY < 5 || newY > 95) newVy = -newVy;

        return {
          ...node,
          x: Math.max(5, Math.min(95, newX)),
          y: Math.max(5, Math.min(95, newY)),
          vx: newVx,
          vy: newVy,
        };
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (currentTextIndex >= typewriterTexts.length) {
      setIsTyping(false);
      return;
    }

    const currentText = typewriterTexts[currentTextIndex];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex <= currentText.length) {
        setDisplayedText(currentText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentTextIndex(prev => prev + 1);
        }, 1500);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentTextIndex]);

  // Pulse effect
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
    }, 2000);
    return () => clearInterval(pulseInterval);
  }, []);

  // Calculate connections between nearby nodes
  const getConnections = () => {
    const connections: { from: NetworkNode; to: NetworkNode }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 20) {
          connections.push({ from: nodes[i], to: nodes[j] });
        }
      }
    }
    return connections;
  };

  const connections = getConnections();

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      {/* Network visualization */}
      <div className="absolute inset-0">
        <svg className="w-full h-full">
          {/* Connection lines */}
          {connections.map((conn, i) => (
            <motion.line
              key={`conn-${i}`}
              x1={`${conn.from.x}%`}
              y1={`${conn.from.y}%`}
              x2={`${conn.to.x}%`}
              y2={`${conn.to.y}%`}
              stroke="hsl(var(--primary))"
              strokeWidth={pulse ? 2 : 1}
              strokeOpacity={pulse ? 0.6 : 0.2}
              className="transition-all duration-300"
            />
          ))}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const Icon = node.icon;
          return (
            <motion.div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
              }}
              animate={{
                scale: pulse ? node.size * 1.2 : node.size,
              }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className={`
                  flex items-center justify-center rounded-full 
                  bg-primary/10 border border-primary/30 backdrop-blur-sm
                  transition-all duration-300
                  ${pulse ? 'shadow-[0_0_20px_hsl(var(--primary)/0.5)]' : ''}
                `}
                style={{
                  width: `${node.size * 48}px`,
                  height: `${node.size * 48}px`,
                }}
              >
                <Icon 
                  className="text-primary" 
                  style={{ 
                    width: `${node.size * 20}px`, 
                    height: `${node.size * 20}px` 
                  }} 
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Content overlay */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Typewriter text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[120px] flex items-center justify-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
            {displayedText}
            {isTyping && (
              <span className="animate-pulse text-primary">|</span>
            )}
          </h1>
        </motion.div>

        {/* Show after typewriter completes */}
        {!isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              The network for hip-hop creators. Rappers. Producers. Engineers. Fans. All connected.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup&role=artist">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  I Make Music
                </Button>
              </Link>
              <Link to="/auth?mode=signup&role=engineer">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10"
                >
                  <SlidersHorizontal className="mr-2 h-5 w-5" />
                  I Shape Sound
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
          <motion.div 
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </motion.div>
    </section>
  );
};
