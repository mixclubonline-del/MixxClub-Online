import { motion } from "framer-motion";
import { Music, Headphones, Disc3, Heart } from "lucide-react";

const nodes = [
  { id: "producer", label: "Producer", icon: Disc3, color: "hsl(45 90% 50%)", angle: -90 },
  { id: "artist", label: "Artist", icon: Music, color: "hsl(262 83% 58%)", angle: 0 },
  { id: "engineer", label: "Engineer", icon: Headphones, color: "hsl(180 100% 50%)", angle: 90 },
  { id: "fan", label: "Fan", icon: Heart, color: "hsl(330 80% 60%)", angle: 180 },
] as const;

const connections = [
  { from: "producer", to: "artist", label: "Beats", fromAngle: -90, toAngle: 0 },
  { from: "artist", to: "engineer", label: "Projects", fromAngle: 0, toAngle: 90 },
  { from: "engineer", to: "fan", label: "Discovery", fromAngle: 90, toAngle: 180 },
  { from: "fan", to: "producer", label: "Engagement", fromAngle: 180, toAngle: -90 },
];

const RADIUS = 140;

function polarToXY(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * RADIUS, y: Math.sin(rad) * RADIUS };
}

const EcosystemFlow = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
            The <span className="bg-gradient-to-r from-primary to-[hsl(180_100%_50%)] bg-clip-text text-transparent">Ecosystem</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Every role feeds the others. Music flows, value compounds, everyone wins.
          </p>
        </motion.div>

        {/* Diagram */}
        <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center">
          {/* Central hub */}
          <motion.div
            className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-[hsl(180_100%_50%)]/30 border border-border/50 backdrop-blur-md flex items-center justify-center z-10"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <span className="text-xs font-black text-foreground tracking-wider">MIXX</span>
          </motion.div>

          {/* Connection lines with animated particles */}
          <svg className="absolute inset-0 w-full h-full" viewBox="-200 -200 400 400">
            {connections.map((conn, i) => {
              const from = polarToXY(conn.fromAngle);
              const to = polarToXY(conn.toAngle);
              const mid = { x: (from.x + to.x) * 0.3, y: (from.y + to.y) * 0.3 };
              const pathD = `M ${from.x} ${from.y} Q ${mid.x} ${mid.y} ${to.x} ${to.y}`;
              const fromNode = nodes.find((n) => n.id === conn.from);

              return (
                <g key={conn.label}>
                  {/* Base path */}
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.5 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                  />
                  {/* Animated particle */}
                  <motion.circle
                    r="3"
                    fill={fromNode?.color ?? "#fff"}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5 + i * 0.2 }}
                  >
                    <animateMotion
                      dur="3s"
                      repeatCount="indefinite"
                      begin={`${i * 0.7}s`}
                      path={pathD}
                    />
                  </motion.circle>
                  {/* Label */}
                  <motion.text
                    x={(from.x + to.x) * 0.35}
                    y={(from.y + to.y) * 0.35 - 8}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px] font-medium"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 + i * 0.2 }}
                  >
                    {conn.label}
                  </motion.text>
                </g>
              );
            })}
          </svg>

          {/* Role nodes */}
          {nodes.map((node, i) => {
            const pos = polarToXY(node.angle);
            const Icon = node.icon;
            // Convert SVG coords (-200..200 viewBox) to percentage for absolute positioning
            const leftPct = ((pos.x + 200) / 400) * 100;
            const topPct = ((pos.y + 200) / 400) * 100;

            return (
              <motion.div
                key={node.id}
                className="absolute flex flex-col items-center gap-1.5 -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 0.3 + i * 0.12 }}
              >
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2"
                  style={{
                    backgroundColor: `${node.color}20`,
                    borderColor: node.color,
                    boxShadow: `0 0 24px ${node.color}40`,
                  }}
                >
                  <Icon className="w-6 h-6 md:w-7 md:h-7" style={{ color: node.color }} />
                </div>
                <span className="text-xs font-bold text-foreground">{node.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EcosystemFlow;
