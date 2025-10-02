import { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, Lightbulb, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AISuggestion {
  type: 'eq' | 'compression' | 'reverb' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
}

export const LiveAISuggestions = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMix = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockSuggestions: AISuggestion[] = [
      {
        type: 'eq',
        priority: 'high',
        title: 'Boost Vocal Clarity',
        description: 'Add a gentle 3dB boost at 3.5kHz to bring vocals forward',
        impact: '+12% clarity improvement'
      },
      {
        type: 'compression',
        priority: 'medium',
        title: 'Tighten Low End',
        description: 'Apply multiband compression to control bass frequencies',
        impact: '+8% punch improvement'
      },
      {
        type: 'reverb',
        priority: 'low',
        title: 'Add Depth',
        description: 'Short reverb on snare (0.4s decay) for dimension',
        impact: '+5% spatial quality'
      },
      {
        type: 'general',
        priority: 'medium',
        title: 'Volume Balance',
        description: 'Reduce kick by 2dB relative to bass for better balance',
        impact: '+10% overall balance'
      }
    ];

    setSuggestions(mockSuggestions);
    setIsAnalyzing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 text-red-500';
      case 'medium': return 'border-yellow-500/30 text-yellow-500';
      case 'low': return 'border-blue-500/30 text-blue-500';
      default: return 'border-primary/30 text-primary';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'eq': return <Zap className="w-4 h-4" />;
      case 'compression': return <TrendingUp className="w-4 h-4" />;
      case 'reverb': return <Sparkles className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">AI Mix Assistant</h3>
            <p className="text-xs text-muted-foreground">Real-time suggestions</p>
          </div>
        </div>

        <Button
          onClick={analyzeMix}
          disabled={isAnalyzing}
          size="sm"
          className="shadow-glow-sm"
        >
          {isAnalyzing ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-pulse-glow" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Analyze Mix
            </>
          )}
        </Button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="glass-studio rounded-xl p-4 border border-primary/20 hover:border-primary/40 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getIcon(suggestion.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getPriorityColor(suggestion.priority)} flex-shrink-0`}
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-green-500">
                      <TrendingUp className="w-3 h-3" />
                      <span>{suggestion.impact}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                        Dismiss
                      </Button>
                      <Button size="sm" className="h-7 text-xs shadow-glow-sm">
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isAnalyzing && suggestions.length === 0 && (
        <div className="text-center py-8 glass-studio rounded-xl border border-dashed border-primary/20">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            Click "Analyze Mix" to get AI-powered suggestions
          </p>
        </div>
      )}
    </div>
  );
};