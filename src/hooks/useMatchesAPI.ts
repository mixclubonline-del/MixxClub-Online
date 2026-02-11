/**
 * Unified hook for CRM matching functionality
 * Handles saved matches, match requests, and API integration
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useEngineerMatchingAPI, type MatchCriteria, type EngineerMatch } from './useEngineerMatchingAPI';

export interface SavedMatch {
  id: string;
  matchedUserId: string;
  name: string;
  avatarUrl?: string;
  matchScore: number;
  rating: number;
  specialty: string;
  genres: string[];
  savedAt: Date;
  lastActive?: string;
  notes?: string;
}

export interface MatchRequest {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  senderAvatar?: string;
  recipientName: string;
  recipientAvatar?: string;
  message: string;
  projectType: string;
  budgetRange?: string;
  genres: string[];
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  respondedAt?: Date;
}

export function useMatchesAPI(userType: 'artist' | 'engineer' | 'producer') {
  const narrowType: 'artist' | 'engineer' = userType === 'producer' ? 'artist' : userType;
  const { user } = useAuth();
  const engineerMatching = useEngineerMatchingAPI();
  
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<MatchRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved matches from user_matches table
  const fetchSavedMatches = useCallback(async () => {
    if (!user) return;

    try {
      const { data: matchData, error: matchError } = await supabase
        .from('user_matches')
        .select('*')
        .eq('user_id', user.id)
        .eq('saved', true)
        .order('created_at', { ascending: false });

      if (matchError) throw matchError;

      if (!matchData || matchData.length === 0) {
        setSavedMatches([]);
        return;
      }

      // Fetch profile data for matched users
      const matchedUserIds = matchData.map(m => m.matched_user_id);
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', matchedUserIds);

      const { data: engineerProfiles } = await supabase
        .from('engineer_profiles')
        .select('user_id, specialties, genres, rating')
        .in('user_id', matchedUserIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const engineerMap = new Map(engineerProfiles?.map(e => [e.user_id, e]) || []);

      const formattedMatches: SavedMatch[] = matchData.map(match => {
        const profile = profileMap.get(match.matched_user_id);
        const engineerProfile = engineerMap.get(match.matched_user_id);

        return {
          id: match.id,
          matchedUserId: match.matched_user_id,
          name: profile?.full_name || 'Unknown User',
          avatarUrl: profile?.avatar_url,
          matchScore: match.match_score || 0,
          rating: engineerProfile?.rating || 4.5,
          specialty: Array.isArray(engineerProfile?.specialties) 
            ? engineerProfile.specialties[0] || 'Mixing' 
            : 'Mixing',
          genres: Array.isArray(engineerProfile?.genres) ? engineerProfile.genres : [],
          savedAt: new Date(match.created_at),
          notes: match.match_reason,
        };
      });

      setSavedMatches(formattedMatches);
    } catch (err) {
      console.error('[useMatchesAPI] Error fetching saved matches:', err);
      setError('Failed to load saved matches');
    }
  }, [user]);

  // Fetch match requests
  const fetchMatchRequests = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch incoming requests (where user is recipient)
      const { data: incoming, error: inError } = await supabase
        .from('match_requests')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (inError) throw inError;

      // Fetch outgoing requests (where user is sender)
      const { data: outgoing, error: outError } = await supabase
        .from('match_requests')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (outError) throw outError;

      // Gather all user IDs we need to fetch profiles for
      const allUserIds = new Set<string>();
      incoming?.forEach(r => {
        allUserIds.add(r.sender_id);
        allUserIds.add(r.recipient_id);
      });
      outgoing?.forEach(r => {
        allUserIds.add(r.sender_id);
        allUserIds.add(r.recipient_id);
      });

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(allUserIds));

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const formatRequest = (request: any): MatchRequest => {
        const sender = profileMap.get(request.sender_id);
        const recipient = profileMap.get(request.recipient_id);

        return {
          id: request.id,
          senderId: request.sender_id,
          recipientId: request.recipient_id,
          senderName: sender?.full_name || 'Unknown User',
          senderAvatar: sender?.avatar_url,
          recipientName: recipient?.full_name || 'Unknown User',
          recipientAvatar: recipient?.avatar_url,
          message: request.message || '',
          projectType: request.project_type || 'mixing',
          budgetRange: request.budget_range,
          genres: Array.isArray(request.genres) ? request.genres : [],
          status: request.status,
          createdAt: new Date(request.created_at),
          respondedAt: request.responded_at ? new Date(request.responded_at) : undefined,
        };
      };

      setIncomingRequests((incoming || []).map(formatRequest));
      setOutgoingRequests((outgoing || []).map(formatRequest));
    } catch (err) {
      console.error('[useMatchesAPI] Error fetching match requests:', err);
      setError('Failed to load match requests');
    }
  }, [user]);

  // Load all data
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchSavedMatches(),
        fetchMatchRequests(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchSavedMatches, fetchMatchRequests]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Save a match
  const saveMatch = useCallback(async (matchedUserId: string, matchScore: number = 80) => {
    if (!user) {
      toast.error('Please sign in to save matches');
      return;
    }

    try {
      // Check if match already exists
      const { data: existing } = await supabase
        .from('user_matches')
        .select('id, saved')
        .eq('user_id', user.id)
        .eq('matched_user_id', matchedUserId)
        .maybeSingle();

      if (existing) {
        // Update existing match
        const { error } = await supabase
          .from('user_matches')
          .update({ saved: true })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new match
        const { error } = await supabase
          .from('user_matches')
          .insert({
            user_id: user.id,
            matched_user_id: matchedUserId,
            match_score: matchScore,
            saved: true,
            status: 'pending',
          });

        if (error) throw error;
      }

      toast.success('Match saved!');
      await fetchSavedMatches();
    } catch (err) {
      console.error('[useMatchesAPI] Error saving match:', err);
      toast.error('Failed to save match');
    }
  }, [user, fetchSavedMatches]);

  // Unsave a match
  const unsaveMatch = useCallback(async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('user_matches')
        .update({ saved: false })
        .eq('id', matchId);

      if (error) throw error;

      setSavedMatches(prev => prev.filter(m => m.id !== matchId));
      toast.success('Match removed from saved');
    } catch (err) {
      console.error('[useMatchesAPI] Error unsaving match:', err);
      toast.error('Failed to remove match');
    }
  }, []);

  // Send a match request
  const sendRequest = useCallback(async (
    recipientId: string,
    message: string,
    projectType: string,
    budgetRange?: string,
    genres?: string[]
  ) => {
    if (!user) {
      toast.error('Please sign in to send requests');
      return;
    }

    try {
      const { error } = await supabase
        .from('match_requests')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          message,
          project_type: projectType,
          budget_range: budgetRange,
          genres: genres || [],
          status: 'pending',
        });

      if (error) throw error;

      // Create notification for recipient
      await supabase.from('notifications').insert({
        user_id: recipientId,
        type: 'collaboration_request',
        title: 'New Collaboration Request',
        message: `You have a new ${projectType} request`,
        action_url: `/${userType === 'artist' ? 'engineer' : 'artist'}-crm?tab=matches`,
      });

      toast.success('Request sent!');
      await fetchMatchRequests();
    } catch (err) {
      console.error('[useMatchesAPI] Error sending request:', err);
      toast.error('Failed to send request');
    }
  }, [user, userType, fetchMatchRequests]);

  // Accept a request
  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      const { data: request, error: fetchError } = await supabase
        .from('match_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('match_requests')
        .update({ 
          status: 'accepted', 
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      // Create notification for sender
      await supabase.from('notifications').insert({
        user_id: request.sender_id,
        type: 'request_accepted',
        title: 'Request Accepted! 🎉',
        message: 'Your collaboration request has been accepted',
        action_url: `/messages?contact=${request.recipient_id}`,
      });

      toast.success('Request accepted!');
      await fetchMatchRequests();
    } catch (err) {
      console.error('[useMatchesAPI] Error accepting request:', err);
      toast.error('Failed to accept request');
    }
  }, [fetchMatchRequests]);

  // Decline a request
  const declineRequest = useCallback(async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('match_requests')
        .update({ 
          status: 'declined', 
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Request declined');
      await fetchMatchRequests();
    } catch (err) {
      console.error('[useMatchesAPI] Error declining request:', err);
      toast.error('Failed to decline request');
    }
  }, [fetchMatchRequests]);

  return {
    // From engineerMatching hook
    matches: engineerMatching.matches,
    findMatches: engineerMatching.findMatches,
    hireEngineer: engineerMatching.hireEngineer,
    hiring: engineerMatching.hiring,

    // Saved matches
    savedMatches,
    saveMatch,
    unsaveMatch,

    // Match requests
    incomingRequests,
    outgoingRequests,
    sendRequest,
    acceptRequest,
    declineRequest,

    // State
    loading: loading || engineerMatching.loading,
    error: error || engineerMatching.error,
    refresh: loadAll,
  };
}
