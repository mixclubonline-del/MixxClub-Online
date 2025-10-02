import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, TrendingUp, AlertTriangle, DollarSign, RefreshCw, Mic, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  confidence_score: number;
  impact_amount: number;
  action_taken: boolean;
  created_at: string;
}

export const AIFinancialController = () => {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch AI insights
  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai-financial-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_financial_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as AIInsight[];
    }
  });

  // Generate new insights
  const generateInsights = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-financial-insights');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-financial-insights'] });
      toast({
        title: "AI Insights Generated",
        description: "New financial insights have been generated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Process natural language query
  const processQuery = async () => {
    if (!query.trim()) return;

    try {
      const { data, error } = await supabase.functions.invoke('chat-simple', {
        body: { 
          message: `As a financial AI assistant for MixClub, answer this question based on current financial data: ${query}`,
          systemPrompt: 'You are a helpful financial AI assistant. Provide clear, actionable insights about revenue, subscriptions, payouts, and business metrics.'
        }
      });

      if (error) throw error;

      toast({
        title: "AI Response",
        description: data.response || "Analysis complete. Check insights above.",
      });
      setQuery("");
    } catch (error) {
      toast({
        title: "Query Failed",
        description: error instanceof Error ? error.message : "Failed to process query",
        variant: "destructive",
      });
    }
  };

  // Voice input (Web Speech API)
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.start();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'success': return 'default';
      default: return 'secondary';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'revenue_optimization': return <DollarSign className="h-5 w-5" />;
      case 'churn_prediction': return <AlertTriangle className="h-5 w-5" />;
      case 'cash_flow_forecast': return <TrendingUp className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Query Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Financial Assistant
              </CardTitle>
              <CardDescription>
                Ask questions or get automated insights about your finances
              </CardDescription>
            </div>
            <Button 
              onClick={() => generateInsights.mutate()}
              disabled={generateInsights.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${generateInsights.isPending ? 'animate-spin' : ''}`} />
              Generate Insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask me anything about your finances... (e.g., 'What's our MRR trend?' or 'How can we reduce churn?')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), processQuery())}
              className="min-h-[60px]"
            />
            <div className="flex flex-col gap-2">
              <Button onClick={processQuery} size="icon">
                <Send className="h-4 w-4" />
              </Button>
              <Button 
                onClick={startVoiceInput} 
                size="icon"
                variant={isListening ? "destructive" : "outline"}
              >
                <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Display */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Active AI Insights</h3>
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Loading insights...</p>
            </CardContent>
          </Card>
        ) : insights && insights.length > 0 ? (
          insights.map((insight) => (
            <Card key={insight.id} className="border-l-4" style={{
              borderLeftColor: insight.severity === 'critical' ? 'hsl(var(--destructive))' : 
                              insight.severity === 'warning' ? 'hsl(var(--warning))' :
                              insight.severity === 'success' ? 'hsl(var(--success))' : 
                              'hsl(var(--primary))'
            }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.insight_type)}
                    <div>
                      <CardTitle className="text-base">{insight.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {insight.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getSeverityColor(insight.severity)}>
                      {insight.severity}
                    </Badge>
                    {insight.confidence_score && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(insight.confidence_score * 100)}% confidence
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              {insight.impact_amount > 0 && (
                <CardContent>
                  <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <span className="text-sm font-medium">Estimated Impact</span>
                    <span className="text-lg font-bold text-primary">
                      ${insight.impact_amount.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No insights yet. Generate your first AI analysis!</p>
              <Button onClick={() => generateInsights.mutate()}>
                Generate Insights
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
