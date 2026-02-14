import { Card } from '@/components/ui/card';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { Award, Users, Headphones, Zap } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { organizationSchema } from '@/lib/seo-schema';

export default function About() {
  return (
    <>
      <SEOHead
        title="About Us - Professional Audio Engineering Platform"
        description="Learn about MixClub's mission to democratize professional audio production. We connect 10,000+ artists with 500+ professional engineers worldwide. 50,000+ projects completed."
        keywords="about mixclub, audio engineering company, music production platform, professional mixing team"
        schema={organizationSchema}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      {/* Hero Section */}
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">About MixClub</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to make professional audio engineering accessible to every artist, 
            anywhere in the world.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To democratize professional audio production by connecting talented artists with 
              world-class engineers through an intuitive platform. We believe great music shouldn't 
              be held back by limited access to professional mixing and mastering services.
            </p>
          </Card>

          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To become the global standard for collaborative audio production, where artists and 
              engineers work together seamlessly regardless of location. We're building the future 
              of music production—one that's transparent, efficient, and artist-first.
            </p>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card className="p-6 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">10,000+</div>
            <div className="text-sm text-muted-foreground">Active Artists</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">500+</div>
            <div className="text-sm text-muted-foreground">Professional Engineers</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">50,000+</div>
            <div className="text-sm text-muted-foreground">Projects Completed</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">Platform Availability</div>
          </Card>
        </div>

        {/* Story */}
        <Card className="p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              MixClub was founded in 2024 by a team of audio engineers and software developers who 
              saw the challenges independent artists face in getting professional-quality production. 
              We experienced firsthand the frustration of finding reliable engineers, managing complex 
              project workflows, and ensuring consistent quality.
            </p>
            <p>
              What started as a simple marketplace has evolved into a comprehensive platform that 
              handles everything from initial project setup to final delivery. We've built tools for 
              real-time collaboration, AI-powered matching, secure payments, and quality assurance—all 
              designed to make the production process as smooth as possible.
            </p>
            <p>
              Today, MixClub serves thousands of artists and engineers worldwide, facilitating millions 
              of dollars in transactions and helping create music that reaches audiences everywhere. 
              We're just getting started.
            </p>
          </div>
        </Card>

        {/* Values */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Quality First</h3>
              <p className="text-muted-foreground">
                Every engineer is vetted, every project is monitored, and every delivery is guaranteed 
                to meet professional standards.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Transparency</h3>
              <p className="text-muted-foreground">
                Clear pricing, honest timelines, and open communication. No hidden fees, no surprises.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Artist Success</h3>
              <p className="text-muted-foreground">
                Your success is our success. We're here to help you create the best version of your music.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
    <PublicFooter />
    </>
  );
}
