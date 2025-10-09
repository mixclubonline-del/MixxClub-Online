import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useKeyboardShortcuts, KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';

interface ShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Keyboard shortcuts panel - shows all available shortcuts
 * Accessible via '?' key
 */
export const ShortcutsPanel: React.FC<ShortcutsPanelProps> = ({ isOpen, onClose }) => {
  const { shortcuts, getShortcutsByCategory } = useKeyboardShortcuts();
  const [searchQuery, setSearchQuery] = React.useState('');

  const categories: Array<{ id: KeyboardShortcut['category']; label: string }> = [
    { id: 'editing', label: 'Editing' },
    { id: 'playback', label: 'Playback' },
    { id: 'selection', label: 'Selection' },
    { id: 'zoom', label: 'Zoom' },
    { id: 'transport', label: 'Transport' },
  ];

  const formatKey = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('⌘');
    if (shortcut.shift) parts.push('⇧');
    if (shortcut.alt) parts.push('⌥');
    
    let key = shortcut.key;
    if (key === ' ') key = 'Space';
    if (key === 'Enter') key = '↵';
    if (key === 'Escape') key = 'Esc';
    
    parts.push(key.toUpperCase());
    return parts.join(' ');
  };

  const filteredShortcuts = React.useMemo(() => {
    if (!searchQuery.trim()) return shortcuts;
    
    const query = searchQuery.toLowerCase();
    return shortcuts.filter(s => 
      s.description.toLowerCase().includes(query) ||
      s.key.toLowerCase().includes(query)
    );
  }, [shortcuts, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8"
            onClick={onClose}
          >
            <div
              className="bg-[hsl(220,18%,16%)] border border-[hsl(220,14%,28%)] rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[hsl(220,14%,28%)]">
                <div className="flex items-center gap-3">
                  <Keyboard className="w-5 h-5 text-[hsl(var(--studio-accent))]" />
                  <h2 className="text-lg font-semibold text-[hsl(var(--studio-text))]">
                    Keyboard Shortcuts
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-[hsl(220,14%,28%)]">
                <Input
                  placeholder="Search shortcuts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[hsl(220,20%,14%)] border-[hsl(220,14%,28%)]"
                />
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[60vh] p-4">
                {categories.map(category => {
                  const categoryShortcuts = filteredShortcuts.filter(
                    s => s.category === category.id
                  );

                  if (categoryShortcuts.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-semibold text-[hsl(var(--studio-text-dim))] uppercase tracking-wider mb-3">
                        {category.label}
                      </h3>
                      <div className="space-y-2">
                        {categoryShortcuts.map((shortcut, index) => (
                          <div
                            key={`${shortcut.key}-${index}`}
                            className="flex items-center justify-between py-2 px-3 rounded bg-[hsl(220,20%,14%)] hover:bg-[hsl(220,18%,18%)] transition-colors"
                          >
                            <span className="text-sm text-[hsl(var(--studio-text))]">
                              {shortcut.description}
                            </span>
                            <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-[hsl(220,20%,12%)] text-[hsl(var(--studio-accent))] border border-[hsl(220,14%,28%)] rounded">
                              {formatKey(shortcut)}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {filteredShortcuts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-[hsl(var(--studio-text-dim))]">
                      No shortcuts found matching "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[hsl(220,14%,28%)] bg-[hsl(220,20%,12%)]">
                <p className="text-xs text-[hsl(var(--studio-text-dim))] text-center">
                  Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-[hsl(220,18%,16%)] border border-[hsl(220,14%,28%)] rounded">?</kbd> anytime to show this panel
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
