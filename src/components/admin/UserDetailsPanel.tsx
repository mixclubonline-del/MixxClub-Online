import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Calendar, 
  Activity, 
  DollarSign, 
  FileText,
  Shield,
  Ban,
  X
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserDetailsPanelProps {
  userId: string | null;
  onClose: () => void;
}

export const UserDetailsPanel = ({ userId, onClose }: UserDetailsPanelProps) => {
  const { data: user } = useQuery({
    queryKey: ["user-details", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (profileError) throw profileError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      if (rolesError) throw rolesError;

      return { ...profile, user_roles: roles || [] };
    },
    enabled: !!userId,
  });

  if (!userId || !user) return null;

  const stats = [
    { label: "Total Projects", value: "0", icon: FileText },
    { label: "Total Spent", value: "$0", icon: DollarSign },
    { label: "Active Sessions", value: "0", icon: Activity },
    { label: "Member Since", value: new Date(user.created_at).toLocaleDateString(), icon: Calendar },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-xl z-50 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">User Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-medium">
                {user.full_name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user.full_name || "Unknown"}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {user.id.slice(0, 16)}...
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {user.user_roles?.map((r: any) => (
              <Badge key={r.role}>{r.role}</Badge>
            ))}
            {(!user.user_roles || user.user_roles.length === 0) && (
              <Badge variant="outline">User</Badge>
            )}
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="h-3 w-3" />
                    {stat.label}
                  </div>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Manage Roles
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Activity className="h-4 w-4 mr-2" />
              View Activity Log
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive">
              <Ban className="h-4 w-4 mr-2" />
              Suspend Account
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-3">Recent Activity</h4>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              No recent activity to display
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
