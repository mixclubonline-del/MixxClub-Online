import { createContext, useContext, ReactNode } from 'react';

interface ChatMessage {
  id: string;
  chatbot_type: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface ChatbotContextValue {
  messages: ChatMessage[];
  loading: boolean;
  currentPage: string;
  currentTab: string;
  fetchMessages: (chatbotType?: string) => Promise<void>;
  fetchRecentContext: (limit?: number) => Promise<ChatMessage[]>;
}

const ChatbotContext = createContext<ChatbotContextValue | undefined>(undefined);

export const ChatbotContextProvider = ({ children }: { children: ReactNode }) => {
  const value: ChatbotContextValue = {
    messages: [],
    loading: false,
    currentPage: '/',
    currentTab: 'overview',
    fetchMessages: async () => {},
    fetchRecentContext: async () => [],
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbotContext must be used within a ChatbotContextProvider');
  }
  return context;
};
