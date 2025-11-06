import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { Card } from "@/components/ui/card";

interface VoiceCommandIndicatorProps {
  isListening: boolean;
  transcript?: string;
  lastCommand?: string;
}

export const VoiceCommandIndicator = ({
  isListening,
  transcript,
  lastCommand,
}: VoiceCommandIndicatorProps) => {
  return (
    <AnimatePresence>
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          className="fixed bottom-24 right-6 z-50"
        >
          <Card className="p-4 bg-background/95 backdrop-blur-sm shadow-lg border-primary/20">
            <div className="flex items-start gap-3 min-w-[200px] max-w-[300px]">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {isListening ? (
                  <Mic className="w-5 h-5 text-primary" />
                ) : (
                  <MicOff className="w-5 h-5 text-muted-foreground" />
                )}
              </motion.div>

              <div className="flex-1 space-y-1">
                <div className="text-sm font-medium">
                  {isListening ? "Listening..." : "Voice Commands Off"}
                </div>
                
                {transcript && (
                  <div className="text-xs text-muted-foreground">
                    "{transcript}"
                  </div>
                )}

                {lastCommand && (
                  <div className="text-xs text-primary font-medium">
                    ✓ {lastCommand}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
