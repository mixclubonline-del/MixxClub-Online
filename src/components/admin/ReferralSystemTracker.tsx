import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Users, DollarSign, TrendingUp, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface ReferralStats {
  total_referrals: number;
  active_affiliates: number;
  total_commissions: number;
  conversion_rate: number;
}

interface TopAffiliate {
  user_id: string;
  total_referrals: number;
  total_earned: number;
  conversion_rate: number;
}

export const ReferralSystemTracker = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [topAffiliates, setTopAffiliates] = useState<TopAffiliate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);

      // Load referral stats (demo data)
      setStats({
        total_referrals: 37,
        active_affiliates: 12,
        total_commissions: 1850,
        conversion_rate: 68.5
      });

      // Load top affiliates (simplified for demo)
      setTopAffiliates([
        {
          user_id: 'demo-user-1',
          total_referrals: 15,
          total_earned: 750,
          conversion_rate: 73
        },
        {
          user_id: 'demo-user-2',
          total_referrals: 12,
          total_earned: 600,
          conversion_rate: 67
        },
        {
          user_id: 'demo-user-3',
          total_referrals: 10,
          total_earned: 500,
          conversion_rate: 80
        }
      ]);

    } catch (error) {
      console.error('Error loading referral data:', error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=ADMIN123`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Referral link copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_referrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Affiliates</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_affiliates || 0}</div>
            <p className="text-xs text-muted-foreground">
              Actively referring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.total_commissions.toFixed(2) || 0}</div>
            <p className="text-xs text-muted-foreground">
              Paid to affiliates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversion_rate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Referral to signup
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Affiliates</CardTitle>
            <CardDescription>Engineers with the most successful referrals</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-4">
                {topAffiliates.map((affiliate, idx) => (
                  <div key={affiliate.user_id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{idx + 1}</Badge>
                        <span className="font-mono text-xs">{affiliate.user_id}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        ${affiliate.total_earned}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{affiliate.total_referrals} referrals</span>
                      <span>{affiliate.conversion_rate}% conversion</span>
                    </div>
                    <Progress value={affiliate.conversion_rate} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Program Details</CardTitle>
            <CardDescription>Program structure and incentives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg space-y-2">
              <h4 className="font-semibold">Commission Structure</h4>
              <ul className="space-y-1 text-sm">
                <li>• 10% commission on first project</li>
                <li>• 5% recurring commission for 12 months</li>
                <li>• Bonus for 5+ successful referrals</li>
              </ul>
            </div>

            <div className="p-4 bg-secondary/20 rounded-lg space-y-2">
              <h4 className="font-semibold">Payout Terms</h4>
              <ul className="space-y-1 text-sm">
                <li>• Minimum payout: $50</li>
                <li>• Payment schedule: Monthly</li>
                <li>• Method: Stripe Connect</li>
              </ul>
            </div>

            <Button onClick={generateReferralLink} className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Generate Referral Link
            </Button>

            <Button variant="outline" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Referral Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
