import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCommunityMilestones } from "@/hooks/useCommunityMilestones";
import { Trophy, Users, TrendingUp, Lock, Unlock, Edit2, Save } from "lucide-react";

const AdminMilestones = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: milestones, refetch } = useCommunityMilestones();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.rpc("is_admin", {
        user_uuid: user.id,
      });

      if (error || !data) {
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setIsLoading(false);
    };

    checkAdmin();
  }, [user, navigate]);

  const handleManualUnlock = async (featureKey: string, isUnlocked: boolean) => {
    const { error } = await supabase
      .from("community_milestones")
      .update({
        is_unlocked: !isUnlocked,
        unlocked_at: !isUnlocked ? new Date().toISOString() : null,
      })
      .eq("feature_key", featureKey);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update milestone status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Milestone ${!isUnlocked ? "unlocked" : "locked"} successfully`,
    });

    refetch();
  };

  const handleUpdateTarget = async (featureKey: string, newTarget: number) => {
    const { error } = await supabase
      .from("community_milestones")
      .update({ target_value: newTarget })
      .eq("feature_key", featureKey);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update target value",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Target value updated successfully",
    });

    setEditingId(null);
    refetch();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Community Milestones</h1>
          <p className="text-muted-foreground">
            Manage community-driven feature unlocks and track progress
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contributors">Top Contributors</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {milestones?.map((milestone) => (
              <Card key={milestone.feature_key} className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{milestone.milestone_name}</h3>
                        {milestone.is_unlocked ? (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Unlock className="h-3 w-3" />
                            Unlocked
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      {milestone.milestone_description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {milestone.milestone_description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <div className="flex items-center gap-4">
                        {editingId === milestone.feature_key ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              defaultValue={milestone.target_value}
                              className="w-20 h-8"
                              id={`target-${milestone.feature_key}`}
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                const input = document.getElementById(
                                  `target-${milestone.feature_key}`
                                ) as HTMLInputElement;
                                handleUpdateTarget(
                                  milestone.feature_key,
                                  parseInt(input.value)
                                );
                              }}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium">
                              {milestone.current_value} / {milestone.target_value}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(milestone.feature_key)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <Progress value={milestone.progress_percentage} className="h-2" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{milestone.progress_percentage.toFixed(1)}% Complete</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {milestone.contributor_count} contributors
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant={milestone.is_unlocked ? "destructive" : "default"}
                      size="sm"
                      onClick={() =>
                        handleManualUnlock(milestone.feature_key, milestone.is_unlocked)
                      }
                    >
                      {milestone.is_unlocked ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Lock Feature
                        </>
                      ) : (
                        <>
                          <Unlock className="h-4 w-4 mr-2" />
                          Unlock Feature
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Unlock Details */}
                  {milestone.is_unlocked && milestone.unlocked_at && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Unlocked on {new Date(milestone.unlocked_at).toLocaleDateString()} at{" "}
                      {new Date(milestone.unlocked_at).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="contributors">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Contributors</h3>
              <p className="text-sm text-muted-foreground">
                Feature coming soon - view users who contributed most to milestone progress
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Progress Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Feature coming soon - detailed analytics on milestone progress over time
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminMilestones;
