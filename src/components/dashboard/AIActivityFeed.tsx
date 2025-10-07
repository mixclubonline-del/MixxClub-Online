import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIDashboardInsights } from "@/hooks/useAIDashboardInsights";

interface ActivityLog {
  id: string;
  message: string;
  timestamp: Date;
  type: 'analysis' | 'sync' | 'match' | 'process';
}

const generateRealtimeLog = (): ActivityLog => {
  const messages = [
    { msg: "Analyzing frequency spectrum on Artist Track #42", type: 'analysis' as const },
    { msg: "Syncing stems for Engineer Mix Session", type: 'sync' as const },
    { msg: "Matching Artist profile with Engineer #127", type: 'match' as const },
    { msg: "Processing mastering preset 'Warm Analog'", type: 'process' as const },
    { msg: "AI analyzing vocal dynamics", type: 'analysis' as const },
    { msg: "Syncing project files to cloud", type: 'sync' as const },
    { msg: "Generating mix suggestions", type: 'process' as const },
    { msg: "Matching genre tags for discovery", type: 'match' as const },
  ];
  
  const random = messages[Math.floor(Math.random() * messages.length)];
  return {
    id: `log-${Date.now()}-${Math.random()}`,
    message: random.msg,
    timestamp: new Date(),
    type: random.type
  };
};

export default function AIActivityFeed() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const { insights, isLoading } = useAIDashboardInsights();

  useEffect(() => {
    // Initialize with a few logs
    const initialLogs = Array.from({ length: 3 }, generateRealtimeLog);
    setLogs(initialLogs);

    // Add new log every 3-5 seconds
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = generateRealtimeLog();
        const updated = [newLog, ...prev].slice(0, 5); // Keep only last 5
        return updated;
      });
    }, Math.random() * 2000 + 3000); // Random between 3-5 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground font-mono">
        <span className="inline-block w-2 h-2 bg-accent-cyan rounded-full animate-pulse mr-2" />
        PrimeBot initializing...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {logs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="text-xs font-mono text-accent-cyan/80 flex items-start gap-2"
          >
            <span className="inline-block w-1.5 h-1.5 bg-accent-cyan rounded-full animate-pulse mt-1 flex-shrink-0" />
            <span className="flex-1">{log.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useRealtimeAILog() {
  const [currentLog, setCurrentLog] = useState<string>("PrimeBot analyzing data...");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLog(generateRealtimeLog().message);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return currentLog;
}
