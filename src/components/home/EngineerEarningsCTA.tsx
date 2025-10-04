import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, Zap } from "lucide-react";

export const EngineerEarningsCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-br from-green-500/10 to-primary/10">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="mb-4">For Engineers</Badge>
          <h2 className="text-4xl font-bold mb-4">
            Earn While You Mix
          </h2>
          <p className="text-muted-foreground mb-8">
            Get matched with artists, build your reputation, and get paid fast
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-500 mb-2">70%</div>
                <p className="text-sm text-muted-foreground">You keep of project fee</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-500 mb-2">$20-$105</div>
                <p className="text-sm text-muted-foreground">Per project earnings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <Zap className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-500 mb-2">24h</div>
                <p className="text-sm text-muted-foreground">Fast payouts</p>
              </CardContent>
            </Card>
          </div>
          <Button size="lg" onClick={() => navigate('/auth?role=engineer')}>
            Start Earning →
          </Button>
        </div>
      </div>
    </section>
  );
};
