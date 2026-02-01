import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Music, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFlowNavigation } from "@/core/fabric/useFlow";
import { FollowersList } from "./FollowersList";
import { useSocialGraph } from "@/hooks/useSocialGraph";

interface ProfileNetworkSectionProps {
  userId: string;
  followerCount?: number;
  followingCount?: number;
}

interface Collaborator {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
  project_count: number;
}

export function ProfileNetworkSection({ 
  userId, 
  followerCount = 0, 
  followingCount = 0 
}: ProfileNetworkSectionProps) {
  const { navigateTo } = useFlowNavigation();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  // Use social graph for followers/following
  const { 
    followers, 
    isLoadingFollowers, 
    following, 
    isLoadingFollowing 
  } = useSocialGraph(userId);

  // Fetch collaborators (people they've worked with on projects)
  const { data: collaborators, isLoading: loadingCollaborators } = useQuery({
    queryKey: ["collaborators", userId],
    queryFn: async () => {
      // Get projects where this user is either client or engineer
      const { data: projects } = await supabase
        .from("projects")
        .select(`
          client_id,
          engineer_id,
          client:profiles!projects_client_id_fkey(id, full_name, username, avatar_url, role),
          engineer:profiles!projects_engineer_id_fkey(id, full_name, username, avatar_url, role)
        `)
        .or(`client_id.eq.${userId},engineer_id.eq.${userId}`)
        .limit(50);

      if (!projects) return [];

      // Extract unique collaborators
      const collaboratorMap = new Map<string, Collaborator>();
      
      projects.forEach(p => {
        // If user is client, add engineer as collaborator
        if (p.client_id === userId && p.engineer && typeof p.engineer === 'object' && !Array.isArray(p.engineer) && 'id' in p.engineer) {
          const eng = p.engineer as { id: string; full_name: string | null; username: string | null; avatar_url: string | null; role: string | null };
          const existing = collaboratorMap.get(eng.id);
          if (existing) {
            existing.project_count += 1;
          } else {
            collaboratorMap.set(eng.id, {
              id: eng.id,
              full_name: eng.full_name,
              username: eng.username,
              avatar_url: eng.avatar_url,
              role: eng.role,
              project_count: 1,
            });
          }
        }
        // If user is engineer, add client as collaborator
        if (p.engineer_id === userId && p.client && typeof p.client === 'object' && !Array.isArray(p.client) && 'id' in p.client) {
          const cli = p.client as { id: string; full_name: string | null; username: string | null; avatar_url: string | null; role: string | null };
          const existing = collaboratorMap.get(cli.id);
          if (existing) {
            existing.project_count += 1;
          } else {
            collaboratorMap.set(cli.id, {
              id: cli.id,
              full_name: cli.full_name,
              username: cli.username,
              avatar_url: cli.avatar_url,
              role: cli.role,
              project_count: 1,
            });
          }
        }
      });

      return Array.from(collaboratorMap.values())
        .sort((a, b) => b.project_count - a.project_count)
        .slice(0, 12);
    },
    enabled: !!userId,
  });

  const getInitials = (name?: string | null) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setShowFollowers(true)}
        >
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{followerCount}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setShowFollowing(true)}
        >
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{followingCount}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </CardContent>
        </Card>
      </div>

      {/* Collaborators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Music className="h-5 w-5" />
            Collaborators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCollaborators ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !collaborators || collaborators.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No collaborations yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Work on projects to build your network
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {collaborators.map((collab) => (
                <button
                  key={collab.id}
                  onClick={() => collab.username && navigateTo(`/u/${collab.username}`)}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors text-center"
                >
                  <Avatar className="h-12 w-12 mb-2">
                    <AvatarImage src={collab.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(collab.full_name)}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm truncate w-full">
                    {collab.full_name || collab.username || "Unknown"}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {collab.project_count} project{collab.project_count !== 1 ? "s" : ""}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Followers Modal */}
      <FollowersList
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
        users={followers || []}
        isLoading={isLoadingFollowers}
      />

      {/* Following Modal */}
      <FollowersList
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
        users={following || []}
        isLoading={isLoadingFollowing}
      />
    </div>
  );
}
