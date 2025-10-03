import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  Zap,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface AIAssistantProps {
  context?: {
    sessionType: string;
    currentActivity: string;
  };
}

const AIAssistant = ({ context }: AIAssistantProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const suggestions = [
    {
      type: 'mixing',
      title: 'Balance the Vocals',
      description: 'The lead vocals are sitting 2dB too low in the mix',
      confidence: 92,
      action: 'Apply +2dB',
      icon: TrendingUp,
      color: 'text-blue-500'
    },
    {
      type: 'eq',
      title: 'Cut Low-End Rumble',
      description: 'High-pass filter at 80Hz will clean up the low end',
      confidence: 88,
      action: 'Apply HPF',
      icon: Zap,
      color: 'text-primary'
    },
    {
      type: 'tip',
      title: 'Pro Tip',
      description: 'Try parallel compression on the drums for more punch',
      confidence: 95,
      action: 'Learn More',
      icon: Lightbulb,
      color: 'text-yellow-500'
    }
  ];

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
        <Button
          onClick={() => setIsMinimized(false)}
          className="gap-2 bg-gradient-to-r from-primary to-accent-cyan shadow-glow-lg hover:scale-110 transition-transform"
          size="lg"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          AI Assistant
          <Badge variant="secondary" className="ml-1">3</Badge>
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-h-[600px] z-50 shadow-glow-lg border-primary/30 animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary/20 to-accent-cyan/20 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary to-accent-cyan rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Real-time suggestions</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsVisible(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[480px]">
        <div className="p-4 space-y-3">
          {/* Current Context */}
          {context && (
            <Card className="p-3 bg-muted/50 border-muted">
              <div className="text-xs text-muted-foreground mb-1">Analyzing</div>
              <div className="font-medium">{context.currentActivity}</div>
            </Card>
          )}

          {/* Suggestions */}
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className="p-4 bloom-hover cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 bg-muted rounded-lg ${suggestion.color}`}>
                  <suggestion.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.confidence}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-2">
                  <Zap className="w-3 h-3" />
                  {suggestion.action}
                </Button>
                <Button size="sm" variant="outline">
                  Dismiss
                </Button>
              </div>
            </Card>
          ))}

          {/* Learning Tips */}
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent-cyan/10 border-primary/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Quick Tip</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Collaborate in real-time by enabling audio comments. 
                  Your collaborators can hear your feedback instantly!
                </p>
                <Button size="sm" variant="outline" className="text-xs">
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          AI suggestions powered by your session context
        </p>
      </div>
    </Card>
  );
};

export default AIAssistant;
