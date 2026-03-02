/**
 * MobileSessionCard — Touch-first session card for the mobile feed.
 * 
 * Designed for thumb reach: large touch targets, haptic feedback,
 * quick-apply, and tap-to-expand via bottom sheet.
 * 
 * The mobile experience is the GROUP HANG — this card shows
 * who's involved, how many people are in, and makes joining feel instant.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Headphones, Music, Clock, DollarSign, Send, CheckCircle2,
    Users, ChevronRight, Loader2, MessageCircle, Radio,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useApplyToSession } from '@/hooks/useSessionMarketplace';
import type { SessionListing } from '@/hooks/useSessionMarketplace';

const SERVICE_LABELS: Record<string, string> = {
    mixing: 'Mix',
    mastering: 'Master',
    vocal_mixing: 'Vocals',
    full_production: 'Full Prod',
};

interface MobileSessionCardProps {
    session: SessionListing;
    onTap?: (session: SessionListing) => void;
}

export function MobileSessionCard({ session, onTap }: MobileSessionCardProps) {
    const navigate = useNavigate();
    const applyMutation = useApplyToSession();
    const [justApplied, setJustApplied] = useState(false);

    const genre = session.session_state?.genre;
    const budget = session.session_state?.budget;
    const deadline = session.session_state?.deadline;
    const isUrgent = deadline && new Date(deadline).getTime() - Date.now() < 3 * 86400000;

    const handleApply = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        applyMutation.mutate(
            { sessionId: session.id },
            {
                onSuccess: () => setJustApplied(true),
            }
        );
    };

    const handleTap = () => {
        if (onTap) {
            onTap(session);
        } else {
            navigate(`/session/${session.id}`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.15 }}
        >
            <Card
                className="bg-card/60 border-border/30 overflow-hidden active:bg-card/80 touch-manipulation"
                onClick={handleTap}
            >
                <div className="p-4">
                    {/* Top row: Host + Status */}
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10 ring-2 ring-border/40">
                            <AvatarImage
                                src={session.host.avatar_url || undefined}
                                alt={session.host.full_name || ''}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-sm">
                                {(session.host.full_name || 'A').charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                                {session.host.full_name || session.host.username || 'Artist'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                            </p>
                        </div>
                        {isUrgent && (
                            <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 text-[10px] px-2 py-0.5">
                                <Clock className="w-3 h-3 mr-0.5" />
                                Urgent
                            </Badge>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-base mb-2 leading-snug">
                        {session.title}
                    </h3>

                    {/* Description */}
                    {session.description && (
                        <p className="text-sm text-muted-foreground/80 mb-3 line-clamp-2">
                            {session.description}
                        </p>
                    )}

                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 gap-0.5">
                            <Headphones className="w-3 h-3" />
                            {SERVICE_LABELS[session.session_type] || session.session_type}
                        </Badge>
                        {genre && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-0.5">
                                <Music className="w-3 h-3" />
                                {genre}
                            </Badge>
                        )}
                        {budget && budget > 0 && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-0.5 text-green-500 border-green-500/30">
                                <DollarSign className="w-3 h-3" />
                                ${budget}
                            </Badge>
                        )}
                    </div>

                    {/* Bottom row: Group info + Actions */}
                    <div className="flex items-center justify-between">
                        {/* Group indicator — shows this is a group hang */}
                        <div className="flex items-center gap-2">
                            {session.applicant_count > 0 ? (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <div className="flex -space-x-1.5">
                                        {/* Stack of avatars representing the group */}
                                        {[...Array(Math.min(session.applicant_count, 3))].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 border border-card"
                                            />
                                        ))}
                                    </div>
                                    <span>{session.applicant_count} in</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-xs text-green-500/80">
                                    <Radio className="w-3 h-3 animate-pulse" />
                                    <span>Open</span>
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            {session.has_applied || justApplied ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled
                                    className="h-10 px-4 text-green-500 gap-1.5"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Applied
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    className="h-10 px-5 gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 active:scale-95 transition-transform"
                                    onClick={handleApply}
                                    disabled={applyMutation.isPending}
                                >
                                    {applyMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Jump In
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

export default MobileSessionCard;
