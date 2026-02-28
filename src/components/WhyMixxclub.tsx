import { Shield, Sparkles, DollarSign, Radio, CheckCircle, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

const WhyMixClub = () => {
  const features = [
    {
      icon: Users,
      title: "Real Engineers, Not Just AI",
      description: "Every track is handled by verified engineers at all experience levels. From rising talent to studio veterans, find the right match for your budget and vision.",
      badge: "Human Touch"
    },
    {
      icon: Sparkles,
      title: "AI-Enhanced Workflow",
      description: "Our AI handles the tedious work—file prep, analysis, suggestions—so engineers focus on the creative magic.",
      badge: "Best of Both"
    },
    {
      icon: DollarSign,
      title: "Fair Revenue Sharing",
      description: "Engineers keep 70% of every project. That's 2-3x more than industry standard. Happy engineers = better results.",
      badge: "70% Split"
    },
    {
      icon: Radio,
      title: "Real-Time Collaboration",
      description: "No more email chains and file attachments. Work together live with instant feedback and changes.",
      badge: "Live Sessions"
    },
    {
      icon: CheckCircle,
      title: "Quality Guarantee",
      description: "Unlimited revisions until you're 100% satisfied. Your success is our success.",
      badge: "Guaranteed"
    },
    {
      icon: Shield,
      title: "Secure & Protected",
      description: "Payment protection, NDA support, and secure file handling. Your music and money are safe.",
      badge: "SSL Secured"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
      <div className="container px-6 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <Badge variant="outline" className="mb-4 border-primary text-primary font-black tracking-wider">
            Why Choose MIXXCLUB
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            We're Not Like{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Other Platforms
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Traditional studios are expensive. Freelance sites are hit-or-miss. 
            AI-only tools sound robotic. We combined the best of all worlds.
          </p>
        </div>

        <div className="mt-12 text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              The Full Spectrum Advantage
            </span>
          </h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Unlike Musiversal's exclusive model, we give you choice. Need an affordable mix from a talented newcomer? 
            Or a premium veteran engineer? You decide. Every engineer is verified, rated, and AI-matched to your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary transition-all duration-300 hover-scale animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {feature.badge}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Engineer Availability</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">48hr</div>
              <div className="text-sm text-muted-foreground">Average Turnaround</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyMixClub;
