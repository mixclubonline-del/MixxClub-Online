import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const TenantManager = () => {
  const { toast } = useToast();
  const [newTenantName, setNewTenantName] = useState("");

  const tenants = [
    { id: "1", name: "Acme Studios", users: 45, storage: "12.5 GB", plan: "Enterprise", status: "active" },
    { id: "2", name: "Beta Records", users: 23, storage: "8.2 GB", plan: "Professional", status: "active" },
    { id: "3", name: "Gamma Productions", users: 67, storage: "25.3 GB", plan: "Enterprise", status: "active" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Tenant Manager
        </CardTitle>
        <CardDescription>Create and manage tenant organizations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="New tenant name"
            value={newTenantName}
            onChange={(e) => setNewTenantName(e.target.value)}
          />
          <Button
            onClick={() => {
              toast({ title: "Tenant created", description: `${newTenantName} has been created` });
              setNewTenantName("");
            }}
            disabled={!newTenantName}
          >
            Create Tenant
          </Button>
        </div>

        <div className="space-y-4">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-lg">{tenant.name}</h4>
                    <Badge>{tenant.plan}</Badge>
                  </div>
                  <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
                    {tenant.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{tenant.users}</div>
                      <div className="text-xs text-muted-foreground">Users</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{tenant.storage}</div>
                      <div className="text-xs text-muted-foreground">Storage</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Manage Users</Button>
                  <Button size="sm" variant="outline">Settings</Button>
                  <Button size="sm" variant="outline">View Analytics</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
