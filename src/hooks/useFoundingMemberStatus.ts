import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FoundingMemberStatus {
  isFoundingMember: boolean;
  tier: 'artist' | 'engineer' | null;
  badge: string | null;
  benefits: string[];
  position: number | null;
  spotsRemaining: {
    artist: number;
    engineer: number;
  };
}

const FOUNDING_LIMITS = {
  artist: 100,
  engineer: 50,
};

const FOUNDING_BENEFITS = {
  artist: [
    "Lifetime 20% discount on all services",
    "Exclusive 'Founding Artist' badge",
    "Priority matching with engineers",
    "Early access to new features",
    "Private community access",
  ],
  engineer: [
    "Permanent Platinum tier locked",
    "Exclusive 'Founding Engineer' badge",
    "Priority in matching for 6 months",
    "Featured profile placement",
    "Early access to new tools",
  ],
};

export const useFoundingMemberStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<FoundingMemberStatus>({
    isFoundingMember: false,
    tier: null,
    badge: null,
    benefits: [],
    position: null,
    spotsRemaining: {
      artist: FOUNDING_LIMITS.artist,
      engineer: FOUNDING_LIMITS.engineer,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true);

      try {
        // Get total counts for each role
        const [artistsResult, engineersResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'artist'),
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'engineer'),
        ]);

        const totalArtists = artistsResult.count || 0;
        const totalEngineers = engineersResult.count || 0;

        const spotsRemaining = {
          artist: Math.max(0, FOUNDING_LIMITS.artist - totalArtists),
          engineer: Math.max(0, FOUNDING_LIMITS.engineer - totalEngineers),
        };

        if (!user) {
          setStatus({
            isFoundingMember: false,
            tier: null,
            badge: null,
            benefits: [],
            position: null,
            spotsRemaining,
          });
          return;
        }

        // Get user's profile and position
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, created_at')
          .eq('id', user.id)
          .single();

        if (!profile) {
          setStatus(prev => ({ ...prev, spotsRemaining }));
          return;
        }

        const userRole = profile.role as 'artist' | 'engineer' | 'user';
        
        if (userRole !== 'artist' && userRole !== 'engineer') {
          setStatus(prev => ({ ...prev, spotsRemaining }));
          return;
        }

        // Get user's position (how many users of same role signed up before them)
        const { count: position } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', userRole)
          .lt('created_at', profile.created_at);

        const userPosition = (position || 0) + 1;
        const limit = FOUNDING_LIMITS[userRole];
        const isFoundingMember = userPosition <= limit;

        setStatus({
          isFoundingMember,
          tier: isFoundingMember ? userRole : null,
          badge: isFoundingMember 
            ? userRole === 'artist' 
              ? 'Founding Artist' 
              : 'Founding Engineer'
            : null,
          benefits: isFoundingMember ? FOUNDING_BENEFITS[userRole] : [],
          position: isFoundingMember ? userPosition : null,
          spotsRemaining,
        });
      } catch (error) {
        console.error("Error fetching founding member status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  return { ...status, isLoading };
};

// Hook for displaying founding member info on landing pages (no auth required)
export const useFoundingSpotsRemaining = () => {
  const [spots, setSpots] = useState({ artist: 100, engineer: 50 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const [artistsResult, engineersResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'artist'),
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'engineer'),
        ]);

        setSpots({
          artist: Math.max(0, FOUNDING_LIMITS.artist - (artistsResult.count || 0)),
          engineer: Math.max(0, FOUNDING_LIMITS.engineer - (engineersResult.count || 0)),
        });
      } catch (error) {
        console.error("Error fetching spots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpots();
  }, []);

  return { spots, isLoading };
};
