import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, TrendingUp } from "lucide-react";
import { isFeatureEnabled } from "@/config/featureFlags";

const LabelServices = () => {
  const isUnlocked = isFeatureEnabled("LABEL_SERVICES_ENABLED");

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Label Services - Coming Soon</CardTitle>
              <CardDescription className="text-lg">
                Unlock at 500 community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage label deals, contracts, and royalty payments
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Label Services</h1>
          <p className="text-muted-foreground">
            Manage your label deals, contracts, and royalty payments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Deal Management</CardTitle>
              <CardDescription>
                Track and manage all your label deals in one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Royalty Tracking</CardTitle>
              <CardDescription>
                Monitor your royalty payments and revenue splits
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Analyze your earnings and deal performance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Database Setup Complete</CardTitle>
            <CardDescription>
              Backend infrastructure is ready. Frontend integration coming soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tables created: label_deals, label_royalties
              <br />
              Edge functions deployed: label-deal-create
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LabelServices;
