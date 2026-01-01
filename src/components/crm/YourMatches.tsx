import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Loader2, Heart, MessageCircle, Sparkles, RefreshCw, History, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EngineerMatch {
  id: string;
  engineerId: string;
  engineerName: string;
  avatarUrl?: string;
  specialties: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  matchScore: number;
  matchReason?: string;
  aiExplanation?: string;
  saved: boolean;
  status: string;
  createdAt: Date;
}

export const YourMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<EngineerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  const loadMatches = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch matches from database
      const { data: matchData, error } = await supabase
        .from('user_matches')
        .select('*')
        .eq('user_id', user.id)
        .order('match_score', { ascending: false });

      if (error) throw error;

      if (matchData && matchData.length > 0) {
        // Get engineer profile data
        const engineerIds = matchData.map(m => m.matched_user_id);
        const { data: engineers } = await supabase
          .from('engineer_profiles')
          .select(`
            user_id,
            specialties,
            years_experience,
            rating,
            completed_projects,
            hourly_rate
          `)
          .in('user_id', engineerIds);

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', engineerIds);

        const engineerMap = new Map(engineers?.map(e => [e.user_id, e]) || []);
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const formattedMatches: EngineerMatch[] = matchData.map(match => {
          const engineer = engineerMap.get(match.matched_user_id);
          const profile = profileMap.get(match.matched_user_id);
          return {
            id: match.id,
            engineerId: match.matched_user_id,
            engineerName: profile?.full_name || 'Unknown Engineer',
            avatarUrl: profile?.avatar_url,
            specialties: Array.isArray(engineer?.specialties) ? engineer.specialties : [],
            experience: engineer?.years_experience || 0,
            rating: engineer?.rating || 4.5,
            totalReviews: engineer?.completed_projects || 0,
            hourlyRate: engineer?.hourly_rate || 50,
            matchScore: match.match_score || 0,
            matchReason: match.match_reason,
            aiExplanation: match.ai_explanation,
            saved: match.saved || false,
            status: match.status,
            createdAt: new Date(match.created_at),
          };
        });

        setMatches(formattedMatches);
      } else {
        // Try to migrate from localStorage if no database matches
        await migrateFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const migrateFromLocalStorage = async () => {
    if (!user) return;

    try {
      const qualifierData = localStorage.getItem('qualifierData');
      if (!qualifierData) return;

      const data = JSON.parse(qualifierData);
      if (!data.matchedEngineers || data.matchedEngineers.length === 0) return;

      // Run fresh matching and save to database
      await runMatching(data);
      
      // Clear localStorage after successful migration
      localStorage.removeItem('qualifierData');
      toast.success('Matches imported successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  const runMatching = async (data: any) => {
    if (!user) return;

    try {
      setRefreshing(true);
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('match-engineers', {
        body: {
          budgetRange: data.budget,
          genres: [data.genre],
          projectType: data.projectType,
        },
        headers: session?.session ? { Authorization: `Bearer ${session.session.access_token}` } : {},
      });

      if (response.data?.matches) {
        // Save matches to database
        const matchInserts = response.data.matches.map((m: any) => ({
          user_id: user.id,
          matched_user_id: m.engineerId,
          match_score: m.matchScore,
          match_reason: `Genre match: ${m.matchingGenres?.join(', ') || 'Various'}`,
          ai_explanation: `This engineer specializes in ${m.specialties?.join(', ')} with a ${m.rating?.toFixed(1)} rating.`,
          status: 'pending',
          match_criteria: { budget: data.budget, genre: data.genre, projectType: data.projectType },
        }));

        const { error } = await supabase
          .from('user_matches')
          .upsert(matchInserts, { onConflict: 'user_id,matched_user_id' });

        if (error) throw error;

        // Reload matches from database
        await loadMatches();
        toast.success('Found new matches!');
      }
    } catch (error) {
      console.error('Error running matching:', error);
      toast.error('Failed to find matches');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleSaveEngineer = async (matchId: string, currentSaved: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_matches')
        .update({ saved: !currentSaved })
        .eq('id', matchId);

      if (error) throw error;

      setMatches(prev => prev.map(m => 
        m.id === matchId ? { ...m, saved: !currentSaved } : m
      ));

      toast.success(currentSaved ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error saving engineer:', error);
      toast.error('Failed to update favorite');
    }
  };

  const handleContactEngineer = async (match: EngineerMatch) => {
    if (!user) return;

    try {
      // Update match status to contacted
      await supabase
        .from('user_matches')
        .update({ status: 'contacted', contacted_at: new Date().toISOString() })
        .eq('id', match.id);

      // Log activity
      await supabase.from('activity_feed').insert({
        user_id: user.id,
        activity_type: 'collab',
        title: `Started project with ${match.engineerName}`,
        description: 'New collaboration initiated',
        is_public: true,
        metadata: { engineer_id: match.engineerId },
      });

      navigate(`/artist-crm?tab=projects&action=new&engineer=${match.engineerId}`);
    } catch (error) {
      console.error('Error contacting engineer:', error);
    }
  };

  const handleRefreshMatches = () => {
    const qualifierData = localStorage.getItem('qualifierData');
    if (qualifierData) {
      runMatching(JSON.parse(qualifierData));
    } else {
      toast.info('Complete the smart qualifier to find new matches');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Loading your matches...</p>
      </div>
    );
  }

  const activeMatches = matches.filter(m => m.status !== 'rejected');
  const savedMatches = matches.filter(m => m.saved);

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 mx-auto mb-6 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No matches yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Complete the smart qualifier to find engineers perfect for your sound. Our AI will match you based on genre, budget, and style.
        </p>
        <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-primary to-purple-600">
          <Sparkles className="w-4 h-4 mr-2" />
          Find Your Match
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Your Engineer Matches
          </h2>
          <p className="text-muted-foreground mt-1">
            {activeMatches.length} engineers matched to your sound
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowHistory(!showHistory)}
            className={cn(showHistory && "border-primary")}
          >
            <History className="w-4 h-4 mr-2" />
            {savedMatches.length} Saved
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefreshMatches}
            disabled={refreshing}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid gap-6">
          {(showHistory ? savedMatches : activeMatches).map((engineer, idx) => (
            <motion.div
              key={engineer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-6 hover:border-primary/50 transition-all group">
                <div className="flex items-start gap-6 flex-wrap md:flex-nowrap">
                  <Avatar className="w-24 h-24 flex-shrink-0">
                    <AvatarImage src={engineer.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-2xl">
                      {engineer.engineerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-2xl font-bold">{engineer.engineerName}</h3>
                          <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30">
                            {engineer.matchScore}% Match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{engineer.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {engineer.totalReviews} projects
                          </span>
                          {engineer.experience > 0 && (
                            <Badge variant="outline">{engineer.experience}+ years</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className="text-3xl font-bold">${engineer.hourlyRate}</p>
                        <p className="text-sm text-muted-foreground">per track</p>
                      </div>
                    </div>

                    {/* AI Explanation */}
                    {engineer.aiExplanation && (
                      <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{engineer.aiExplanation}</p>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-2">
                        {engineer.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {engineer.matchReason && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          {engineer.matchReason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 flex-wrap">
                      <Button 
                        onClick={() => handleContactEngineer(engineer)}
                        className="flex-1 min-w-[200px] bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Project
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleSaveEngineer(engineer.id, engineer.saved)}
                        className={cn(
                          "transition-colors",
                          engineer.saved && "border-primary bg-primary/10"
                        )}
                      >
                        <Heart 
                          className={cn(
                            "w-4 h-4",
                            engineer.saved && "fill-primary text-primary"
                          )} 
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};
