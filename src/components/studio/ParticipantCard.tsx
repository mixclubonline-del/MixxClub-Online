import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Video,
  VideoOff,
  MapPin,
  Wifi,
  Heart,
  ThumbsUp,
  Zap
} from 'lucide-react';
import { useState } from 'react';

interface ParticipantCardProps {
  participant: {
    id: string;
    name: string;
    role: 'artist' | 'engineer';
    location: { city: string; country: string; flag: string };
    activity: string;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
    latency: number;
  };
  onMuteToggle: (id: string) => void;
  onVolumeChange: (id: string, volume: number) => void;
}

const ParticipantCard = ({ participant, onMuteToggle, onVolumeChange }: ParticipantCardProps) => {
  const [volume, setVolume] = useState([80]);
  const [showReactions, setShowReactions] = useState(false);

  const getConnectionColor = (quality: string) => {
    const colors = {
      excellent: 'text-green-500',
      good: 'text-blue-500',
      fair: 'text-yellow-500',
      poor: 'text-red-500'
    };
    return colors[quality as keyof typeof colors] || 'text-gray-500';
  };

  const getConnectionBars = (quality: string) => {
    const bars = {
      excellent: 4,
      good: 3,
      fair: 2,
      poor: 1
    };
    return bars[quality as keyof typeof bars] || 1;
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    onVolumeChange(participant.id, newVolume[0]);
  };

  const reactions = [
    { icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
    { icon: Heart, label: 'Love', color: 'text-red-500' },
    { icon: Zap, label: 'Fire', color: 'text-orange-500' }
  ];

  return (
    <Card className="p-4 bloom-hover transition-all hover:shadow-glow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{participant.name}</h4>
            <Badge 
              variant="secondary" 
              className={participant.role === 'engineer' ? 'bg-primary/20 text-primary' : 'bg-accent-cyan/20 text-accent-cyan'}
            >
              {participant.role}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <MapPin className="w-3 h-3" />
            <span>{participant.location.flag} {participant.location.city}, {participant.location.country}</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 ${participant.isAudioEnabled ? 'bg-green-500' : 'bg-gray-500'} rounded-full pulse-live`}></div>
            <span className="text-muted-foreground italic">{participant.activity}</span>
          </div>
        </div>

        {/* Connection Quality */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-3 rounded-full signal-bar ${
                  i < getConnectionBars(participant.connectionQuality)
                    ? getConnectionColor(participant.connectionQuality)
                    : 'bg-muted'
                }`}
                style={{ animationDelay: `${i * 150}ms`, height: `${(i + 1) * 4}px` }}
              />
            ))}
          </div>
          <span className={`text-xs ${getConnectionColor(participant.connectionQuality)}`}>
            {participant.latency}ms
          </span>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={participant.isAudioEnabled ? 'default' : 'secondary'}
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => onMuteToggle(participant.id)}
          >
            {participant.isAudioEnabled ? (
              <Mic className="w-3.5 h-3.5" />
            ) : (
              <MicOff className="w-3.5 h-3.5" />
            )}
          </Button>

          <div className="flex-1 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">{volume[0]}%</span>
          </div>
        </div>

        {/* Video and Reactions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={participant.isVideoEnabled ? 'default' : 'outline'}
            className="h-8 flex-1 gap-2"
          >
            {participant.isVideoEnabled ? (
              <Video className="w-3.5 h-3.5" />
            ) : (
              <VideoOff className="w-3.5 h-3.5" />
            )}
            Video
          </Button>

          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-2"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              <Heart className="w-3.5 h-3.5" />
            </Button>

            {showReactions && (
              <div className="absolute bottom-full mb-2 right-0 bg-card border rounded-lg p-2 shadow-lg flex gap-1 animate-scale-in z-10">
                {reactions.map((reaction, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <reaction.icon className={`w-4 h-4 ${reaction.color}`} />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ParticipantCard;
