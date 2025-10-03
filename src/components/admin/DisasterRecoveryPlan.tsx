import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Users, FileText, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const DisasterRecoveryPlan = () => {
  const { toast } = useToast();

  const runDRTest = () => {
    toast({
      title: "DR test initiated",
      description: "Disaster recovery test scenario is running...",
    });
  };

  const drMetrics = [
    { label: "Recovery Time Objective (RTO)", value: "4 hours", icon: Clock, status: "good" },
    { label: "Recovery Point Objective (RPO)", value: "1 hour", icon: Clock, status: "good" },
    { label: "Last DR Test", value: "Dec 15, 2023", icon: TestTube, status: "warning" },
    { label: "Test Success Rate", value: "98%", icon: Shield, status: "good" },
  ];

  const emergencyContacts = [
    { name: "John Smith", role: "Primary DBA", phone: "+1 (555) 123-4567" },
    { name: "Sarah Johnson", role: "Backup DBA", phone: "+1 (555) 234-5678" },
    { name: "Mike Chen", role: "DevOps Lead", phone: "+1 (555) 345-6789" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Disaster Recovery Plan
        </CardTitle>
        <CardDescription>
          Recovery procedures and emergency response protocols
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {drMetrics.map((metric, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                </div>
                <Badge
                  variant={metric.status === "good" ? "default" : "secondary"}
                  className={metric.status === "warning" ? "bg-yellow-500" : ""}
                >
                  {metric.status === "good" ? "On Track" : "Review"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recovery Procedures
          </h3>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-medium text-primary">1.</span>
              <div>
                <div className="font-medium">Assess the situation</div>
                <div className="text-muted-foreground">
                  Determine the scope and severity of the disaster
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-medium text-primary">2.</span>
              <div>
                <div className="font-medium">Activate emergency contacts</div>
                <div className="text-muted-foreground">
                  Notify the DR team and key stakeholders
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-medium text-primary">3.</span>
              <div>
                <div className="font-medium">Initiate failover procedures</div>
                <div className="text-muted-foreground">
                  Switch to backup systems and restore from latest backup
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-medium text-primary">4.</span>
              <div>
                <div className="font-medium">Verify system integrity</div>
                <div className="text-muted-foreground">
                  Run validation tests on restored systems
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-medium text-primary">5.</span>
              <div>
                <div className="font-medium">Resume operations</div>
                <div className="text-muted-foreground">
                  Bring systems online and notify users
                </div>
              </div>
            </li>
          </ol>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Emergency Contacts
          </h3>
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-muted-foreground">{contact.role}</div>
                </div>
                <div className="text-sm font-mono">{contact.phone}</div>
              </div>
            ))}
          </div>
        </Card>

        <Button onClick={runDRTest} className="w-full">
          <TestTube className="mr-2 h-4 w-4" />
          Run DR Test Scenario
        </Button>
      </CardContent>
    </Card>
  );
};
