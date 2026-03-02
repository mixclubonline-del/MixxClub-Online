import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { GenrePreset } from '@/audio/context/GenreContext';

interface MasteringPrimeChatProps {
  genre: GenrePreset;
  originalLUFS: number;
  masteredLUFS: number;
  improvements: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const MASTERING_CONTEXT = (genre: string, originalLUFS: number, masteredLUFS: number, improvements: string[]) => ({
  currentPage: '/go',
  masteringSession: {
    genre,
    originalLUFS,
    masteredLUFS,
    improvements,
    engine: 'Velvet Curve',
  },
});

export function MasteringPrimeChat({ genre, originalLUFS, masteredLUFS, improvements }: MasteringPrimeChatProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const insightFetched = useRef(false);

  const context = MASTERING_CONTEXT(genre, originalLUFS, masteredLUFS, improvements);
  const delta = (masteredLUFS - originalLUFS).toFixed(1);

  // Auto-fetch one-line insight on mount
  useEffect(() => {
    if (insightFetched.current) return;
    insightFetched.current = true;

    const fetchInsight = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('prime-chat', {
          body: {
            messages: [
              {
                role: 'user',
                content: `Give a one-sentence mastering summary (max 25 words). I just mastered a ${genre} track from ${originalLUFS.toFixed(1)} LUFS to ${masteredLUFS.toFixed(1)} LUFS. Improvements: ${improvements.join(', ')}.`,
              },
            ],
            context,
          },
        });

        if (error) throw error;

        // Handle streaming SSE response or plain JSON
        if (typeof data === 'string') {
          // Parse SSE chunks for text content
          const text = parseSSEText(data);
          setInsight(text || fallbackInsight());
        } else if (data?.content) {
          setInsight(data.content);
        } else if (data?.response) {
          setInsight(data.response);
        } else {
          setInsight(fallbackInsight());
        }
      } catch (err: any) {
        console.warn('[MasteringPrime] insight fetch failed, using fallback', err);
        setInsight(fallbackInsight());
      } finally {
        setInsightLoading(false);
      }
    };

    const fallbackInsight = () =>
      `Your ${genre} track jumped ${delta} dB — ${improvements.slice(0, 2).join(' and ').toLowerCase() || 'dynamics tightened'}. Streaming-ready.`;

    fetchInsight();
  }, [genre, originalLUFS, masteredLUFS, improvements, context, delta]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('prime-chat', {
        body: {
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          context,
        },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Prime is busy — try again in a moment.');
          return;
        }
        if (error.message?.includes('402')) {
          toast.error('AI credits depleted.');
          return;
        }
        throw error;
      }

      let reply = "I'm here to talk through your master — ask me anything!";
      if (typeof data === 'string') {
        reply = parseSSEText(data) || reply;
      } else if (data?.content) {
        reply = data.content;
      } else if (data?.response) {
        reply = data.response;
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('[MasteringPrime] chat error:', err);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: "Connection hiccup — try again in a sec." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, context]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden"
    >
      {/* Insight card */}
      <div className="p-4 flex items-start gap-3">
        {/* Prime avatar */}
        <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden border-2 border-primary/40">
          <img src="/assets/prime-pointing.jpg" alt="Prime" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          {insightLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 animate-pulse text-primary" />
              Prime is analyzing your master…
            </div>
          ) : (
            <p className="text-sm text-foreground/90 leading-relaxed">{insight}</p>
          )}
        </div>
      </div>

      {/* Expand / chat toggle */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors border-t border-primary/10"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Ask Prime about this master
        </button>
      )}

      {/* Inline chat */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-primary/10"
          >
            {/* Messages */}
            <div className="max-h-48 overflow-y-auto p-3 space-y-2.5">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Ask anything — "Why did you boost the highs?" or "How would this sound on Spotify?"
                </p>
              )}
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/60 text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted/60 px-3 py-2 rounded-xl flex gap-1">
                    {[0, 0.1, 0.2].map((d, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: d }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={e => { e.preventDefault(); handleSend(); }}
              className="flex gap-2 p-3 pt-0"
            >
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your master…"
                className="flex-1 h-8 text-xs bg-background/50 border-primary/20"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isTyping || !input.trim()}
                className="h-8 w-8 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Parse SSE text/event-stream into concatenated text */
function parseSSEText(raw: string): string {
  try {
    const lines = raw.split('\n');
    let result = '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') continue;
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
            ?? parsed?.choices?.[0]?.delta?.content
            ?? '';
          result += delta;
        } catch { /* skip non-JSON lines */ }
      }
    }
    return result.trim();
  } catch {
    return '';
  }
}
