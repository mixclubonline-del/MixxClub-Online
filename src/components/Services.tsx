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
          <h2 className="text-4xl font-bold mb-4">Your Music, Studio-Quality Sound</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We combine real pro engineers with smart AI tools to give your tracks that radio-ready polish. 
            Whether you need mixing magic, mastering shine, or full production - we've got you covered at prices 
            that won't break the bank.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border bg-card hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Pro Engineers + Smart AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Real musicians with Grammy credits, powered by intelligent tools
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Engineers who've worked on chart hits</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>AI helps dial in your perfect sound</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Get your tracks back in days, not weeks</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Every mix gets better with time</span>
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
              <CardTitle className="text-xl">Live Studio Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Work together like you're both in the studio
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Hear changes as they happen</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Watch the engineer work their magic</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Leave voice notes for revision ideas</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Save every session for later</span>
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
              <CardTitle className="text-xl">Instant Mastering Polish</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                AI trained on hits to make your tracks streaming-ready
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Perfect for Spotify, Apple Music, YouTube</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Radio-ready loudness automatically</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>EQ balanced like the pros do it</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Punch and clarity that pops</span>
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
