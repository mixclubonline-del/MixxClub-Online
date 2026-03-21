/**
 * ActiveWorkHub — Migrated to GlassPanel/HubHeader/StaggeredList design tokens.
 * 
 * Shows active projects and recent deliverables with glassmorphic styling,
 * staggered entrance animations, and standardized section headers.
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FileText, Clock, CheckCircle, Upload, Download, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { GlassPanel, HubHeader, StaggeredList, HubSkeleton, EmptyState } from './design';
import { useSearchParams } from 'react-router-dom';
import { createSignedUrl } from '@/lib/storage/signedUrls';
import { useToast } from '@/hooks/use-toast';

export const ActiveWorkHub = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const { data: activeProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['active-projects', user?.id],
    queryFn: async () => {
      const { data: deliverables } = await supabase
        .from('engineer_deliverables')
        .select(`
          *,
          projects:project_id (
            id,
            title,
            description,
            status,
            user_id,
            profiles:user_id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('engineer_id', user?.id)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(10);

      return deliverables || [];
    },
    enabled: !!user?.id,
  });

  const { data: recentDeliverables, isLoading: deliverablesLoading } = useQuery({
    queryKey: ['recent-deliverables', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('engineer_deliverables')
        .select(`
          *,
          projects:project_id (title)
        `)
        .eq('engineer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    },
    enabled: !!user?.id,
  });

  const [, setSearchParams] = useSearchParams();

  if (projectsLoading || deliverablesLoading) {
    return <HubSkeleton variant="list" count={5} />;
  }

  // Group deliverables by project for version timeline
  const groupedByProject = (recentDeliverables || []).reduce<Record<string, any[]>>((acc, d: any) => {
    const projTitle = d.projects?.title || 'Unknown Project';
    if (!acc[projTitle]) acc[projTitle] = [];
    acc[projTitle].push(d);
    return acc;
  }, {});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'revision_requested': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Projects */}
      <GlassPanel glow>
        <HubHeader
          icon={<FileText className="h-5 w-5 text-blue-400" />}
          title={`Active Work (${activeProjects?.length || 0})`}
          subtitle="Current projects and deliverables in progress"
          accent="rgba(59, 130, 246, 0.5)"
        />

        <div className="mt-5">
          {!activeProjects?.length ? (
            <EmptyState
              icon={FileText}
              title="No active projects"
              description="Browse available sessions to get started"
              cta={{ label: 'Browse Opportunities', onClick: () => setSearchParams({ tab: 'opportunities' }) }}
            />
          ) : (
            <StaggeredList className="space-y-3">
              {activeProjects.map((deliverable: any) => (
                <GlassPanel
                  key={deliverable.id}
                  hoverable
                  padding="p-4"
                  accent="rgba(59, 130, 246, 0.3)"
                >
                  <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-start justify-between'}`}>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">{deliverable.projects?.title}</h3>
                        <Badge className={getStatusColor(deliverable.status)}>
                          {deliverable.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {deliverable.file_name}
                      </p>
                      {deliverable.notes && (
                        <p className="text-sm text-muted-foreground/70">{deliverable.notes}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(deliverable.created_at), { addSuffix: true })}
                        </span>
                        {deliverable.version_number && (
                          <span className="text-primary/70">v{deliverable.version_number}</span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5">
                      <Upload className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                  </div>
                </GlassPanel>
              ))}
            </StaggeredList>
          )}
        </div>
      </GlassPanel>

      {/* Recent Deliverables */}
      <GlassPanel>
        <HubHeader
          icon={<CheckCircle className="h-5 w-5 text-green-400" />}
          title="Recent Deliverables"
          subtitle="Latest files uploaded"
          accent="rgba(34, 197, 94, 0.5)"
        />

        <div className="mt-5">
          {!recentDeliverables?.length ? (
            <EmptyState
              icon={CheckCircle}
              title="No deliverables yet"
              description="Your uploaded files will appear here"
            />
          ) : (
            <StaggeredList className="space-y-2">
              {recentDeliverables.map((deliverable: any) => (
                <GlassPanel
                  key={deliverable.id}
                  hoverable
                  padding="p-3"
                  accent="rgba(34, 197, 94, 0.3)"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{deliverable.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {deliverable.projects?.title}
                      </p>
                    </div>
                    <Badge className={getStatusColor(deliverable.status)} variant="outline">
                      {deliverable.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </GlassPanel>
              ))}
            </StaggeredList>
          )}
        </div>
      </GlassPanel>

      {/* Version Timeline */}
      {Object.keys(groupedByProject).length > 0 && (
        <GlassPanel>
          <HubHeader
            icon={<Clock className="h-5 w-5 text-purple-400" />}
            title="Version Timeline"
            subtitle="File history grouped by project"
            accent="rgba(168, 85, 247, 0.5)"
          />
          <div className="mt-5 space-y-5">
            {Object.entries(groupedByProject).map(([projTitle, versions]) => (
              <div key={projTitle}>
                <h4 className="text-sm font-medium text-foreground mb-3">{projTitle}</h4>
                <div className="relative pl-6 border-l-2 border-white/10 space-y-3">
                  {(versions as any[]).map((v: any, idx: number) => (
                    <div key={v.id} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[calc(1.5rem+5px)] w-2.5 h-2.5 rounded-full border-2 ${idx === 0 ? 'bg-primary border-primary' : 'bg-background border-white/20'
                        }`} />
                      <GlassPanel hoverable padding="p-3" accent="rgba(168, 85, 247, 0.2)">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{v.file_name}</span>
                              {v.version_number && (
                                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                                  v{v.version_number}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <Badge className={getStatusColor(v.status)} variant="outline">
                            {v.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </GlassPanel>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
};