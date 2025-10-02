import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, Share2, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SystemMetrics {
  total_users: number;
  total_projects: number;
  active_projects: number;
  total_revenue: number;
  engineer_payouts: number;
  platform_commission: number;
  active_sessions: number;
  last_updated: string;
}

const SLIDE_CONTENT = [
  {
    title: "MixClub System Architecture",
    subtitle: "Platform Overview",
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">MixClub</h2>
          <p className="text-xl text-muted-foreground">Connecting Artists with Top Audio Engineers</p>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">React + Vite</div>
              <p className="text-sm text-muted-foreground mt-2">Modern Frontend</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">Supabase</div>
              <p className="text-sm text-muted-foreground mt-2">Backend Platform</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">TypeScript</div>
              <p className="text-sm text-muted-foreground mt-2">Type Safety</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    title: "System Architecture Diagram",
    subtitle: "Technology Stack",
    content: (
      <div className="flex items-center justify-center h-full">
        <pre className="text-sm bg-muted p-6 rounded-lg">
{`┌─────────────────────┐
│   React Frontend    │
│   (Vite + TypeScript)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Supabase Backend   │
├─────────────────────┤
│ • PostgreSQL DB     │
│ • Edge Functions    │
│ • Storage (4 buckets)│
│ • Real-time         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Payment Gateways   │
├─────────────────────┤
│ • Stripe            │
│ • PayPal            │
│ • Coinbase Commerce │
└─────────────────────┘`}
        </pre>
      </div>
    ),
  },
  {
    title: "Database Overview",
    subtitle: "Schema Statistics",
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold text-primary">60+</div>
              <p className="text-sm text-muted-foreground mt-2">Tables</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold text-primary">47</div>
              <p className="text-sm text-muted-foreground mt-2">Functions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold text-primary">23</div>
              <p className="text-sm text-muted-foreground mt-2">Triggers</p>
            </CardContent>
          </Card>
        </div>
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="font-semibold mb-4">Key Tables:</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            <li>✓ profiles (users)</li>
            <li>✓ projects</li>
            <li>✓ payments</li>
            <li>✓ audio_files</li>
            <li>✓ engineer_earnings</li>
            <li>✓ collaboration_sessions</li>
          </ul>
        </div>
      </div>
    ),
  },
];

export default function AdminSystemPresentation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchMetrics();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      toast.error("Please sign in");
      navigate("/auth");
      return;
    }

    const { data: isAdmin } = await supabase.rpc("is_admin", { user_uuid: user.id });
    if (!isAdmin) {
      toast.error("Access Denied: Admin privileges required");
      navigate("/");
    }
  };

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from("system_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Aggregate latest metrics
      const latest: any = {};
      data?.forEach((m) => {
        if (!latest[m.metric_type]) {
          latest[m.metric_type] = m.metric_value;
        }
      });

      setMetrics({
        total_users: latest.total_users || 0,
        total_projects: latest.total_projects || 0,
        active_projects: latest.active_projects || 0,
        total_revenue: latest.total_revenue || 0,
        engineer_payouts: latest.engineer_payouts || 0,
        platform_commission: latest.platform_commission || 0,
        active_sessions: latest.active_sessions || 0,
        last_updated: data?.[0]?.recorded_at || new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Failed to fetch metrics:", error);
    }
  };

  const handleRefreshMetrics = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke("collect-system-metrics");
      if (error) throw error;

      toast.success("Metrics refreshed successfully");
      fetchMetrics();
    } catch (error: any) {
      toast.error("Failed to refresh metrics: " + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!sharePassword || sharePassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-presentation-share", {
        body: {
          password: sharePassword,
          expires_in_days: 30,
        },
      });

      if (error) throw error;

      setShareUrl(data.share_url);
      toast.success("Share link generated!");
    } catch (error: any) {
      toast.error("Failed to generate share link: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < SLIDE_CONTENT.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentSlideData = SLIDE_CONTENT[currentSlide];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={() => navigate("/admin")} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleRefreshMetrics} variant="outline" size="sm" disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Metrics
            </Button>
            <Button onClick={() => setShareDialogOpen(true)} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Generate Share Link
            </Button>
          </div>
        </div>

        {/* Presentation Slide */}
        <Card className="min-h-[600px]">
          <CardContent className="p-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">{currentSlideData.title}</h1>
              <p className="text-xl text-muted-foreground">{currentSlideData.subtitle}</p>
            </div>

            <div className="min-h-[400px]">{currentSlideData.content}</div>

            {/* Live Metrics Footer */}
            {metrics && (
              <div className="mt-12 pt-6 border-t">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{metrics.total_users}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-bold">{metrics.total_projects}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${metrics.total_revenue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Active Sessions</p>
                    <p className="text-2xl font-bold">{metrics.active_sessions}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Last updated: {new Date(metrics.last_updated).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button onClick={prevSlide} disabled={currentSlide === 0} variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Slide {currentSlide + 1} of {SLIDE_CONTENT.length}
          </div>
          <Button onClick={nextSlide} disabled={currentSlide === SLIDE_CONTENT.length - 1} variant="outline">
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Share Link Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Password-Protected Share Link</DialogTitle>
            <DialogDescription>
              Create a secure link to share this presentation. The link will expire in 30 days.
            </DialogDescription>
          </DialogHeader>

          {!shareUrl ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password (min 8 characters)</Label>
                <Input
                  id="password"
                  type="password"
                  value={sharePassword}
                  onChange={(e) => setSharePassword(e.target.value)}
                  placeholder="Enter a secure password"
                />
              </div>
              <Button onClick={handleGenerateShareLink} disabled={generating || sharePassword.length < 8} className="w-full">
                {generating ? "Generating..." : "Generate Share Link"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Share Link</Label>
                <Input value={shareUrl} readOnly />
              </div>
              <div>
                <Label>Password</Label>
                <Input value={sharePassword} readOnly type="password" />
              </div>
              <p className="text-sm text-muted-foreground">
                ⚠️ Share both the link AND password with the recipient. This link will expire in 30 days.
              </p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`Link: ${shareUrl}\nPassword: ${sharePassword}`);
                  toast.success("Copied to clipboard!");
                }}
                className="w-full"
              >
                Copy Link & Password
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}