/**
 * CollabWall — Showcase past collaborators with endorsements.
 * 
 * Displays a grid of collaborator cards with avatars, roles,
 * project links, and optional endorsement quotes.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, Users, ExternalLink } from 'lucide-react';
import type { CollabEntry } from './types';

interface CollabWallProps {
    collabs: CollabEntry[];
    className?: string;
}

export const CollabWall: React.FC<CollabWallProps> = ({ collabs, className }) => {
    if (collabs.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No collaborators yet</p>
            </div>
        );
    }

    return (
        <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-3', className)}>
            {collabs.map((collab, i) => {
                const initials = collab.fullName
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase() || '?';

                return (
                    <motion.div
                        key={collab.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all group"
                    >
                        <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <Avatar className="h-11 w-11 border-2 border-white/10">
                                <AvatarImage src={collab.avatarUrl || undefined} />
                                <AvatarFallback className="text-sm bg-primary/20">{initials}</AvatarFallback>
                            </Avatar>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm text-foreground truncate">
                                        {collab.fullName || collab.username || 'Anonymous'}
                                    </p>
                                    {collab.username && (
                                        <a
                                            href={`/u/${collab.username}`}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                        </a>
                                    )}
                                </div>
                                {collab.role && (
                                    <p className="text-xs text-muted-foreground">{collab.role}</p>
                                )}
                                {collab.projectTitle && (
                                    <p className="text-xs text-primary/70 mt-0.5">🎵 {collab.projectTitle}</p>
                                )}
                            </div>
                        </div>

                        {/* Endorsement quote */}
                        {collab.endorsement && (
                            <div className="mt-3 pl-3 border-l-2 border-primary/20">
                                <p className="text-xs text-muted-foreground italic leading-relaxed">
                                    <Quote className="h-3 w-3 inline mr-1 opacity-40" />
                                    {collab.endorsement}
                                </p>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};
