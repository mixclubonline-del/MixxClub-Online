import { motion } from "framer-motion";
import { getCharacter, type CharacterId } from "@/config/characters";

const nodes = [
  { id: "producer", label: "Rell", sublabel: "Producer", characterId: "rell" as CharacterId, angle: -90 },
  { id: "artist", label: "Jax", sublabel: "Artist", characterId: "jax" as CharacterId, angle: 0 },
  { id: "engineer", label: "Prime", sublabel: "Engineer", characterId: "prime" as CharacterId, angle: 90 },
  { id: "fan", label: "Nova", sublabel: "Fan", characterId: "nova" as CharacterId, angle: 180 },
];

const connections = [
  { from: "producer", to: "artist", label: "Beats", fromAngle: -90, toAngle: 0 },
  { from: "artist", to: "engineer", label: "Projects", fromAngle: 0, toAngle: 90 },
  { from: "engineer", to: "fan", label: "Discovery", fromAngle: 90, toAngle: 180 },
  { from: "fan", to: "producer", label: "Engagement", fromAngle: 180, toAngle: -90 },
];

const RADIUS = 140;
const NODE_SIZE = 64; // px size of each avatar node

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

        {/* Diagram — single SVG coordinate space for perfect alignment */}
        <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center">
          <svg
            className="absolute inset-0 w-full h-full overflow-visible"
            viewBox="-200 -200 400 400"
          >
            {/* Central hub */}
            <foreignObject x={-40} y={-40} width={80} height={80} className="overflow-visible">
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-[hsl(180_100%_50%)]/30 border border-border/50 backdrop-blur-md flex items-center justify-center"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 0.8 }}
              >
                <span className="text-xs font-black text-foreground tracking-wider">MIXX</span>
              </motion.div>
            </foreignObject>

            {/* Connection lines with animated particles */}
            {connections.map((conn, i) => {
              const from = polarToXY(conn.fromAngle);
              const to = polarToXY(conn.toAngle);
              const mid = { x: (from.x + to.x) * 0.3, y: (from.y + to.y) * 0.3 };
              const pathD = `M ${from.x} ${from.y} Q ${mid.x} ${mid.y} ${to.x} ${to.y}`;
              const fromNode = nodes.find((n) => n.id === conn.from);
              const fromChar = fromNode ? getCharacter(fromNode.characterId) : null;

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
                    fill={fromChar?.accentColor ?? "#fff"}
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

            {/* Role nodes — inside SVG as foreignObject for perfect alignment */}
            {nodes.map((node, i) => {
              const pos = polarToXY(node.angle);
              const character = getCharacter(node.characterId);
              const halfSize = NODE_SIZE / 2;

              return (
                <foreignObject
                  key={node.id}
                  x={pos.x - halfSize - 8}
                  y={pos.y - halfSize - 10}
                  width={NODE_SIZE + 16}
                  height={NODE_SIZE + 36}
                  className="overflow-visible"
                >
                  <motion.div
                    className="flex flex-col items-center gap-1"
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", delay: 0.3 + i * 0.12 }}
                  >
                    {/* Avatar circle */}
                    <div
                      className="rounded-full overflow-hidden border-2 flex-shrink-0"
                      style={{
                        width: NODE_SIZE,
                        height: NODE_SIZE,
                        borderColor: character.accentColor,
                        boxShadow: `0 0 24px ${character.accentColor.replace(')', ' / 0.4)')}`,
                      }}
                    >
                      <img
                        src={character.avatarPath}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Character name + role sublabel */}
                    <div className="text-center leading-tight">
                      <span className="text-xs font-bold text-foreground block">{node.label}</span>
                      <span className="text-[10px] text-muted-foreground block">{node.sublabel}</span>
                    </div>
                  </motion.div>
                </foreignObject>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
};

export default EcosystemFlow;
