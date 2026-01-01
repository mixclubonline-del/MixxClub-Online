import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Project {
  id: string;
  partnership_id: string;
  title: string;
  description: string | null;
  status: string | null;
  project_type: string | null;
  release_date: string | null;
  total_revenue: number | null;
  priority: string | null;
  deadline: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  tags: string[] | null;
  client_id: string | null;
  progress_percentage: number | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  partnership?: {
    artist_id: string;
    engineer_id: string;
    artist?: { full_name: string; avatar_url: string | null };
    engineer?: { full_name: string; avatar_url: string | null };
  };
  client?: { name: string; email: string | null } | null;
}

export interface ProjectActivity {
  id: string;
  project_id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: { full_name: string; avatar_url: string | null };
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  is_pinned: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  user?: { full_name: string; avatar_url: string | null };
  replies?: ProjectComment[];
}

export interface ProjectFile {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  version: number;
  category: string;
  notes: string | null;
  created_at: string;
  user?: { full_name: string; avatar_url: string | null };
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string | null;
  payment_amount: number | null;
  due_date: string | null;
  completed_at: string | null;
  deliverables: unknown[];
  created_at: string;
}

type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';

export function useProjectsHub() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all projects for the user
  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['projects-hub', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('collaborative_projects')
        .select(`
          *,
          partnership:partnerships!collaborative_projects_partnership_id_fkey(
            artist_id,
            engineer_id,
            artist:profiles!partnerships_artist_id_fkey(full_name, avatar_url),
            engineer:profiles!partnerships_engineer_id_fkey(full_name, avatar_url)
          ),
          client:crm_clients(name, email)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Project[];
    },
    enabled: !!user?.id,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Partial<Project>) => {
      const { data, error } = await supabase
        .from('collaborative_projects')
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-hub'] });
      toast.success('Project created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('collaborative_projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-hub'] });
      toast.success('Project updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });

  // Update project status
  const updateStatus = useCallback(async (projectId: string, status: ProjectStatus) => {
    await updateProjectMutation.mutateAsync({ id: projectId, status });
    
    // Log activity
    if (user?.id) {
      await supabase.from('project_activities').insert({
        project_id: projectId,
        user_id: user.id,
        activity_type: 'status_change',
        description: `Status changed to ${status}`,
        metadata: { new_status: status },
      });
    }
  }, [updateProjectMutation, user?.id]);

  // Get projects by status
  const getProjectsByStatus = useCallback((status: ProjectStatus) => {
    return projects.filter(p => p.status === status);
  }, [projects]);

  // Get project stats
  const stats = {
    total: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    review: projects.filter(p => p.status === 'review').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on_hold').length,
    totalRevenue: projects.reduce((sum, p) => sum + (p.total_revenue || 0), 0),
    overdue: projects.filter(p => p.deadline && new Date(p.deadline) < new Date() && p.status !== 'completed').length,
  };

  return {
    projects,
    isLoading,
    error,
    refetch,
    stats,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    updateStatus,
    getProjectsByStatus,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
  };
}

export function useProjectDetail(projectId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch single project with all related data
  const { data: project, isLoading } = useQuery({
    queryKey: ['project-detail', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('collaborative_projects')
        .select(`
          *,
          partnership:partnerships!collaborative_projects_partnership_id_fkey(
            artist_id,
            engineer_id,
            artist:profiles!partnerships_artist_id_fkey(full_name, avatar_url, email),
            engineer:profiles!partnerships_engineer_id_fkey(full_name, avatar_url, email)
          ),
          client:crm_clients(id, name, email, avatar_url)
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data as unknown as Project;
    },
    enabled: !!projectId,
  });

  // Fetch milestones
  const { data: milestones = [] } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as Milestone[];
    },
    enabled: !!projectId,
  });

  // Fetch activities
  const { data: activities = [] } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_activities')
        .select(`
          *,
          user:profiles!project_activities_user_id_fkey(full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as unknown as ProjectActivity[];
    },
    enabled: !!projectId,
  });

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ['project-comments', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_comments')
        .select(`
          *,
          user:profiles!project_comments_user_id_fkey(full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as ProjectComment[];
    },
    enabled: !!projectId,
  });

  // Fetch files
  const { data: files = [] } = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_files')
        .select(`
          *,
          user:profiles!project_files_user_id_fkey(full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as ProjectFile[];
    },
    enabled: !!projectId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!user?.id || !projectId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('project_comments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-comments', projectId] });
      toast.success('Comment added');
    },
  });

  // Add file mutation
  const addFileMutation = useMutation({
    mutationFn: async (fileData: Omit<ProjectFile, 'id' | 'created_at' | 'user'>) => {
      const { data, error } = await supabase
        .from('project_files')
        .insert(fileData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
      toast.success('File uploaded');
    },
  });

  // Create/Update milestone mutation
  const saveMilestoneMutation = useMutation({
    mutationFn: async (milestoneData: Partial<Milestone>) => {
      if (milestoneData.id) {
        const { data, error } = await supabase
          .from('project_milestones')
          .update(milestoneData)
          .eq('id', milestoneData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('project_milestones')
          .insert({ ...milestoneData, project_id: projectId })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] });
      toast.success('Milestone saved');
    },
  });

  return {
    project,
    isLoading,
    milestones,
    activities,
    comments,
    files,
    addComment: addCommentMutation.mutate,
    addFile: addFileMutation.mutate,
    saveMilestone: saveMilestoneMutation.mutate,
  };
}
