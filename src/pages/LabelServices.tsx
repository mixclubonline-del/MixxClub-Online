import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, TrendingUp, Users, DollarSign, Award, Briefcase } from "lucide-react";
import Navigation from "@/components/Navigation";
import { isFeatureEnabled } from "@/config/featureFlags";

const LabelServices = () => {
  const isEnabled = isFeatureEnabled("LABEL_SERVICES_ENABLED");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4 mb-12">
          <Badge variant="secondary">{isEnabled ? "Now Available" : "Coming Soon"}</Badge>
          <h1 className="text-5xl font-bold">Label Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional artist development and distribution services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Get your music on all major platforms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Marketing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Professional marketing campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                A&R Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Experienced A&R guidance</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LabelServices;
