import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Send, Zap, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAIStudioStore, Track } from '@/stores/aiStudioStore';
import { toast } from 'sonner';

interface AISuggestion {
  type: string;
  content: string;
  timestamp: number;
}

export const AIAssistantPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  
  const { tracks, tempo, masterPeakLevel } = useAIStudioStore();

  const getSuggestion = async (type: string, track?: Track) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-studio-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type,
            trackData: track || null,
            sessionData: {
              tempo,
              trackCount: tracks.length,
              masterPeak: masterPeakLevel,
            },
          }),
        }
      );

      if (response.status === 429) {
        toast.error('Rate Limit Reached', {
          description: 'AI requests are rate limited. Please wait a moment and try again.',
        });
        return;
      }

      if (response.status === 402) {
        toast.error('AI Credits Exhausted', {
          description: 'Please add credits to your Lovable workspace to continue using AI features.',
        });
        return;
      }

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();
      
      const newSuggestion: AISuggestion = {
        type,
        content: data.suggestion,
        timestamp: Date.now(),
      };
      
      setSuggestions((prev) => [newSuggestion, ...prev]);
      
      toast.success('AI Suggestion Generated', {
        description: 'New recommendation added below',
      });
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast.error('AI Request Failed', {
        description: 'Could not generate suggestion. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Mix Analysis', type: 'mix-analysis', icon: Wand2 },
    { label: 'Master Tips', type: 'mastering-suggestions', icon: Sparkles },
    { label: 'Vocal Polish', type: 'vocal-enhancement', icon: Zap },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[hsl(var(--studio-border))]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-gradient-primary rounded-lg shadow-[var(--shadow-glow)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[hsl(var(--studio-text))]">AI Assistant</h3>
            <p className="text-xs text-[hsl(var(--studio-text-dim))]">
              Powered by Gemini 2.5 Flash
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.type}
              variant="outline"
              size="sm"
              onClick={() => getSuggestion(action.type)}
              disabled={isLoading || tracks.length === 0}
              className="text-xs hover:bg-[hsl(var(--studio-accent)/0.1)] hover:border-[hsl(var(--studio-accent))]"
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Suggestions Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-[hsl(var(--studio-panel-raised))] rounded-lg border border-[hsl(var(--studio-border))]"
          >
            <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--studio-accent))]" />
            <span className="text-sm text-[hsl(var(--studio-text-dim))]">
              Generating suggestion...
            </span>
          </motion.div>
        )}

        <AnimatePresence>
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.timestamp}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-[hsl(var(--studio-panel-raised))] rounded-lg border border-[hsl(var(--studio-border))] hover:border-[hsl(var(--studio-accent)/0.5)] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  {suggestion.type.replace('-', ' ')}
                </Badge>
                <span className="text-[10px] text-[hsl(var(--studio-text-dim))]">
                  {new Date(suggestion.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm text-[hsl(var(--studio-text))] whitespace-pre-wrap leading-relaxed">
                {suggestion.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {suggestions.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--studio-panel-raised))] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[hsl(var(--studio-text-dim))]" />
            </div>
            <p className="text-sm text-[hsl(var(--studio-text-dim))]">
              No AI suggestions yet
            </p>
            <p className="text-xs text-[hsl(var(--studio-text-dim))] mt-1">
              Click a quick action above to get started
            </p>
          </div>
        )}
      </div>

      {/* Custom Prompt Input */}
      <div className="p-4 border-t border-[hsl(var(--studio-border))]">
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask AI anything about your mix..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="flex-1 min-h-[60px] bg-[hsl(var(--studio-panel-raised))] border-[hsl(var(--studio-border))]"
            disabled={isLoading}
          />
          <Button
            onClick={() => {
              if (customPrompt.trim()) {
                getSuggestion('creative-suggestion');
                setCustomPrompt('');
              }
            }}
            disabled={isLoading || !customPrompt.trim()}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
