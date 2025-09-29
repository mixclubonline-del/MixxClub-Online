import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, CheckCircle, Clock, Award, Zap } from "lucide-react";

const EngineerDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container px-6 py-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Engineer Dashboard</h1>
            <p className="text-muted-foreground">Manage projects and track your performance</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-2 py-2 px-4">
              <Zap className="w-4 h-4 text-yellow-500" />
              7 Day Streak
            </Badge>
            <Badge variant="outline" className="gap-2 py-2 px-4">
              <Award className="w-4 h-4 text-primary" />
              Pro Engineer
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Music className="w-4 h-4 text-primary" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5</div>
              <p className="text-sm text-muted-foreground">Projects</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">48</div>
              <p className="text-sm text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-orange-500" />
                Avg. Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">36h</div>
              <p className="text-sm text-muted-foreground">Per project</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="w-4 h-4 text-primary" />
                Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4.9</div>
              <p className="text-sm text-muted-foreground">From 48 reviews</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Assigned Projects</CardTitle>
              <CardDescription>Projects awaiting your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Summer Vibes", artist: "DJ Alex", status: "Mixing", progress: 60 },
                  { name: "Night Drive", artist: "Sarah M.", status: "Revisions", progress: 85 },
                  { name: "Electric Dreams", artist: "Nova", status: "First Draft", progress: 40 },
                ].map((project, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">by {project.artist}</div>
                      </div>
                      <Badge variant="secondary">{project.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Update Milestone
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your milestones and badges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { icon: Award, title: "100 Projects", description: "Completed 100 total projects", earned: true },
                  { icon: Zap, title: "Speed Demon", description: "10 projects under 24h turnaround", earned: true },
                  { icon: CheckCircle, title: "Perfect Month", description: "30 days streak", earned: false },
                ].map((achievement, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      achievement.earned
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-muted/50 border border-border"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.earned ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      <achievement.icon
                        className={`w-6 h-6 ${achievement.earned ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{achievement.title}</div>
                      <div className="text-sm text-muted-foreground">{achievement.description}</div>
                    </div>
                    {achievement.earned && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
