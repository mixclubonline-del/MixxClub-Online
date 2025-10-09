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
    <Card className="mt-20 p-8 border text-center max-w-2xl mx-auto"
      style={{
        background: 'linear-gradient(135deg, rgba(255,112,208,0.1), rgba(197,163,255,0.1), rgba(112,230,255,0.1))',
        borderColor: 'rgba(197,163,255,0.3)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 40px rgba(197,163,255,0.2)'
      }}
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
        className={`text-lg font-medium transition-colors duration-300 ${
          isProcessing ? 'text-mixx-lavender' : 'text-white/80'
        }`}
      >
        {displayMessage}
      </p>
    </Card>
  );
};
