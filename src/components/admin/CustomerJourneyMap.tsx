import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export const CustomerJourneyMap = () => {
  const journeyStages = [
    {
      stage: "Discovery",
      users: 1250,
      dropoff: 15,
      avgTime: "2.5 min",
      status: "good",
      actions: ["Visit landing page", "Watch demo", "Read features"],
    },
    {
      stage: "Signup",
      users: 1062,
      dropoff: 22,
      avgTime: "3.2 min",
      status: "warning",
      actions: ["Create account", "Email verification", "Profile setup"],
    },
    {
      stage: "Onboarding",
      users: 828,
      dropoff: 18,
      avgTime: "8.5 min",
      status: "good",
      actions: ["Tutorial walkthrough", "First project", "Team invite"],
    },
    {
      stage: "Active Usage",
      users: 679,
      dropoff: 12,
      avgTime: "15+ min",
      status: "good",
      actions: ["Regular logins", "Feature exploration", "Collaboration"],
    },
    {
      stage: "Conversion",
      users: 597,
      dropoff: 8,
      avgTime: "N/A",
      status: "good",
      actions: ["Upgrade to paid", "Add payment method", "Subscription active"],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Journey Map</CardTitle>
        <CardDescription>Visualize user paths and identify friction points</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {journeyStages.map((stage, index) => (
            <div key={index} className="relative">
              <Card className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{stage.stage}</h3>
                      {stage.status === "good" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stage.users.toLocaleString()} users • {stage.avgTime} avg
                    </div>
                  </div>
                  <Badge
                    variant={stage.dropoff > 20 ? "destructive" : "secondary"}
                    className={stage.dropoff > 15 && stage.dropoff <= 20 ? "bg-yellow-500" : ""}
                  >
                    {stage.dropoff}% drop-off
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Key Actions:</div>
                  <div className="flex flex-wrap gap-2">
                    {stage.actions.map((action, actionIndex) => (
                      <Badge key={actionIndex} variant="outline">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              {index < journeyStages.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <Card className="p-4 mt-6 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            Optimization Opportunities
          </h4>
          <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
            <li>• Signup stage shows 22% drop-off - consider simplifying the process</li>
            <li>• Add progress indicators during onboarding to reduce abandonment</li>
            <li>• Implement exit-intent popups at high drop-off points</li>
          </ul>
        </Card>
      </CardContent>
    </Card>
  );
};
