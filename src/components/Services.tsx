import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic2, Disc3, Sparkles, Headphones } from "lucide-react";

const services = [
  {
    icon: Mic2,
    title: "Professional Mixing",
    description: "High-quality mixes optimized for any DAW and recording setup. From bedroom to studio quality.",
  },
  {
    icon: Disc3,
    title: "Mastering",
    description: "Polished, commercial-ready sound using industry-standard plugins and techniques.",
  },
  {
    icon: Sparkles,
    title: "AI Enhancement",
    description: "Transform BandLab and bedroom recordings with cutting-edge AI processing.",
  },
  {
    icon: Headphones,
    title: "Live Sessions",
    description: "Real-time collaboration with your engineer. Chat, share files, and get instant feedback.",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-card">
      <div className="container px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to take your music to the next level
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="border-border bg-gradient-to-br from-card to-card/50 hover:border-primary/50 transition-all hover:scale-105 group"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
