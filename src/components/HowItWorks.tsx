import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, UserCheck, Radio, Download, Users, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FAQSection } from './seo/FAQSection';

const HowItWorks = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<"artist" | "engineer">("artist");

  const artistSteps = [
    {
      icon: Upload,
      title: "Upload Your Track",
      description: "Drop your audio file and describe what you're looking for. Our AI analyzes your track instantly.",
      time: "2 minutes"
    },
    {
      icon: UserCheck,
      title: "Get Matched with Engineers",
      description: "We match you with verified engineers based on genre expertise, style, and availability.",
      time: "Instant"
    },
    {
      icon: Radio,
      title: "Collaborate in Real-Time",
      description: "Work together in our live studio. Chat, share references, make changes on the fly.",
      time: "1-3 days"
    },
    {
      icon: Download,
      title: "Download Your Hit",
      description: "Get your radio-ready track with unlimited revisions until it's perfect.",
      time: "Done!"
    }
  ];

  const engineerSteps = [
    {
      icon: Users,
      title: "Create Your Profile",
      description: "Showcase your portfolio, certifications, and expertise. Our AI helps optimize your profile.",
      time: "15 minutes"
    },
    {
      icon: UserCheck,
      title: "Get Matched with Artists",
      description: "We send you projects that match your skills and style. You choose what to accept.",
      time: "Ongoing"
    },
    {
      icon: Radio,
      title: "Work Your Magic",
      description: "Use our collaborative tools or your own DAW. Artists see progress in real-time.",
      time: "Flexible"
    },
    {
      icon: TrendingUp,
      title: "Earn 70% Revenue",
      description: "Get paid instantly when projects complete. Build your reputation and grow your business.",
      time: "Same day"
    }
  ];

  const steps = activeView === "artist" ? artistSteps : engineerSteps;

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_70%)]" />
      <div className="container px-6 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">
            How <span className="font-black tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">MIXXCLUB</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A seamless process designed for both artists and engineers. Switch views to see how each side benefits.
          </p>

          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "artist" | "engineer")} className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="artist">I'm an Artist</TabsTrigger>
              <TabsTrigger value="engineer">I'm an Engineer</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card 
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 relative overflow-hidden group hover-scale animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-primary">{step.time}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary mb-2">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-6 inline-block">
              <p className="text-lg mb-4">
                {activeView === "artist" 
                  ? "From rough track to radio-ready in days, not weeks."
                  : "Turn your skills into steady income with fair compensation."}
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {activeView === "artist" ? "Start Your First Project" : "Join as Engineer"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
