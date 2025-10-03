import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Bot, X, Minimize2, Maximize2, Send, Sparkles, Shield, AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMobileDetect } from "@/hooks/useMobileDetect";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  securityAlert?: boolean;
}

interface SecureAdminBotProps {
  isFullScreen?: boolean;
  onClose?: () => void;
  quickActions?: Array<{ label: string; prompt: string; icon: any }>;
}

export default function SecureAdminBot({ 
  isFullScreen = false, 
  onClose,
  quickActions = []
}: SecureAdminBotProps) {
  const location = useLocation();
  const isMobile = useMobileDetect();
  const currentPage = location.pathname;
  
  const [isOpen, setIsOpen] = useState(isFullScreen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "🔒 Secure Admin Mode Active\n\n👋 I'm Mixx Bot, your AI assistant with enterprise-grade security. I can analyze data, provide insights, and recommend actions—but I cannot execute sensitive operations directly. All interactions are logged for security.\n\nHow can I help you manage MixClub today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to use Mixx Bot");
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-chat-enhanced', {
        body: { 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          context: { page: currentPage, isMobile }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Function error:', error);
        
        if (error.message?.includes('Rate limit')) {
          toast.error("Rate limit exceeded. Please wait a moment.", {
            description: "For security, admin chatbot has usage limits."
          });
        } else if (error.message?.includes('Admin access required')) {
          toast.error("Admin access required", {
            description: "This feature is only available to administrators."
          });
        } else {
          throw error;
        }
        return;
      }

      const isSecurityAlert = data.response?.includes('⚠️ Security Alert') || 
                              data.response?.includes('🔒 I cannot perform');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        securityAlert: isSecurityAlert
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      if (isSecurityAlert) {
        toast.warning("Security Alert", {
          description: "This action cannot be performed via chatbot for security reasons."
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get response from Mixx Bot");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
  };

  if (!isOpen && !isFullScreen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 z-50"
        size="icon"
      >
        <Bot className="h-7 w-7" />
      </Button>
    );
  }

  const cardClassName = isFullScreen 
    ? "w-full h-full flex flex-col" 
    : `fixed bottom-6 right-6 w-full max-w-[480px] shadow-2xl border-2 z-50 transition-all duration-200 ${
        isMinimized ? 'h-16' : 'h-[600px]'
      }`;

  return (
    <Card className={cardClassName}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-purple-600">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="h-6 w-6 text-white" />
            <Shield className="h-3 w-3 text-green-300 absolute -top-1 -right-1" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              Mixx Bot
              <Badge variant="secondary" className="bg-white/20 text-white text-[10px]">
                SECURE
              </Badge>
            </h3>
            <p className="text-xs text-white/80">Enterprise AI Assistant</p>
          </div>
        </div>
        {!isFullScreen && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {!isMinimized && (
        <>
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="p-3 border-b bg-muted/30">
              <p className="text-xs font-medium mb-2 text-muted-foreground">Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Badge
                    key={action.label}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleQuickAction(action.prompt)}
                  >
                    <action.icon className="h-3 w-3 mr-1" />
                    {action.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className={`flex-1 p-4 ${isFullScreen ? 'h-full' : 'h-[400px]'}`} ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[85%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.securityAlert
                        ? "bg-amber-100 dark:bg-amber-950 border-2 border-amber-500"
                        : "bg-muted border"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1">
                        {message.securityAlert ? (
                          <>
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Security Notice</span>
                          </>
                        ) : (
                          <>
                            <Bot className="h-4 w-4 text-primary" />
                            <span className="text-xs font-semibold text-primary">Mixx Bot</span>
                          </>
                        )}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-2 bg-muted border">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                      <span className="text-sm text-muted-foreground">
                        Analyzing data securely...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={onSubmit} className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about business strategy, metrics, or insights..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Enterprise-grade security • All interactions logged
            </p>
          </form>
        </>
      )}
    </Card>
  );
}
