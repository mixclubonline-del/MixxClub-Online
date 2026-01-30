import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DreamMode } from '@/hooks/useDreamEngine';

interface EnhancedPromptCardProps {
  id: string;
  name: string;
  prompt: string;
  videoPrompt?: string;
  context: string;
  mode: DreamMode;
  category?: string;
  isGenerating: boolean;
  generatingId: string | null;
  onGenerate: (id: string, prompt: string, context?: string) => void;
}

// Category styling
const CATEGORY_STYLES: Record<string, { icon: string; gradient: string }> = {
  landing_: { icon: '🎯', gradient: 'from-purple-500/20 to-pink-500/20' },
  economy_: { icon: '💰', gradient: 'from-amber-500/20 to-yellow-500/20' },
  studio_: { icon: '🎵', gradient: 'from-orange-500/20 to-red-500/20' },
  prime_: { icon: '🤖', gradient: 'from-cyan-500/20 to-blue-500/20' },
  unlock_: { icon: '🏆', gradient: 'from-green-500/20 to-emerald-500/20' },
  community_: { icon: '👥', gradient: 'from-indigo-500/20 to-purple-500/20' },
};

function getCategoryStyle(context: string) {
  for (const [prefix, style] of Object.entries(CATEGORY_STYLES)) {
    if (context.startsWith(prefix)) return style;
  }
  return { icon: '📁', gradient: 'from-gray-500/20 to-gray-600/20' };
}

export function EnhancedPromptCard({
  id,
  name,
  prompt,
  videoPrompt,
  context,
  mode,
  isGenerating,
  generatingId,
  onGenerate,
}: EnhancedPromptCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const isThisGenerating = generatingId === id;
  const categoryStyle = getCategoryStyle(context);
  
  const activePrompt = mode === 'video' && videoPrompt ? videoPrompt : prompt;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "group relative rounded-xl overflow-hidden",
        "bg-gradient-to-br backdrop-blur border border-border/50",
        "transition-all duration-300",
        categoryStyle.gradient,
        isThisGenerating && "border-primary/50 shadow-lg shadow-primary/20"
      )}
      style={{
        boxShadow: isThisGenerating 
          ? '0 0 30px hsl(270 75% 55% / 0.2)' 
          : undefined
      }}
    >
      {/* Holographic shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          style={{ transform: 'translateX(-100%)', animation: 'shimmer 2s infinite' }}
        />
      </div>

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{categoryStyle.icon}</span>
            <h3 className="font-semibold">{name}</h3>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Context badge */}
        <div className="mb-3">
          <span className="text-xs px-2 py-1 rounded-full bg-background/50 text-muted-foreground font-mono">
            {context}
          </span>
        </div>

        {/* Prompt preview */}
        <p className={cn(
          "text-sm text-muted-foreground mb-4 transition-all",
          showPreview ? "line-clamp-none" : "line-clamp-2"
        )}>
          {activePrompt}
        </p>

        {/* Generate button */}
        <Button
          onClick={() => onGenerate(id, activePrompt, context)}
          disabled={isGenerating}
          className={cn(
            "w-full gap-2 transition-all",
            isThisGenerating && "bg-primary/80"
          )}
          variant={isThisGenerating ? "default" : "secondary"}
        >
          {isThisGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Dreaming...
            </>
          ) : (
            <>
              {mode === 'video' ? <Play className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              Dream It
            </>
          )}
        </Button>
      </div>

      {/* Bottom glow line */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
          "bg-gradient-to-r from-transparent via-primary to-transparent"
        )}
      />

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
}
