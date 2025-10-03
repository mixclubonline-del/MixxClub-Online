import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface SupportTicket {
  id: string;
  user: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  lastUpdate: string;
}

const demoTickets: SupportTicket[] = [
  {
    id: 'TKT-001',
    user: 'John Doe',
    subject: 'Payment not processing',
    status: 'open',
    priority: 'urgent',
    category: 'Billing',
    createdAt: '2 hours ago',
    lastUpdate: '30 mins ago'
  },
  {
    id: 'TKT-002',
    user: 'Sarah Smith',
    subject: 'Cannot upload audio files',
    status: 'in-progress',
    priority: 'high',
    category: 'Technical',
    createdAt: '5 hours ago',
    lastUpdate: '1 hour ago'
  },
  {
    id: 'TKT-003',
    user: 'Mike Johnson',
    subject: 'Feature request: Export stems',
    status: 'open',
    priority: 'medium',
    category: 'Feature Request',
    createdAt: '1 day ago',
    lastUpdate: '8 hours ago'
  },
  {
    id: 'TKT-004',
    user: 'Emily Brown',
    subject: 'How to invite collaborators?',
    status: 'resolved',
    priority: 'low',
    category: 'General',
    createdAt: '2 days ago',
    lastUpdate: '1 day ago'
  },
];

export function SupportTicketManager() {
  const getStatusColor = (status: SupportTicket['status']) => {
    const colors = {
      open: 'bg-blue-500',
      'in-progress': 'bg-yellow-500',
      resolved: 'bg-green-500',
      closed: 'bg-gray-500'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    const colors = {
      low: 'bg-gray-500',
      medium: 'bg-blue-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    return colors[priority];
  };

  const stats = {
    open: demoTickets.filter(t => t.status === 'open').length,
    inProgress: demoTickets.filter(t => t.status === 'in-progress').length,
    resolved: demoTickets.filter(t => t.status === 'resolved').length,
    avgResponseTime: '2.5 hours'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Ticket Manager</CardTitle>
        <CardDescription>Manage and track customer support requests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-blue-500">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Open</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.open}</div>
          </div>
          
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-yellow-500">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.inProgress}</div>
          </div>
          
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Resolved</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.resolved}</div>
          </div>
          
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Avg Response</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.avgResponseTime}</div>
          </div>
        </div>

        {/* Tickets */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {demoTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                    <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </div>
                  <h4 className="font-semibold">{ticket.subject}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By {ticket.user}</span>
                    <span>•</span>
                    <span>Created {ticket.createdAt}</span>
                    <span>•</span>
                    <span>Updated {ticket.lastUpdate}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  <Button size="sm">View</Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="open" className="mt-4">
            <p className="text-sm text-muted-foreground">Showing open tickets only...</p>
          </TabsContent>

          <TabsContent value="in-progress" className="mt-4">
            <p className="text-sm text-muted-foreground">Showing in-progress tickets only...</p>
          </TabsContent>

          <TabsContent value="resolved" className="mt-4">
            <p className="text-sm text-muted-foreground">Showing resolved tickets only...</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
