import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Users, TrendingUp, DollarSign, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SubscriptionStats {
  total_active: number;
  total_mrr: number;
  churn_rate: number;
  avg_lifetime_value: number;
}

interface Subscription {
  id: string;
  user_id: string;
  status: string;
  package_name: string;
  current_period_end: string;
  created_at: string;
  user_email?: string;
}

export const SubscriptionManager = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load subscription stats (demo data for now)
      setStats({
        total_active: 47,
        total_mrr: 2303,
        churn_rate: 5.2,
        avg_lifetime_value: 588
      });

      // Load subscriptions (demo data)
      setSubscriptions([
        {
          id: 'sub-1',
          user_id: 'demo-user-1',
          status: 'active',
          package_name: 'MixClub Pro',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sub-2',
          user_id: 'demo-user-2',
          status: 'active',
          package_name: 'MixClub Pro',
          current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sub-3',
          user_id: 'demo-user-3',
          status: 'cancelled',
          package_name: 'MixClub Pro',
          current_period_end: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('user_mastering_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Subscription cancelled",
        description: "The subscription has been cancelled successfully"
      });

      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    searchTerm === "" || 
    sub.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.package_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_active || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.total_mrr.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.churn_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              -2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lifetime Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.avg_lifetime_value || 0}</div>
            <p className="text-xs text-muted-foreground">
              12 months average
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>View and manage all active subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by user ID or package..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs">
                      {sub.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{sub.package_name}</TableCell>
                    <TableCell>
                      <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(sub.current_period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {sub.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelSubscription(sub.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
