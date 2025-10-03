import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, Mail, Bell, MessageSquare, CheckCircle, 
  XCircle, Clock, Search, Filter, Download
} from "lucide-react";

interface CommunicationLog {
  id: string;
  type: 'email' | 'notification' | 'sms';
  recipient: string;
  subject: string;
  status: 'delivered' | 'failed' | 'pending' | 'bounced';
  timestamp: string;
  templateUsed?: string;
  openedAt?: string;
  clickedAt?: string;
}

const logs: CommunicationLog[] = [
  {
    id: '1',
    type: 'email',
    recipient: 'john.smith@example.com',
    subject: 'Welcome to MixxMatch!',
    status: 'delivered',
    timestamp: '2 minutes ago',
    templateUsed: 'Welcome Email',
    openedAt: '1 minute ago'
  },
  {
    id: '2',
    type: 'notification',
    recipient: 'sarah.j@example.com',
    subject: 'Your project is complete!',
    status: 'delivered',
    timestamp: '15 minutes ago',
    templateUsed: 'Project Completed',
    openedAt: '10 minutes ago',
    clickedAt: '9 minutes ago'
  },
  {
    id: '3',
    type: 'email',
    recipient: 'mike.davis@example.com',
    subject: 'Payment Receipt',
    status: 'delivered',
    timestamp: '1 hour ago',
    templateUsed: 'Payment Receipt',
    openedAt: '45 minutes ago'
  },
  {
    id: '4',
    type: 'email',
    recipient: 'invalid@domain.xyz',
    subject: 'Monthly Newsletter',
    status: 'bounced',
    timestamp: '2 hours ago',
    templateUsed: 'Monthly Newsletter'
  },
  {
    id: '5',
    type: 'notification',
    recipient: 'emily.r@example.com',
    subject: 'New message from engineer',
    status: 'delivered',
    timestamp: '3 hours ago',
    openedAt: '2 hours ago'
  },
  {
    id: '6',
    type: 'sms',
    recipient: '+1 (555) 123-4567',
    subject: '2FA verification code: 123456',
    status: 'delivered',
    timestamp: '4 hours ago'
  },
  {
    id: '7',
    type: 'email',
    recipient: 'alex.t@example.com',
    subject: 'Password Reset Request',
    status: 'delivered',
    timestamp: '5 hours ago',
    templateUsed: 'Password Reset',
    openedAt: '4 hours ago',
    clickedAt: '4 hours ago'
  },
  {
    id: '8',
    type: 'email',
    recipient: 'temp.user@example.com',
    subject: 'Feature Launch Announcement',
    status: 'failed',
    timestamp: '6 hours ago',
    templateUsed: 'Feature Launch'
  }
];

export function CommunicationLogs() {
  const getTypeIcon = (type: CommunicationLog['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: CommunicationLog['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'bounced':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: CommunicationLog['status']) => {
    const variants: Record<string, any> = {
      delivered: 'default',
      failed: 'destructive',
      bounced: 'secondary',
      pending: 'outline'
    };
    return variants[status];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Communication Logs
            </CardTitle>
            <CardDescription>Complete history of all platform communications</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search & Stats */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by recipient, subject, or template..." 
              className="pl-9"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-3 border rounded-lg bg-card">
              <div className="text-xs text-muted-foreground mb-1">Total Sent (24h)</div>
              <div className="text-xl font-bold">1,243</div>
            </div>
            
            <div className="p-3 border rounded-lg bg-card">
              <div className="text-xs text-muted-foreground mb-1">Delivery Rate</div>
              <div className="text-xl font-bold text-green-600">98.2%</div>
            </div>
            
            <div className="p-3 border rounded-lg bg-card">
              <div className="text-xs text-muted-foreground mb-1">Open Rate</div>
              <div className="text-xl font-bold text-blue-600">72.4%</div>
            </div>
            
            <div className="p-3 border rounded-lg bg-card">
              <div className="text-xs text-muted-foreground mb-1">Failed/Bounced</div>
              <div className="text-xl font-bold text-red-600">23</div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getTypeIcon(log.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{log.recipient}</span>
                      <Badge variant={getStatusBadge(log.status)} className="text-xs">
                        {log.status}
                      </Badge>
                      {log.templateUsed && (
                        <Badge variant="outline" className="text-xs">
                          {log.templateUsed}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {log.subject}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{log.timestamp}</span>
                      {log.openedAt && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">Opened {log.openedAt}</span>
                        </>
                      )}
                      {log.clickedAt && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">Clicked {log.clickedAt}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(log.status)}
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing 1-8 of 1,243 logs
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
