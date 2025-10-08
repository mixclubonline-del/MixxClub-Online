import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, MessageCircle, Share2, TrendingUp, UserPlus } from "lucide-react";

const SocialFeed = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Social Feed</h1>
          <p className="text-muted-foreground">
            Connect with artists, share your work, and discover new music
          </p>
        </div>

        {/* Coming Soon Notice */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The Social Feed is currently in development. Soon you'll be able to follow artists,
              share your work, and engage with the community.
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold">Backend Infrastructure Ready:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Tables: user_follows, activity_feed, user_posts, post_likes, post_comments</li>
                <li>Edge Function: social-follow</li>
                <li>Activity tracking and notifications</li>
                <li>Follow/unfollow system with privacy controls</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Follow System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="outline">Build Your Network</Badge>
              <p className="text-sm text-muted-foreground">
                Follow your favorite artists, producers, and engineers. See their latest work
                and updates in your personalized feed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Your Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="outline">Get Discovered</Badge>
              <p className="text-sm text-muted-foreground">
                Post your tracks, projects, and achievements. Control visibility with public,
                followers-only, or private sharing options.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="outline">Likes & Comments</Badge>
              <p className="text-sm text-muted-foreground">
                Like, comment, and share posts from your network. Build relationships and
                collaborate with other creators.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="outline">Stay Updated</Badge>
              <p className="text-sm text-muted-foreground">
                See what's happening in your network. Track achievements, new releases,
                collaborations, and community milestones.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Example Post Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Example Post Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Artist Name</span>
                  <Badge variant="secondary" className="text-xs">Pro</Badge>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <p className="text-sm mb-3">
                  Just dropped my latest track! What do you think? 🔥🎵
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Button variant="ghost" size="sm" disabled>
                    <Heart className="mr-1 h-4 w-4" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm" disabled>
                    <MessageCircle className="mr-1 h-4 w-4" />
                    Comment
                  </Button>
                  <Button variant="ghost" size="sm" disabled>
                    <Share2 className="mr-1 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Join the Community</h3>
                <p className="text-sm text-muted-foreground">
                  Start posting and connecting when the social feed launches
                </p>
              </div>
              <Button disabled>
                <Share2 className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialFeed;
