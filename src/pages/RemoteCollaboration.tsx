import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Users, Mic, Share2, MessageSquare, Lock } from "lucide-react";
import Navigation from "@/components/Navigation";
import { isFeatureEnabled } from "@/config/featureFlags";

const RemoteCollaboration = () => {
  const isEnabled = isFeatureEnabled("REMOTE_COLLABORATION_ENABLED");

  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Lock className="h-20 w-20 mx-auto text-muted-foreground" />
            <h1 className="text-4xl font-bold">Remote Collaboration</h1>
            <p className="text-xl text-muted-foreground">
              This feature will unlock when we reach 250 community members!
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Remote Collaboration</h1>
            <p className="text-muted-foreground">
              Work together in real-time from anywhere in the world
            </p>
          </div>
          <Button size="lg">
            <Video className="mr-2 h-5 w-5" />
            Start Session
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Real-Time Video
              </CardTitle>
              <CardDescription>HD video collaboration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crystal clear video with multiple participants for visual collaboration and feedback
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Audio Streaming
              </CardTitle>
              <CardDescription>Low-latency audio</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Professional-grade audio streaming for real-time mixing and production collaboration
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Screen Sharing
              </CardTitle>
              <CardDescription>Share your DAW</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Share your screen to demonstrate techniques, plugins, and workflow in real-time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Live Chat
              </CardTitle>
              <CardDescription>Text communication</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Instant messaging for quick notes, timestamps, and technical details during sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Multi-User Sessions
              </CardTitle>
              <CardDescription>Up to 8 participants</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Collaborate with multiple team members, clients, and engineers simultaneously
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Private & Secure
              </CardTitle>
              <CardDescription>Encrypted sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                End-to-end encrypted WebRTC connections keep your work private and secure
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Join or create collaboration sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active sessions</p>
              <Button className="mt-4">Create Your First Session</Button>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Perfect For</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">🎵 Mixing Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Work with engineers in real-time as they mix your tracks
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎤 Recording Direction</h3>
                <p className="text-sm text-muted-foreground">
                  Direct remote recording sessions with artists and engineers
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎹 Production Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Co-produce tracks with collaborators anywhere in the world
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📚 Teaching & Mentoring</h3>
                <p className="text-sm text-muted-foreground">
                  Provide or receive one-on-one instruction and feedback
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RemoteCollaboration;
