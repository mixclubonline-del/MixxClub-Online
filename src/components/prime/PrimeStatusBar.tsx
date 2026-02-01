import { motion, AnimatePresence } from "framer-motion";
import { usePrime } from "@/contexts/PrimeContext";
import { Brain, Users, Activity, Waves, Navigation, AlertCircle } from "lucide-react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useFlowStore } from "@/core/fabric/flowStore";

export default function PrimeStatusBar() {
  const { systemMode, networkAwareness, audioState, accentColor } = usePrime();
  const { isDesktop } = useBreakpoint();
  
  // Flow state from Fabric
  const flowState = useFlowStore((s) => s.flowState);
  const pendingIntent = useFlowStore((s) => s.pendingIntent);
  const blockingReason = useFlowStore((s) => s.blockingReason);

  // Only show on desktop - mobile/tablet have their own nav indicators
  if (!isDesktop) return null;

  // Flow indicator configuration
  const getFlowConfig = () => {
    switch (flowState) {
      case 'resolving':
        return {
          label: pendingIntent?.type?.replace(/_/g, ' ') || 'RESOLVING',
          color: 'hsl(var(--accent-cyan))',
          pulse: true
        };
      case 'transitioning':
        return {
          label: 'TRANSIT',
          color: 'hsl(var(--accent))',
          pulse: true
        };
      case 'blocked':
        return {
          label: blockingReason?.replace(/_/g, ' ').toUpperCase() || 'BLOCKED',
          color: 'hsl(var(--destructive))',
          pulse: false
        };
      default:
        return {
          label: 'READY',
          color: 'hsl(var(--muted-foreground))',
          pulse: false
        };
    }
  };

  const flowConfig = getFlowConfig();

  const statusItems = [
    {
      icon: Navigation,
      label: "Flow",
      value: flowConfig.label,
      color: flowConfig.color,
      pulse: flowConfig.pulse,
      isFlow: true
    },
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
              animate={{ 
                color: item.color,
                scale: item.pulse ? [1, 1.2, 1] : 1
              }}
              transition={{ 
                color: { duration: 0.3 },
                scale: { duration: 0.5, repeat: item.pulse ? Infinity : 0 }
              }}
            >
              {flowState === 'blocked' && item.isFlow ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <item.icon className="w-3.5 h-3.5" />
              )}
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                {item.label}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={item.value}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="text-[11px] font-mono font-medium truncate max-w-[60px]"
                >
                  {item.value}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
