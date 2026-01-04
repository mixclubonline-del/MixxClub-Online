import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { 
  Video, 
  Zap, 
  DollarSign, 
  Users, 
  Award,
  TrendingUp,
  Globe,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Briefcase,
  BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { RevenuePreview } from "@/components/home/RevenuePreview";
import { StudioPreview } from "@/components/home/StudioPreview";

export default function ForEngineers() {
  const stats = [
    { value: "$4,200", label: "Avg Monthly Earnings" },
    { value: "10", label: "Revenue Streams" },
    { value: "85%", label: "Max Revenue Split" },
    { value: "2,500+", label: "Engineers Earning" },
  ];

  const tiers = [
    {
      tier: "Bronze",
      split: "70%",
      requirements: ["New engineers", "Basic remote tools"],
      color: "from-orange-600 to-orange-400"
    },
    {
      tier: "Silver", 
      split: "75%",
      requirements: ["3+ months", "4.0+ rating"],
      color: "from-slate-400 to-slate-300"
    },
    {
      tier: "Gold",
      split: "80%",
      requirements: ["6+ months", "4.5+ rating", "20+ projects"],
      color: "from-yellow-600 to-yellow-400"
    },
    {
      tier: "Platinum",
      split: "85%",
      requirements: ["1+ year", "4.8+ rating", "50+ projects"],
      color: "from-purple-600 to-purple-400"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Founding Engineer Banner */}
      <section className="py-4 bg-gradient-to-r from-purple-500/20 via-purple-400/10 to-purple-500/20 border-b border-purple-500/30 mt-16">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left"
          >
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-purple-400" />
              <p className="font-bold text-purple-100">
                ⚡ Founding Engineer Program - First 50 get <span className="text-purple-300">Platinum tier locked forever</span>
              </p>
            </div>
            <Badge className="bg-purple-500/30 text-purple-100 border-purple-400/50 animate-pulse">
              23 spots left
            </Badge>
          </motion.div>
        </div>
      </section>
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 bg-gradient-to-br from-secondary/5 via-background to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--secondary)/0.1),transparent_70%)]" />
        
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <Badge variant="secondary" className="mb-6 text-base px-4 py-2">
            <Sliders className="w-4 h-4 mr-2" />
            For Engineers
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-secondary to-foreground bg-clip-text text-transparent">
            Your Skills Deserve to Be Paid
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform your audio expertise into a thriving business with 10 revenue streams and automatic client matching.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-secondary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/engineer-onboarding">
              <Button size="lg" className="text-lg px-8 bg-secondary hover:bg-secondary/90">
                Start Earning Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/showcase">
              <Button size="lg" variant="outline" className="text-lg px-8">
                See The Technology
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Revenue Streams Preview */}
      <RevenuePreview />

      {/* Studio Preview */}
      <StudioPreview />

      {/* Revenue Tiers Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              Revenue Tiers
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Industry-Leading Splits</h2>
            <p className="text-xl text-muted-foreground">
              Grow your career and increase your earnings
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {tiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 relative overflow-hidden hover:shadow-lg transition-all">
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CRM Preview Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Briefcase className="w-4 h-4 mr-2" />
              Your Business HQ
            </Badge>
            <h2 className="text-4xl font-bold mb-4">This is YOUR Engineer CRM</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to run your audio business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: "Dashboard", description: "Real-time business metrics and earnings" },
              { icon: Users, title: "Clients Hub", description: "Full CRM with deal pipeline" },
              { icon: DollarSign, title: "Revenue Hub", description: "Track all 10 revenue streams" },
              { icon: Video, title: "Sessions", description: "Manage live collaboration sessions" },
              { icon: Globe, title: "Opportunities", description: "Browse and bid on projects" },
              { icon: Award, title: "Growth Hub", description: "Level up with coaching and goals" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                  <feature.icon className="w-10 h-10 text-secondary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        <div className="container mx-auto max-w-4xl">
          <Card className="text-center border-2 border-secondary/20 shadow-xl">
            <CardContent className="pt-12 pb-12">
              <Crown className="w-16 h-16 mx-auto mb-6 text-secondary" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Engineering Career?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of engineers already earning more on MixClub
              </p>
              <Link to="/engineer-onboarding">
                <Button size="lg" className="text-lg px-12 bg-secondary hover:bg-secondary/90">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <div className="mt-8 pt-8 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  No setup fees • Keep 70-85% of earnings • Instant payouts
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
