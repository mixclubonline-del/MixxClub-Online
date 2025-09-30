import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Send, Bot, User, Music, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BeforeAfterPlayer } from '@/components/crm/BeforeAfterPlayer';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  audioFile?: {
    name: string;
    url: string;
  };
  masteringResult?: {
    originalUrl: string;
    masteredUrl: string;
    improvements: string[];
    analysis?: {
      originalLUFS: number;
      masteredLUFS: number;
      dynamicRange: number;
      peakReduction: number;
    };
    processing?: {
      service: string;
      processingTime: number;
    };
  };
}

export const MasteringChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your elite AI mastering engineer powered by multi-API technology. Upload a track (up to 10MB) and I'll provide professional-grade mastering with detailed analysis. I support all genres and can match specific loudness targets (Spotify, Apple Music, YouTube, CD). What can I help you master today?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (temporarily 10MB for stability)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB for now.",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      toast({
        title: "File uploaded",
        description: `${file.name} is ready for mastering`,
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && !uploadedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage || (uploadedFile ? `Master my track: ${uploadedFile.name}` : ''),
      timestamp: new Date(),
      audioFile: uploadedFile ? {
        name: uploadedFile.name,
        url: URL.createObjectURL(uploadedFile)
      } : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputMessage('');

    try {
      // Prepare audio file data if uploaded
      let audioFileData = null;
      if (uploadedFile) {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        audioFileData = {
          data: base64,
          name: uploadedFile.name,
          size: uploadedFile.size
        };
      }

      const { data, error } = await supabase.functions.invoke('advanced-mastering', {
        body: {
          message: inputMessage || "Please master this track with professional AI mastering",
          audioFile: audioFileData,
          preferences: {
            genre: 'pop', // Can be enhanced to ask user
            loudnessTarget: -14, // Spotify standard
            style: 'modern'
          }
        },
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.analysis,
        timestamp: new Date(),
        masteringResult: data.masteringResult,
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (data.masteringResult) {
        const service = data.masteringResult.processing?.service || 'AI Mastering';
        toast({
          title: "Professional Mastering Complete!",
          description: `${service} processed your track. Compare before/after below.`,
        });
      } else {
        toast({
          title: "Professional Analysis Complete",
          description: "Check out the expert recommendations above.",
        });
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage = error.status === 429 
        ? "Rate limit exceeded. Our AI is processing many tracks. Please wait a moment."
        : error.status === 402
        ? "AI service credits low. Please try again later or contact support."
        : error.status === 400
        ? "File too large or invalid format. Please use a file under 10MB in MP3 or WAV format."
        : error.message?.includes('API key')
        ? "Mastering service configuration needed. Please contact support."
        : "Sorry, couldn't process your track. Please try again or use a different file.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: errorMessage,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "Processing failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-background via-background to-primary/5 border-primary/20 animate-glow-pulse">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Elite AI Mastering Suite</h3>
            <p className="text-sm text-muted-foreground">Multi-API professional mastering powered by cutting-edge AI</p>
          </div>
        </div>

        <ScrollArea className="h-96 mb-4 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`p-2 rounded-full ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <div className={`flex-1 max-w-[80%] ${
                  message.type === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.audioFile && (
                      <div className="mt-2 flex items-center gap-2 text-xs opacity-75">
                        <Music className="w-3 h-3" />
                        {message.audioFile.name}
                      </div>
                    )}
                  </div>
                  
                  {message.masteringResult && (
                    <div className="mt-3">
                      <BeforeAfterPlayer
                        title="Professional A/B Comparison"
                        beforeSrc={message.masteringResult.originalUrl}
                        afterSrc={message.masteringResult.masteredUrl}
                      />
                      
                      {message.masteringResult.analysis && (
                        <div className="mt-2 p-3 bg-accent/50 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Technical Analysis:</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Original LUFS:</span>
                              <span className="ml-2 font-mono">{message.masteringResult.analysis.originalLUFS.toFixed(1)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Mastered LUFS:</span>
                              <span className="ml-2 font-mono">{message.masteringResult.analysis.masteredLUFS.toFixed(1)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Dynamic Range:</span>
                              <span className="ml-2 font-mono">{message.masteringResult.analysis.dynamicRange.toFixed(1)} dB</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Peak Reduction:</span>
                              <span className="ml-2 font-mono">{message.masteringResult.analysis.peakReduction.toFixed(1)} dB</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2 p-3 bg-accent/50 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Processing Applied:</h4>
                        <ul className="text-xs space-y-1">
                          {message.masteringResult.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-primary rounded-full" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                        {message.masteringResult.processing && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <span className="text-muted-foreground">Powered by: </span>
                            <span className="font-medium">{message.masteringResult.processing.service}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="text-sm text-muted-foreground ml-2">Processing with professional AI mastering...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="space-y-3">
          {uploadedFile && (
            <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(uploadedFile.size / (1024 * 1024)).toFixed(1)}MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUploadedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Remove
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="relative overflow-hidden group animate-pulse-glow"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 animate-shimmer" />
              <Upload className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">Upload Track</span>
            </Button>
            
            <div className="flex-1 flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about mixing, mastering, or describe what you want to improve..."
                disabled={isLoading}
                className="flex-1"
              />
              
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || (!inputMessage.trim() && !uploadedFile)}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};