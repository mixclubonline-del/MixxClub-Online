import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Radio, Users, Zap, ArrowRight, UserPlus,
    Headphones, Crown, Play,
} from 'lucide-react';
import { SessionsHub } from './SessionsHub';
import { motion } from 'framer-motion';

interface SessionCommandCenterProps {
    userType: 'artist' | 'engineer' | 'producer';
}

interface PartnerSession {
    id: string;
    title: string;
    status: string;
    host_user_id: string;
    host_profile?: {
        full_name: string;
        avatar_url: string | null;
    };
    participant_count: number;
}

const ROLE_CONFIG = {
    artist: {
        title: 'Artist Session HQ',
        subtitle: 'Your creative recording space',
        gradient: 'from-purple-500 to-pink-500',
        icon: Headphones,
    },
    producer: {
        title: 'Producer Session HQ',
        subtitle: 'Your production command center',
        gradient: 'from-amber-500 to-orange-500',
        icon: Crown,
    },
    engineer: {
        title: 'Engineer Session HQ',
        subtitle: 'Your mixing & mastering control room',
        gradient: 'from-cyan-500 to-blue-500',
        icon: Radio,
    },
};

export const SessionCommandCenter = ({ userType }: SessionCommandCenterProps) => {
    const { user } = useAuth();
    const [liveCount, setLiveCount] = useState(0);
    const [partnerSessions, setPartnerSessions] = useState<PartnerSession[]>([]);

    const config = ROLE_CONFIG[userType];
    const RoleIcon = config.icon;

    useEffect(() => {
        if (!user?.id) return;

        const fetchLiveData = async () => {
            // Get live session count across all roles
            const { count } = await supabase
                .from('collaboration_sessions')
                .select('id', { count: 'exact', head: true })
                .in('status', ['active', 'waiting']);

            setLiveCount(count || 0);

            // Get partner sessions (sessions from partnerships)
            const { data: partnerships } = await supabase
                .from('partnerships')
                .select('artist_id, engineer_id, producer_id')
                .or(`artist_id.eq.${user.id},engineer_id.eq.${user.id},producer_id.eq.${user.id}`)
                .eq('status', 'active');

            if (partnerships && partnerships.length > 0) {
                const partnerIds = new Set<string>();
                partnerships.forEach((p) => {
                    if (p.artist_id && p.artist_id !== user.id) partnerIds.add(p.artist_id);
                    if (p.engineer_id && p.engineer_id !== user.id) partnerIds.add(p.engineer_id);
                    if (p.producer_id && p.producer_id !== user.id) partnerIds.add(p.producer_id);
                });

                if (partnerIds.size > 0) {
                    const { data: sessions } = await supabase
                        .from('collaboration_sessions')
                        .select(`
              id, title, status, host_user_id,
              host_profile:profiles!collaboration_sessions_host_user_id_fkey (
                full_name, avatar_url
              )
            `)
                        .in('host_user_id', Array.from(partnerIds))
                        .in('status', ['active', 'waiting'])
                        .limit(5);

                    if (sessions) {
                        setPartnerSessions(
                            sessions.map((s) => ({
                                ...s,
                                host_profile: Array.isArray(s.host_profile)
                                    ? s.host_profile[0]
                                    : s.host_profile,
                                participant_count: 0,
                            }))
                        );
                    }
                }
            }
        };

        fetchLiveData();

        // Real-time subscription for live session updates
        const channel = supabase
            .channel('session-command-center')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'collaboration_sessions',
                },
                () => {
                    fetchLiveData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    return (
        <div className="space-y-6">
            {/* Role-branded header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${config.gradient} p-6`}
            >
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                            <RoleIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{config.title}</h2>
                            <p className="text-white/80">{config.subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                            <Zap className="w-3 h-3 mr-1" />
                            {liveCount} Live Now
                        </Badge>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
                <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/5" />
            </motion.div>

            {/* Partner Sessions Quick-Join */}
            {partnerSessions.length > 0 && (
                <Card className="border-border/30 bg-card/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            Partner Sessions — Quick Join
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="w-full">
                            <div className="flex gap-3">
                                {partnerSessions.map((session) => (
                                    <motion.div
                                        key={session.id}
                                        whileHover={{ scale: 1.02 }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border/30 bg-background/50 hover:border-primary/30 transition-colors min-w-[250px] cursor-pointer"
                                    >
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={session.host_profile?.avatar_url || undefined} />
                                            <AvatarFallback className="text-xs">
                                                {session.host_profile?.full_name?.charAt(0) || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{session.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.host_profile?.full_name}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="text-xs bg-green-500/10 text-green-500 border-green-500/20"
                                        >
                                            <Play className="w-3 h-3 mr-1" />
                                            Live
                                        </Badge>
                                    </motion.div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

            {/* Main SessionsHub */}
            <SessionsHub />
        </div>
    );
};
