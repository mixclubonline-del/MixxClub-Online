import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Triangle, Zap, Clock, CheckCircle, Loader2,
    Users, Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThreeWayPartnershipCard } from './ThreeWayPartnershipCard';

interface TriPartnershipViewProps {
    userType: 'artist' | 'engineer' | 'producer';
}

interface TriPartnership {
    id: string;
    status: string;
    total_revenue: number;
    artist_id: string;
    engineer_id: string | null;
    producer_id: string | null;
    artist_percentage: number;
    engineer_percentage: number;
    producer_percentage: number;
    artist_earnings: number;
    engineer_earnings: number;
    producer_earnings: number;
    created_at: string;
    artist_profile?: { full_name: string; avatar_url: string | null } | null;
    engineer_profile?: { full_name: string; avatar_url: string | null } | null;
    producer_profile?: { full_name: string; avatar_url: string | null } | null;
    health_score?: number;
}

export const TriPartnershipView = ({ userType }: TriPartnershipViewProps) => {
    const { user } = useAuth();
    const [partnerships, setPartnerships] = useState<TriPartnership[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');

    const fetchPartnerships = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('partnerships')
                .select(`
          *,
          artist_profile:profiles!partnerships_artist_id_fkey(full_name, avatar_url),
          engineer_profile:profiles!partnerships_engineer_id_fkey(full_name, avatar_url),
          producer_profile:profiles!partnerships_producer_id_fkey(full_name, avatar_url)
        `)
                .eq('partnership_type', 'artist_engineer_producer')
                .or(`artist_id.eq.${user.id},engineer_id.eq.${user.id},producer_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Also try to get health scores
            const partnershipIds = (data || []).map((p) => p.id);
            let healthMap: Record<string, number> = {};

            if (partnershipIds.length > 0) {
                const { data: healthData } = await supabase
                    .from('partnership_health')
                    .select('partnership_id, health_score')
                    .in('partnership_id', partnershipIds);

                if (healthData) {
                    healthMap = Object.fromEntries(
                        healthData.map((h) => [h.partnership_id, h.health_score || 100])
                    );
                }
            }

            const mapped: TriPartnership[] = (data || []).map((p) => ({
                id: p.id,
                status: p.status,
                total_revenue: p.total_revenue || 0,
                artist_id: p.artist_id,
                engineer_id: p.engineer_id,
                producer_id: p.producer_id,
                artist_percentage: p.artist_percentage || 33,
                engineer_percentage: p.engineer_percentage || 33,
                producer_percentage: p.producer_percentage || 34,
                artist_earnings: p.artist_earnings || 0,
                engineer_earnings: p.engineer_earnings || 0,
                producer_earnings: p.producer_earnings || 0,
                created_at: p.created_at,
                artist_profile: Array.isArray(p.artist_profile)
                    ? p.artist_profile[0]
                    : p.artist_profile,
                engineer_profile: Array.isArray(p.engineer_profile)
                    ? p.engineer_profile[0]
                    : p.engineer_profile,
                producer_profile: Array.isArray(p.producer_profile)
                    ? p.producer_profile[0]
                    : p.producer_profile,
                health_score: healthMap[p.id] || 100,
            }));

            setPartnerships(mapped);
        } catch (err) {
            console.error('Error fetching tri-partnerships:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchPartnerships();
    }, [fetchPartnerships]);

    // Real-time subscription
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel('tri-partnerships')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'partnerships',
                    filter: 'partnership_type=eq.artist_engineer_producer',
                },
                () => fetchPartnerships()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, fetchPartnerships]);

    const filteredPartnerships = partnerships.filter((p) => {
        if (activeTab === 'active') return p.status === 'active' || p.status === 'accepted';
        if (activeTab === 'proposed') return p.status === 'proposed' || p.status === 'negotiating';
        if (activeTab === 'completed') return p.status === 'completed';
        return true;
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-16 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-72 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Triangle className="w-6 h-6 text-primary" />
                        3-Way Collaborations
                    </h2>
                    <p className="text-muted-foreground">
                        Artist + Producer + Engineer partnerships with shared revenue
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 via-amber-500 to-cyan-500 hover:opacity-90 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New 3-Way Collab
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50">
                    <TabsTrigger value="active" className="gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        Active
                    </TabsTrigger>
                    <TabsTrigger value="proposed" className="gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Proposed
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    {filteredPartnerships.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPartnerships.map((partnership, index) => (
                                <motion.div
                                    key={partnership.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <ThreeWayPartnershipCard
                                        id={partnership.id}
                                        status={partnership.status}
                                        totalRevenue={partnership.total_revenue}
                                        healthScore={partnership.health_score || 100}
                                        artist={{
                                            id: partnership.artist_id,
                                            name: partnership.artist_profile?.full_name || 'Artist',
                                            avatar_url: partnership.artist_profile?.avatar_url,
                                            role: 'artist',
                                            percentage: partnership.artist_percentage,
                                            earnings: partnership.artist_earnings,
                                        }}
                                        producer={{
                                            id: partnership.producer_id || '',
                                            name: partnership.producer_profile?.full_name || 'Producer',
                                            avatar_url: partnership.producer_profile?.avatar_url,
                                            role: 'producer',
                                            percentage: partnership.producer_percentage,
                                            earnings: partnership.producer_earnings,
                                        }}
                                        engineer={{
                                            id: partnership.engineer_id || '',
                                            name: partnership.engineer_profile?.full_name || 'Engineer',
                                            avatar_url: partnership.engineer_profile?.avatar_url,
                                            role: 'engineer',
                                            percentage: partnership.engineer_percentage,
                                            earnings: partnership.engineer_earnings,
                                        }}
                                        createdAt={partnership.created_at}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-border/30 bg-card/50">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="relative mb-4">
                                    <Triangle className="w-16 h-16 text-muted-foreground/30" />
                                    <Users className="w-6 h-6 text-muted-foreground/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No 3-Way Collaborations Yet</h3>
                                <p className="text-muted-foreground text-sm text-center max-w-sm mb-4">
                                    Create a partnership that brings together an artist, producer, and engineer
                                    for shared revenue and collaborative projects.
                                </p>
                                <Button variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Start Your First 3-Way Collab
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};
