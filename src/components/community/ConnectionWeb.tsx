import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Sparkles, Users, Link2 } from 'lucide-react';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { Button } from '@/components/ui/button';

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'artist' | 'engineer';
  size: number;
}

interface Connection {
  from: number;
  to: number;
  opacity: number;
}

export const ConnectionWeb = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const { data: stats } = useCommunityStats();

  useEffect(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: 400 });

    // Generate nodes
    const nodeCount = Math.min(30, (stats?.totalUsers || 20));
    const generatedNodes: Node[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      generatedNodes.push({
        id: i,
        x: Math.random() * rect.width,
        y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        type: Math.random() > 0.5 ? 'artist' : 'engineer',
        size: 4 + Math.random() * 8
      });
    }
    setNodes(generatedNodes);

    // Generate connections
    const generatedConnections: Connection[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const connectionCount = Math.floor(Math.random() * 3);
      for (let j = 0; j < connectionCount; j++) {
        const target = Math.floor(Math.random() * nodeCount);
        if (target !== i) {
          generatedConnections.push({
            from: i,
            to: target,
            opacity: 0.1 + Math.random() * 0.3
          });
        }
      }
    }
    setConnections(generatedConnections);
  }, [stats?.totalUsers]);

  // Animate nodes
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => {
        let newX = node.x + node.vx;
        let newY = node.y + node.vy;
        let newVx = node.vx;
        let newVy = node.vy;

        // Bounce off walls
        if (newX < 0 || newX > dimensions.width) {
          newVx *= -1;
          newX = Math.max(0, Math.min(dimensions.width, newX));
        }
        if (newY < 0 || newY > dimensions.height) {
          newVy *= -1;
          newY = Math.max(0, Math.min(dimensions.height, newY));
        }

        return { ...node, x: newX, y: newY, vx: newVx, vy: newVy };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [dimensions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="w-8 h-8 text-accent-cyan" />
          <h2 className="text-2xl font-bold">The Network</h2>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Find Matches
        </Button>
      </div>

      {/* Network Visualization */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card/80 to-background border border-white/5 h-[400px]"
      >
        {/* SVG Layer for connections */}
        <svg className="absolute inset-0 w-full h-full">
          {connections.map((conn, i) => {
            const fromNode = nodes[conn.from];
            const toNode = nodes[conn.to];
            if (!fromNode || !toNode) return null;
            
            return (
              <motion.line
                key={i}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="url(#gradient)"
                strokeWidth="1"
                strokeOpacity={conn.opacity}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.02 }}
              />
            );
          })}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent-cyan))" />
            </linearGradient>
          </defs>
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className={`absolute rounded-full ${
              node.type === 'artist' 
                ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]' 
                : 'bg-accent-cyan shadow-[0_0_10px_rgba(var(--accent-cyan),0.5)]'
            }`}
            style={{
              width: node.size,
              height: node.size,
              left: node.x - node.size / 2,
              top: node.y - node.size / 2
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random()
            }}
          />
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Artists</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full bg-accent-cyan" />
            <span>Engineers</span>
          </div>
        </div>

        {/* Stats Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-xs">
            <Users className="w-3 h-3 text-primary" />
            <span>{stats?.totalUsers || 0} members</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-xs">
            <Link2 className="w-3 h-3 text-accent-cyan" />
            <span>{connections.length} connections</span>
          </div>
        </div>

        {/* Center CTA */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center pointer-events-auto"
          >
            <p className="text-muted-foreground mb-2">Your network is waiting</p>
            <Button size="sm" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Join the Network
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionWeb;
