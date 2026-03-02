/**
 * SocialPresenceEditor — Orchestrates all social presence sub-editors.
 * 
 * Tabbed interface for managing links, status, and collabs,
 * designed to be embedded in BrandHub.
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link2, Radio, Users, Save } from 'lucide-react';
import { GlassPanel, HubHeader } from '@/components/crm/design';

import { LinkBioManager } from './LinkBioManager';
import { StatusSystem } from './StatusSystem';
import { CollabWall } from './CollabWall';
import type { LinkCard, StudioStatus, CollabEntry } from './types';

interface SocialPresenceEditorProps {
    links: LinkCard[];
    onLinksChange: (links: LinkCard[]) => void;
    status: StudioStatus;
    onStatusChange: (status: StudioStatus) => void;
    collabs: CollabEntry[];
    onSave: () => void;
    saving?: boolean;
    accent?: string;
}

export const SocialPresenceEditor: React.FC<SocialPresenceEditorProps> = ({
    links,
    onLinksChange,
    status,
    onStatusChange,
    collabs,
    onSave,
    saving = false,
    accent,
}) => {
    return (
        <div className="space-y-6">
            <HubHeader
                icon={<Radio className="h-5 w-5 text-cyan-400" />}
                title="Social Presence"
                subtitle="Manage your links, status, and collaborators"
                accent="rgba(6, 182, 212, 0.5)"
                action={
                    <Button onClick={onSave} disabled={saving} size="sm" className="gap-1.5">
                        <Save className="h-3.5 w-3.5" />
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                }
            />

            <GlassPanel padding="p-5" glow accent="rgba(6, 182, 212, 0.2)">
                <Tabs defaultValue="links">
                    <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/8 mb-5">
                        <TabsTrigger value="links" className="gap-1.5 text-xs">
                            <Link2 className="h-3.5 w-3.5" />
                            Links
                        </TabsTrigger>
                        <TabsTrigger value="status" className="gap-1.5 text-xs">
                            <Radio className="h-3.5 w-3.5" />
                            Status
                        </TabsTrigger>
                        <TabsTrigger value="collabs" className="gap-1.5 text-xs">
                            <Users className="h-3.5 w-3.5" />
                            Collabs
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="links" className="mt-0">
                        <LinkBioManager
                            links={links}
                            onChange={onLinksChange}
                            editable
                            accent={accent}
                        />
                    </TabsContent>

                    <TabsContent value="status" className="mt-0">
                        <StatusSystem
                            status={status}
                            onChange={onStatusChange}
                            editable
                        />
                    </TabsContent>

                    <TabsContent value="collabs" className="mt-0">
                        <CollabWall collabs={collabs} />
                        <p className="text-xs text-muted-foreground mt-3 text-center">
                            Collaborators are automatically added when you complete projects together.
                        </p>
                    </TabsContent>
                </Tabs>
            </GlassPanel>
        </div>
    );
};
