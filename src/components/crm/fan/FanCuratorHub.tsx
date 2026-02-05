import { useState } from 'react';
import { useCuratorProfile } from '@/hooks/useCuratorProfile';
import { useCuratorSlots } from '@/hooks/useCuratorSlots';
import { useCuratorPromotions } from '@/hooks/useCuratorPromotions';
import { useCuratorBookings } from '@/hooks/useCuratorBookings';
import { useFanStats } from '@/hooks/useFanStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Headphones, 
  Music, 
  DollarSign, 
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Coins,
  TrendingUp,
  Sparkles,
  Lock,
  Play,
  Users
} from 'lucide-react';
import { CuratorOnboarding } from '@/components/curator/CuratorOnboarding';
import { PromotionRequestCard } from '@/components/curator/PromotionRequestCard';
import { PremiereSlotCard } from '@/components/curator/PremiereSlotCard';
import { CreateSlotModal } from '@/components/curator/CreateSlotModal';

export const FanCuratorHub = () => {
  const { stats } = useFanStats();
  const { profile, isLoading: profileLoading, isEligible, isCurator, coinzNeeded, minCoinz } = useCuratorProfile();
  const { slots, isLoading: slotsLoading } = useCuratorSlots();
  const { pendingRequests, acceptedRequests, completedRequests, requestsLoading } = useCuratorPromotions();
  const { pendingBookings, confirmedBookings } = useCuratorBookings();
  const [showCreateSlot, setShowCreateSlot] = useState(false);

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  // Not eligible - show progress to unlock
  if (!isEligible) {
    const progress = ((stats?.mixxcoinz_earned || 0) / minCoinz) * 100;
    
    return (
      <div className="space-y-6">
        <Card variant="glass" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Curator Mode
                  <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                    Champion Tier
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Unlock the ability to promote artists and earn MixxCoinz
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to unlock</span>
                <span className="font-medium">
                  {stats?.mixxcoinz_earned?.toLocaleString() || 0} / {minCoinz.toLocaleString()} MixxCoinz
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Earn {coinzNeeded.toLocaleString()} more MixxCoinz to unlock Curator Mode
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
                <Music className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <p className="text-sm font-medium">Curate Playlists</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
                <Coins className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                <p className="text-sm font-medium">Earn From Artists</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
                <Play className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <p className="text-sm font-medium">Host Premieres</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
                <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <p className="text-sm font-medium">Build Reputation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Eligible but not yet a curator - show onboarding
  if (!isCurator) {
    return <CuratorOnboarding />;
  }

  // Active curator dashboard
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profile?.total_earnings || 0}</p>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profile?.total_placements || 0}</p>
                <p className="text-xs text-muted-foreground">Placements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profile?.average_rating?.toFixed(1) || '—'}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length + pendingBookings.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            Requests
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="slots" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Slots
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Earnings
          </TabsTrigger>
        </TabsList>

        {/* Promotion Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          {requestsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <Card variant="glass" className="text-center py-12">
              <Music className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No pending promotion requests</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Artists will find you based on your genres and ratings
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <PromotionRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}

          {acceptedRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Accepted - Awaiting Placement
              </h3>
              {acceptedRequests.map((request) => (
                <PromotionRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Premiere Slots Tab */}
        <TabsContent value="slots" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Your Premiere Slots</h3>
            <Button size="sm" onClick={() => setShowCreateSlot(true)}>
              <Calendar className="w-4 h-4 mr-2" />
              Create Slot
            </Button>
          </div>

          {slotsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : slots.length === 0 ? (
            <Card variant="glass" className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No premiere slots created</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Create time slots for artists to book premieres
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {slots.map((slot) => (
                <PremiereSlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-4">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                Earnings Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold text-green-400">
                    {profile?.total_earnings?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">MixxCoinz</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-sm text-muted-foreground">Completed Jobs</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {completedRequests.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Promotions</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-medium mb-3">Recent Earnings</h4>
                {completedRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Complete promotions to see earnings here
                  </p>
                ) : (
                  <div className="space-y-2">
                    {completedRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex justify-between items-center py-2 px-3 rounded-lg bg-card/50">
                        <div>
                          <p className="text-sm font-medium">{request.track_title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.completed_at || request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">
                          +{request.payment_amount} coinz
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Slot Modal */}
      <CreateSlotModal open={showCreateSlot} onOpenChange={setShowCreateSlot} />
    </div>
  );
};
