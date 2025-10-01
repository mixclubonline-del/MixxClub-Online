import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { 
  Video, 
  Mic, 
  Zap, 
  DollarSign, 
  Users, 
  Award,
  TrendingUp,
  Globe,
  MessageSquare,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function ForEngineers() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            The Only Remote Music Production Platform You'll Ever Need
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join 2,500+ engineers earning 70-85% revenue splits in our complete ecosystem.
            Work remotely, collaborate live, and never leave our platform.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {[
              { icon: Globe, text: "Never Leave Platform" },
              { icon: Video, text: "Remote Collaboration" },
              { icon: Zap, text: "AI-Powered Tools" },
              { icon: DollarSign, text: "70-85% Revenue" }
            ].map((item, i) => (
              <Card key={i} className="p-4 border-primary/20 hover:border-primary/40 transition-colors">
                <item.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{item.text}</p>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to="/engineer-onboarding">Start Earning Today</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link to="/engineers">View Engineer Directory</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Complete Ecosystem Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-4">Complete Integrated Workflow</h2>
          <p className="text-xl text-center text-muted-foreground mb-12">
            Everything you need, all in one place. No switching between tools, no external platforms required.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Video,
                title: "Remote Collaboration Studio",
                description: "Work live with artists anywhere in the world. Video, audio, chat - all integrated seamlessly."
              },
              {
                icon: Zap,
                title: "AI + Human Hybrid Approach",
                description: "Leverage cutting-edge AI tools while maintaining full artistic control. Transform bedroom recordings to billboard quality."
              },
              {
                icon: Users,
                title: "Automatic Client Matching",
                description: "Our algorithm connects you with perfect projects. No more hunting for clients - they come to you."
              },
              {
                icon: MessageSquare,
                title: "Integrated Communication",
                description: "Chat, voice, video calls, file sharing - everything built-in. Collaborate in real-time without leaving the platform."
              },
              {
                icon: DollarSign,
                title: "Instant Payments",
                description: "Get paid immediately through our automated system. No invoicing, no chasing payments."
              },
              {
                icon: Award,
                title: "Performance-Based Bonuses",
                description: "Earn extra for platform usage, quality work, speed, and collaboration. Top performers earn up to 85% splits."
              }
            ].map((feature, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Tiers Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-4">Industry-Leading Revenue Splits</h2>
          <p className="text-xl text-center text-muted-foreground mb-12">
            Grow your career and increase your earnings with our tier-based system
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                tier: "Bronze",
                split: "70%",
                requirements: ["New engineers", "Basic remote tools"],
                color: "from-orange-600 to-orange-400"
              },
              {
                tier: "Silver", 
                split: "75%",
                requirements: ["3+ months", "4.0+ rating", "Advanced collaboration"],
                color: "from-slate-400 to-slate-300"
              },
              {
                tier: "Gold",
                split: "80%",
                requirements: ["6+ months", "4.5+ rating", "20+ projects", "Full platform access"],
                color: "from-yellow-600 to-yellow-400"
              },
              {
                tier: "Platinum",
                split: "85%",
                requirements: ["1+ year", "4.8+ rating", "50+ projects", "Exclusive features"],
                color: "from-purple-600 to-purple-400"
              }
            ].map((tier, i) => (
              <Card key={i} className="p-6 relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${tier.color}`} />
                <h3 className="text-2xl font-bold mb-2 mt-2">{tier.tier}</h3>
                <div className="text-4xl font-bold text-primary mb-4">{tier.split}</div>
                <ul className="space-y-2">
                  {tier.requirements.map((req, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <Card className="mt-8 p-8 bg-primary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              Extra Platform Bonuses
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Remote Collaboration Bonus</p>
                  <p className="text-sm text-muted-foreground">+$50 per live session</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Platform Completion Bonus</p>
                  <p className="text-sm text-muted-foreground">+5% for 100% on-platform work</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Quality Excellence</p>
                  <p className="text-sm text-muted-foreground">+$100 for 5-star ratings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Speed Achievement</p>
                  <p className="text-sm text-muted-foreground">+$25 for early delivery</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">Why Engineers Choose MixClub</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Mic className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-3">For Home Studio Engineers</h3>
              <p className="text-muted-foreground">
                Stop juggling 5 different platforms. Everything you need is here - find clients, collaborate, and get paid.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-3">For Professional Engineers</h3>
              <p className="text-muted-foreground">
                Streamline your workflow and increase earnings with our integrated ecosystem and premium tools.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Globe className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-3">Work From Anywhere</h3>
              <p className="text-muted-foreground">
                Connect with artists worldwide. All you need is an internet connection and your expertise.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Engineering Career?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of engineers already earning more and working smarter on our platform
          </p>
          <Button size="lg" className="text-lg px-12" asChild>
            <Link to="/engineer-onboarding" className="inline-flex items-center gap-2">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}