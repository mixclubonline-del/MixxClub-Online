import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type FeedItem = {
  id: string;
  title: string;
  description: string | null;
  activity_type: string;
  created_at: string;
};

export const FanFeedHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      if (!user?.id) {
        setFeed([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('activity_feed')
          .select('id, title, description, activity_type, created_at')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setFeed(data || []);
      } catch (error) {
        console.error('Error loading fan feed:', error);
        setFeed([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [user?.id]);

  if (loading) {
    return <div className="h-24 rounded-lg bg-muted animate-pulse" />;
  }

  if (feed.length === 0) {
    return (
      <CharacterEmptyState
        type="feed"
        characterId="nova"
        title="Your Discovery Feed"
        actionLabel="Find Artists to Follow"
        onAction={() => navigate('/sessions')}
      />
    );
  }

  return (
    <div className="space-y-3">
      {feed.map((item) => (
        <Card key={item.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">{item.title}</CardTitle>
              <Badge variant="outline" className="text-[10px]">{item.activity_type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {item.description || 'New community activity'}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
