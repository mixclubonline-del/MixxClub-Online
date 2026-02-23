/**
 * SessionApplicants — What artists see after posting a session.
 * 
 * Shows a list of engineers who applied, with profiles and an "Accept" button.
 * When an artist accepts an engineer, the session moves to "matched" status.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    CheckCircle2, Users, Clock, Loader2, UserCheck, Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useSessionApplicants, useAcceptEngineer } from '@/hooks/useSessionMarketplace';
import type { SessionApplicant } from '@/hooks/useSessionMarketplace';

interface SessionApplicantsProps {
    sessionId: string;
    isHost: boolean;
}

export function SessionApplicants({ sessionId, isHost }: SessionApplicantsProps) {
    const { data: applicants, isLoading } = useSessionApplicants(sessionId);
    const acceptMutation = useAcceptEngineer();

    const applied = (applicants || []).filter(a => a.status === 'applied');
    const accepted = (applicants || []).filter(a => a.status === 'accepted');
    const hasAccepted = accepted.length > 0;

    const handleAccept = (applicant: SessionApplicant) => {
        acceptMutation.mutate({
            participantId: applicant.id,
            sessionId,
        });
    };

    if (isLoading) {
        return (
            <Card className="bg-card/50 border-border/30">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!applicants || applicants.length === 0) {
        return (
            <Card className="bg-card/50 border-border/30">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Engineer Applications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">
                            No engineers have applied yet. Your session is live — they'll find it.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/50 border-border/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Engineer Applications
                        <Badge variant="secondary" className="ml-1">
                            {applied.length + accepted.length}
                        </Badge>
                    </CardTitle>
                    {hasAccepted && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Matched
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    <div className="space-y-3">
                        {/* Show accepted first */}
                        {accepted.map((applicant, i) => (
                            <ApplicantRow
                                key={applicant.id}
                                applicant={applicant}
                                index={i}
                                isHost={isHost}
                                isAccepted={true}
                                onAccept={() => { }}
                                isAccepting={false}
                                hasAccepted={true}
                            />
                        ))}

                        {/* Then pending applications */}
                        {applied.map((applicant, i) => (
                            <ApplicantRow
                                key={applicant.id}
                                applicant={applicant}
                                index={accepted.length + i}
                                isHost={isHost}
                                isAccepted={false}
                                onAccept={() => handleAccept(applicant)}
                                isAccepting={acceptMutation.isPending}
                                hasAccepted={hasAccepted}
                            />
                        ))}
                    </div>
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}

// ─── Applicant Row ───────────────────────────────────────────────

function ApplicantRow({
    applicant,
    index,
    isHost,
    isAccepted,
    onAccept,
    isAccepting,
    hasAccepted,
}: {
    applicant: SessionApplicant;
    index: number;
    isHost: boolean;
    isAccepted: boolean;
    onAccept: () => void;
    isAccepting: boolean;
    hasAccepted: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isAccepted
                    ? 'bg-green-500/5 border-green-500/30'
                    : hasAccepted
                        ? 'bg-muted/30 border-border/20 opacity-60'
                        : 'bg-card border-border/50 hover:border-primary/30'
                }`}
        >
            {/* Avatar */}
            <Avatar className="w-11 h-11 ring-2 ring-border/30">
                <AvatarImage
                    src={applicant.profile.avatar_url || undefined}
                    alt={applicant.profile.full_name || ''}
                />
                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-accent text-white font-semibold">
                    {(applicant.profile.full_name || 'E').charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                        {applicant.profile.full_name || applicant.profile.username || 'Engineer'}
                    </span>
                    {isAccepted && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Accepted
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    Applied {formatDistanceToNow(new Date(applicant.created_at), { addSuffix: true })}
                </p>
            </div>

            {/* Action */}
            {isHost && !isAccepted && !hasAccepted && (
                <Button
                    size="sm"
                    className="gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
                    onClick={onAccept}
                    disabled={isAccepting}
                >
                    {isAccepting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <UserCheck className="w-4 h-4" />
                    )}
                    Accept
                </Button>
            )}
        </motion.div>
    );
}

export default SessionApplicants;
