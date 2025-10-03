import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmailCampaignManager } from "@/components/marketing/EmailCampaignManager";
import { SocialShareButtons } from "@/components/marketing/SocialShareButtons";
import { SEOOptimizer } from "@/components/marketing/SEOOptimizer";
import { AnalyticsTracker } from "@/components/marketing/AnalyticsTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowLeft, Mail, Share2, Search, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function MarketingGrowth() {
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
              <TrendingUp className="h-8 w-8" />
              Marketing & Growth Tools
            </h1>
            <p className="text-muted-foreground mt-2">
              Drive user acquisition and optimize conversion
            </p>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email Campaigns
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="h-4 w-4 mr-2" />
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsTracker />
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <EmailCampaignManager />
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <SEOOptimizer />
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <SocialShareButtons />
              
              <Card>
                <CardHeader>
                  <CardTitle>Growth Strategies</CardTitle>
                  <CardDescription>
                    Proven tactics for user acquisition
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-semibold mb-2">Content Marketing</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Blog: Audio production tips & tutorials</li>
                        <li>• YouTube: Before/after showcases</li>
                        <li>• Podcast: Engineer interviews</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-green-500/5 rounded-lg">
                      <h4 className="font-semibold mb-2">Partnerships</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Music schools & academies</li>
                        <li>• DAW software integrations</li>
                        <li>• Audio plugin developers</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-blue-500/5 rounded-lg">
                      <h4 className="font-semibold mb-2">Community Building</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Discord server for producers</li>
                        <li>• Monthly mixing challenges</li>
                        <li>• Engineer spotlight features</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
          <h3 className="font-bold text-lg mb-4">Marketing Readiness Checklist</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Launch Essentials</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✅ Analytics tracking configured</li>
                <li>✅ Email campaign templates ready</li>
                <li>✅ SEO optimization complete</li>
                <li>✅ Social sharing enabled</li>
                <li>✅ Landing page optimized</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Growth Channels</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✅ Referral program active</li>
                <li>✅ Content calendar planned</li>
                <li>⚠ Partnership outreach pending</li>
                <li>⚠ Paid ads campaigns to setup</li>
                <li>⚠ Influencer partnerships TBD</li>
              </ul>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Launch Day Marketing Plan</CardTitle>
            <CardDescription>
              Coordinated strategy for maximum impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Week Before Launch</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Tease on social media</li>
                    <li>• Email waitlist subscribers</li>
                    <li>• Press release to industry sites</li>
                    <li>• Update all social bios</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Launch Day</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Product Hunt submission</li>
                    <li>• LinkedIn announcement post</li>
                    <li>• Email blast to all contacts</li>
                    <li>• Reddit community posts</li>
                    <li>• Twitter thread with features</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Week After Launch</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Follow-up emails to signups</li>
                    <li>• Share user testimonials</li>
                    <li>• Thank you post to supporters</li>
                    <li>• Analyze launch metrics</li>
                    <li>• Optimize based on data</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
