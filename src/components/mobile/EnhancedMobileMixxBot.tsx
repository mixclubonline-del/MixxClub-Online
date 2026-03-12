/**
 * EnhancedMobileMixxBot — Role-aware AI chat with personality.
 * 
 * Each role gets a different AI character:
 * - Artist → Jax (purple accent, creative energy)
 * - Engineer → Rell (orange accent, technical precision)
 * - Producer → Tempo (amber accent, rhythm & flow)
 * - Fan → Nova (magenta accent, discovery & hype)
 * 
 * Features: brand gradient on bot messages, time-aware welcome,
 * animated typing indicator with role colors, voice input.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Send, Sparkles, TrendingUp, Zap, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

// ─── AI Character Definitions ─────────────────────────────────
const AI_CHARACTERS = {
  artist: {
    name: 'Jax',
    emoji: '🎤',
    accent: 'text-primary',
    gradientBorder: 'from-primary via-accent to-primary',
    bubbleBg: 'bg-primary/5 border-primary/15',
    dotColor: 'bg-primary',
  },
  engineer: {
    name: 'Rell',
    emoji: '🎛️',
    accent: 'text-accent-foreground',
    gradientBorder: 'from-accent via-primary to-accent',
    bubbleBg: 'bg-accent/5 border-accent/15',
    dotColor: 'bg-accent',
  },
  producer: {
    name: 'Tempo',
    emoji: '🎹',
    accent: 'text-secondary-foreground',
    gradientBorder: 'from-secondary via-primary to-secondary',
    bubbleBg: 'bg-secondary/5 border-secondary/15',
    dotColor: 'bg-secondary',
  },
  fan: {
    name: 'Nova',
    emoji: '✨',
    accent: 'text-destructive',
    gradientBorder: 'from-destructive via-accent to-destructive',
    bubbleBg: 'bg-destructive/5 border-destructive/15',
    dotColor: 'bg-destructive',
  },
  admin: {
    name: 'Prime',
    emoji: '🧠',
    accent: 'text-primary',
    gradientBorder: 'from-primary via-accent to-primary',
    bubbleBg: 'bg-primary/5 border-primary/15',
    dotColor: 'bg-primary',
  },
} as const;

function getTimeGreeting(name: string, charName: string): string {
  const hour = new Date().getHours();
  if (hour < 5) return `Late night grind? ${charName}'s got you, ${name}. What are we working on? 🎧`;
  if (hour < 12) return `Morning, ${name}! ${charName} here — ready to make today count. What's up?`;
  if (hour < 17) return `What's good, ${name}? ${charName} checking in — how can I help?`;
  if (hour < 22) return `Evening session with ${charName}. Let's get creative, ${name} 🎵`;
  return `Burning the midnight oil, ${name}? ${charName}'s right here with you. Let's go 🔥`;
}

function getRoleSuggestions(role: string): string[] {
  switch (role) {
    case 'engineer':
      return ['🎚️ Mix suggestions', '📊 Session queue', '🎛️ Mastering tips', '💰 Earnings breakdown'];
    case 'producer':
      return ['🎹 Beat ideas', '📈 Sales analytics', '🎵 Trending sounds', '💡 Collaboration tips'];
    case 'fan':
      return ['🔥 Who\'s live?', '🏆 Active challenges', '🎵 New drops', '💰 Earn Coinz'];
    default: // artist
      return ['🎵 Post a session', '🔍 Find engineers', '📊 Project status', '💡 Quick tips'];
  }
}

export const EnhancedMobileMixxBot = () => {
  const { user, activeRole } = useAuth();
  const role = activeRole || 'artist';
  const character = AI_CHARACTERS[role as keyof typeof AI_CHARACTERS] || AI_CHARACTERS.artist;

  const firstName = useMemo(() =>
    (user as any)?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Creator',
    [user]
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: getTimeGreeting(firstName, character.name),
      timestamp: new Date(),
      suggestions: getRoleSuggestions(role),
    }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { triggerHaptic } = useMobileOptimization({ enableHaptics: true });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    triggerHaptic('light');
    const userMessage: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-simple', {
        body: {
          message: text,
          userId: user?.id,
          context: `mobile-app-${role}`,
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || `${character.name} is thinking... Try asking about your projects!`,
        timestamp: new Date(),
        suggestions: data.suggestions || getRoleSuggestions(role),
      };

      setMessages(prev => [...prev, assistantMessage]);
      triggerHaptic('medium');
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Connection Issue',
        description: `${character.name} couldn't respond. Try again.`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    triggerHaptic('medium');

    if (!('webkitSpeechRecognition' in window)) {
      toast({ title: 'Not Supported', description: 'Voice input not available on this device.', variant: 'destructive' });
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
    recognition.onerror = () => {
      setIsRecording(false);
      toast({ title: 'Voice Error', description: 'Could not recognize speech.', variant: 'destructive' });
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-safe">
      {/* Header with character identity */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center text-lg",
          character.bubbleBg, "border"
        )}>
          {character.emoji}
        </div>
        <div>
          <p className={cn("text-sm font-bold", character.accent)}>
            {character.name}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Your {role === 'fan' ? 'discovery guide' : 'AI assistant'}
          </p>
        </div>
        <Badge variant="outline" className="ml-auto text-[10px] capitalize bg-muted/50">
          {role}
        </Badge>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 touch-manipulation">
        <div className="space-y-4 pb-4">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-start gap-2 max-w-[85%]">
                      {/* Gradient left border on bot messages */}
                      <div className={cn(
                        "w-0.5 rounded-full self-stretch bg-gradient-to-b",
                        character.gradientBorder
                      )} />
                      <Card className={cn("p-3 border", character.bubbleBg)}>
                        <p className="text-sm whitespace-pre-wrap text-foreground">{msg.content}</p>
                      </Card>
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <Card className="max-w-[85%] p-3 bg-primary text-primary-foreground border-primary/30">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </Card>
                  )}
                </div>

                {/* Suggestions */}
                {msg.suggestions && msg.role === 'assistant' && idx === messages.length - 1 && (
                  <div className="flex flex-wrap gap-2 pl-4">
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <Button
                        key={sIdx}
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(suggestion)}
                        className="text-xs h-8 border-border/50"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator with role-colored dots */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2"
            >
              <div className={cn("w-0.5 rounded-full h-8 bg-gradient-to-b", character.gradientBorder)} />
              <Card className={cn("p-3 border", character.bubbleBg)}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground mr-1">{character.name}</span>
                  <div className={cn("w-2 h-2 rounded-full animate-bounce", character.dotColor)} />
                  <div className={cn("w-2 h-2 rounded-full animate-bounce [animation-delay:0.15s]", character.dotColor)} />
                  <div className={cn("w-2 h-2 rounded-full animate-bounce [animation-delay:0.3s]", character.dotColor)} />
                </div>
              </Card>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-border/30">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button variant="outline" size="sm" className="flex-shrink-0 text-xs">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            AI Analysis
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0 text-xs">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            Progress
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0 text-xs">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Quick Mix
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/30 bg-background">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceInput}
            className={cn(
              "flex-shrink-0 w-10 h-10",
              isRecording && "bg-destructive text-destructive-foreground border-destructive"
            )}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder={`Ask ${character.name} anything...`}
            className="flex-1 h-10"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="flex-shrink-0 w-10 h-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
