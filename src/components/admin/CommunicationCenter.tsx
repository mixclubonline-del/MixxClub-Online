import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Mail, Bell, Megaphone, Send, Users, Clock, 
  CheckCircle2, AlertCircle, Trash2, Edit, Eye,
  FileText, Code, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'notification' | 'marketing' | 'transactional';
  isActive: boolean;
  lastEdited: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetAudience: 'all' | 'artists' | 'engineers' | 'admins';
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface BroadcastMessage {
  id: string;
  channel: 'email' | 'notification' | 'both';
  subject: string;
  message: string;
  recipientCount: number;
  sentAt: string;
  status: 'sent' | 'pending' | 'failed';
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to MixClub!',
    body: 'Hi {{name}},\n\nWelcome to MixClub! We\'re excited to have you join our community of artists and engineers.\n\nGet started by exploring your dashboard and setting up your profile.\n\nBest,\nThe MixClub Team',
    type: 'welcome',
    isActive: true,
    lastEdited: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Session Invitation',
    subject: 'You\'ve been invited to a session!',
    body: 'Hi {{name}},\n\n{{inviter}} has invited you to collaborate on a session: "{{session_title}}".\n\nClick here to view and respond to the invitation.\n\nBest,\nThe MixClub Team',
    type: 'notification',
    isActive: true,
    lastEdited: new Date().toISOString(),
  },
];

export function CommunicationCenter() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  
  // Template editor state
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [templateType, setTemplateType] = useState<EmailTemplate['type']>('notification');
  
  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState<Announcement['type']>('info');
  const [announcementAudience, setAnnouncementAudience] = useState<Announcement['targetAudience']>('all');
  
  // Broadcast state
  const [broadcastChannel, setBroadcastChannel] = useState<'email' | 'notification' | 'both'>('notification');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState<'all' | 'artists' | 'engineers'>('all');
  const [isSending, setIsSending] = useState(false);

  const handleSaveTemplate = () => {
    if (!templateName || !templateSubject || !templateBody) {
      toast.error('Please fill in all template fields');
      return;
    }

    const newTemplate: EmailTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      name: templateName,
      subject: templateSubject,
      body: templateBody,
      type: templateType,
      isActive: true,
      lastEdited: new Date().toISOString(),
    };

    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? newTemplate : t));
      toast.success('Template updated');
    } else {
      setTemplates([...templates, newTemplate]);
      toast.success('Template created');
    }

    resetTemplateForm();
  };

  const resetTemplateForm = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateSubject('');
    setTemplateBody('');
    setTemplateType('notification');
  };

  const editTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
    setTemplateType(template.type);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success('Template deleted');
  };

  const handleCreateAnnouncement = () => {
    if (!announcementTitle || !announcementMessage) {
      toast.error('Please fill in announcement title and message');
      return;
    }

    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: announcementTitle,
      message: announcementMessage,
      type: announcementType,
      targetAudience: announcementAudience,
      isActive: true,
      expiresAt: null,
      createdAt: new Date().toISOString(),
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    toast.success('Announcement created');
  };

  const toggleAnnouncement = (id: string) => {
    setAnnouncements(announcements.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    toast.success('Announcement deleted');
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage) {
      toast.error('Please enter a message');
      return;
    }

    if (broadcastChannel !== 'notification' && !broadcastSubject) {
      toast.error('Please enter an email subject');
      return;
    }

    setIsSending(true);
    try {
      // Get recipient count based on audience
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq(broadcastAudience === 'all' ? 'id' : 'role', 
            broadcastAudience === 'all' ? undefined : broadcastAudience);

      const recipientCount = count || 0;

      // In a real implementation, this would call an edge function to send
      const newBroadcast: BroadcastMessage = {
        id: Date.now().toString(),
        channel: broadcastChannel,
        subject: broadcastSubject || 'Notification',
        message: broadcastMessage,
        recipientCount,
        sentAt: new Date().toISOString(),
        status: 'sent',
      };

      setBroadcasts([newBroadcast, ...broadcasts]);
      setBroadcastSubject('');
      setBroadcastMessage('');
      toast.success(`Broadcast sent to ${recipientCount} users`);
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error('Failed to send broadcast');
    } finally {
      setIsSending(false);
    }
  };

  const getTypeColor = (type: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (type) {
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      case 'success': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="h-6 w-6" />
          Communication Center
        </h2>
        <p className="text-muted-foreground">
          Manage email templates, announcements, and broadcast messages
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="announcements" className="gap-2">
            <Bell className="h-4 w-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="broadcast" className="gap-2">
            <Send className="h-4 w-4" />
            Broadcast
          </TabsTrigger>
        </TabsList>

        {/* Email Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Template Editor */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </CardTitle>
                <CardDescription>
                  Create email templates with dynamic variables
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g., Welcome Email"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={templateType} onValueChange={(val) => setTemplateType(val as EmailTemplate['type'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="transactional">Transactional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject Line</Label>
                  <Input
                    placeholder="Email subject..."
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Body</Label>
                  <Textarea
                    placeholder="Email body... Use {{variable}} for dynamic content"
                    rows={8}
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available variables: {'{{name}}'}, {'{{email}}'}, {'{{session_title}}'}, {'{{inviter}}'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveTemplate} className="flex-1">
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
                  {editingTemplate && (
                    <Button variant="outline" onClick={resetTemplateForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Template List */}
            <Card>
              <CardHeader>
                <CardTitle>Saved Templates</CardTitle>
                <CardDescription>{templates.length} templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.subject}</div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{template.type}</Badge>
                            <Badge variant={template.isActive ? 'default' : 'secondary'}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => editTemplate(template)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteTemplate(template.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Announcement</CardTitle>
                <CardDescription>Display announcements across the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Announcement title"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Announcement message..."
                    rows={4}
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={announcementType} onValueChange={(val) => setAnnouncementType(val as Announcement['type'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Audience</Label>
                    <Select value={announcementAudience} onValueChange={(val) => setAnnouncementAudience(val as Announcement['targetAudience'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="artists">Artists Only</SelectItem>
                        <SelectItem value="engineers">Engineers Only</SelectItem>
                        <SelectItem value="admins">Admins Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateAnnouncement} className="w-full">
                  Create Announcement
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Announcements</CardTitle>
                <CardDescription>{announcements.filter(a => a.isActive).length} active</CardDescription>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No announcements yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className={`p-3 rounded-lg border ${announcement.isActive ? 'bg-card' : 'bg-muted/50 opacity-60'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{announcement.title}</div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={getTypeColor(announcement.type)}>{announcement.type}</Badge>
                              <Badge variant="outline">{announcement.targetAudience}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={announcement.isActive}
                              onCheckedChange={() => toggleAnnouncement(announcement.id)}
                            />
                            <Button size="sm" variant="ghost" onClick={() => deleteAnnouncement(announcement.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Broadcast Tab */}
        <TabsContent value="broadcast" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Broadcast</CardTitle>
                <CardDescription>Send messages to multiple users at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Channel</Label>
                  <Select value={broadcastChannel} onValueChange={(val) => setBroadcastChannel(val as 'email' | 'notification' | 'both')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">In-App Notification</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Audience</Label>
                  <Select value={broadcastAudience} onValueChange={(val) => setBroadcastAudience(val as 'all' | 'artists' | 'engineers')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="artists">Artists Only</SelectItem>
                      <SelectItem value="engineers">Engineers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {broadcastChannel !== 'notification' && (
                  <div>
                    <Label>Subject</Label>
                    <Input
                      placeholder="Email subject"
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Broadcast message..."
                    rows={6}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleSendBroadcast} 
                  className="w-full gap-2"
                  disabled={isSending}
                >
                  <Send className="h-4 w-4" />
                  {isSending ? 'Sending...' : 'Send Broadcast'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Broadcast History</CardTitle>
                <CardDescription>Recent broadcast messages</CardDescription>
              </CardHeader>
              <CardContent>
                {broadcasts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Send className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No broadcasts sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {broadcasts.map((broadcast) => (
                      <div key={broadcast.id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{broadcast.subject}</div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{broadcast.message}</p>
                            <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {broadcast.recipientCount} recipients
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(broadcast.sentAt), 'MMM d, h:mm a')}
                              </span>
                            </div>
                          </div>
                          <Badge variant={broadcast.status === 'sent' ? 'default' : 'destructive'}>
                            {broadcast.status === 'sent' ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {broadcast.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
