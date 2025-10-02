import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Send, CheckCircle, Clock, XCircle } from "lucide-react";

// Phase 3: Playlist Pitching & Submission Tools
// This component will be activated when DISTRIBUTION_PLAYLIST_PITCHING_ENABLED is true

export function PlaylistPitching() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submissions = [
    { id: '1', playlist: 'New Music Friday', curator: 'Spotify Editorial', status: 'pending', submittedAt: '2 days ago' },
    { id: '2', playlist: 'Indie Mix', curator: 'Apple Music', status: 'accepted', submittedAt: '1 week ago' },
    { id: '3', playlist: 'Fresh Finds', curator: 'Independent', status: 'rejected', submittedAt: '2 weeks ago' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Playlist Pitching</h2>
          <p className="text-muted-foreground">
            Submit your music to curated playlists and track your submissions
          </p>
        </div>
        <Badge variant="secondary">Phase 3</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Submission Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>New Playlist Submission</CardTitle>
            <CardDescription>
              Submit your track to relevant playlists for consideration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="release">Select Release</Label>
              <Select>
                <SelectTrigger id="release">
                  <SelectValue placeholder="Choose a release" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="release1">My Latest Single</SelectItem>
                  <SelectItem value="release2">Summer Vibes EP</SelectItem>
                  <SelectItem value="release3">Acoustic Sessions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spotify">Spotify</SelectItem>
                  <SelectItem value="apple">Apple Music</SelectItem>
                  <SelectItem value="youtube">YouTube Music</SelectItem>
                  <SelectItem value="tidal">Tidal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="playlist">Playlist Name / Curator</Label>
              <Input id="playlist" placeholder="e.g., New Music Friday" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="curator-email">Curator Email (Optional)</Label>
              <Input id="curator-email" type="email" placeholder="curator@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pitch">Pitch Message</Label>
              <Textarea
                id="pitch"
                placeholder="Tell the curator why your track is a good fit for their playlist..."
                rows={4}
              />
            </div>

            <Button className="w-full" disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit to Playlist'}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submission Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">5</p>
                <p className="text-sm text-muted-foreground">Accepted</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">4</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">3</p>
                <p className="text-sm text-muted-foreground">Declined</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Music className="h-4 w-4" />
                Pro Tips
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Research playlists that match your genre</li>
                <li>• Personalize your pitch message</li>
                <li>• Submit 2-3 weeks before release</li>
                <li>• Follow up professionally if no response</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submission History */}
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>Track your playlist submission status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(submission.status)}
                  <div>
                    <p className="font-medium">{submission.playlist}</p>
                    <p className="text-sm text-muted-foreground">{submission.curator}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{submission.submittedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}