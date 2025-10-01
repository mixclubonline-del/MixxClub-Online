import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, Target, Lightbulb } from "lucide-react";
import { useProfileAI } from "@/hooks/useProfileAI";

export default function ProfileInsights() {
  const { generateProfileInsights } = useProfileAI();
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const data = await generateProfileInsights();
      setInsights(data);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Profile Insights
          </CardTitle>
          <CardDescription>
            Smart recommendations to optimize your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold">Perfect Profile!</p>
              <p className="text-sm text-muted-foreground">
                Your profile is complete and optimized for success.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Lightbulb className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Profile Strength
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profile Completeness</span>
              <span className="font-semibold">
                {insights.length === 0 ? "100%" : `${Math.max(0, 100 - insights.length * 20)}%`}
              </span>
            </div>
            <Progress value={insights.length === 0 ? 100 : Math.max(0, 100 - insights.length * 20)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">
                {insights.length === 0 ? "Excellent" : "Good"}
              </div>
              <div className="text-xs text-muted-foreground">Profile Quality</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">
                {insights.length === 0 ? "High" : "Medium"}
              </div>
              <div className="text-xs text-muted-foreground">Visibility</div>
            </div>
          </div>

          {insights.length === 0 && (
            <Badge variant="secondary" className="w-full justify-center">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Verified Profile
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
