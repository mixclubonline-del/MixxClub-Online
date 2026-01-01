import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  MessageSquare,
  DollarSign,
  Plus,
  Edit2,
  ExternalLink
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClientNotes } from './ClientNotes';
import { formatDistanceToNow, format } from 'date-fns';
import { useCRMDeals } from '@/hooks/useCRMDeals';
import { useCRMInteractions } from '@/hooks/useCRMInteractions';

interface ClientDetailPanelProps {
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    client_type: string;
    avatar_url: string | null;
    status: string | null;
    source: string | null;
    total_value: number | null;
    deals_count: number | null;
    notes_count: number | null;
    last_interaction_at: string | null;
    created_at: string;
  };
  onClose: () => void;
}

export const ClientDetailPanel: React.FC<ClientDetailPanelProps> = ({ client, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { deals } = useCRMDeals(client.id);
  const { interactions } = useCRMInteractions(client.id);

  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-[400px] shrink-0 border-l border-border bg-card"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={client.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">{client.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{client.client_type}</Badge>
                  {client.status && (
                    <Badge variant="secondary">{client.status}</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <Button size="sm" className="flex-1 gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
            <Button size="sm" variant="outline" className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              New Deal
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start px-6 pt-2 bg-transparent border-b rounded-none">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deals">Deals ({deals?.length || 0})</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="overview" className="p-6 space-y-6 mt-0">
              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Contact Info
                </h3>
                {client.email && (
                  <a 
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm">{client.email}</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                )}
                {client.phone && (
                  <a 
                    href={`tel:${client.phone}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{client.phone}</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                )}
                {client.company && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.company}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-accent/50 text-center">
                    <DollarSign className="h-5 w-5 mx-auto text-emerald-400 mb-1" />
                    <p className="text-2xl font-bold text-foreground">
                      ${(client.total_value || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Value</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/50 text-center">
                    <MessageSquare className="h-5 w-5 mx-auto text-blue-400 mb-1" />
                    <p className="text-2xl font-bold text-foreground">
                      {client.deals_count || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Deals</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Added {format(new Date(client.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  {client.last_interaction_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>
                        Last interaction {formatDistanceToNow(new Date(client.last_interaction_at), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  {client.source && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ExternalLink className="h-4 w-4" />
                      <span>Source: {client.source}</span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deals" className="p-6 space-y-4 mt-0">
              {deals && deals.length > 0 ? (
                deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{deal.title}</h4>
                        <Badge variant="outline" className="mt-1">{deal.stage}</Badge>
                      </div>
                      <span className="text-lg font-bold text-emerald-400">
                        ${(deal.value || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No deals yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <ClientNotes clientId={client.id} />
            </TabsContent>

            <TabsContent value="activity" className="p-6 space-y-4 mt-0">
              {interactions && interactions.length > 0 ? (
                interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="flex gap-3 p-3 rounded-lg bg-accent/30"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{interaction.summary}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(interaction.occurred_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No activity recorded</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </motion.div>
  );
};
