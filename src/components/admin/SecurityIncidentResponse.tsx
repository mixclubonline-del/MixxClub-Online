import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SecurityIncidentResponse = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const { data: incidents } = useQuery({
    queryKey: ["security-incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_security_events")
        .select("*")
        .eq("is_resolved", false)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const resolveIncidentMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from("admin_security_events")
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          resolution_notes: notes,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Incident resolved", description: "Security incident marked as resolved" });
      queryClient.invalidateQueries({ queryKey: ["security-incidents"] });
      setSelectedIncident(null);
      setNotes("");
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "secondary";
      case "medium":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Security Incident Response
        </CardTitle>
        <CardDescription>Active security incidents and response actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="space-y-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <div className="text-2xl font-bold">
                {incidents?.filter((i) => i.severity === "critical").length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <Clock className="h-6 w-6 text-yellow-500" />
              <div className="text-2xl font-bold">
                {incidents?.filter((i) => i.severity === "high").length || 0}
              </div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div className="text-2xl font-bold">{incidents?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Open</div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {incidents?.map((incident) => (
            <Card key={incident.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge variant="outline">{incident.event_type}</Badge>
                    </div>
                    <h4 className="font-medium">{incident.description}</h4>
                    <div className="text-sm text-muted-foreground">
                      {new Date(incident.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {selectedIncident === incident.id ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add resolution notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          resolveIncidentMutation.mutate({ id: incident.id, notes })
                        }
                        disabled={resolveIncidentMutation.isPending}
                      >
                        Resolve Incident
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedIncident(null);
                          setNotes("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => setSelectedIncident(incident.id)}>
                    Respond to Incident
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {incidents?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No active security incidents
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
