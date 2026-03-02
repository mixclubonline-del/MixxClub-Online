import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type Day1Record = {
  id: string;
  artist_id: string;
  recognition_tier: string;
  followed_at: string;
};

export const FanDay1sHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [day1s, setDay1s] = useState<Day1Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDay1s = async () => {
      if (!user?.id) {
        setDay1s([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('artist_day1s')
          .select('id, artist_id, recognition_tier, followed_at')
          .eq('fan_id', user.id)
          .order('followed_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setDay1s(data || []);
      } catch (error) {
        console.error('Error loading day1 artists:', error);
        setDay1s([]);
      } finally {
        setLoading(false);
      }
    };

    loadDay1s();
  }, [user?.id]);

  if (loading) {
    return <div className="h-24 rounded-lg bg-muted animate-pulse" />;
  }

  if (day1s.length === 0) {
    return (
      <CharacterEmptyState
        type="favorites"
        characterId="nova"
        title="Your Day 1 Artists"
        message="Support artists early and earn your Day 1 badge when they blow up."
        actionLabel="Discover Rising Artists"
        onAction={() => navigate('/for-artists')}
      />
    );
  }

  return (
    <div className="space-y-3">
      {day1s.map((record) => (
        <Card key={record.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">Artist {record.artist_id.slice(0, 8)}</CardTitle>
              <Badge variant="secondary" className="text-[10px] capitalize">{record.recognition_tier}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Followed on {new Date(record.followed_at).toLocaleDateString()}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
