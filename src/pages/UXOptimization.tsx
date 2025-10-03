import { AdminLayout } from "@/components/admin/AdminLayout";
import { InteractiveProductTour } from "@/components/onboarding/InteractiveProductTour";
import { DemoModeToggle } from "@/components/demo/DemoModeToggle";
import { EnhancedHero } from "@/components/home/EnhancedHero";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Rocket, Users, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function UXOptimization() {
  const navigate = useNavigate();

  const artistTourSteps = [
    {
      target: 'dashboard',
      title: 'Welcome to Your Dashboard',
      description: 'This is your central hub for managing projects, finding engineers, and tracking progress.',
      position: 'bottom' as const
    },
    {
      target: 'matching',
      title: 'AI-Powered Matching',
      description: 'Our AI analyzes your music style and matches you with the perfect engineers for your project.',
      position: 'bottom' as const
    },
    {
      target: 'projects',
      title: 'Project Management',
      description: 'Track all your active projects, communicate with engineers, and review deliverables in one place.',
      position: 'right' as const
    },
    {
      target: 'payments',
      title: 'Secure Payments',
      description: 'Only pay when you\'re satisfied. Our escrow system protects both artists and engineers.',
      position: 'top' as const
    }
  ];

  const engineerTourSteps = [
    {
      target: 'opportunities',
      title: 'Browse Opportunities',
      description: 'Find projects that match your skills and expertise. Our AI recommends the best fits for you.',
      position: 'bottom' as const
    },
    {
      target: 'studio',
      title: 'Real-Time Studio',
      description: 'Collaborate with artists in real-time using our professional-grade audio workspace.',
      position: 'right' as const
    },
    {
      target: 'earnings',
      title: 'Track Your Earnings',
      description: 'Monitor your income, pending payments, and performance bonuses all in one place.',
      position: 'top' as const
    },
    {
      target: 'reputation',
      title: 'Build Your Reputation',
      description: 'High ratings and completed projects unlock better opportunities and higher rates.',
      position: 'left' as const
    }
  ];

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
              <Sparkles className="h-8 w-8" />
              UX Optimization & Polish
            </h1>
            <p className="text-muted-foreground mt-2">
              Enhance user experience, onboarding flows, and demo capabilities
            </p>
          </div>
        </div>

        <Tabs defaultValue="tours" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tours">Product Tours</TabsTrigger>
            <TabsTrigger value="demo">Demo Mode</TabsTrigger>
            <TabsTrigger value="hero">Landing Page</TabsTrigger>
            <TabsTrigger value="metrics">Optimization Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="tours" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Artist Onboarding Tour</CardTitle>
                  <CardDescription>
                    Interactive walkthrough for new artists
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InteractiveProductTour
                    tourId="artist_onboarding"
                    steps={artistTourSteps}
                    autoStart={false}
                  />
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Tour includes:</p>
                    <ul className="text-sm space-y-1">
                      {artistTourSteps.map((step, idx) => (
                        <li key={idx}>• {step.title}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engineer Onboarding Tour</CardTitle>
                  <CardDescription>
                    Interactive walkthrough for new engineers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InteractiveProductTour
                    tourId="engineer_onboarding"
                    steps={engineerTourSteps}
                    autoStart={false}
                  />
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Tour includes:</p>
                    <ul className="text-sm space-y-1">
                      {engineerTourSteps.map((step, idx) => (
                        <li key={idx}>• {step.title}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demo" className="space-y-4">
            <DemoModeToggle />
            
            <Card>
              <CardHeader>
                <CardTitle>Demo Mode Benefits</CardTitle>
                <CardDescription>
                  Perfect for investor presentations and showcase events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-primary" />
                      For Presentations
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Show impressive metrics without real data</li>
                      <li>• Demonstrate full feature set</li>
                      <li>• No awkward empty states</li>
                      <li>• Instant reset for multiple demos</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      For Testing
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Test user flows with realistic data</li>
                      <li>• Preview how the platform looks at scale</li>
                      <li>• Validate UI/UX decisions</li>
                      <li>• Train team members safely</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hero" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Landing Page Preview</CardTitle>
                <CardDescription>
                  New hero section optimized for conversion
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <EnhancedHero />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Optimizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Social Proof</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>✓ User avatars</li>
                      <li>✓ Star ratings</li>
                      <li>✓ Active user count</li>
                      <li>✓ Trust badges</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Clear CTAs</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>✓ Primary action prominent</li>
                      <li>✓ Secondary option available</li>
                      <li>✓ Benefit-focused copy</li>
                      <li>✓ Reduced friction</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Value Props</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>✓ AI matching highlighted</li>
                      <li>✓ Real-time collab shown</li>
                      <li>✓ Quality guarantee featured</li>
                      <li>✓ Visual demonstrations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Onboarding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Completion Rate</span>
                        <span className="font-bold">78%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[78%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Time to First Action</span>
                        <span className="font-bold">2.5 min</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Target: &lt;3 min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Conversion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Sign-up Rate</span>
                        <span className="font-bold">12.3%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[62%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">First Project Rate</span>
                        <span className="font-bold">45%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Target: 50%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Daily Active Users</span>
                        <span className="font-bold">67%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[67%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Avg Session Time</span>
                        <span className="font-bold">18 min</span>
                      </div>
                      <p className="text-xs text-muted-foreground">+25% from last month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
          <h3 className="font-bold text-lg mb-4">UX Optimization Checklist</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Completed</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✅ Interactive product tours</li>
                <li>✅ Demo mode for presentations</li>
                <li>✅ Enhanced hero section</li>
                <li>✅ Social proof elements</li>
                <li>✅ Clear CTAs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Next Steps</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>🎯 A/B test hero variations</li>
                <li>🎯 Add onboarding progress indicators</li>
                <li>🎯 Implement exit intent popups</li>
                <li>🎯 Create video testimonials</li>
                <li>🎯 Set up heatmap tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
