import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Send, Users, Bell } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'update' | 'maintenance' | 'feature';
  audience: string;
  sentAt: string;
  recipients: number;
}

const recentAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'New Feature: Voice Commands',
    message: 'Control your DAW with voice commands in the studio',
    type: 'feature',
    audience: 'All Users',
    sentAt: '2 hours ago',
    recipients: 1250
  },
  {
    id: '2',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for tonight at 2 AM EST',
    type: 'maintenance',
    audience: 'All Users',
    sentAt: '1 day ago',
    recipients: 1250
  },
  {
    id: '3',
    title: 'Mobile App Update',
    message: 'Version 2.0 is now available with improved performance',
    type: 'update',
    audience: 'Mobile Users',
    sentAt: '3 days ago',
    recipients: 450
  },
];

export function AnnouncementBroadcaster() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'update' | 'maintenance' | 'feature'>('info');
  const [audience, setAudience] = useState('all');

  const handleSend = () => {
    if (!title || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    toast.success('Announcement sent successfully!');
    setTitle('');
    setMessage('');
  };

  const getTypeColor = (type: Announcement['type']) => {
    const colors = {
      info: 'bg-blue-500',
      update: 'bg-green-500',
      maintenance: 'bg-yellow-500',
      feature: 'bg-purple-500'
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Create Announcement
          </CardTitle>
          <CardDescription>Broadcast messages to your users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Enter announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Enter announcement message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="feature">New Feature</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Audience</label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="artists">Artists Only</SelectItem>
                    <SelectItem value="engineers">Engineers Only</SelectItem>
                    <SelectItem value="premium">Premium Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSend} className="w-full gap-2">
              <Send className="h-4 w-4" />
              Send Announcement
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>Previously sent messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(announcement.type)}>{announcement.type}</Badge>
                    <h4 className="font-semibold">{announcement.title}</h4>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {announcement.recipients}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{announcement.message}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>To: {announcement.audience}</span>
                  <span>•</span>
                  <span>Sent {announcement.sentAt}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
