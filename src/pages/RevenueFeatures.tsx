import { AdminLayout } from "@/components/admin/AdminLayout";
import { SubscriptionManager } from "@/components/admin/SubscriptionManager";
import { ReferralSystemTracker } from "@/components/admin/ReferralSystemTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function RevenueFeatures() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-8 w-8" />
              Revenue Features
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage subscriptions, referrals, and revenue analytics
            </p>
          </div>
        </div>

        <Tabs defaultValue="subscriptions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="referrals">Referral System</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-4">
            <SubscriptionManager />
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            <ReferralSystemTracker />
          </TabsContent>
        </Tabs>

        <div className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border">
          <h3 className="font-bold text-lg mb-4">Revenue Optimization Checklist</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Subscription Growth</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Free trial mechanism active</li>
                <li>✓ Upgrade prompts in place</li>
                <li>✓ Email drip campaign configured</li>
                <li>⚠ A/B test pricing tiers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Referral Program</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Commission structure defined</li>
                <li>✓ Tracking system operational</li>
                <li>✓ Payout automation ready</li>
                <li>⚠ Launch promotional campaign</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Payment Optimization</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Multiple payment methods</li>
                <li>✓ Failed payment recovery flow</li>
                <li>✓ Dunning management active</li>
                <li>⚠ Add annual billing discount</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Analytics & Insights</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ MRR tracking implemented</li>
                <li>✓ Churn analysis dashboard</li>
                <li>✓ LTV calculations active</li>
                <li>⚠ Set up revenue alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
