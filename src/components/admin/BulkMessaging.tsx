import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Send, Users, Filter, MessageSquare, Mail, Bell,
  CheckCircle, Clock, AlertCircle
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'notification' | 'sms';
  status: 'scheduled' | 'sending' | 'completed' | 'failed';
  recipients: number;
  sent: number;
  opened?: number;
  clicked?: number;
  scheduledFor?: string;
  completedAt?: string;
}

const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'New Feature Launch Announcement',
    type: 'email',
    status: 'completed',
    recipients: 1250,
    sent: 1250,
    opened: 845,
    clicked: 312,
    completedAt: '2 hours ago'
  },
  {
    id: '2',
    name: 'Payment Reminder - Overdue Invoices',
    type: 'notification',
    status: 'completed',
    recipients: 45,
    sent: 45,
    opened: 38,
    completedAt: '1 day ago'
  },
  {
    id: '3',
    name: 'Monthly Newsletter - January',
    type: 'email',
    status: 'scheduled',
    recipients: 2100,
    sent: 0,
    scheduledFor: 'Tomorrow at 9:00 AM'
  },
  {
    id: '4',
    name: 'System Maintenance Notice',
    type: 'notification',
    status: 'sending',
    recipients: 1856,
    sent: 1234,
    opened: 987
  },
  {
    id: '5',
    name: 'Subscription Renewal Reminder',
    type: 'email',
    status: 'completed',
    recipients: 312,
    sent: 312,
    opened: 234,
    clicked: 89,
    completedAt: '3 days ago'
  }
];

const userSegments = [
  { id: '1', name: 'All Active Users', count: 1250 },
  { id: '2', name: 'Premium Subscribers', count: 450 },
  { id: '3', name: 'Free Tier Users', count: 800 },
  { id: '4', name: 'Engineers', count: 320 },
  { id: '5', name: 'Artists', count: 930 },
  { id: '6', name: 'Inactive (30+ days)', count: 180 },
  { id: '7', name: 'New Users (Last 7 days)', count: 67 },
  { id: '8', name: 'High Engagement', count: 234 }
];

export function BulkMessaging() {
  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sending':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Bulk Message Composer
          </CardTitle>
          <CardDescription>Send messages to multiple users at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Type</label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" className="flex-1">
                  <Bell className="h-4 w-4 mr-2" />
                  In-App
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Name</label>
              <Input placeholder="e.g., Monthly Newsletter" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Select Recipients
            </label>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 p-4 border rounded-lg bg-muted/50">
              {userSegments.map((segment) => (
                <label
                  key={segment.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                >
                  <Checkbox />
                  <span className="text-sm flex-1">{segment.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {segment.count}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subject / Title</label>
            <Input placeholder="Enter message subject" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message Content</label>
            <Textarea 
              placeholder="Write your message here..." 
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              Tip: Use variables like {`{{user_name}}`}, {`{{email}}`}, {`{{plan}}`} for personalization
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </Button>
            <Button variant="outline" className="flex-1">
              <Clock className="h-4 w-4 mr-2" />
              Schedule for Later
            </Button>
            <Button variant="outline">
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaign History */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign History</CardTitle>
          <CardDescription>Recent bulk messaging campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(campaign.status)}
                      {getTypeIcon(campaign.type)}
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <Badge variant="outline" className="capitalize text-xs">
                        {campaign.status}
                      </Badge>
                    </div>

                    <div className="grid gap-2 md:grid-cols-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Recipients:</span>
                        <span className="font-medium ml-2">{campaign.recipients.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sent:</span>
                        <span className="font-medium ml-2">{campaign.sent.toLocaleString()}</span>
                      </div>
                      {campaign.opened !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Opened:</span>
                          <span className="font-medium ml-2 text-green-600">
                            {campaign.opened.toLocaleString()} ({Math.round((campaign.opened / campaign.sent) * 100)}%)
                          </span>
                        </div>
                      )}
                      {campaign.clicked !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Clicked:</span>
                          <span className="font-medium ml-2 text-blue-600">
                            {campaign.clicked.toLocaleString()} ({Math.round((campaign.clicked / campaign.sent) * 100)}%)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground mt-2">
                      {campaign.completedAt && `Completed ${campaign.completedAt}`}
                      {campaign.scheduledFor && `Scheduled for ${campaign.scheduledFor}`}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
