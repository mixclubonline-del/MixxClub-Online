import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Share2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import VotingInterface from './VotingInterface';
import PremiereAudioPlayer from './PremiereAudioPlayer';
import { formatDistanceToNow } from 'date-fns';

interface PremiereCardProps {
  premiere: any;
  onUpdate: () => void;
}

export default function PremiereCard({ premiere, onUpdate }: PremiereCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVoting, setShowVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVotes, setUserVotes] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      checkUserVotes();
    }
  }, [user, premiere.id]);

  const checkUserVotes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('premiere_votes')
      .select('*')
      .eq('premiere_id', premiere.id)
      .eq('user_id', user.id);

    if (data && data.length > 0) {
      setHasVoted(true);
      setUserVotes(data);
    }
  };

  const handlePlay = async () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying && user) {
      // Increment play count
      await supabase
        .from('premieres')
        .update({ play_count: premiere.play_count + 1 })
        .eq('id', premiere.id);

      // Update fan stats
      await supabase
        .from('fan_stats')
        .upsert({
          user_id: user.id,
          total_listens: 1
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });
    }
  };

  const handleVote = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on tracks.",
        variant: "destructive",
      });
      return;
    }
    setShowVoting(true);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/premieres/${premiere.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: premiere.title,
          text: `Check out "${premiere.title}" by ${premiere.profiles.display_name}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard.",
      });
    }
  };

  return (
    <>
      <Card className="overflow-hidden bg-card/30 backdrop-blur-sm border-white/10 hover:border-accent/30 transition-all">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            {premiere.artwork_url && (
              <img 
                src={premiere.artwork_url} 
                alt={premiere.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold">{premiere.title}</h3>
                {premiere.status === 'live' && (
                  <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">
                    🔴 LIVE
                  </Badge>
                )}
                {premiere.status === 'scheduled' && (
                  <Badge variant="secondary">
                    ⏰ {formatDistanceToNow(new Date(premiere.premiere_date), { addSuffix: true })}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {premiere.genre && <span className="px-2 py-1 rounded-full bg-accent/10">{premiere.genre}</span>}
                {premiere.bpm && <span>{premiere.bpm} BPM</span>}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-medium text-accent mb-1">
                <Star className="h-4 w-4 fill-accent" />
                <span>{premiere.average_rating?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {premiere.total_votes} votes
              </div>
            </div>
          </div>

          {premiere.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {premiere.description}
            </p>
          )}

          {/* Audio player with waveform */}
          <div className="mb-4">
            <PremiereAudioPlayer
              audioUrl={premiere.audio_url}
              isPlaying={isPlaying}
              onPlayPause={handlePlay}
              playCount={premiere.play_count}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleVote}
              disabled={!user || premiere.status !== 'live'}
              className="flex-1 bg-gradient-to-r from-accent to-accent-blue hover:shadow-[0_0_20px_hsl(var(--accent)/0.5)]"
            >
              <Star className={hasVoted ? "h-4 w-4 mr-2 fill-current" : "h-4 w-4 mr-2"} />
              {hasVoted ? 'Update Vote' : 'Vote'}
            </Button>
            
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {showVoting && (
        <VotingInterface
          premiere={premiere}
          existingVotes={userVotes}
          onClose={() => {
            setShowVoting(false);
            checkUserVotes();
            onUpdate();
          }}
        />
      )}
    </>
  );
}
