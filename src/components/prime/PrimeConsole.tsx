import { motion, AnimatePresence } from "framer-motion";
import { usePrime } from "@/contexts/PrimeContext";
import { useEffect, useState } from "react";

export default function PrimeConsole() {
  const { systemMode, recentActivity, networkAwareness, audioState, accentColor } = usePrime();
  const [consoleLog, setConsoleLog] = useState<string>("");

  useEffect(() => {
    // Generate contextual console messages
    const messages = [
      `PRIME: System ${systemMode.toUpperCase()}`,
      `NETWORK: ${networkAwareness.activeUsers} users • ${networkAwareness.onlineEngineers} engineers online`,
      `AUDIO: ${audioState.isPlaying ? 'ACTIVE' : 'IDLE'} • Amplitude ${Math.round(audioState.amplitude)}`,
      ...recentActivity.slice(0, 2)
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setConsoleLog(randomMessage);
  }, [systemMode, recentActivity, networkAwareness, audioState]);

  return (
    <div className="fixed bottom-4 left-4 z-50 font-mono text-xs">
      <AnimatePresence mode="wait">
        <motion.div
          key={consoleLog}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 0.7, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2"
        >
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: accentColor }}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span className="text-muted-foreground">{consoleLog}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
