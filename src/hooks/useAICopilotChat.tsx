import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useAICopilotChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = { role: 'user', content: userMessage };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);

    try {
      const response = await fetch(
        'https://htvmkylgrrlaydhdbonl.supabase.co/functions/v1/copilot-chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dm1reWxncnJsYXlkaGRib25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTUwODIsImV4cCI6MjA3NDU5MTA4Mn0.peKF6_Gf15ZJCrwlnS2Kizy0tOkJ_9BJxXcs1TGM5Cc',
          },
          body: JSON.stringify({ messages: updatedMessages }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to start AI stream');
      }

      // Stream response
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
          } catch (e) {
            // Incomplete JSON, wait for more data
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return { messages, sendMessage, isStreaming, clearChat };
};
