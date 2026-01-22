import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { AssetContext } from '@/hooks/useDreamEngine';

interface ContextSelectorProps {
  contexts: AssetContext[];
  loading: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Icon mapping for context prefixes
const contextIcons: Record<string, string> = {
  landing_: '🎯',
  prime_: '🤖',
  studio_: '🎵',
  hallway_: '🚪',
  room_: '🏠',
  unlock_: '🏆',
  community_: '👥',
  economy_: '💰',
  vault_: '🔐',
  merch_: '🛍️',
  course_: '🎓',
  badge_: '🏅',
  promo_: '📣',
};

export function ContextSelector({ contexts, loading, value, onChange, placeholder = "Select context..." }: ContextSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 bg-muted/50 rounded-md">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading contexts...</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {contexts.map((ctx) => (
          <SelectItem key={ctx.id} value={ctx.context_prefix}>
            <span className="flex items-center gap-2">
              <span>{contextIcons[ctx.context_prefix] || '📁'}</span>
              <span>{ctx.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
