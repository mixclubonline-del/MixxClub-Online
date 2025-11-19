import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  id: string;
  suggestion_type: string;
  title: string;
  description: string;
  confidence_score: number;
  technical_details: any;
  applied: boolean;
}

interface AIMixingSuggestionsProps {
  sessionId: string;
  audioFileId: string;
}

export const AIMixingSuggestions = ({ sessionId, audioFileId }: AIMixingSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSuggestions();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('ai-suggestions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_mixing_suggestions',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setSuggestions(prev => [...prev, payload.new as Suggestion]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const loadSuggestions = async () => {
    const { data, error } = await supabase
      .from("ai_mixing_suggestions")
      .select("*")
      .eq("project_id", sessionId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSuggestions(data as any);
    }
    setLoading(false);
  };

  const applySuggestion = async (suggestionId: string) => {
    const { error } = await supabase
      .from("ai_mixing_suggestions")
      .update({ applied: true, applied_at: new Date().toISOString() })
      .eq("id", suggestionId);

    if (!error) {
      setSuggestions(prev =>
        prev.map(s => s.id === suggestionId ? { ...s, applied: true } : s)
      );
      toast({
        title: "Suggestion Applied",
        description: "The AI mixing suggestion has been applied",
      });
    }
  };

  const provideFeedback = async (suggestionId: string, feedback: string) => {
    await supabase
      .from("ai_mixing_suggestions")
      .update({ user_feedback: feedback })
      .eq("id", suggestionId);

    toast({
      title: "Feedback Recorded",
      description: "Thank you for helping improve our AI!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Mixing Suggestions
        </CardTitle>
        <CardDescription>
          Real-time AI-powered recommendations for your mix
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Analyzing audio...</p>
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            AI is listening to your mix and will suggest improvements...
          </p>
        ) : (
          suggestions.map((suggestion) => (
            <Card key={suggestion.id} className={suggestion.applied ? "border-primary/50" : ""}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      {suggestion.applied && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {Math.round(suggestion.confidence_score * 100)}% confident
                  </Badge>
                </div>

                <div className="flex gap-2">
                  {!suggestion.applied && (
                    <Button
                      size="sm"
                      onClick={() => applySuggestion(suggestion.id)}
                      className="flex-1"
                    >
                      Apply Suggestion
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => provideFeedback(suggestion.id, "helpful")}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => provideFeedback(suggestion.id, "not_helpful")}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
