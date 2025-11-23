import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOpportunities = (userRole: 'artist' | 'engineer') => {
  return useQuery({
    queryKey: ['opportunities', userRole],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (userRole === 'engineer') {
        // Fetch open job postings
        const { data: jobs, error } = await supabase
          .from('job_postings')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;

        // Fetch artist profiles for the jobs
        const artistIds = jobs?.map(j => j.artist_id).filter(Boolean) || [];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', artistIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        return jobs?.map(job => {
          const artist = profileMap.get(job.artist_id);
          return {
            id: job.id,
            title: job.title,
            artist: artist?.full_name || 'Unknown Artist',
            avatar: artist?.avatar_url || '',
            location: job.location || 'Remote',
            budget: `$${job.budget}`,
            matchScore: 85,
            skills: [job.genre, job.service_type].filter(Boolean),
            description: job.description || '',
            urgency: 'medium',
            responseTime: '24 hours',
            rating: 4.8
          };
        }) || [];
      } else {
        // For artists: fetch AI collaboration matches
        const { data: matches, error } = await supabase
          .from('ai_collaboration_matches')
          .select('*')
          .or(`artist_id.eq.${user.id},matched_user_id.eq.${user.id}`)
          .eq('status', 'pending')
          .order('compatibility_score', { ascending: false })
          .limit(10);
        
        if (error) throw error;

        // Fetch engineer profiles
        const engineerIds = matches?.map(m => m.engineer_id).filter(Boolean) || [];
        const [engineerProfiles, engineerDetails] = await Promise.all([
          supabase.from('profiles').select('id, full_name, avatar_url, bio').in('id', engineerIds),
          supabase.from('engineer_profiles').select('*').in('user_id', engineerIds)
        ]);

        const profileMap = new Map(engineerProfiles.data?.map(p => [p.id, p]) || []);
        const detailsMap = new Map(engineerDetails.data?.map(p => [p.user_id, p]) || []);

        return matches?.map(match => {
          const engineer = profileMap.get(match.engineer_id);
          const details = detailsMap.get(match.engineer_id);
          
          return {
            id: match.id,
            title: `Collaboration Opportunity`,
            artist: engineer?.full_name || 'Unknown Engineer',
            avatar: engineer?.avatar_url || '',
            location: 'Remote',
            budget: 'Negotiable',
            matchScore: Math.round(match.compatibility_score),
            skills: match.complementary_skills || [],
            description: engineer?.bio || 'Experienced audio engineer',
            urgency: 'medium',
            responseTime: '24 hours',
            rating: details?.rating || 4.5
          };
        }) || [];
      }
    }
  });
};

export const useOpportunityAction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      opportunityId, 
      action, 
      userRole 
    }: { 
      opportunityId: string; 
      action: 'interested' | 'pass';
      userRole: 'artist' | 'engineer';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (userRole === 'engineer') {
        // Create or update job application
        const { data, error } = await supabase
          .from('job_applications')
          .upsert({
            applicant_id: user.id,
            job_id: opportunityId,
            status: action === 'interested' ? 'pending' : 'withdrawn',
          })
          .select();
        
        if (error) throw error;
        return data;
      } else {
        // Update AI match status for artists
        const { data, error } = await supabase
          .from('ai_collaboration_matches')
          .update({
            status: action === 'interested' ? 'accepted' : 'declined',
          })
          .eq('id', opportunityId);
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['match-analytics'] });
      toast({
        title: 'Action recorded',
        description: 'Your preference has been saved',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
};

export const useMatchAnalytics = (userRole: 'artist' | 'engineer') => {
  return useQuery({
    queryKey: ['match-analytics', userRole],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      if (userRole === 'engineer') {
        const [applications, completed] = await Promise.all([
          supabase
            .from('job_applications')
            .select('*')
            .eq('engineer_id', user.id),
          supabase
            .from('projects')
            .select('*')
            .eq('engineer_id', user.id)
            .eq('status', 'completed')
        ]);
        
        return {
          matches: applications.data?.length || 0,
          activeChats: 0, // TODO: Implement when messages table is available
          completed: completed.data?.length || 0
        };
      } else {
        const [matches, completed] = await Promise.all([
          supabase
            .from('ai_collaboration_matches')
            .select('*')
            .eq('artist_id', user.id),
          supabase
            .from('projects')
            .select('*')
            .eq('client_id', user.id)
            .eq('status', 'completed')
        ]);
        
        return {
          matches: matches.data?.length || 0,
          activeChats: 0, // TODO: Implement when messages table is available
          completed: completed.data?.length || 0
        };
      }
    }
  });
};
