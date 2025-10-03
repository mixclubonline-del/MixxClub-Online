import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, Plus, Edit, Trash2, Eye, Send, Copy, 
  CheckCircle, Clock, AlertCircle
} from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'transactional' | 'marketing' | 'notification' | 'system';
  status: 'active' | 'draft' | 'archived';
  lastUsed?: string;
  sentCount: number;
  openRate?: number;
}

const templates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to MixxMatch! 🎵',
    category: 'transactional',
    status: 'active',
    lastUsed: '2 hours ago',
    sentCount: 287,
    openRate: 68.2
  },
  {
    id: '2',
    name: 'Payment Receipt',
    subject: 'Payment Received - Receipt #{{invoice_number}}',
    category: 'transactional',
    status: 'active',
    lastUsed: '15 minutes ago',
    sentCount: 542,
    openRate: 92.5
  },
  {
    id: '3',
    name: 'Project Completed',
    subject: 'Your project {{project_name}} is complete!',
    category: 'notification',
    status: 'active',
    lastUsed: '1 hour ago',
    sentCount: 156,
    openRate: 78.4
  },
  {
    id: '4',
    name: 'Monthly Newsletter',
    subject: 'MixxMatch Monthly Roundup - {{month}}',
    category: 'marketing',
    status: 'active',
    lastUsed: '5 days ago',
    sentCount: 1243,
    openRate: 45.3
  },
  {
    id: '5',
    name: 'Password Reset',
    subject: 'Reset Your MixxMatch Password',
    category: 'system',
    status: 'active',
    lastUsed: '3 hours ago',
    sentCount: 89,
    openRate: 95.1
  },
  {
    id: '6',
    name: 'Subscription Renewal',
    subject: 'Your subscription renews in 7 days',
    category: 'notification',
    status: 'active',
    lastUsed: '1 day ago',
    sentCount: 312,
    openRate: 62.8
  },
  {
    id: '7',
    name: 'Feature Launch Announcement',
    subject: 'New Feature: {{feature_name}} is now live! 🚀',
    category: 'marketing',
    status: 'draft',
    sentCount: 0
  },
  {
    id: '8',
    name: 'Engineer Invitation',
    subject: 'Join {{artist_name}}\'s project on MixxMatch',
    category: 'notification',
    status: 'active',
    lastUsed: '4 hours ago',
    sentCount: 234,
    openRate: 71.2
  }
];

export function EmailTemplateManager() {
  const getCategoryBadge = (category: EmailTemplate['category']) => {
    const variants: Record<string, any> = {
      transactional: 'default',
      marketing: 'secondary',
      notification: 'outline',
      system: 'destructive'
    };
    const colors: Record<string, string> = {
      transactional: 'bg-blue-500',
      marketing: 'bg-purple-500',
      notification: 'bg-green-500',
      system: 'bg-red-500'
    };
    return { variant: variants[category], color: colors[category] };
  };

  const getStatusIcon = (status: EmailTemplate['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'archived':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const categories = ['All', 'Transactional', 'Marketing', 'Notification', 'System'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Template Manager
            </CardTitle>
            <CardDescription>Create and manage email templates for automated communications</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === 'All' ? 'default' : 'outline'}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 border rounded-lg bg-card">
            <div className="text-sm text-muted-foreground mb-1">Total Templates</div>
            <div className="text-2xl font-bold">{templates.length}</div>
            <div className="text-xs text-green-500 mt-1">+2 this month</div>
          </div>
          
          <div className="p-4 border rounded-lg bg-card">
            <div className="text-sm text-muted-foreground mb-1">Emails Sent (30d)</div>
            <div className="text-2xl font-bold">2,863</div>
            <div className="text-xs text-green-500 mt-1">+15.2% vs last month</div>
          </div>
          
          <div className="p-4 border rounded-lg bg-card">
            <div className="text-sm text-muted-foreground mb-1">Avg Open Rate</div>
            <div className="text-2xl font-bold">71.8%</div>
            <div className="text-xs text-green-500 mt-1">+3.1% vs last month</div>
          </div>
          
          <div className="p-4 border rounded-lg bg-card">
            <div className="text-sm text-muted-foreground mb-1">Active Templates</div>
            <div className="text-2xl font-bold">{templates.filter(t => t.status === 'active').length}</div>
            <div className="text-xs text-muted-foreground mt-1">1 draft, 0 archived</div>
          </div>
        </div>

        {/* Templates List */}
        <div className="space-y-3">
          {templates.map((template) => {
            const categoryBadge = getCategoryBadge(template.category);
            
            return (
              <div
                key={template.id}
                className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(template.status)}
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant={categoryBadge.variant} className="text-xs">
                        {template.category}
                      </Badge>
                      {template.status === 'draft' && (
                        <Badge variant="outline" className="text-xs">
                          Draft
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      Subject: {template.subject}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {template.lastUsed && (
                        <span>Last used: {template.lastUsed}</span>
                      )}
                      <span>•</span>
                      <span>Sent: {template.sentCount.toLocaleString()} times</span>
                      {template.openRate && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-medium">
                            Open rate: {template.openRate}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
