import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const NPS_SurveyManager = () => {
  const { toast } = useToast();

  const npsData = {
    score: 67,
    trend: "+5",
    promoters: 68,
    passives: 24,
    detractors: 8,
    responses: 450,
  };

  const recentFeedback = [
    { score: 9, comment: "Love the new collaboration features!", date: "2 hours ago", type: "promoter" },
    { score: 6, comment: "Good but needs more templates", date: "5 hours ago", type: "passive" },
    { score: 3, comment: "Performance issues during peak hours", date: "1 day ago", type: "detractor" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          NPS Survey Manager
        </CardTitle>
        <CardDescription>Net Promoter Score tracking and feedback analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4 col-span-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">NPS Score</span>
                <Badge className="bg-green-500">
                  {npsData.trend}
                </Badge>
              </div>
              <div className="text-4xl font-bold">{npsData.score}</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Based on {npsData.responses} responses
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Promoters</div>
              <div className="text-2xl font-bold text-green-600">{npsData.promoters}%</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Detractors</div>
              <div className="text-2xl font-bold text-red-600">{npsData.detractors}%</div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Feedback
          </h3>
          <div className="space-y-3">
            {recentFeedback.map((feedback, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          feedback.type === "promoter"
                            ? "default"
                            : feedback.type === "detractor"
                            ? "destructive"
                            : "secondary"
                        }
                        className={feedback.type === "passive" ? "bg-yellow-500" : ""}
                      >
                        Score: {feedback.score}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{feedback.date}</span>
                    </div>
                  </div>
                  <p className="text-sm">{feedback.comment}</p>
                  {feedback.type === "detractor" && (
                    <Button size="sm" variant="outline">
                      Follow Up
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Button
          onClick={() => toast({ title: "Survey sent", description: "NPS survey sent to 500 users" })}
          className="w-full"
        >
          Send New Survey
        </Button>
      </CardContent>
    </Card>
  );
};
