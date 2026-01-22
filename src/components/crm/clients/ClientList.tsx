import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, List, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientCard } from './ClientCard';
import { ClientDetailPanel } from './ClientDetailPanel';
import { useCRMClients } from '@/hooks/useCRMClients';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';

interface ClientListProps {
  searchQuery: string;
  userType: 'artist' | 'engineer';
}

export const ClientList: React.FC<ClientListProps> = ({ searchQuery, userType }) => {
  const { clients, loading: isLoading, deleteClient } = useCRMClients();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'value'>('recent');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    
    let filtered = clients.filter((client) => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || client.client_type === filterType;
      
      return matchesSearch && matchesType;
    });

    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        filtered.sort((a, b) => 
          new Date(b.last_interaction_at || b.created_at).getTime() - 
          new Date(a.last_interaction_at || a.created_at).getTime()
        );
        break;
      case 'value':
        filtered.sort((a, b) => (b.total_value || 0) - (a.total_value || 0));
        break;
    }

    return filtered;
  }, [clients, searchQuery, sortBy, filterType]);

  const selectedClient = clients?.find((c) => c.id === selectedClientId);

  const handleEdit = (id: string) => {
    // Open edit dialog - for now just select
    setSelectedClientId(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      await deleteClient(id);
      if (selectedClientId === id) {
        setSelectedClientId(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Main List */}
      <div className="flex-1 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="artist">Artists</SelectItem>
                <SelectItem value="engineer">Engineers</SelectItem>
                <SelectItem value="label">Labels</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-36">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="value">Highest Value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Empty State - Nova integration */}
        {filteredClients.length === 0 ? (
          <CharacterEmptyState
            type="clients"
            title="No clients yet"
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className={
                viewMode === 'grid'
                  ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-3'
              }
            >
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onSelect={setSelectedClientId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isSelected={selectedClientId === client.id}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Results Count */}
        {filteredClients.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing {filteredClients.length} of {clients?.length || 0} clients
          </p>
        )}
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedClient && (
          <ClientDetailPanel
            client={selectedClient}
            onClose={() => setSelectedClientId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
