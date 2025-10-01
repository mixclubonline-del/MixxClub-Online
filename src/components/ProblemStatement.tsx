import { AlertCircle, TrendingDown, Clock, DollarSign } from "lucide-react";
import { Card } from "./ui/card";

const ProblemStatement = () => {
  const problems = [
    {
      icon: DollarSign,
      title: "Studio Sessions Cost a Fortune",
      description: "Pro studio time runs $50-200/hour. Most tracks need 10+ hours."
    },
    {
      icon: TrendingDown,
      title: "DIY Mixes Sound Amateur",
      description: "Your track sounds great in headphones but terrible everywhere else."
    },
    {
      icon: Clock,
      title: "Finding Good Engineers Takes Forever",
      description: "Weeks of searching, demos, and negotiations. Most are already booked."
    },
    {
      icon: AlertCircle,
      title: "No Way to Know If You'll Click",
      description: "You invest time and money with no guarantee they'll understand your vision."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
      <div className="container px-6 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">
            Traditional Music Production is{" "}
            <span className="bg-gradient-to-r from-destructive to-orange-500 bg-clip-text text-transparent">
              Broken
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're an artist trying to get pro sound or an engineer looking for steady work,
            the old way just doesn't work anymore.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/50 backdrop-blur-sm border-muted hover:border-primary/50 transition-all duration-300 hover-scale"
            >
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mb-4">
                <problem.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
              <p className="text-sm text-muted-foreground">{problem.description}</p>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground">
            There has to be a better way...{" "}
            <span className="text-primary font-semibold">and there is.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;
