import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { stateManager } from '@/utils/stateManager';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContext {
  userRole?: 'artist' | 'engineer';
  currentPage?: string;
  sessionId?: string;
  projectId?: string;
  userName?: string;
  earnings?: number;
  projectsCompleted?: number;
}

const CHAT_STATE_KEY = 'ai_copilot_chat';
const MAX_CHAT_AGE = 24 * 60 * 60 * 1000; // 24 hours

export const useAICopilotChat = (context?: ChatContext) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    return stateManager.loadState<Message[]>(CHAT_STATE_KEY, MAX_CHAT_AGE) || [];
  });
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (userMessage: string, useDeepThink = false) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = { role: 'user', content: userMessage };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);

    try {
      // Use the new Prime chat endpoint with Gemini
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prime-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            messages: updatedMessages,
            context,
            useDeepThink
          }),
        }
      );

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start AI stream');
      }

      // Stream response - handle both Gemini and OpenAI formats
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';

      // Add placeholder for assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        // Try to parse Gemini streaming format
        try {
          // Gemini returns JSON objects directly
          const lines = textBuffer.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              
              // Gemini format
              if (parsed.candidates?.[0]?.content?.parts) {
                const text = parsed.candidates[0].content.parts
                  .filter((p: any) => p.text)
                  .map((p: any) => p.text)
                  .join('');
                
                if (text) {
                  assistantContent = text;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      role: 'assistant',
                      content: assistantContent
                    };
                    return newMessages;
                  });
                }
              }
              
              // OpenAI SSE format (fallback)
              if (parsed.choices?.[0]?.delta?.content) {
                assistantContent += parsed.choices[0].delta.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantContent
                  };
                  return newMessages;
                });
              }
            } catch {
              // Line not complete JSON yet
            }
          }
          
          // Keep incomplete lines in buffer
          const lastNewline = textBuffer.lastIndexOf('\n');
          if (lastNewline !== -1) {
            textBuffer = textBuffer.slice(lastNewline + 1);
          }
        } catch {
          // Handle SSE format as fallback
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              
              if (delta) {
                assistantContent += delta;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantContent
                  };
                  return newMessages;
                });
              }
            } catch {
              // Incomplete JSON, wait for more data
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    stateManager.clearState(CHAT_STATE_KEY);
  };

  // Persist messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      stateManager.saveState(CHAT_STATE_KEY, messages, 1000);
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stateManager.cleanup();
    };
  }, []);

  return { messages, sendMessage, isStreaming, clearChat };
};
