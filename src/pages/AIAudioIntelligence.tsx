import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIAudioProfiles, useAIMasteringPresets, useAICollaborationMatches } from "@/hooks/useAIAudioAnalysis";
import { isFeatureEnabled } from "@/config/featureFlags";
import { Lock, Brain, TrendingUp, Users, Star, Music } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AIAudioIntelligence = () => {
  const navigate = useNavigate();

  const { data: audioProfiles, isLoading: profilesLoading } = useAIAudioProfiles();
  const { data: masteringPresets, isLoading: presetsLoading } = useAIMasteringPresets(true);
  const { data: collaborationMatches, isLoading: matchesLoading } = useAICollaborationMatches();

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
              <CardTitle className="text-2xl">AI Audio Intelligence - Coming Soon</CardTitle>
              <CardDescription className="text-lg">
                This feature unlocks at 1000 community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Get advanced AI-powered audio analysis, smart mastering presets, and intelligent collaboration matching.
                Join our growing community to unlock this feature!
              </p>
              <Button onClick={() => navigate("/")}>
                Return Home
              </Button>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Audio Intelligence</h1>
          <p className="text-muted-foreground">
            Advanced AI-powered insights for your music production
          </p>
        </div>

        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analysis">Audio Analysis</TabsTrigger>
            <TabsTrigger value="presets">Smart Presets</TabsTrigger>
            <TabsTrigger value="matches">AI Matches</TabsTrigger>
          </TabsList>

          {/* Audio Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Advanced Audio Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered deep analysis of your tracks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-48" />
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : audioProfiles && audioProfiles.length > 0 ? (
                  <div className="space-y-4">
                    {audioProfiles.slice(0, 5).map((profile) => (
                      <Card key={profile.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {profile.tempo_bpm && (
                                  <div>
                                    <span className="text-xs text-muted-foreground">Tempo</span>
                                    <p className="font-medium">{profile.tempo_bpm.toFixed(1)} BPM</p>
                                  </div>
                                )}
                                {profile.key_signature && (
                                  <div>
                                    <span className="text-xs text-muted-foreground">Key</span>
                                    <p className="font-medium">{profile.key_signature}</p>
                                  </div>
                                )}
                                {profile.mastering_quality_score && (
                                  <div>
                                    <span className="text-xs text-muted-foreground">Quality Score</span>
                                    <p className="font-medium">{(profile.mastering_quality_score * 100).toFixed(0)}%</p>
                                  </div>
                                )}
                                {profile.loudness_lufs && (
                                  <div>
                                    <span className="text-xs text-muted-foreground">Loudness</span>
                                    <p className="font-medium">{profile.loudness_lufs.toFixed(1)} LUFS</p>
                                  </div>
                                )}
                              </div>
                              {profile.improvement_suggestions && profile.improvement_suggestions.length > 0 && (
                                <div className="mt-4">
                                  <span className="text-sm font-medium">AI Suggestions:</span>
                                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                                    {profile.improvement_suggestions.slice(0, 3).map((suggestion: any, idx: number) => (
                                      <li key={idx}>{suggestion.text || suggestion}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload audio files to get AI-powered insights
                    </p>
                    <Button onClick={() => navigate("/artist-studio")}>
                      Upload Audio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Smart Presets Tab */}
          <TabsContent value="presets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  AI Mastering Presets
                </CardTitle>
                <CardDescription>
                  Smart presets learned from your preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {presetsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-32" />
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : masteringPresets && masteringPresets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {masteringPresets.map((preset) => (
                      <Card key={preset.id}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center justify-between">
                            {preset.preset_name}
                            {preset.is_public && (
                              <Badge variant="secondary">Public</Badge>
                            )}
                          </CardTitle>
                          {preset.genre_optimized && (
                            <CardDescription>{preset.genre_optimized}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Times Used:</span>
                              <span className="font-medium">{preset.times_used}</span>
                            </div>
                            {preset.success_rate > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Success Rate:</span>
                                <span className="font-medium">{(preset.success_rate * 100).toFixed(0)}%</span>
                              </div>
                            )}
                            {preset.user_rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{preset.user_rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No presets yet</h3>
                    <p className="text-muted-foreground">
                      AI will learn and create presets based on your mastering preferences
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  AI Collaboration Matches
                </CardTitle>
                <CardDescription>
                  Smart recommendations for potential collaborators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matchesLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-48" />
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : collaborationMatches && collaborationMatches.length > 0 ? (
                  <div className="space-y-4">
                    {collaborationMatches.map((match) => (
                      <Card key={match.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">
                                Compatibility Score: {(match.compatibility_score * 100).toFixed(0)}%
                              </CardTitle>
                              <CardDescription className="mt-2">
                                <div className="flex gap-2 flex-wrap">
                                  {match.genre_match_score && (
                                    <Badge variant="outline">
                                      Genre: {(match.genre_match_score * 100).toFixed(0)}%
                                    </Badge>
                                  )}
                                  {match.style_match_score && (
                                    <Badge variant="outline">
                                      Style: {(match.style_match_score * 100).toFixed(0)}%
                                    </Badge>
                                  )}
                                  {match.technical_match_score && (
                                    <Badge variant="outline">
                                      Technical: {(match.technical_match_score * 100).toFixed(0)}%
                                    </Badge>
                                  )}
                                </div>
                              </CardDescription>
                            </div>
                            <Badge>{match.match_status}</Badge>
                          </div>
                          {match.shared_characteristics && match.shared_characteristics.length > 0 && (
                            <div className="mt-4">
                              <span className="text-sm font-medium">Shared Traits:</span>
                              <div className="flex gap-1 flex-wrap mt-1">
                                {match.shared_characteristics.slice(0, 5).map((trait: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {trait}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
                    <p className="text-muted-foreground">
                      Complete your profile to get AI-powered collaboration recommendations
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAudioIntelligence;
