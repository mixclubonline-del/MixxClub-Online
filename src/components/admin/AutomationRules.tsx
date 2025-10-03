import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const AutomationRules = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState([
    { id: "1", name: "Auto-assign new projects", enabled: true, executions: 234, successRate: 98 },
    { id: "2", name: "Send payment reminders", enabled: true, executions: 145, successRate: 95 },
    { id: "3", name: "Archive completed projects", enabled: false, executions: 89, successRate: 100 },
    { id: "4", name: "Flag suspicious activity", enabled: true, executions: 12, successRate: 100 },
  ]);

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    toast({
      title: "Rule updated",
      description: `Automation rule ${rules.find(r => r.id === ruleId)?.enabled ? "disabled" : "enabled"}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Automation Rules
        </CardTitle>
        <CardDescription>Conditional automation rules and execution logs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{rule.name}</h4>
                  <Badge variant={rule.enabled ? "default" : "secondary"}>
                    {rule.enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {rule.executions} executions
                  </div>
                  <div>{rule.successRate}% success rate</div>
                </div>
              </div>
              <Switch
                checked={rule.enabled}
                onCheckedChange={() => toggleRule(rule.id)}
              />
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
