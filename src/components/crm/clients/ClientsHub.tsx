/**
 * ClientsHub — Migrated to GlassPanel/HubHeader design tokens.
 * 
 * CRM client management with glassmorphic tab containers,
 * standardized header, and animated tab transitions.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Kanban, Activity, BarChart3, Plus, Search, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientList } from './ClientList';
import { DealPipeline } from './DealPipeline';
import { InteractionTimeline } from './InteractionTimeline';
import { ClientInsights } from './ClientInsights';
import { AddClientDialog } from './AddClientDialog';
import { useCRMClients } from '@/hooks/useCRMClients';
import { useCRMDeals } from '@/hooks/useCRMDeals';
import { GlassPanel, HubHeader, HubSkeleton, EmptyState } from '../design';

interface ClientsHubProps {
  userType?: 'artist' | 'engineer';
}

export const ClientsHub: React.FC<ClientsHubProps> = ({ userType = 'artist' }) => {
  const [activeTab, setActiveTab] = useState('clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);

  const { clients, loading: clientsLoading } = useCRMClients();
  const { deals, loading: dealsLoading } = useCRMDeals();

  const tabs = [
    { id: 'clients', label: 'Clients', icon: Users, count: clients?.length || 0 },
    { id: 'pipeline', label: 'Pipeline', icon: Kanban, count: deals?.filter(d => !['won', 'lost'].includes(d.stage)).length || 0 },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ];

  const accentColor = userType === 'artist'
    ? 'rgba(168, 85, 247, 0.5)'
    : 'rgba(249, 115, 22, 0.5)';

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        icon={<Users className="h-5 w-5" style={{ color: userType === 'artist' ? '#a855f7' : '#f97316' }} />}
        title="Clients Hub"
        subtitle={`Manage relationships with your ${userType === 'artist' ? 'engineers and collaborators' : 'artists and clients'}`}
        accent={accentColor}
        action={
          <Button onClick={() => setShowAddClient(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        }
      />

      {/* Search & Filters */}
      <GlassPanel padding="p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients, deals, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </GlassPanel>

      {/* Loading State */}
      {clientsLoading && <HubSkeleton variant="list" count={6} />}

      {/* Tabs */}
      {!clientsLoading && <GlassPanel padding="p-5" glow accent={accentColor}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-white/5 border border-white/8">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="ml-1 text-xs bg-white/10 px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="clients" className="mt-0">
                <ClientList
                  searchQuery={searchQuery}
                  userType={userType}
                />
              </TabsContent>

              <TabsContent value="pipeline" className="mt-0">
                <DealPipeline userType={userType} />
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <InteractionTimeline />
              </TabsContent>

              <TabsContent value="insights" className="mt-0">
                <ClientInsights userType={userType} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </GlassPanel>}

      {/* Add Client Dialog */}
      <AddClientDialog
        open={showAddClient}
        onOpenChange={setShowAddClient}
        userType={userType}
      />
    </div>
  );
};
