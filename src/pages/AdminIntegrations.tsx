import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, Radio, Key, Webhook, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminIntegrations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase.rpc("is_admin", { user_uuid: user.id });
      if (!data) {
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, [user, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API & Integration Framework</h1>
            <p className="text-muted-foreground">Connect to DAWs, streaming platforms, and external services</p>
          </div>
          <Badge variant="outline" className="text-warning border-warning">
            Coming Soon
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="w-5 h-5" />
                DAW Plugins
              </CardTitle>
              <CardDescription>Manage plugin distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Distribute MixClub plugins for Ableton, FL Studio, Logic Pro, and other DAWs.
              </p>
              <Button disabled className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Plugin
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                Streaming Platforms
              </CardTitle>
              <CardDescription>Connect to Spotify, Apple Music</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Enable direct uploads to streaming platforms after mastering completion.
              </p>
              <Button disabled className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Setup Platform
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Webhooks
              </CardTitle>
              <CardDescription>Configure external webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Set up webhooks for external services to receive real-time project updates.
              </p>
              <Button disabled className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feature Roadmap</CardTitle>
            <CardDescription>Planned capabilities for Integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• VST/AU plugin development for DAW integration</li>
              <li>• Direct file import from DAW sessions</li>
              <li>• Spotify for Artists API integration</li>
              <li>• Apple Music Connect integration</li>
              <li>• SoundCloud, YouTube Music, and Tidal connections</li>
              <li>• DistroKid and TuneCore distribution partnerships</li>
              <li>• Custom API endpoints for third-party developers</li>
              <li>• Webhook event system for project lifecycle events</li>
              <li>• OAuth provider setup for external services</li>
              <li>• API key management and rate limiting</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminIntegrations;
