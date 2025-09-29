import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for trying out our services",
    features: [
      "Professional Mixing",
      "AI Enhancement",
      "Up to 2 Revisions",
      "5-Day Turnaround",
      "Email Support",
    ],
  },
  {
    name: "Pro",
    price: "$99",
    description: "For serious artists and producers",
    features: [
      "Professional Mixing",
      "Mastering Included",
      "AI Enhancement",
      "Unlimited Revisions",
      "3-Day Turnaround",
      "Priority Support",
      "Live Session Access",
    ],
    popular: true,
  },
  {
    name: "Billboard",
    price: "$199",
    description: "Industry-standard quality",
    features: [
      "Professional Mixing",
      "Mastering Included",
      "Advanced AI Processing",
      "Unlimited Revisions",
      "24h Turnaround",
      "Dedicated Engineer",
      "Live Session Access",
      "Stems Delivery",
    ],
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-card">
      <div className="container px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our AI-enhanced workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-border ${
                plan.popular
                  ? "border-primary shadow-[0_0_40px_hsl(263_70%_63%/0.3)] scale-105"
                  : "hover:border-primary/50"
              } transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-primary-glow rounded-full text-xs font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/track</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <a href="#contact" className="w-full">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
