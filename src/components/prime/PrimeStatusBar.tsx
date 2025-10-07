import { motion } from "framer-motion";
import { usePrime } from "@/contexts/PrimeContext";
import { Brain, Users, Activity, Waves } from "lucide-react";

export default function PrimeStatusBar() {
  const { systemMode, networkAwareness, audioState, accentColor } = usePrime();

  const statusItems = [
    {
      icon: Brain,
      label: "Prime",
      value: systemMode.toUpperCase(),
      color: accentColor
    },
    {
      icon: Users,
      label: "Network",
      value: `${networkAwareness.activeUsers}`,
      color: "hsl(var(--accent-cyan))"
    },
    {
      icon: Activity,
      label: "Sessions",
      value: `${networkAwareness.activeSessions}`,
      color: "hsl(var(--accent-magenta))"
    },
    {
      icon: Waves,
      label: "Audio",
      value: audioState.isPlaying ? "ACTIVE" : "IDLE",
      color: audioState.isPlaying ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2"
    >
      <div className="flex items-center gap-4">
        {statusItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <motion.div
              animate={{
                color: item.color
              }}
              transition={{ duration: 0.3 }}
            >
              <item.icon className="w-4 h-4" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {item.label}
              </span>
              <span className="text-xs font-mono font-semibold">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
