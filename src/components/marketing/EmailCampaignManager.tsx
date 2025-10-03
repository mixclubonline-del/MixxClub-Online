import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
  opens: number;
  clicks: number;
  sent_at?: string;
}

export const EmailCampaignManager = () => {
  const { toast } = useToast();
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Welcome Series - Day 1',
      subject: 'Welcome to MixClub! Get Started in 5 Minutes',
      status: 'sent',
      recipients: 342,
      opens: 187,
      clicks: 94,
      sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'Feature Announcement',
      subject: 'New: AI-Powered Matching is Here! 🎉',
      status: 'sent',
      recipients: 1253,
      opens: 678,
      clicks: 312,
      sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      name: 'Re-engagement Campaign',
      subject: 'We Miss You! Special Offer Inside',
      status: 'scheduled',
      recipients: 567,
      opens: 0,
      clicks: 0
    }
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    audience: 'all',
    content: ''
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject) {
      toast({
        title: "Missing fields",
        description: "Please fill in campaign name and subject",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Campaign created!",
      description: "Your campaign has been saved as a draft"
    });

    setNewCampaign({
      name: '',
      subject: '',
      audience: 'all',
      content: ''
    });
  };

  const getOpenRate = (campaign: Campaign) => {
    if (campaign.recipients === 0) return 0;
    return ((campaign.opens / campaign.recipients) * 100).toFixed(1);
  };

  const getClickRate = (campaign: Campaign) => {
    if (campaign.opens === 0) return 0;
    return ((campaign.clicks / campaign.opens) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23.5K</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">54.7%</div>
            <p className="text-xs text-muted-foreground">
              Above industry avg (21%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28.3%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,892</div>
            <p className="text-xs text-muted-foreground">
              +234 this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
            <CardDescription>Design and schedule email campaigns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="e.g., Weekly Newsletter"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                placeholder="Catchy subject line..."
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Select 
                value={newCampaign.audience} 
                onValueChange={(val) => setNewCampaign({ ...newCampaign, audience: val })}
              >
                <SelectTrigger id="audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="artists">Artists Only</SelectItem>
                  <SelectItem value="engineers">Engineers Only</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                  <SelectItem value="trial">Trial Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Email Content</Label>
              <Textarea
                id="content"
                placeholder="Write your email content..."
                rows={6}
                value={newCampaign.content}
                onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateCampaign} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Recent email campaigns and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Open Rate</TableHead>
                  <TableHead>Click Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">{campaign.subject}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          campaign.status === 'sent' ? 'default' : 
                          campaign.status === 'scheduled' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {campaign.status === 'scheduled' && <Clock className="mr-1 h-3 w-3" />}
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {campaign.status === 'sent' ? `${getOpenRate(campaign)}%` : '-'}
                    </TableCell>
                    <TableCell>
                      {campaign.status === 'sent' ? `${getClickRate(campaign)}%` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
