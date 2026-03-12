import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserPlus, MessageCircle, Star, Award, Music,
  CheckCircle, Clock, Users, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NetworkingSectionProps {
  userType: 'artist' | 'engineer' | 'producer';
  searchQuery: string;
}

interface Connection {
  id: string;
  name: string;
  avatar: string;
  role: 'artist' | 'engineer';
  genres: string[];
  rating: number;
  projectsCompleted: number;
  status: 'connected' | 'pending' | 'suggested';
  verified: boolean;
  matchScore?: number;
}

export const NetworkingSection: React.FC<NetworkingSectionProps> = ({ userType, searchQuery }) => {
  const [connections] = useState<Connection[]>([
    {
      id: '1',
      name: 'SonicWave',
      avatar: '',
      role: 'engineer',
      genres: ['Hip-Hop', 'Trap', 'R&B'],
      rating: 4.9,
      projectsCompleted: 156,
      status: 'connected',
      verified: true,
    },
    {
      id: '2',
      name: 'BeatMaster',
      avatar: '',
      role: 'artist',
      genres: ['Pop', 'Electronic'],
      rating: 4.8,
      projectsCompleted: 89,
      status: 'connected',
      verified: true,
    },
    {
      id: '3',
      name: 'ProProducer',
      avatar: '',
      role: 'engineer',
      genres: ['Rock', 'Indie'],
      rating: 4.7,
      projectsCompleted: 234,
      status: 'pending',
      verified: true,
    },
    {
      id: '4',
      name: 'VocalQueen',
      avatar: '',
      role: 'artist',
      genres: ['R&B', 'Soul'],
      rating: 4.6,
      projectsCompleted: 45,
      status: 'suggested',
      verified: false,
      matchScore: 92,
    },
    {
      id: '5',
      name: 'MixMaster',
      avatar: '',
      role: 'engineer',
      genres: ['Hip-Hop', 'Jazz'],
      rating: 4.9,
      projectsCompleted: 312,
      status: 'suggested',
      verified: true,
      matchScore: 88,
    },
    {
      id: '6',
      name: 'TrapKing',
      avatar: '',
      role: 'artist',
      genres: ['Trap', 'Drill'],
      rating: 4.5,
      projectsCompleted: 67,
      status: 'suggested',
      verified: false,
      matchScore: 85,
    },
  ]);

  const filteredConnections = connections.filter(conn =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const connected = filteredConnections.filter(c => c.status === 'connected');
  const pending = filteredConnections.filter(c => c.status === 'pending');
  const suggested = filteredConnections.filter(c => c.status === 'suggested');

  const ConnectionCard: React.FC<{ connection: Connection; index: number }> = ({ connection, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-card/50 border-border/50 p-4 hover:border-primary/50 transition-all">
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14">
            <AvatarImage src={connection.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">
              {connection.name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground truncate">{connection.name}</span>
              {connection.verified && <Award className="w-4 h-4 text-blue-400 flex-shrink-0" />}
              {connection.matchScore && (
                <Badge className="bg-green-500/20 text-green-400 text-xs flex-shrink-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {connection.matchScore}% Match
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Badge variant="outline" className="text-xs capitalize">
                {connection.role}
              </Badge>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {connection.rating}
              </span>
              <span className="flex items-center gap-1">
                <Music className="w-3 h-3" />
                {connection.projectsCompleted} projects
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {connection.genres.map(genre => (
                <Badge key={genre} variant="secondary" className="text-xs bg-muted/50">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {connection.status === 'connected' ? (
              <>
                <Button size="sm" variant="outline" className="gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Message
                </Button>
                <Badge className="bg-green-500/20 text-green-400 justify-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </>
            ) : connection.status === 'pending' ? (
              <>
                <Button size="sm" variant="outline" disabled className="gap-1">
                  <Clock className="w-3 h-3" />
                  Pending
                </Button>
                <Button size="sm" variant="ghost" className="text-red-400">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" className="gap-1">
                  <UserPlus className="w-3 h-3" />
                  Connect
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Message
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{connected.length}</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card/50 border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card/50 border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{suggested.length}</p>
              <p className="text-xs text-muted-foreground">Suggested</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card/50 border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-xs text-muted-foreground">Active Chats</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Connection Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="bg-background/50 border border-border/50">
          <TabsTrigger value="all">All ({filteredConnections.length})</TabsTrigger>
          <TabsTrigger value="connected">Connected ({connected.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="suggested">Suggested ({suggested.length})</TabsTrigger>
        </TabsList>

        <div className="mt-4 space-y-3">
          <TabsContent value="all" className="mt-0 space-y-3">
            {filteredConnections.map((conn, i) => (
              <ConnectionCard key={conn.id} connection={conn} index={i} />
            ))}
          </TabsContent>

          <TabsContent value="connected" className="mt-0 space-y-3">
            {connected.map((conn, i) => (
              <ConnectionCard key={conn.id} connection={conn} index={i} />
            ))}
          </TabsContent>

          <TabsContent value="pending" className="mt-0 space-y-3">
            {pending.map((conn, i) => (
              <ConnectionCard key={conn.id} connection={conn} index={i} />
            ))}
          </TabsContent>

          <TabsContent value="suggested" className="mt-0 space-y-3">
            {suggested.map((conn, i) => (
              <ConnectionCard key={conn.id} connection={conn} index={i} />
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
