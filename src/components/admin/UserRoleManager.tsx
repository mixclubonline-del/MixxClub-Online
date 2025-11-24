import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, X } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const AVAILABLE_ROLES = ["admin", "engineer", "artist"];

export const UserRoleManager = () => {
  const { users, assignRole, removeRole } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleAssignRole = () => {
    if (selectedUserId && selectedRole) {
      assignRole({ userId: selectedUserId, role: selectedRole as 'admin' | 'artist' | 'engineer' });
      setSelectedUserId("");
      setSelectedRole("");
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Role Management</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleAssignRole}
            disabled={!selectedUserId || !selectedRole}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Current Role Assignments</h4>
          <div className="space-y-2">
            {users?.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{user.full_name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{user.id.slice(0, 12)}...</p>
                </div>
                <div className="flex items-center gap-2">
                  {user.user_roles?.map((r: any) => (
                    <Badge key={r.role} className="gap-1">
                      {r.role}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeRole({ userId: user.id, role: r.role })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {(!user.user_roles || user.user_roles.length === 0) && (
                    <Badge variant="outline">No roles</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
