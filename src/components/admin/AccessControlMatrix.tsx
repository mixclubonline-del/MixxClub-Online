import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

export const AccessControlMatrix = () => {
  const roles = ["admin", "moderator", "engineer", "artist", "user"];
  const permissions = [
    { name: "View Users", admin: true, moderator: true, engineer: false, artist: false, user: false },
    { name: "Edit Users", admin: true, moderator: false, engineer: false, artist: false, user: false },
    { name: "Delete Users", admin: true, moderator: false, engineer: false, artist: false, user: false },
    { name: "Manage Projects", admin: true, moderator: true, engineer: true, artist: true, user: false },
    { name: "View Analytics", admin: true, moderator: true, engineer: false, artist: false, user: false },
    { name: "Manage Billing", admin: true, moderator: false, engineer: false, artist: false, user: false },
    { name: "Create Content", admin: true, moderator: true, engineer: true, artist: true, user: true },
    { name: "Moderate Content", admin: true, moderator: true, engineer: false, artist: false, user: false },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Control Matrix</CardTitle>
        <CardDescription>Role-based permissions across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Permission</th>
                {roles.map((role) => (
                  <th key={role} className="text-center p-2">
                    <Badge variant="outline" className="capitalize">
                      {role}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{permission.name}</td>
                  {roles.map((role) => (
                    <td key={role} className="text-center p-2">
                      {permission[role as keyof typeof permission] ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
