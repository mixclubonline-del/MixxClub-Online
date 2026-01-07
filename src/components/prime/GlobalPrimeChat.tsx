import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePrimePosition } from '@/hooks/usePrimePosition';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Context-aware greetings based on current route
const getContextualGreeting = (pathname: string): string => {
  if (pathname.includes('/for-artists')) {
    return "Hey! Looking to connect with professional engineers? I can help you find the perfect match for your sound.";
  }
  if (pathname.includes('/for-engineers')) {
    return "Welcome, engineer! I can help you set up your profile, understand our platform, or answer any questions.";
  }
  if (pathname.includes('/pricing')) {
    return "Got questions about our plans? I can break down exactly what you get at each tier.";
  }
  if (pathname.includes('/ai-mastering')) {
    return "Ready to master your track? I can walk you through our AI mastering process or help with any questions.";
  }
  if (pathname.includes('/how-it-works')) {
    return "Want to understand MixClub better? Ask me anything about how we connect artists with engineers!";
  }
  return "Hey! I'm Prime, your guide to MixClub. I know everything about mixing, mastering, and building your music career. What can I help you with?";
};

// Routes where GlobalPrimeChat should be hidden (they have their own chatbots)
const HIDDEN_ROUTES = [
  '/artist-crm',
  '/engineer-crm',
  '/hybrid-daw',
  '/session-workspace',
  '/admin',
];

export const GlobalPrimeChat = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { bottom, right } = usePrimePosition();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide on CRM/DAW routes (they have dedicated chatbots)
  const shouldHide = HIDDEN_ROUTES.some(route => location.pathname.startsWith(route));
  
  // Also hide for authenticated users who have CRM access
  const shouldRender = !shouldHide && !user;

  // Delay showing Prime to not distract on initial load
  useEffect(() => {
    if (!shouldRender) {
      setIsVisible(false);
      return;
    }
    
    // Show Prime after 8 seconds of page engagement
    const timer = setTimeout(() => setIsVisible(true), 8000);
    return () => clearTimeout(timer);
  }, [shouldRender, location.pathname]);

  // Reset messages with contextual greeting when route changes
  useEffect(() => {
    setMessages([
      { id: '1', role: 'assistant', content: getContextualGreeting(location.pathname) }
    ]);
  }, [location.pathname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Don't render if hidden or not visible yet
  if (!shouldRender || !isVisible) {
    return null;
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Call prime-chat edge function
      const { data, error } = await supabase.functions.invoke('prime-chat', {
        body: {
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          context: {
            currentPage: location.pathname,
            isAuthenticated: !!user,
          },
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.content || data?.response || "I'm here to help! Could you rephrase that?",
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Prime chat error:', error);
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. MixClub connects artists with professional mixing and mastering engineers. You can explore our services or sign up to get started!",
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed z-[55] touch-feedback"
        style={{ bottom, right }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring' }}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                size="lg"
                onClick={() => setIsOpen(true)}
                className="relative w-14 h-14 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))] hover:shadow-[0_0_40px_hsl(var(--primary)/0.8)] transition-all group touch-target-xl"
              >
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[hsl(var(--primary))]"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Prime avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20">
                  <img 
                    src="/assets/prime-pointing.jpg" 
                    alt="Prime"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Notification dot */}
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full bg-[hsl(var(--accent-cyan))] border-2 border-background"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </Button>

              {/* Tooltip - hidden on mobile */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute right-16 md:right-20 top-1/2 -translate-y-1/2 whitespace-nowrap hidden md:block"
              >
                <div className="glass-pill px-4 py-2 rounded-full text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[hsl(var(--primary))]" />
                  Ask Prime anything!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed z-[55] w-[calc(100vw-2rem)] sm:w-96 max-w-[400px]"
            style={{ bottom, right }}
          >
            <div className="glass-ultra rounded-2xl overflow-hidden border border-[hsl(var(--glass-border-glow))] shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-3 md:p-4 border-b border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--primary)/0.1)] to-[hsl(var(--accent-cyan)/0.1)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[hsl(var(--primary)/0.5)]">
                    <img 
                      src="/assets/prime-pointing.jpg" 
                      alt="Prime"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm md:text-base flex items-center gap-2">
                      Prime
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="text-xs text-muted-foreground">Your MixClub Guide</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="h-64 md:h-80 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-2.5 md:p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] text-white'
                          : 'glass-mid'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="glass-mid p-3 rounded-2xl">
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 md:p-4 border-t border-[hsl(var(--border))]">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about MixClub..."
                    className="flex-1 glass-mid border-[hsl(var(--glass-border))] text-sm"
                  />
                  <Button 
                    type="submit"
                    size="icon"
                    disabled={isTyping || !input.trim()}
                    className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
