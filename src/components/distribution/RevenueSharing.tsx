import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Award, Users, ArrowUpRight } from "lucide-react";

// Phase 4: Revenue Sharing & Commission System
// This component will be activated when DISTRIBUTION_REVENUE_SHARING_ENABLED is true

export function RevenueSharing() {
  const commissions = [
    { id: '1', type: 'Referral', amount: 125.00, status: 'paid', date: '2024-03-15' },
    { id: '2', type: 'Revenue Share', amount: 89.50, status: 'approved', date: '2024-03-14' },
    { id: '3', type: 'Performance Bonus', amount: 200.00, status: 'pending', date: '2024-03-10' },
    { id: '4', type: 'Affiliate', amount: 45.00, status: 'paid', date: '2024-03-08' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'approved': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Revenue Sharing & Commissions</h2>
          <p className="text-muted-foreground">
            Earn money by referring artists and growing the community
          </p>
        </div>
        <Badge variant="secondary">Phase 4</Badge>
      </div>

      {/* Earnings Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,459.50</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +18.2% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$289.50</div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Active referrals this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15%</div>
            <p className="text-xs text-muted-foreground">
              Your current tier rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Program */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>
            Earn 15% commission on every artist you refer to MixClub Distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Your Referral Link</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value="https://mixclub.com/ref/YOUR_CODE"
                className="flex-1 px-3 py-2 border rounded text-sm bg-background"
              />
              <Button>Copy Link</Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">15%</p>
              <p className="text-sm text-muted-foreground">Per referral sale</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">$50</p>
              <p className="text-sm text-muted-foreground">Minimum payout</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">30d</p>
              <p className="text-sm text-muted-foreground">Cookie duration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>Your earnings breakdown</CardDescription>
            </div>
            <Button variant="outline">
              Request Payout
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commissions.map((commission) => (
              <div
                key={commission.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{commission.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(commission.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="font-semibold">${commission.amount.toFixed(2)}</p>
                  <Badge variant={getStatusColor(commission.status)}>
                    {commission.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Tiers */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
        <CardHeader>
          <CardTitle>Performance Tiers</CardTitle>
          <CardDescription>
            Increase your commission rate by referring more artists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
              <div>
                <p className="font-medium">Bronze Tier</p>
                <p className="text-sm text-muted-foreground">1-9 referrals</p>
              </div>
              <Badge variant="outline">10% Commission</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border-2 border-primary rounded-lg bg-primary/5">
              <div>
                <p className="font-medium">Silver Tier (Current)</p>
                <p className="text-sm text-muted-foreground">10-24 referrals</p>
              </div>
              <Badge>15% Commission</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
              <div>
                <p className="font-medium">Gold Tier</p>
                <p className="text-sm text-muted-foreground">25-49 referrals</p>
              </div>
              <Badge variant="secondary">20% Commission</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
              <div>
                <p className="font-medium">Platinum Tier</p>
                <p className="text-sm text-muted-foreground">50+ referrals</p>
              </div>
              <Badge variant="secondary">25% Commission</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}