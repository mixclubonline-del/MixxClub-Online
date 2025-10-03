import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAICopilotChat } from '@/hooks/useAICopilotChat';
import { cn } from '@/lib/utils';

interface AICopilotSidebarProps {
  onClose: () => void;
  insights: any[];
  isLoading: boolean;
}

export const AICopilotSidebar = ({ onClose, insights, isLoading }: AICopilotSidebarProps) => {
  const { messages, sendMessage, isStreaming, clearChat } = useAICopilotChat();
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    await sendMessage(input);
    setInput('');
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'improvement': return '💡';
      default: return '💡';
    }
  };

  return (
    <Card className="h-full flex flex-col bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl rounded-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <h2 className="text-lg font-semibold">AI Copilot</h2>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="h-8 w-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="p-4 space-y-2 border-b border-border/50">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Insights</h3>
          {insights.slice(0, 2).map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getInsightIcon(insight.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Sparkles className="w-12 h-12 text-primary/50 mb-4" />
            <h3 className="text-sm font-medium mb-2">Ask me anything!</h3>
            <p className="text-xs text-muted-foreground">
              I can help with project recommendations, workflow tips, and navigation.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={cn(
                "flex",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] p-3 rounded-lg text-sm",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted border border-border/50"
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted border border-border/50 p-3 rounded-lg">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4 border-t border-border/50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything..."
            disabled={isStreaming}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!input.trim() || isStreaming}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
