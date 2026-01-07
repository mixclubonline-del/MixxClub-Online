import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { Award, GraduationCap, Trophy, CheckCircle, Bell, Sparkles, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function MyCertifications() {
  return (
    <>
      <Helmet>
        <title>My Certifications | Mixx Club</title>
        <meta name="description" content="Earn and showcase professional certifications in mixing, mastering, and audio engineering." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container max-w-4xl mx-auto px-4 pt-24 pb-16">
          {/* Back Link */}
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Coming Soon Card */}
          <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-amber-500/5 via-background to-primary/5 border-amber-500/20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Award className="w-10 h-10 text-white" />
            </div>

            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Phase 3 Feature
            </Badge>

            <h1 className="text-3xl font-bold mb-4">Certifications Coming Soon</h1>
            
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Complete courses, pass skill assessments, and earn verified certifications 
              that showcase your expertise to artists and labels worldwide.
            </p>

            {/* Feature Preview */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <GraduationCap className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Skill Courses</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium">Verified Badges</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <p className="text-sm font-medium">Profile Showcase</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/tutorials">
                  Explore Tutorials
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
