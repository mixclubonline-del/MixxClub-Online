import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Send, Sparkles, TrendingUp, Zap, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export const EnhancedMobileMixxBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hey! I\'m your AI mixing assistant. How can I help you today?',
      timestamp: new Date(),
      suggestions: [
        '🎵 Upload a track',
        '🎚️ Mix suggestions',
        '📊 Project status',
        '💡 Quick tips'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { triggerHaptic } = useMobileOptimization({ enableHaptics: true });
  const { user } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    triggerHaptic('light');
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-simple', {
        body: { 
          message: text,
          userId: user?.id,
          context: 'mobile-app'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'I\'m here to help! Try asking about mixing, mastering, or your projects.',
        timestamp: new Date(),
        suggestions: data.suggestions || [
          '🎵 Analyze my track',
          '🎚️ Mixing tips',
          '📈 Check progress'
        ]
      };

      setMessages(prev => [...prev, assistantMessage]);
      triggerHaptic('medium');
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    triggerHaptic('medium');
    
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Voice input is not supported on this device.',
        variant: 'destructive'
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      toast({
        title: 'Voice Error',
        description: 'Could not recognize speech. Please try again.',
        variant: 'destructive'
      });
    };

    recognition.start();
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-4 pb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              <div
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-[85%] p-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </Card>
              </div>

              {/* Suggestions */}
              {msg.suggestions && msg.role === 'assistant' && idx === messages.length - 1 && (
                <div className="flex flex-wrap gap-2 pl-2">
                  {msg.suggestions.map((suggestion, sIdx) => (
                    <Button
                      key={sIdx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs h-8"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-muted p-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                </div>
              </Card>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-border">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Analysis
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <TrendingUp className="h-4 w-4 mr-2" />
            Progress
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <Zap className="h-4 w-4 mr-2" />
            Quick Mix
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceInput}
            className={isRecording ? 'bg-destructive text-destructive-foreground' : ''}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask me anything..."
            className="flex-1"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
