import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  message: string;
  timestamp: Date;
  type: 'analysis' | 'sync' | 'match' | 'process';
}

/**
 * AIActivityFeed - Real activity from database
 * Follows Live Data First doctrine - no Math.random() simulation
 */
export default function AIActivityFeed() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['ai-activity-feed'],
    queryFn: async (): Promise<ActivityLog[]> => {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('id, title, activity_type, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map((item) => ({
        id: item.id,
        message: item.title || 'Platform activity',
        timestamp: new Date(item.created_at),
        type: mapActivityType(item.activity_type),
      }));
    },
    staleTime: 15000,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground font-mono">
        <span className="inline-block w-2 h-2 bg-accent-cyan rounded-full animate-pulse mr-2" />
        PrimeBot initializing...
      </div>
    );
  }

  const displayLogs = logs && logs.length > 0 ? logs : getIdleLogs();

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {displayLogs.map((log) => (
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

// Map activity types to display categories
function mapActivityType(activityType: string): 'analysis' | 'sync' | 'match' | 'process' {
  const typeMap: Record<string, 'analysis' | 'sync' | 'match' | 'process'> = {
    'project': 'process',
    'session': 'sync',
    'collab': 'match',
    'upload': 'process',
    'achievement': 'analysis',
    'signup': 'sync',
    'follow': 'match',
  };
  return typeMap[activityType] || 'process';
}

// Idle state logs when no real activity exists
function getIdleLogs(): ActivityLog[] {
  return [
    { id: 'idle-1', message: 'PrimeBot monitoring platform...', timestamp: new Date(), type: 'analysis' },
    { id: 'idle-2', message: 'Waiting for activity...', timestamp: new Date(), type: 'sync' },
  ];
}

export function useRealtimeAILog() {
  const [currentLog, setCurrentLog] = useState<string>("PrimeBot analyzing data...");

  const { data } = useQuery({
    queryKey: ['latest-ai-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('title')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return "PrimeBot monitoring...";
      return data?.title || "PrimeBot monitoring...";
    },
    staleTime: 10000,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (data) {
      setCurrentLog(data);
    }
  }, [data]);

  return currentLog;
}
