import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface MatchResult {
  artistId: string;
  engineerId: string;
  score: number;
  matchFactors: {
    genre: number;
    technical: number;
    style: number;
  };
}

export const MatchingAlgorithmTester = () => {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<{
    totalTests: number;
    successful: number;
    failed: number;
    avgScore: number;
    avgResponseTime: number;
    matches: MatchResult[];
  } | null>(null);

  const runMatchingTests = async () => {
    setIsTesting(true);
    const startTime = performance.now();

    try {
      // Fetch sample artists and engineers
      const { data: artists, error: artistsError } = await supabase
        .from('profiles')
        .select('id')
        .limit(10);

      const { data: engineers, error: engineersError } = await supabase
        .from('engineer_profiles')
        .select('user_id')
        .limit(20);

      if (artistsError || engineersError) {
        throw new Error("Failed to fetch test data");
      }

      if (!artists?.length || !engineers?.length) {
        throw new Error("Insufficient test data");
      }

      // Simulate matching tests
      const matches: MatchResult[] = [];
      let successful = 0;
      let failed = 0;

      for (const artist of artists) {
        try {
          // Get AI collaboration matches
          const { data: matchData, error: matchError } = await supabase
            .from('ai_collaboration_matches')
            .select('*')
            .eq('artist_id', artist.id)
            .order('compatibility_score', { ascending: false })
            .limit(3);

          if (matchError) {
            failed++;
            continue;
          }

          if (matchData && matchData.length > 0) {
            successful++;
            matchData.forEach(match => {
              matches.push({
                artistId: match.artist_id,
                engineerId: match.engineer_id,
                score: match.compatibility_score,
                matchFactors: {
                  genre: match.genre_match_score || 0,
                  technical: match.technical_match_score || 0,
                  style: match.style_match_score || 0,
                }
              });
            });
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }

      const endTime = performance.now();
      const avgResponseTime = (endTime - startTime) / artists.length;
      const avgScore = matches.reduce((sum, m) => sum + m.score, 0) / (matches.length || 1);

      setResults({
        totalTests: artists.length,
        successful,
        failed,
        avgScore,
        avgResponseTime,
        matches: matches.slice(0, 5), // Show top 5
      });

      toast({
        title: "Matching tests complete!",
        description: `${successful}/${artists.length} successful matches`,
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Matching Algorithm Tester</CardTitle>
          </div>
          <Button onClick={runMatchingTests} disabled={isTesting}>
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Run Tests"
            )}
          </Button>
        </div>
        <CardDescription>
          Test AI-powered artist-engineer matching algorithm
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTesting && (
          <div className="space-y-2">
            <Progress value={33} className="animate-pulse" />
            <p className="text-sm text-muted-foreground text-center">
              Running matching tests...
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold">Successful</span>
                </div>
                <p className="text-2xl font-bold">{results.successful}</p>
                <p className="text-xs text-muted-foreground">
                  out of {results.totalTests} tests
                </p>
              </div>

              <div className="p-4 bg-red-500/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold">Failed</span>
                </div>
                <p className="text-2xl font-bold">{results.failed}</p>
                <p className="text-xs text-muted-foreground">
                  {((results.failed / results.totalTests) * 100).toFixed(1)}% failure rate
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold">Avg Match Score</span>
                </div>
                <p className="text-2xl font-bold">{results.avgScore.toFixed(1)}%</p>
              </div>

              <div className="p-4 bg-purple-500/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-semibold">Avg Response Time</span>
                </div>
                <p className="text-2xl font-bold">{results.avgResponseTime.toFixed(0)}ms</p>
              </div>
            </div>

            {results.matches.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 text-sm">Top Matches</h4>
                <div className="space-y-2">
                  {results.matches.map((match, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{match.score.toFixed(1)}% Match</Badge>
                        <span className="text-muted-foreground">
                          {match.artistId.slice(0, 8)}... → {match.engineerId.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Genre:</span>
                          <span className="ml-1 font-semibold">{match.matchFactors.genre.toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tech:</span>
                          <span className="ml-1 font-semibold">{match.matchFactors.technical.toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Style:</span>
                          <span className="ml-1 font-semibold">{match.matchFactors.style.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!results && !isTesting && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Click "Run Tests" to start matching algorithm validation
          </div>
        )}
      </CardContent>
    </Card>
  );
};
