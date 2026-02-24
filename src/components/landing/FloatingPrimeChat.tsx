import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const DEMO_RESPONSES: Record<string, string> = {
  default: "Hey! I'm Prime, your AI guide to MixClub. Ask me about mixing, mastering, or how to get started!",
  mixing: "Mixing is all about balance. I can help you find the perfect engineer for your track's genre and style. Want me to show you how our AI matching works?",
  mastering: "Our AI mastering analyzes your track in seconds - detecting genre, BPM, key, and suggesting the perfect processing chain. Try uploading a track to see it in action!",
  engineer: "MixClub connects you with vetted audio engineers who specialize in your genre. Our AI matches you based on style, budget, and availability.",
  price: "We have flexible pricing! Engineers set their own rates, typically $50-500 per track. Plus, our AI mastering starts at just $9.99.",
  how: "Simple: Upload your track → Get AI analysis → Match with engineers → Collaborate in real-time → Receive professional masters. All in one platform!",
};

export const FloatingPrimeChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: DEMO_RESPONSES.default }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('mix')) return DEMO_RESPONSES.mixing;
    if (q.includes('master')) return DEMO_RESPONSES.mastering;
    if (q.includes('engineer')) return DEMO_RESPONSES.engineer;
    if (q.includes('price') || q.includes('cost') || q.includes('$')) return DEMO_RESPONSES.price;
    if (q.includes('how') || q.includes('work')) return DEMO_RESPONSES.how;
    return "Great question! MixClub is the future of music collaboration. We use AI to match artists with the perfect engineers, analyze tracks instantly, and streamline the entire production process. What specifically would you like to know?";
  };

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

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response = getResponse(input);

    // Typewriter effect for response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response
    };

    setIsTyping(false);
    setMessages(prev => [...prev, assistantMessage]);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
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
                className="relative w-16 h-16 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))] hover:shadow-[0_0_40px_hsl(var(--primary)/0.8)] transition-all group"
              >
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[hsl(var(--primary))]"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Prime avatar mini */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                  <img
                    src="/assets/prime-pointing.jpg"
                    alt="Prime"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Notification dot */}
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[hsl(var(--accent-cyan))] border-2 border-background"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </Button>

              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute right-20 top-1/2 -translate-y-1/2 whitespace-nowrap"
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
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <div className="mg-panel rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="mg-header flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[hsl(var(--primary)/0.5)]">
                    <img
                      src="/assets/prime-pointing.jpg"
                      alt="Prime"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      Prime AI
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
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${message.role === 'user'
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
              <div className="p-4 border-t border-[hsl(var(--border))]">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about mixing, mastering..."
                    className="flex-1 glass-mid border-[hsl(var(--glass-border))]"
                  />
                  <Button
                    type="submit"
                    size="icon"
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
