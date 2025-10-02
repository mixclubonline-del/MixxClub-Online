import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIMasteringPresets, useAICollaborationMatches, useUpdateMatchStatus } from "@/hooks/useAIAudioAnalysis";
import { isFeatureEnabled } from "@/config/featureFlags";
import { Lock, Brain, Sparkles, TrendingUp, Users, ThumbsUp, ThumbsDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AIAudioIntelligence = () => {
  const navigate = useNavigate();
  const { data: presets, isLoading: presetsLoading } = useAIMasteringPresets();
  const { data: matches, isLoading: matchesLoading } = useAICollaborationMatches();
  const updateMatch = useUpdateMatchStatus();

  const isUnlocked = isFeatureEnabled("AI_AUDIO_INTELLIGENCE_ENABLED");

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Advanced AI Audio Intelligence - Coming Soon</CardTitle>
              <CardDescription className="text-lg">Unlocks at 1000 community members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Get AI-powered audio analysis, smart mastering presets, and intelligent collaboration matches.
              </p>
              <Button onClick={() => navigate("/")}>Return Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">AI Audio Intelligence</h1>
        <p className="text-muted-foreground mb-8">Leverage advanced AI to analyze and optimize</p>

        <Tabs defaultValue="presets" className="space-y-6">
          <TabsList>
            <TabsTrigger value="presets">Smart Presets</TabsTrigger>
            <TabsTrigger value="matches">Collaboration Matches</TabsTrigger>
            <TabsTrigger value="analysis">Audio Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="presets">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">AI Mastering Presets</h2>
                <p className="text-muted-foreground">Learned from your preferences</p>
              </div>
              <Button><Sparkles className="h-4 w-4 mr-2" />Create New</Button>
            </div>

            {presetsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader></Card>
                ))}
              </div>
            ) : presets && presets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {presets.map((preset) => (
                  <Card key={preset.id}>
                    <CardHeader>
                      <CardTitle>{preset.preset_name}</CardTitle>
                      {preset.genre_optimized && <CardDescription>{preset.genre_optimized}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Times Used</span>
                          <span>{preset.times_used}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Success Rate</span>
                          <span>{preset.success_rate.toFixed(1)}%</span>
                        </div>
                        <Button className="w-full mt-4">Apply Preset</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center p-12">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold">No presets yet</h3>
                <Button className="mt-4"><Sparkles className="h-4 w-4 mr-2" />Create Preset</Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="matches">
            <h2 className="text-2xl font-bold mb-6">Smart Collaboration Matches</h2>
            {matchesLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i}><CardHeader><Skeleton className="h-6" /></CardHeader></Card>
                ))}
              </div>
            ) : matches && matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card key={match.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold">Match Found</h3>
                        <Badge>{(match.compatibility_score * 100).toFixed(0)}% Compatible</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => updateMatch.mutate({ matchId: match.id, status: "contacted", interested: true })}>
                          <ThumbsUp className="h-4 w-4 mr-2" />Interested
                        </Button>
                        <Button variant="outline" onClick={() => updateMatch.mutate({ matchId: match.id, status: "dismissed", interested: false })}>
                          <ThumbsDown className="h-4 w-4 mr-2" />Not Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center p-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold">No matches yet</h3>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis">
            <h2 className="text-2xl font-bold mb-6">Advanced Audio Analysis</h2>
            <Card className="text-center p-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload audio to analyze</h3>
              <p className="text-muted-foreground mb-4">Get spectral analysis, dynamic range, and quality scores</p>
              <Button>Upload Audio File</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAudioIntelligence;
