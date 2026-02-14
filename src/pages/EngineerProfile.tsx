import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { User, Star, Music, Calendar, ArrowLeft, Bell, Sparkles } from 'lucide-react';


export default function EngineerProfile() {
  const { userId } = useParams();

  return (
    <>
      <Helmet>
        <title>Engineer Profile | Mixx Club</title>
        <meta name="description" content="View detailed engineer profiles, portfolios, and book mixing & mastering sessions." />
      </Helmet>

      <div className="min-h-screen bg-background">
        
        <main className="container max-w-4xl mx-auto px-4 py-6">
          {/* Back Link */}
          <Link 
            to="/engineers" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Engineers
          </Link>

          {/* Coming Soon Card */}
          <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>

            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Phase 3 Feature
            </Badge>

            <h1 className="text-3xl font-bold mb-4">Engineer Profiles Coming Soon</h1>
            
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              We're building comprehensive engineer profiles with portfolios, reviews, 
              availability calendars, and instant booking. Be the first to know when it launches.
            </p>

            {/* Feature Preview */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <Star className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <p className="text-sm font-medium">Verified Reviews</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <Music className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Audio Portfolios</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="text-sm font-medium">Instant Booking</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/engineers">
                  Browse Available Engineers
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/coming-soon">
                  <Bell className="w-4 h-4 mr-2" />
                  Get Notified
                </Link>
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </>
  );
}
