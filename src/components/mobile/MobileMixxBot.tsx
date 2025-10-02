import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, User, Activity, AlertCircle, TrendingUp, Users, DollarSign, Zap, Mic, MicOff, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import mixclub3DLogo from '@/assets/mixclub-3d-logo.png';
import { useIsMobile } from '@/hooks/use-mobile';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  prompt: string;
  category: 'stats' | 'users' | 'revenue' | 'trends';
}

const quickActions: QuickAction[] = [
  {
    label: 'Platform Overview',
    icon: <Activity className="w-4 h-4" />,
    prompt: 'Give me a complete overview of platform health, including active users, revenue trends, and any critical issues',
    category: 'stats'
  },
  {
    label: 'Revenue Analysis',
    icon: <DollarSign className="w-4 h-4" />,
    prompt: 'Analyze current revenue trends, top-earning engineers, and suggest pricing optimizations',
    category: 'revenue'
  },
  {
    label: 'User Insights',
    icon: <Users className="w-4 h-4" />,
    prompt: 'Show me user engagement metrics, new sign-ups, and retention rates',
    category: 'users'
  },
  {
    label: 'Growth Strategy',
    icon: <TrendingUp className="w-4 h-4" />,
    prompt: 'What are the top 3 growth opportunities for MixClubOnline right now?',
    category: 'trends'
  },
  {
    label: 'Critical Alerts',
    icon: <AlertCircle className="w-4 h-4" />,
    prompt: 'Are there any critical issues or alerts I should address immediately?',
    category: 'stats'
  },
  {
    label: 'Quick Win Ideas',
    icon: <Zap className="w-4 h-4" />,
    prompt: 'Give me 5 quick wins I can implement today to improve the platform',
    category: 'trends'
  },
];

export const MobileMixxBot = ({ onClose }: { onClose?: () => void }) => {
  const location = useLocation();
  const currentPage = location.pathname;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hey Boss! I'm Mixx Bot, your ultimate AI business companion. I have complete access to all platform data, user insights, and industry trends. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const recognition = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition for mobile
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      
      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognition.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Please try again",
          variant: "destructive"
        });
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognition.current) {
      toast({
        title: "Voice input not supported",
        description: "Your device doesn't support voice input",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('admin-chat-enhanced', {
        body: { 
          message: messageText,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          context: { page: currentPage, isMobile: true }
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I apologize, I couldn't process that request.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save to database for context sharing
      await supabase.from('chatbot_messages').insert([
        {
          user_id: user.id,
          chatbot_type: 'admin',
          role: 'user',
          content: messageText,
          session_id: null
        },
        {
          user_id: user.id,
          chatbot_type: 'admin',
          role: 'assistant',
          content: data.response,
          session_id: null
        }
      ]);

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Connection Error",
        description: "Couldn't reach Mixx Bot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
            <div className="relative z-10">
              <img 
                src={mixclub3DLogo} 
                alt="Mixx Bot" 
                className="w-8 h-6 object-contain"
                style={{
                  filter: 'drop-shadow(0 0 6px hsl(var(--primary))) brightness(1.2) saturate(1.5)'
                }}
              />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg">Mixx Bot</h1>
            <p className="text-xs text-muted-foreground">Your AI Business Companion</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-border bg-muted/30">
        <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.prompt)}
              disabled={isLoading}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {action.icon}
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground w-10 h-10' 
                  : 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 w-10 h-10 relative'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
                    <img 
                      src={mixclub3DLogo} 
                      alt="Mixx Bot" 
                      className="w-5 h-4 object-contain relative z-10"
                      style={{
                        filter: 'drop-shadow(0 0 3px hsl(var(--primary))) brightness(1.2)'
                      }}
                    />
                  </>
                )}
              </div>
              
              <div className={`flex-1 ${
                message.role === 'user' ? 'text-right' : ''
              }`}>
                <div className={`rounded-lg p-3 text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto inline-block max-w-[85%]'
                    : 'bg-muted inline-block max-w-[85%]'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 w-10 h-10 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-pink-500/30 animate-pulse"></div>
                <img 
                  src={mixclub3DLogo} 
                  alt="Thinking" 
                  className="w-5 h-4 object-contain relative z-10 animate-pulse"
                  style={{
                    filter: 'drop-shadow(0 0 4px hsl(var(--primary))) brightness(1.3)'
                  }}
                />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <span className="text-xs text-muted-foreground ml-2">Analyzing data...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border bg-background">
        <form onSubmit={onSubmit} className="flex gap-2">
          {isMobile && recognition.current && (
            <Button
              type="button"
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={toggleVoiceInput}
              disabled={isLoading}
              className={isListening ? "animate-pulse" : ""}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
          )}
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about platform metrics, strategy..."
            disabled={isLoading}
            className="flex-1"
          />
          
          <Button 
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Real-time platform intelligence • Powered by AI
        </p>
      </div>
    </div>
  );
};