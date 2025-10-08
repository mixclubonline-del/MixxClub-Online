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
    <Card className="mt-20 p-8 bg-gradient-to-br from-purple-950/20 to-indigo-950/20 border-purple-500/30 text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          PrimeBot 4.0
        </h3>
        <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
      </div>
      <p 
        className={`text-lg transition-colors duration-300 ${
          isProcessing ? 'text-purple-400' : 'text-muted-foreground'
        }`}
      >
        {displayMessage}
      </p>
    </Card>
  );
};
