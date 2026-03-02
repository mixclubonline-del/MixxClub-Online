import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { HubType, useHubData } from '@/contexts/HubDataContext';
import { uuid } from '@/lib/uuid';

export type PrimeBotMode = 'collapsed' | 'expanded' | 'command-palette';

export interface PrimeBotAction {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: unknown;
  timestamp: number;
}

export interface PrimeBotContext {
  currentHub: HubType;
  selectedRecordId: string | null;
  selectedRecordType: string | null;
  userPreferences: Record<string, unknown>;
  recentActions: PrimeBotAction[];
}

interface PrimeBotContextValue {
  mode: PrimeBotMode;
  setMode: (mode: PrimeBotMode) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  context: PrimeBotContext;
  updateContext: (updates: Partial<PrimeBotContext>) => void;
  selectRecord: (id: string | null, type: string | null) => void;
  addAction: (action: Omit<PrimeBotAction, 'id' | 'timestamp'>) => string;
  updateAction: (id: string, updates: Partial<PrimeBotAction>) => void;
  clearActions: () => void;
  lastMessage: string | null;
  setLastMessage: (message: string | null) => void;
  proactiveHints: string[];
  addProactiveHint: (hint: string) => void;
  clearProactiveHints: () => void;
}

const PrimeBotCtx = createContext<PrimeBotContextValue | undefined>(undefined);

export function PrimeBotProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const hubData = useHubData();
  
  const [mode, setMode] = useState<PrimeBotMode>('collapsed');
  const [isListening, setIsListening] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [proactiveHints, setProactiveHints] = useState<string[]>([]);
  
  const [context, setContext] = useState<PrimeBotContext>({
    currentHub: 'dashboard',
    selectedRecordId: null,
    selectedRecordType: null,
    userPreferences: {},
    recentActions: [],
  });

  // Sync with HubDataContext
  useEffect(() => {
    setContext(prev => ({ ...prev, currentHub: hubData.currentHub }));
  }, [hubData.currentHub]);

  const updateContext = useCallback((updates: Partial<PrimeBotContext>) => {
    setContext(prev => ({ ...prev, ...updates }));
  }, []);

  const selectRecord = useCallback((id: string | null, type: string | null) => {
    setContext(prev => ({
      ...prev,
      selectedRecordId: id,
      selectedRecordType: type,
    }));
  }, []);

  const addAction = useCallback((action: Omit<PrimeBotAction, 'id' | 'timestamp'>): string => {
    const id = uuid();
    const newAction: PrimeBotAction = {
      ...action,
      id,
      timestamp: Date.now(),
    };
    setContext(prev => ({
      ...prev,
      recentActions: [newAction, ...prev.recentActions.slice(0, 19)],
    }));
    return id;
  }, []);

  const updateAction = useCallback((id: string, updates: Partial<PrimeBotAction>) => {
    setContext(prev => ({
      ...prev,
      recentActions: prev.recentActions.map(a => 
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  }, []);

  const clearActions = useCallback(() => {
    setContext(prev => ({ ...prev, recentActions: [] }));
  }, []);

  const addProactiveHint = useCallback((hint: string) => {
    setProactiveHints(prev => {
      if (prev.includes(hint)) return prev;
      return [hint, ...prev.slice(0, 4)];
    });
  }, []);

  const clearProactiveHints = useCallback(() => {
    setProactiveHints([]);
  }, []);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setMode(prev => prev === 'command-palette' ? 'collapsed' : 'command-palette');
      }
      if (e.key === 'Escape' && mode === 'command-palette') {
        setMode('collapsed');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    setMode,
    isListening,
    setIsListening,
    context,
    updateContext,
    selectRecord,
    addAction,
    updateAction,
    clearActions,
    lastMessage,
    setLastMessage,
    proactiveHints,
    addProactiveHint,
    clearProactiveHints,
  }), [mode, isListening, context, updateContext, selectRecord, addAction, updateAction, clearActions, lastMessage, proactiveHints, addProactiveHint, clearProactiveHints]);

  return (
    <PrimeBotCtx.Provider value={value}>
      {children}
    </PrimeBotCtx.Provider>
  );
}

export function usePrimeBot() {
  const context = useContext(PrimeBotCtx);
  if (context === undefined) {
    throw new Error('usePrimeBot must be used within a PrimeBotProvider');
  }
  return context;
}
