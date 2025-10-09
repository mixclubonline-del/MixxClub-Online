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
    <PluginWindow title="PrimeBot 4.0" category="AI Assistant" isOpen={isOpen} onClose={onClose} width={500} height={600}>
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-4 overflow-auto mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && <Brain className="w-6 h-6 text-primary mt-1" />}
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white/5'}`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about mixing, mastering, effects..." />
          <Button size="icon"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </PluginWindow>
  );
};
