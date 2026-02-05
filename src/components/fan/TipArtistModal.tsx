import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Search, Heart, Loader2, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMixxWallet } from '@/hooks/useMixxWallet';
import { MixxCoin } from '@/components/economy/MixxCoin';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface TipArtistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIP_AMOUNTS = [10, 25, 50, 100, 250];

export function TipArtistModal({ open, onOpenChange }: TipArtistModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<{
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [amount, setAmount] = useState(25);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { totalBalance, spendCoinz, canAfford } = useMixxWallet();

  // Search artists
  const artistsQuery = useQuery({
    queryKey: ['search-artists', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, role')
        .eq('role', 'artist')
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: searchQuery.length >= 2,
  });

  const handleSendTip = async () => {
    if (!selectedArtist) {
      toast.error('Please select an artist');
      return;
    }

    if (!canAfford(amount)) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setIsSending(true);

      await spendCoinz({
        amount,
        source: 'tip',
        description: `Tip to ${selectedArtist.username || selectedArtist.full_name}`,
        referenceType: 'artist_tip',
        referenceId: selectedArtist.id,
      });

      // Create notification for artist (simplified - in production use edge function)
      await supabase.from('notifications').insert({
        user_id: selectedArtist.id,
        type: 'gift',
        title: '💝 You received a tip!',
        message: `Someone sent you ${amount} MixxCoinz${message ? `: "${message}"` : ''}`,
      });

      toast.success(`Sent ${amount} coinz to ${selectedArtist.username || selectedArtist.full_name}!`);
      onOpenChange(false);
      
      // Reset state
      setSelectedArtist(null);
      setAmount(25);
      setMessage('');
      setSearchQuery('');
    } catch (error) {
      toast.error('Failed to send tip');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-pink-400" />
            Tip an Artist
          </DialogTitle>
          <DialogDescription>
            Show support for your favorite artists with MixxCoinz
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Artist Search */}
          {!selectedArtist ? (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {artistsQuery.data && artistsQuery.data.length > 0 && (
                <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                  {artistsQuery.data.map((artist) => (
                    <button
                      key={artist.id}
                      className="w-full p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left"
                      onClick={() => {
                        setSelectedArtist(artist);
                        setSearchQuery('');
                      }}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={artist.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {artist.username ? `@${artist.username}` : artist.full_name}
                        </p>
                        {artist.username && artist.full_name && (
                          <p className="text-xs text-muted-foreground">{artist.full_name}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && artistsQuery.data?.length === 0 && !artistsQuery.isLoading && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No artists found
                </p>
              )}
            </div>
          ) : (
            /* Selected Artist */
            <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedArtist.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedArtist.username ? `@${selectedArtist.username}` : selectedArtist.full_name}
                  </p>
                  <Badge variant="outline" className="text-xs">Artist</Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedArtist(null)}
              >
                Change
              </Button>
            </div>
          )}

          {/* Tip Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tip Amount</label>
            <div className="flex flex-wrap gap-2">
              {TIP_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(preset)}
                  disabled={!canAfford(preset)}
                  className="flex items-center gap-1"
                >
                  <MixxCoin type="earned" size="sm" />
                  {preset}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Your balance:</span>
              <span className="font-medium text-primary">{totalBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message (optional)</label>
            <Textarea
              placeholder="Add a message to your tip..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={2}
            />
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSendTip}
          disabled={!selectedArtist || !canAfford(amount) || isSending}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Heart className="h-4 w-4 mr-2" />
          )}
          Send {amount} Coinz
        </Button>
      </DialogContent>
    </Dialog>
  );
}
