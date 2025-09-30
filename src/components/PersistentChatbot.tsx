import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Send, Bot, User, Music, Settings, MessageCircle, X, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import mixclub3DLogo from '@/assets/mixclub-3d-logo.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const PersistentChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI mixing & mastering engineer. Upload a track and I'll give you instant professional feedback plus an A/B comparison of our mastering technology. What can I help you with today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 50MB",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      toast({
        title: "File uploaded",
        description: `${file.name} is ready for analysis`,
      });
    }
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const { data, error } = await supabase.functions.invoke('chat-simple', {
        body: {
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || "I apologize, but I couldn't process your request right now.",
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Sorry, I couldn't process your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    let messageContent = input;
    if (uploadedFile && !input.trim()) {
      messageContent = `Please analyze my uploaded track: ${uploadedFile.name}`;
    } else if (uploadedFile && input.trim()) {
      messageContent = `${input} (Uploaded file: ${uploadedFile.name})`;
    }

    sendMessage(messageContent);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
          size="sm"
        >
          {/* Pulsating background rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 animate-pulse"></div>
          
          {/* Logo */}
          <div className="relative z-10 flex items-center justify-center">
            <img 
              src={mixclub3DLogo} 
              alt="MixClub AI Assistant" 
              className="w-8 h-6 object-contain transition-transform duration-300 group-hover:scale-110 filter drop-shadow-lg"
              style={{
                filter: 'drop-shadow(0 0 8px hsl(var(--primary))) brightness(1.2) saturate(1.5)'
              }}
            />
          </div>
          
          {/* Animated glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/0 via-purple-500/40 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 bg-background border-primary/20 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[600px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              {/* Pulsating glow effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
              
              {/* Logo */}
              <div className="relative z-10">
                <img 
                  src={mixclub3DLogo} 
                  alt="MixClub AI" 
                  className="w-6 h-4 object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 4px hsl(var(--primary))) brightness(1.1) saturate(1.3)'
                  }}
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Mastering Assistant</h3>
              {!isMinimized && (
                <p className="text-xs text-muted-foreground">Professional feedback</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" style={{ height: 'calc(600px - 140px)' }}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground w-8 h-8' 
                        : 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 w-8 h-8 relative'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <>
                          {/* Pulsating background for assistant */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
                          <img 
                            src={mixclub3DLogo} 
                            alt="AI Assistant" 
                            className="w-4 h-3 object-contain relative z-10"
                            style={{
                              filter: 'drop-shadow(0 0 2px hsl(var(--primary))) brightness(1.1)'
                            }}
                          />
                        </>
                      )}
                    </div>
                    
                    <div className={`flex-1 max-w-[80%] ${
                      message.role === 'user' ? 'text-right' : ''
                    }`}>
                      <div className={`rounded-lg p-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 w-8 h-8 relative">
                      {/* Pulsating background */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-pink-500/30 animate-pulse"></div>
                      <img 
                        src={mixclub3DLogo} 
                        alt="AI Thinking" 
                        className="w-4 h-3 object-contain relative z-10 animate-pulse"
                        style={{
                          filter: 'drop-shadow(0 0 4px hsl(var(--primary))) brightness(1.2)'
                        }}
                      />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="text-xs text-muted-foreground ml-2">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border space-y-3">
              {uploadedFile && (
                <div className="flex items-center justify-between p-2 bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Music className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium">{uploadedFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="h-6 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              )}
              
              <form onSubmit={onSubmit} className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="shrink-0"
                >
                  <Upload className="w-3 h-3" />
                </Button>
                
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about mixing, mastering..."
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                
                <Button 
                  type="submit"
                  disabled={isLoading || (!input.trim() && !uploadedFile)}
                  size="sm"
                  className="shrink-0"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </form>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};