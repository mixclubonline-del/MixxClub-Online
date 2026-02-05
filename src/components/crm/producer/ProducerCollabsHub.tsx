import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
import { CollabRequestCard } from '@/components/producer/CollabRequestCard';
import { ActiveCollabCard } from '@/components/producer/ActiveCollabCard';
import { RoyaltyTrackerPanel } from '@/components/producer/RoyaltyTrackerPanel';
import { useProducerPartnerships } from '@/hooks/useProducerPartnerships';
import { useBeatRoyalties } from '@/hooks/useBeatRoyalties';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  Music
} from 'lucide-react';

export const ProducerCollabsHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const {
    partnerships,
    pendingRequests,
    activeCollabs,
    loading: partnershipsLoading,
    acceptPartnership,
    declinePartnership,
  } = useProducerPartnerships();

  const { summary, loading: royaltiesLoading } = useBeatRoyalties();

  const handleAccept = async (id: string) => {
    const success = await acceptPartnership(id);
    if (success) {
      toast({
        title: 'Collaboration Accepted',
        description: 'The partnership is now active. You can add track releases.',
      });
    }
  };

  const handleDecline = async (id: string) => {
    const success = await declinePartnership(id);
    if (success) {
      toast({
        title: 'Request Declined',
        description: 'The collaboration request has been declined.',
      });
    }
  };

  const handleViewDetails = (id: string) => {
    // TODO: Open details modal
    console.log('View details for partnership:', id);
  };

  const handleAddRelease = (id: string) => {
    // TODO: Open add release modal
    console.log('Add release for partnership:', id);
  };

  // Filter collaborations by search
  const filteredPending = pendingRequests.filter(p => {
    if (!searchQuery) return true;
    const artistName = p.artist?.full_name?.toLowerCase() || '';
    const beatTitle = p.beat?.title?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return artistName.includes(query) || beatTitle.includes(query);
  });

  const filteredActive = activeCollabs.filter(p => {
    if (!searchQuery) return true;
    const artistName = p.artist?.full_name?.toLowerCase() || '';
    const beatTitle = p.beat?.title?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return artistName.includes(query) || beatTitle.includes(query);
  });

  const hasCollabs = partnerships.length > 0;

  if (!hasCollabs && !partnershipsLoading) {
    return (
      <CharacterEmptyState
        type="collabs"
        characterId="tempo"
        title="Artist Collaborations"
        actionLabel="Find Artists"
        onAction={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Artist Collaborations
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage partnerships and track royalties from released tracks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collaborations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold">{pendingRequests.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Active</span>
          </div>
          <p className="text-2xl font-bold">{activeCollabs.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Music className="h-4 w-4" />
            <span className="text-sm">Released Tracks</span>
          </div>
          <p className="text-2xl font-bold">0</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Royalty Earnings</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            ${(summary?.totalRoyalties || 0).toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Active ({activeCollabs.length})
          </TabsTrigger>
          <TabsTrigger value="royalties" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Royalties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {partnershipsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredPending.length > 0 ? (
            <div className="space-y-4">
              {filteredPending.map((partnership) => (
                <CollabRequestCard
                  key={partnership.id}
                  partnership={partnership}
                  isProducer={partnership.producer_id === user?.id}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No pending requests</p>
              <p className="text-sm text-muted-foreground mt-1">
                Collaboration requests from artists will appear here
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {partnershipsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : filteredActive.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredActive.map((partnership) => (
                <ActiveCollabCard
                  key={partnership.id}
                  partnership={partnership}
                  isProducer={partnership.producer_id === user?.id}
                  onViewDetails={handleViewDetails}
                  onAddRelease={handleAddRelease}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No active collaborations</p>
              <p className="text-sm text-muted-foreground mt-1">
                Accepted partnerships will appear here
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="royalties">
          <RoyaltyTrackerPanel summary={summary} loading={royaltiesLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
