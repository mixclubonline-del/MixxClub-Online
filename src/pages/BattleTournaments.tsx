import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Calendar, DollarSign, Sparkles, Lock } from "lucide-react";
import { useBattleTournaments, useJoinTournament } from "@/hooks/useBattleTournaments";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { isFeatureEnabled } from "@/config/featureFlags";

const BattleTournaments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: tournaments, isLoading } = useBattleTournaments();
  const joinTournament = useJoinTournament();
  const [activeTab, setActiveTab] = useState("upcoming");

  const featureUnlocked = isFeatureEnabled('MIX_BATTLES_ARENA_ENABLED');

  const handleJoin = (tournamentId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    joinTournament.mutate({ tournamentId, userId: user.id });
  };

  if (!featureUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-3xl">Battle Tournaments</CardTitle>
              <CardDescription>
                This feature unlocks when the community reaches 100 members!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Join our growing community to unlock competitive mixing tournaments,
                AI-powered matchmaking, and exciting prizes.
              </p>
              <Button onClick={() => navigate("/auth?signup=true")} size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Join MixClub
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredTournaments = tournaments?.filter(t => t.status === activeTab) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-2">
            <Trophy className="w-3 h-3 mr-1" />
            Tier 1 Unlocked
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Mix Battle Tournaments</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compete against the best audio engineers, showcase your skills, and win prizes
          </p>
        </div>

        {/* Tournaments List */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTournaments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No {activeTab} tournaments at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTournaments.map((tournament) => (
                  <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl">{tournament.tournament_name}</CardTitle>
                        <Badge variant={tournament.status === 'active' ? 'default' : 'secondary'}>
                          {tournament.status}
                        </Badge>
                      </div>
                      <CardDescription className="capitalize">
                        {tournament.tournament_type} Tournament
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-muted-foreground">
                            <Users className="w-4 h-4 mr-2" />
                            Participants
                          </span>
                          <span className="font-medium">
                            {tournament.current_participants}/{tournament.max_participants}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-muted-foreground">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Prize Pool
                          </span>
                          <span className="font-medium text-primary">
                            ${tournament.prize_pool}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            Starts
                          </span>
                          <span className="font-medium">
                            {new Date(tournament.start_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {tournament.status === 'upcoming' && (
                        <Button
                          className="w-full"
                          onClick={() => handleJoin(tournament.id)}
                          disabled={tournament.current_participants >= tournament.max_participants}
                        >
                          {tournament.current_participants >= tournament.max_participants
                            ? "Tournament Full"
                            : "Join Tournament"}
                        </Button>
                      )}
                      {tournament.status === 'active' && (
                        <Button className="w-full" variant="outline">
                          View Bracket
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BattleTournaments;
