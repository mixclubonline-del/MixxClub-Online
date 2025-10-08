import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface PrimeBotAssistantProps {
  activePlugin?: string;
  message?: string;
}

export const PrimeBotAssistant = ({ activePlugin, message }: PrimeBotAssistantProps) => {
  const [displayMessage, setDisplayMessage] = useState("How can I assist you today?");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (activePlugin) {
      setIsProcessing(true);
      setDisplayMessage(`Opening ${activePlugin}…`);
      
      setTimeout(() => {
        setDisplayMessage(`Ready to tweak ${activePlugin}.`);
        setIsProcessing(false);
      }, 2200);
    } else if (message) {
      setDisplayMessage(message);
    }
  }, [activePlugin, message]);

  return (
    <Card className="mt-20 p-8 text-center max-w-2xl mx-auto relative overflow-hidden
      bg-gradient-to-br from-[hsl(235_45%_10%/0.7)] to-[hsl(235_45%_12%/0.5)]
      backdrop-blur-2xl border-[hsl(270_100%_70%/0.3)]
      shadow-[0_16px_64px_hsl(270_100%_70%/0.25),inset_0_1px_2px_hsl(0_0%_100%/0.08)]">
      
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(270_100%_70%/0.1)] via-transparent to-[hsl(185_100%_50%/0.1)] 
        animate-gradient opacity-50" 
        style={{ backgroundSize: '200% 200%' }} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-[hsl(270_100%_70%)] animate-pulse 
            drop-shadow-[0_0_16px_hsl(270_100%_70%/0.8)]" />
          <h3 className="text-3xl font-bold bg-gradient-to-r from-[hsl(270_100%_70%)] via-[hsl(300_90%_65%)] to-[hsl(185_100%_50%)] 
            bg-clip-text text-transparent drop-shadow-[0_0_20px_hsl(185_100%_50%/0.3)]">
            PrimeBot 4.0
          </h3>
          <Sparkles className="h-8 w-8 text-[hsl(185_100%_50%)] animate-pulse 
            drop-shadow-[0_0_16px_hsl(185_100%_50%/0.8)]" />
        </div>
        <p 
          className={`text-lg transition-all duration-300 ${
            isProcessing 
              ? 'text-[hsl(185_100%_50%)] drop-shadow-[0_0_12px_hsl(185_100%_50%/0.5)]' 
              : 'text-muted-foreground'
          }`}
        >
          {displayMessage}
        </p>
      </div>
    </Card>
  );
};
