import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, User, Settings, DollarSign, FileText, Shield } from "lucide-react";
import { useState } from "react";

interface ActivityLog {
  id: string;
  admin: string;
  action: string;
  type: 'user' | 'content' | 'system' | 'financial' | 'security';
  details: string;
  timestamp: string;
  avatar?: string;
}

const demoLogs: ActivityLog[] = [
  {
    id: '1',
    admin: 'John Smith',
    action: 'Updated system settings',
    type: 'system',
    details: 'Changed rate limiting configuration',
    timestamp: '2 minutes ago',
  },
  {
    id: '2',
    admin: 'Sarah Johnson',
    action: 'Approved user verification',
    type: 'user',
    details: 'Verified engineer: Mike Davis',
    timestamp: '15 minutes ago',
  },
  {
    id: '3',
    admin: 'Mike Davis',
    action: 'Processed refund',
    type: 'financial',
    details: 'Refund of $150 for project #1234',
    timestamp: '1 hour ago',
  },
  {
    id: '4',
    admin: 'John Smith',
    action: 'Updated RLS policy',
    type: 'security',
    details: 'Modified projects table access rules',
    timestamp: '2 hours ago',
  },
  {
    id: '5',
    admin: 'Sarah Johnson',
    action: 'Removed inappropriate content',
    type: 'content',
    details: 'Deleted project flagged by users',
    timestamp: '3 hours ago',
  },
  {
    id: '6',
    admin: 'Mike Davis',
    action: 'Created API key',
    type: 'system',
    details: 'Generated production API key for integration',
    timestamp: '5 hours ago',
  },
];

export function AdminActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getTypeIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'content':
        return <FileText className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: ActivityLog['type']) => {
    const variants: Record<string, any> = {
      user: 'default',
      content: 'secondary',
      system: 'outline',
      financial: 'default',
      security: 'destructive'
    };
    return variants[type] || 'outline';
  };

  const filteredLogs = demoLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Admin Activity Log
          </CardTitle>
          <CardDescription>Track all administrative actions across the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User Management</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity List */}
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={log.avatar} />
                  <AvatarFallback>
                    {log.admin.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{log.admin}</span>
                    <Badge variant={getTypeBadge(log.type)} className="gap-1">
                      {getTypeIcon(log.type)}
                      {log.type}
                    </Badge>
                  </div>
                  <div className="font-medium text-sm mb-1">{log.action}</div>
                  <div className="text-sm text-muted-foreground">{log.details}</div>
                </div>

                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No activities found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
