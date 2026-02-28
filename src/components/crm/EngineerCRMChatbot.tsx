import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Send, User, Music, X, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import mixclub3DLogo from '@/assets/mixxclub-3d-logo.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const EngineerCRMChatbot = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your Engineer CRM assistant. I can help you with technical tools, workflow optimization, client management, earnings tracking, and building your reputation. How can I help you today?",
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
          description: "Please upload an audio file",
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
        description: `${file.name} is ready`,
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
      const pageContext = `Current page: Engineer CRM - ${currentTab === 'overview' ? 'Dashboard' : currentTab}`;
      
      const systemPrompt = `You are an Engineer CRM assistant for MixClub.

**NAVIGATION MAP:**
- /engineer-crm (Dashboard with earnings and stats)
- /engineer-crm?tab=active-projects (Current client projects)
- /engineer-crm?tab=opportunities (Job applications and new gigs)
- /engineer-crm?tab=tools (AI mastering and workspace)
- /engineer-crm?tab=business (Earnings, payouts, analytics)
- /engineer-crm?tab=profile (Portfolio, reviews, badges)

**CURRENT LOCATION:** ${pageContext}

**YOUR CAPABILITIES:**
- Navigate between CRM sections with direct links
- AI mastering tools and plugins guidance
- Profile optimization for more clients
- Multi-project management
- Revenue share (70%) and payment system
- Client communication best practices
- Workflow optimization and timelines
- Genre-specific quality standards
- Reputation building through reviews
- Technical workspace setup

**NAVIGATION HELP:**
Provide contextual links like:
"View your earnings at [Business](/engineer-crm?tab=business)"
"Check [Active Projects](/engineer-crm?tab=active-projects) for client work"

Be professional, technical, and business-focused with actionable advice.`;

      const { data, error } = await supabase.functions.invoke('chat-simple', {
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: messageContent }
          ],
          context: { page: location.pathname, tab: currentTab }
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
      messageContent = `I have an audio file to discuss: ${uploadedFile.name}`;
    } else if (uploadedFile && input.trim()) {
      messageContent = `${input} (File: ${uploadedFile.name})`;
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
          className="h-14 w-14 rounded-full bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 shadow-xl transition-all duration-300 group relative"
          size="sm"
        >
          <div className="absolute inset-0 rounded-full bg-secondary/20 animate-ping"></div>
          <div className="relative z-10 flex items-center justify-center">
            <img 
              src={mixclub3DLogo} 
              alt="Engineer Assistant" 
              className="w-7 h-5 object-contain transition-transform duration-300 group-hover:scale-110"
              style={{ filter: 'drop-shadow(0 0 6px hsl(var(--secondary))) brightness(1.2)' }}
            />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 bg-background border-secondary/20 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[600px]'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-lg bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20">
              <div className="absolute inset-0 rounded-lg bg-secondary/20 animate-pulse"></div>
              <div className="relative z-10">
                <img 
                  src={mixclub3DLogo} 
                  alt="Engineer AI" 
                  className="w-6 h-4 object-contain"
                  style={{ filter: 'drop-shadow(0 0 4px hsl(var(--secondary)))' }}
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Engineer Assistant</h3>
              {!isMinimized && (
                <p className="text-xs text-muted-foreground">Your business partner</p>
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
                        ? 'bg-secondary text-secondary-foreground w-8 h-8' 
                        : 'bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 w-8 h-8 relative'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <>
                          <div className="absolute inset-0 rounded-full bg-secondary/20 animate-pulse"></div>
                          <img 
                            src={mixclub3DLogo} 
                            alt="AI" 
                            className="w-4 h-3 object-contain relative z-10"
                            style={{ filter: 'drop-shadow(0 0 2px hsl(var(--secondary)))' }}
                          />
                        </>
                      )}
                    </div>
                    
                    <div className={`flex-1 max-w-[80%] ${
                      message.role === 'user' ? 'text-right' : ''
                    }`}>
                      <div className={`rounded-lg p-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-secondary text-secondary-foreground ml-auto'
                          : 'bg-muted'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center rounded-full bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 w-8 h-8 relative">
                      <div className="absolute inset-0 rounded-full bg-secondary/30 animate-pulse"></div>
                      <img 
                        src={mixclub3DLogo} 
                        alt="AI Thinking" 
                        className="w-4 h-3 object-contain relative z-10 animate-pulse"
                        style={{ filter: 'drop-shadow(0 0 4px hsl(var(--secondary)))' }}
                      />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="text-xs text-muted-foreground ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border space-y-3">
              {uploadedFile && (
                <div className="flex items-center justify-between p-2 bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Music className="w-3 h-3 text-secondary" />
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
                  placeholder="Ask about tools, earnings..."
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
