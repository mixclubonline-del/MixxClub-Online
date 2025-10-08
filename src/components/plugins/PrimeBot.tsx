import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Send, Sparkles } from 'lucide-react';

interface PrimeBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrimeBot: React.FC<PrimeBotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey! I\'m PrimeBot 4.0, your AI mixing assistant. How can I help your track today?' }
  ]);
  const [input, setInput] = useState('');

  return (
    <PluginWindow title="PrimeBot 4.0" category="AI Assistant" isOpen={isOpen} onClose={onClose} width={520} height={640}>
      <div className="flex flex-col h-full p-6">
        <div className="flex-1 space-y-4 overflow-auto mb-4 pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(270_100%_70%)] to-[hsl(185_100%_50%)] 
                  flex items-center justify-center shadow-[0_0_16px_hsl(270_100%_70%/0.5)]">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] p-4 rounded-2xl backdrop-blur-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-[hsl(185_100%_50%)] to-[hsl(185_100%_40%)] text-white shadow-[0_0_16px_hsl(185_100%_50%/0.3)]' 
                  : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-inner'
              }`}>
                <p className={msg.role === 'user' ? 'text-white' : 'text-foreground'}>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask about mixing, mastering, effects..."
            className="bg-gradient-to-r from-[hsl(230_35%_14%)] to-[hsl(230_30%_12%)] 
              border-[hsl(185_100%_50%/0.2)] focus:border-[hsl(185_100%_50%/0.5)] 
              placeholder:text-muted-foreground/60" 
          />
          <Button size="icon" className="bg-gradient-to-br from-[hsl(185_100%_50%)] to-[hsl(185_100%_40%)] 
            hover:from-[hsl(185_100%_55%)] hover:to-[hsl(185_100%_45%)]
            shadow-[0_0_20px_hsl(185_100%_50%/0.4)] hover:shadow-[0_0_30px_hsl(185_100%_50%/0.6)]">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </PluginWindow>
  );
};
