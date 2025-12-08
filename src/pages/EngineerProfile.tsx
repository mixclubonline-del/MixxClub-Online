import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import GlobalHeader from '@/components/GlobalHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, Star, Music, DollarSign, Clock, CheckCircle, 
  Headphones, Award, Zap, MessageSquare, Calendar, Send,
  Play, Users, TrendingUp, Shield
} from 'lucide-react';
import { useDemoData } from '@/hooks/useDemoData';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function EngineerProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading } = useDemoData('engineers');
  
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Find the engineer from demo data
  const engineer = useMemo(() => {
    const engineers = data?.engineers || [];
    return engineers.find((e: any) => e.id === userId) || engineers[0];
  }, [data, userId]);

  const handleSendInvite = async () => {
    if (!user) {
      toast.error("Please sign in to send invites");
      navigate("/auth?mode=signup");
      return;
    }

    setSending(true);
    // Simulate sending invite
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);
    setInviteDialogOpen(false);
    toast.success(`Invitation sent to ${engineer?.full_name}!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalHeader />
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="animate-pulse space-y-8">
            <div className="flex gap-6">
              <div className="w-32 h-32 rounded-full bg-muted" />
              <div className="flex-1 space-y-4">
                <div className="h-8 w-64 bg-muted rounded" />
                <div className="h-4 w-48 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!engineer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Engineer Not Found</h1>
          <Button onClick={() => navigate('/engineers')}>Browse Engineers</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{engineer.full_name} — MixClub Engineer</title>
        <meta name="description" content={`${engineer.full_name} - Professional audio engineer specializing in ${engineer.specialties?.join(', ')}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <GlobalHeader />
        
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/engineers')}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Engineers
          </Button>

          {/* Profile Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-6 mb-8"
          >
            {/* Avatar */}
            <Avatar className="w-32 h-32 ring-4 ring-border">
              <AvatarImage src={engineer.avatar_url} alt={engineer.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent-blue text-white text-4xl font-bold">
                {engineer.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{engineer.full_name}</h1>
                {engineer.level >= 3 && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified Pro
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-lg text-yellow-500 mb-3">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold">{engineer.rating?.toFixed(1)}</span>
                <span className="text-muted-foreground">({engineer.completed_projects} projects completed)</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {engineer.genres?.map((genre: string) => (
                  <Badge key={genre} variant="secondary" className="bg-primary/10 text-primary border-0">
                    {genre}
                  </Badge>
                ))}
              </div>

              <p className="text-muted-foreground mb-4">
                {engineer.bio || `Professional audio engineer with ${engineer.years_experience} years of experience specializing in ${engineer.specialties?.join(', ')}.`}
              </p>

              {/* Availability */}
              {engineer.availability_status === 'available' ? (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  <Zap className="w-3 h-3 mr-1" />
                  Available Now
                </Badge>
              ) : engineer.availability_status === 'busy' ? (
                <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  Limited Availability
                </Badge>
              ) : (
                <Badge className="bg-muted text-muted-foreground">
                  Currently Unavailable
                </Badge>
              )}
            </div>

            {/* Action Card */}
            <Card className="w-full md:w-72 bg-card/80 border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Starting at</p>
                  <p className="text-3xl font-bold text-primary">${engineer.hourly_rate}<span className="text-lg font-normal text-muted-foreground">/hr</span></p>
                </div>

                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-primary to-accent-blue hover:opacity-90">
                      <Send className="w-4 h-4 mr-2" />
                      Invite to Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite {engineer.full_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Session</label>
                        <Select value={selectedSession} onValueChange={setSelectedSession}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a session" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">+ Create New Session</SelectItem>
                            <SelectItem value="session-1">Hip-Hop Mix Project</SelectItem>
                            <SelectItem value="session-2">R&B Vocals Session</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Message (optional)</label>
                        <Textarea 
                          placeholder="Tell them about your project..."
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSendInvite} disabled={sending}>
                        {sending ? 'Sending...' : 'Send Invite'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/create-session">
                    <Calendar className="w-4 h-4 mr-2" />
                    Start New Session
                  </Link>
                </Button>

                <Button variant="ghost" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-4 text-center">
                <Music className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{engineer.completed_projects}</p>
                <p className="text-sm text-muted-foreground">Projects Done</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-4 text-center">
                <Clock className="w-5 h-5 text-accent-blue mx-auto mb-2" />
                <p className="text-2xl font-bold">{engineer.years_experience}+</p>
                <p className="text-sm text-muted-foreground">Years Experience</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-4 text-center">
                <Users className="w-5 h-5 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">24h</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs Content */}
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/30">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-primary" />
                    Specialties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {engineer.specialties?.map((specialty: string) => (
                      <Badge key={specialty} variant="outline" className="px-3 py-1">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio">
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary" />
                    Recent Work
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-background/50 hover:bg-background transition-colors">
                        <div className="w-12 h-12 rounded bg-gradient-to-br from-primary/20 to-accent-blue/20 flex items-center justify-center">
                          <Music className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Track {i} - Hip-Hop Mix</p>
                          <p className="text-sm text-muted-foreground">Mixing & Mastering • 2024</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Client Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Marcus J.", rating: 5, comment: "Incredible attention to detail. My track sounds professional now!" },
                      { name: "Sarah T.", rating: 5, comment: "Fast turnaround and great communication. Will work with again." },
                      { name: "DJ Mike", rating: 4, comment: "Solid mixing skills, especially with 808s and bass." },
                    ].map((review, i) => (
                      <div key={i} className="p-4 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.name}</span>
                          <div className="flex text-yellow-500">
                            {[...Array(review.rating)].map((_, j) => (
                              <Star key={j} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment">
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Studio Equipment
                  </CardTitle>
                </CardHeader>
              <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Pro Tools Ultimate',
                      'Universal Audio Apollo',
                      'Waves Complete Bundle',
                      'Neumann U87 Microphone',
                      'SSL Fusion',
                      'Focal Trio6 Monitors'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
