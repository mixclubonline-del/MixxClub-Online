import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MixingSuggestion {
  track: string;
  parameter: string;
  currentValue?: number;
  suggestedValue?: number;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  applied?: boolean;
}

export const AIMixingAssistant = () => {
  const [suggestions, setSuggestions] = useState<MixingSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<'mix' | 'master' | 'arrangement'>('mix');
  const tracks = useAIStudioStore((state) => state.tracks);
  const updateTrack = useAIStudioStore((state) => state.updateTrack);

  const analyzeMix = async (type: 'mix' | 'master' | 'arrangement') => {
    setIsAnalyzing(true);
    setAnalysisType(type);
    setSuggestions([]);

    try {
      const trackData = tracks.map(track => ({
        id: track.id,
        name: track.name,
        volume: track.volume,
        pan: track.pan,
        mute: track.mute,
        solo: track.solo,
        type: track.type,
        regions: track.regions.length,
      }));

      const { data, error } = await supabase.functions.invoke('ai-mixing-assistant', {
        body: { trackData, analysisType: type }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message.includes('402')) {
          toast.error('AI credits depleted. Please add credits to continue.');
        } else {
          throw error;
        }
        return;
      }

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        toast.success(`${data.suggestions.length} suggestions generated`);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to analyze mix');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: MixingSuggestion, index: number) => {
    const track = tracks.find(t => t.name === suggestion.track || t.id === suggestion.track);
    if (!track) {
      toast.error('Track not found');
      return;
    }

    const updates: any = {};
    
    if (suggestion.parameter === 'volume' && suggestion.suggestedValue !== undefined) {
      updates.volume = suggestion.suggestedValue;
    } else if (suggestion.parameter === 'pan' && suggestion.suggestedValue !== undefined) {
      updates.pan = suggestion.suggestedValue;
    }

    if (Object.keys(updates).length > 0) {
      updateTrack(track.id, updates);
      setSuggestions(prev => prev.map((s, i) => 
        i === index ? { ...s, applied: true } : s
      ));
      toast.success('Suggestion applied');
    } else {
      toast.info(suggestion.reason);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI Mixing Assistant</h3>
          <Badge variant="outline" className="text-xs">2027 Tech</Badge>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => analyzeMix('mix')}
          disabled={isAnalyzing}
          variant={analysisType === 'mix' ? 'default' : 'outline'}
          className="flex-1"
        >
          {isAnalyzing && analysisType === 'mix' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <TrendingUp className="w-4 h-4 mr-2" />
          )}
          Analyze Mix
        </Button>
        <Button
          onClick={() => analyzeMix('master')}
          disabled={isAnalyzing}
          variant={analysisType === 'master' ? 'default' : 'outline'}
          className="flex-1"
        >
          {isAnalyzing && analysisType === 'master' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Master
        </Button>
        <Button
          onClick={() => analyzeMix('arrangement')}
          disabled={isAnalyzing}
          variant={analysisType === 'arrangement' ? 'default' : 'outline'}
          className="flex-1"
        >
          {isAnalyzing && analysisType === 'arrangement' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <AlertCircle className="w-4 h-4 mr-2" />
          )}
          Arrange
        </Button>
      </div>

      {isAnalyzing && (
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">AI analyzing your mix...</p>
        </div>
      )}

      {!isAnalyzing && suggestions.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                    <span className="font-medium text-sm">{suggestion.track}</span>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.parameter}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                  {suggestion.currentValue !== undefined && suggestion.suggestedValue !== undefined && (
                    <p className="text-xs">
                      <span className="text-muted-foreground">Current: {suggestion.currentValue.toFixed(2)}</span>
                      {' → '}
                      <span className="text-primary font-medium">Suggested: {suggestion.suggestedValue.toFixed(2)}</span>
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={suggestion.applied ? 'outline' : 'default'}
                  onClick={() => applySuggestion(suggestion, index)}
                  disabled={suggestion.applied}
                  className="shrink-0"
                >
                  {suggestion.applied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Applied
                    </>
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isAnalyzing && suggestions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Click a button above to get AI-powered suggestions</p>
        </div>
      )}
    </Card>
  );
};
