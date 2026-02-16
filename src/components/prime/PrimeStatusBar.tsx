import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { usePrime } from "@/contexts/PrimeContext";
import { Brain, Users, Activity, Waves } from "lucide-react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { isFullImmersiveRoute } from "@/config/immersiveRoutes";

export default function PrimeStatusBar() {
  const location = useLocation();
  const { systemMode, networkAwareness, audioState, accentColor } = usePrime();
  const { isDesktop } = useBreakpoint();

  // Hide on immersive routes and non-desktop
  if (!isDesktop || isFullImmersiveRoute(location.pathname)) return null;

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-40 bg-card/90 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2 shadow-lg"
    >
      <div className="flex items-center gap-3">
        {statusItems.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <motion.div
              animate={{ color: item.color }}
              transition={{ duration: 0.3 }}
            >
              <item.icon className="w-3.5 h-3.5" />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                {item.label}
              </span>
              <span className="text-[11px] font-mono font-medium">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
