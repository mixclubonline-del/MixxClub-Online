import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const permissions: Permission[] = [
  // User Management
  { id: 'users.view', name: 'View Users', description: 'View user profiles and data', category: 'User Management' },
  { id: 'users.edit', name: 'Edit Users', description: 'Modify user information', category: 'User Management' },
  { id: 'users.delete', name: 'Delete Users', description: 'Remove users from platform', category: 'User Management' },
  { id: 'users.ban', name: 'Ban Users', description: 'Suspend user accounts', category: 'User Management' },
  
  // Content Management
  { id: 'content.view', name: 'View Content', description: 'Access all content', category: 'Content Management' },
  { id: 'content.edit', name: 'Edit Content', description: 'Modify projects and files', category: 'Content Management' },
  { id: 'content.delete', name: 'Delete Content', description: 'Remove projects and files', category: 'Content Management' },
  { id: 'content.moderate', name: 'Moderate Content', description: 'Review and approve content', category: 'Content Management' },
  
  // Financial
  { id: 'finance.view', name: 'View Financials', description: 'Access financial reports', category: 'Financial' },
  { id: 'finance.payments', name: 'Manage Payments', description: 'Process refunds and payouts', category: 'Financial' },
  { id: 'finance.subscriptions', name: 'Manage Subscriptions', description: 'Modify subscription plans', category: 'Financial' },
  
  // System
  { id: 'system.settings', name: 'System Settings', description: 'Configure platform settings', category: 'System' },
  { id: 'system.api', name: 'API Access', description: 'Manage API keys and integrations', category: 'System' },
  { id: 'system.security', name: 'Security Settings', description: 'Configure security policies', category: 'System' },
];

interface RolePermissions {
  [role: string]: string[];
}

const rolePermissions: RolePermissions = {
  owner: permissions.map(p => p.id),
  admin: [
    'users.view', 'users.edit', 'users.ban',
    'content.view', 'content.edit', 'content.delete', 'content.moderate',
    'finance.view', 'finance.payments',
    'system.settings'
  ],
  moderator: [
    'users.view',
    'content.view', 'content.moderate',
    'finance.view'
  ],
  viewer: [
    'users.view',
    'content.view',
    'finance.view'
  ]
};

export function RolePermissionsManager() {
  const categories = Array.from(new Set(permissions.map(p => p.category)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Permissions Matrix
        </CardTitle>
        <CardDescription>Overview of permissions for each role level</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="flex gap-3">
          <Badge variant="default">Owner</Badge>
          <Badge variant="default">Admin</Badge>
          <Badge variant="secondary">Moderator</Badge>
          <Badge variant="outline">Viewer</Badge>
        </div>

        {/* Permissions by Category */}
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">{category}</h3>
            <div className="space-y-2">
              {permissions
                .filter(p => p.category === category)
                .map(permission => (
                  <div
                    key={permission.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {permission.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mt-3">
                      {['owner', 'admin', 'moderator', 'viewer'].map(role => (
                        <div key={role} className="flex items-center gap-2">
                          <Checkbox
                            checked={rolePermissions[role]?.includes(permission.id)}
                            disabled
                          />
                          <span className="text-xs capitalize">{role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {/* Role Summary */}
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(rolePermissions).map(([role, perms]) => (
            <div key={role} className="p-4 rounded-lg border bg-muted/50">
              <div className="font-semibold capitalize mb-2">{role}</div>
              <div className="text-sm text-muted-foreground">
                {perms.length} permissions granted
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
