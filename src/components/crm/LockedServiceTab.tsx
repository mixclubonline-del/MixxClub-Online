import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Music } from "lucide-react";
import { Link } from "react-router-dom";

interface LockedServiceTabProps {
  serviceName: string;
  serviceType: "mixing" | "mastering";
  description: string;
  features: string[];
}

export const LockedServiceTab = ({ 
  serviceName, 
  serviceType,
  description, 
  features 
}: LockedServiceTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Unlock {serviceName}</CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <Link to={serviceType === "mixing" ? "/mixing-showcase" : "/mastering-showcase"}>
              <Button className="w-full gap-2" size="lg">
                {serviceType === "mixing" ? (
                  <>
                    <Music className="w-5 h-5" />
                    Upgrade to Mixing
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Upgrade to Mastering
                  </>
                )}
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Unlock this feature with a {serviceName.toLowerCase()} subscription
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
