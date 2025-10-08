import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ThumbsUp, CheckCircle, TrendingUp } from 'lucide-react';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { Progress } from '@/components/ui/progress';

interface AISuggestionsProps {
  sessionId: string;
}

export const AISuggestions = ({ sessionId }: AISuggestionsProps) => {
  const { aiAnalysis, suggestions, isLoading, applySuggestion } = useAISuggestions(sessionId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'eq': return '🎚️';
      case 'compression': return '🔧';
      case 'reverb': return '🌊';
      case 'delay': return '⏱️';
      default: return '✨';
    }
  };

  const spectralAnalysis = aiAnalysis?.spectral_analysis as any;
  const tonalAnalysis = aiAnalysis?.tonal_analysis as any;
  const emotionAnalysis = aiAnalysis?.emotion_analysis as any;

  return (
    <div className="space-y-4">
      {/* AI Analysis Overview */}
      {aiAnalysis && spectralAnalysis && tonalAnalysis && emotionAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Analysis Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Clarity Score</p>
                <Progress value={spectralAnalysis.clarity_score || 0} />
                <p className="text-xs text-muted-foreground mt-1">
                  {(spectralAnalysis.clarity_score || 0).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Confidence</p>
                <Progress value={(aiAnalysis.confidence_score || 0) * 100} />
                <p className="text-xs text-muted-foreground mt-1">
                  {((aiAnalysis.confidence_score || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Detected Characteristics</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {tonalAnalysis.key} {tonalAnalysis.scale_type}
                </Badge>
                <Badge variant="outline">
                  {tonalAnalysis.tempo} BPM
                </Badge>
                <Badge variant="outline">
                  {tonalAnalysis.time_signature}
                </Badge>
                <Badge variant="outline">
                  {emotionAnalysis.mood}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Mixing Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading suggestions...</p>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(suggestion.suggestion_type)}</span>
                      <div>
                        <p className="font-medium">{suggestion.suggestion_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.suggestion_description}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(suggestion.parameters.priority || 'medium')}>
                      {suggestion.parameters.priority || 'medium'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ThumbsUp className="h-3 w-3" />
                      <span>Confidence: {(suggestion.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                    {suggestion.applied ? (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Applied
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => applySuggestion({ suggestionId: suggestion.id })}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No AI suggestions available yet. Upload audio to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
