import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAIProjectRecommendations = () => {
  return useQuery({
    queryKey: ['ai-project-recommendations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id)
        .in('status', ['in_progress', 'pending'])
        .order('deadline', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      
      // Calculate AI scores for each project
      return (projects || []).map(project => {
        const progress = project.progress_percentage || 0;
        const daysUntilDeadline = project.deadline 
          ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 999;
        
        // AI Urgency Calculation
        let urgency: 'high' | 'medium' | 'low' = 'low';
        if (daysUntilDeadline <= 2 || (progress > 70 && daysUntilDeadline <= 5)) {
          urgency = 'high';
        } else if (daysUntilDeadline <= 7 || (progress > 50 && daysUntilDeadline <= 10)) {
          urgency = 'medium';
        }
        
        // Health Score Algorithm
        const timeProgress = daysUntilDeadline > 0 
          ? Math.min(100, ((progress / 100) / (daysUntilDeadline / 30)) * 100)
          : 0;
        const healthScore = Math.round((progress + timeProgress) / 2);
        
        // AI Recommendation Logic
        const aiRecommended = (
          (urgency === 'high' && progress < 90) ||
          (healthScore < 70) ||
          (daysUntilDeadline <= 3 && progress < 80)
        );
        
        // Generate AI Insight
        let aiInsight = '';
        if (aiRecommended && urgency === 'high') {
          aiInsight = `⚠️ Urgent: ${100 - progress}% remaining with ${daysUntilDeadline} day(s) left`;
        } else if (healthScore < 60) {
          aiInsight = `⚡ Project falling behind schedule - consider prioritizing`;
        } else if (progress > 80 && daysUntilDeadline > 5) {
          aiInsight = `🎉 Great progress! On track for early completion`;
        } else {
          aiInsight = `✅ Steady progress - maintain current momentum`;
        }
        
        return {
          name: project.title,
          description: project.description || 'No description',
          progress,
          urgency,
          deadline: daysUntilDeadline <= 0 
            ? 'overdue' 
            : `in ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''}`,
          healthScore,
          aiRecommended,
          aiInsight,
          link: `/artist-crm?tab=active-work&project=${project.id}`
        };
      }).sort((a, b) => {
        // Sort: AI recommended first, then by urgency, then by health score
        if (a.aiRecommended && !b.aiRecommended) return -1;
        if (!a.aiRecommended && b.aiRecommended) return 1;
        
        const urgencyWeight = { high: 3, medium: 2, low: 1 };
        if (urgencyWeight[a.urgency] !== urgencyWeight[b.urgency]) {
          return urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
        }
        
        return a.healthScore - b.healthScore;
      });
    }
  });
};
