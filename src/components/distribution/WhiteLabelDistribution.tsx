import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Check, ArrowRight } from "lucide-react";

// Phase 2: White-Label Distribution Infrastructure
// This component will be activated when DISTRIBUTION_WHITE_LABEL_ENABLED is true

const WHITE_LABEL_PROVIDERS = [
  {
    id: 'labelgrid',
    name: 'LabelGrid',
    type: 'Direct Distribution',
    description: 'Direct-to-store distribution with 100% revenue retention',
    features: ['Unlimited releases', 'All major stores', 'Split sheets', 'ISRC codes'],
    pricing: { monthly: 29, yearly: 290 },
  },
  {
    id: 'limbomusic',
    name: 'Limbo Music',
    type: 'Premium Distribution',
    description: 'Premium distribution with sync licensing opportunities',
    features: ['Sync licensing', 'Playlist pitching', 'YouTube monetization', 'Advanced analytics'],
    pricing: { monthly: 49, yearly: 490 },
  },
  {
    id: 'aioten',
    name: 'Aioten',
    type: 'Smart Distribution',
    description: 'AI-powered distribution with marketing tools',
    features: ['AI marketing', 'Social media tools', 'Fan insights', 'Pre-release campaigns'],
    pricing: { monthly: 39, yearly: 390 },
  },
];

export function WhiteLabelDistribution() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">White-Label Distribution</h2>
          <p className="text-muted-foreground">
            Choose from our curated distribution partners with exclusive Mixxclub pricing
          </p>
        </div>
        <Badge variant="secondary">Phase 2</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {WHITE_LABEL_PROVIDERS.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <Package className="h-8 w-8 text-primary" />
                <Badge variant="outline">{provider.type}</Badge>
              </div>
              <CardTitle className="mt-4">{provider.name}</CardTitle>
              <CardDescription>{provider.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {provider.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t space-y-3">
                <div>
                  <p className="text-2xl font-bold">
                    ${provider.pricing.monthly}
                    <span className="text-sm text-muted-foreground font-normal">/mo</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or ${provider.pricing.yearly}/year (save ${provider.pricing.monthly * 12 - provider.pricing.yearly})
                  </p>
                </div>
                <Button className="w-full">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">✨ Mixxclub Exclusive Benefits</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• 20% discount on all distribution packages</li>
            <li>• Priority support from distribution partners</li>
            <li>• Integrated analytics across all platforms</li>
            <li>• One-click release management</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}