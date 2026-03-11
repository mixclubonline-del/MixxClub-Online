import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Check for updates every 30 minutes
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[80] pointer-events-auto"
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full shrink-0">
              <RefreshCw className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">New version available</p>
              <p className="text-xs text-muted-foreground">Tap update for latest features</p>
            </div>
            <Button size="sm" onClick={handleUpdate} className="shrink-0">
              Update
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-muted rounded-full transition-colors shrink-0"
              aria-label="Dismiss update"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
