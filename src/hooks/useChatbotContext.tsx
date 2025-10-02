import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
  const { user } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Extract current page and tab from location
  const currentPage = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  const fetchMessages = async (chatbotType?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('chatbot_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (chatbotType) {
        query = query.eq('chatbot_type', chatbotType);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setMessages((data || []) as ChatMessage[]);
    } catch (error) {
      console.error('Error fetching chatbot messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentContext = async (limit: number = 20): Promise<ChatMessage[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return (data || []) as ChatMessage[];
    } catch (error) {
      console.error('Error fetching recent context:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  return (
    <ChatbotContext.Provider value={{ messages, loading, currentPage, currentTab, fetchMessages, fetchRecentContext }}>
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