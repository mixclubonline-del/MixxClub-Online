import { Card, CardContent } from "@/components/ui/card";
import { Wand2, Music2, Radio, Sliders } from "lucide-react";

export const PluginShowcase = () => {
  const tools = [
    {
      category: "DAWs",
      icon: Music2,
      items: ["Pro Tools", "Logic Pro X", "Ableton Live", "FL Studio"]
    },
    {
      category: "Plugins",
      icon: Sliders,
      items: ["Waves Platinum", "FabFilter Pro-Q 3", "iZotope Ozone 10", "Soundtoys 5"]
    },
    {
      category: "Hardware",
      icon: Radio,
      items: ["Universal Audio Apollo", "Neve Preamps", "SSL Compressors", "Neumann Mics"]
    },
    {
      category: "AI Tools",
      icon: Wand2,
      items: ["Neural Mix Pro", "Stem Separation AI", "Auto-Tune AI", "Smart EQ"]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-card to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
      
      <div className="container px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sliders className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Industry-Standard Tools</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            We Use The Same Gear As The Pros
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our engineers work with industry-leading software, hardware, and AI tools trusted by Grammy-winning producers and top studios worldwide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.category} className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{tool.category}</h3>
                  </div>
                  <ul className="space-y-2">
                    {tool.items.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            <span className="font-semibold text-primary">Over $50,000</span> worth of professional audio equipment and software at your fingertips. 
            We invest in the best tools so you don't have to.
          </p>
        </div>
      </div>
    </section>
  );
};
