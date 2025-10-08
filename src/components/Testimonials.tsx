import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, Play } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Marcus J.",
      role: "Hip-Hop Artist",
      location: "Atlanta, GA",
      rating: 5,
      text: "Mixxclub transformed my bedroom recordings into radio-ready tracks. The engineer understood exactly what I wanted and the AI polish made everything pop. Got my EP done for under $500 - would've cost me $3K+ at a local studio.",
      track: "Lost in the City",
      initials: "MJ"
    },
    {
      name: "Sarah K.",
      role: "Pop Singer-Songwriter",
      location: "Los Angeles, CA",
      rating: 5,
      text: "As an independent artist, budget is everything. Mixxclub's pricing let me afford professional mixing for my whole album. The live collaboration feature is insane - I could hear changes in real-time and give instant feedback. Game changer.",
      track: "Midnight Dreams",
      initials: "SK"
    },
    {
      name: "DJ Chrome",
      role: "Electronic Producer",
      location: "London, UK",
      rating: 5,
      text: "The AI mastering got my tracks Spotify-ready in minutes, and when I needed that extra human touch for my singles, the pro engineers delivered. Best of both worlds. My streams jumped 3x after releasing properly mastered music.",
      track: "Neon Lights Remix",
      initials: "DC"
    },
    {
      name: "Riley M.",
      role: "Rock Band Lead",
      location: "Nashville, TN",
      rating: 5,
      text: "We recorded our debut album in our garage and honestly thought it sounded terrible. Mixxclub's engineers salvaged it and made it sound like we recorded in a million-dollar studio. The stems separation was clutch for getting clean mixes.",
      track: "Electric Storm",
      initials: "RM"
    },
    {
      name: "Alicia R.",
      role: "R&B Vocalist",
      location: "New York, NY",
      rating: 5,
      text: "The 24-hour turnaround on the Professional package saved me when I needed to meet a deadline. Quality didn't suffer at all - my vocals have never sounded this polished. The vocal tuning add-on is worth every penny.",
      track: "Better Days",
      initials: "AR"
    },
    {
      name: "Tyler B.",
      role: "Country Artist",
      location: "Austin, TX",
      rating: 5,
      text: "Started with the Starter package to test it out, ended up upgrading to Professional for my whole album. The engineers really get the nuances of country production. Plus, unlimited revisions meant I could get it exactly right.",
      track: "Backroads",
      initials: "TB"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
      
      <div className="container px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm text-primary font-medium">5-Star Reviews</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Artists Love Their Results
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join 50,000+ independent artists who've elevated their sound with Mixxclub. Real reviews from real musicians.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-border bg-card hover:border-primary/40 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                  <Quote className="w-8 h-8 text-primary/20" />
                </div>

                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  "{testimonial.text}"
                </p>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    Track: <span className="text-foreground font-medium">{testimonial.track}</span>
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs gap-2 hover:text-primary"
                  >
                    <Play className="w-3 h-3" />
                    Listen to Before/After
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-lg">
            <div className="flex -space-x-2">
              {["MJ", "SK", "DC", "RM"].map((initials) => (
                <Avatar key={initials} className="w-8 h-8 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="text-sm">
              <span className="font-semibold text-primary">50,000+</span> artists trust Mixxclub
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
