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
    <Card className="mg-panel mt-20 p-8 text-center max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-center gap-3 mb-4">
        <Sparkles
          className="h-8 w-8 animate-pulse"
          style={{ color: '#FF70D0' }}
        />
        <h3
          className="text-2xl font-black"
          style={{
            background: 'linear-gradient(135deg, #FF70D0, #C5A3FF, #70E6FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          PrimeBot 4.0
        </h3>
        <Sparkles
          className="h-8 w-8 animate-pulse"
          style={{ color: '#70E6FF' }}
        />
      </div>
      <p
        className={`text-lg font-medium transition-colors duration-300 ${isProcessing ? 'text-mixx-lavender' : 'text-white/80'
          }`}
      >
        {displayMessage}
      </p>
    </Card>
  );
};
