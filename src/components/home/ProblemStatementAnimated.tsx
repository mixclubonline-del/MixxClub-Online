import { motion } from "framer-motion";
import { AlertCircle, TrendingDown, Clock, DollarSign, HardDrive, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const problems = [
  {
    icon: HardDrive,
    title: "Music Dies on Hard Drives",
    description: "Millions of unreleased tracks sit collecting dust because artists can't afford pro mixing.",
    stat: "87%",
    statLabel: "of tracks never released"
  },
  {
    icon: DollarSign,
    title: "Studios Cost a Fortune",
    description: "Pro studio time runs $50-200/hour. Most tracks need 10+ hours. That's $500-2000 per song.",
    stat: "$1,500",
    statLabel: "average mixing cost"
  },
  {
    icon: TrendingDown,
    title: "DIY Sounds Amateur",
    description: "Your track sounds great in headphones but terrible on speakers, in cars, everywhere else.",
    stat: "73%",
    statLabel: "fail streaming quality checks"
  },
  {
    icon: Clock,
    title: "Finding Engineers is Hard",
    description: "Weeks of searching, demos, and negotiations. Most good engineers are already booked.",
    stat: "3-6 weeks",
    statLabel: "average search time"
  },
];

export function ProblemStatementAnimated() {
  const [visibleProblems, setVisibleProblems] = useState<number[]>([]);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    // Reveal problems one by one
    problems.forEach((_, index) => {
      setTimeout(() => {
        setVisibleProblems((prev) => [...prev, index]);
      }, (index + 1) * 500);
    });

    // Show solution after all problems
    setTimeout(() => {
      setShowSolution(true);
    }, (problems.length + 1) * 500);
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/5 to-background" />
      
      <div className="container px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="destructive" className="mb-4">
            <AlertCircle className="w-3 h-3 mr-1" />
            The Problem
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Traditional Music Production is{" "}
            <span className="bg-gradient-to-r from-destructive to-orange-500 bg-clip-text text-transparent">
              Broken
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every day, thousands of incredible tracks die on hard drives because artists can't access professional engineering.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={
                visibleProblems.includes(index)
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 30, scale: 0.9 }
              }
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 h-full bg-card/50 border-destructive/20 hover:border-destructive/40 transition-all">
                <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mb-4">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{problem.description}</p>
                
                <div className="pt-4 border-t border-border/50">
                  <div className="text-2xl font-bold text-destructive">{problem.stat}</div>
                  <div className="text-xs text-muted-foreground">{problem.statLabel}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Solution Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showSolution ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
            <X className="w-6 h-6 text-destructive" />
            <span className="text-lg text-muted-foreground">There has to be a better way...</span>
            <motion.span
              className="text-lg font-bold text-primary"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              And there is.
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
