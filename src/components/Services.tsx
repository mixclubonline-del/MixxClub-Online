import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Radio, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const Services = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI-Powered Innovation</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Why We Outperform Every Competitor</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            While others offer either AI-only automation or expensive human-only services, we combine both for unbeatable results. 
            Compare us to LANDR, eMastered, BandLab, or traditional studios - we deliver better quality, faster turnaround, 
            and more features at a fraction of the cost.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border bg-card hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Grammy Engineers + AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Real Grammy-winning engineers enhanced by cutting-edge AI technology
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Human expertise verified by Grammys</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>AI analyzes 1000+ audio parameters</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>10x faster than traditional studios</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Learns from every track processed</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/dashboard">Explore</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Radio className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Live Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Real-time audio streaming and remote engineering
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Real-time Audio Streaming</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Screen Sharing</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Voice Notes</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Session Recording</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/mixing">Explore</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Neural Mastering</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                AI-powered mastering trained on Grammy-winning tracks
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Platform Optimization</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Loudness Standards</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Frequency Analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Dynamic Processing</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/mastering">Explore</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Services;
