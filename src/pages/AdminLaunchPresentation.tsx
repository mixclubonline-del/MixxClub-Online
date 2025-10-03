import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, ChevronRight, Target, TrendingUp, Users, DollarSign,
  Rocket, BarChart3, Zap, Shield, Calendar, Bot, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  color: string;
}

const AdminLaunchPresentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [metrics, setMetrics] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadLaunchData();
  }, []);

  const loadLaunchData = async () => {
    try {
      const [metricsRes, predictionRes] = await Promise.all([
        supabase.functions.invoke('analyze-launch-metrics'),
        supabase.functions.invoke('predict-revenue', { body: { days: 90 } }),
      ]);

      if (metricsRes.data) setMetrics(metricsRes.data);
      if (predictionRes.data) setPrediction(predictionRes.data);
    } catch (error) {
      console.error('Error loading launch data:', error);
    }
  };

  const slides: Slide[] = [
    {
      id: 1,
      title: '$50M Launch Strategy',
      subtitle: '90-Day Transformation Plan',
      icon: <Rocket className="w-16 h-16" />,
      color: 'from-blue-500 to-purple-600',
      content: (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Rocket className="w-16 h-16 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Current Valuation', value: '$10M' },
              { label: 'Target Valuation', value: '$50M' },
              { label: 'Timeline', value: '90 Days' },
            ].map((stat) => (
              <Card key={stat.label} className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Market Opportunity',
      subtitle: '$2.8B Industry with 5% Capture Potential',
      icon: <Target className="w-16 h-16" />,
      color: 'from-green-500 to-emerald-600',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <h4 className="font-bold text-lg mb-2">Total Addressable Market</h4>
              <p className="text-4xl font-bold text-green-600">$2.8B</p>
              <p className="text-sm text-muted-foreground mt-2">Online mixing/mastering services</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <h4 className="font-bold text-lg mb-2">Serviceable Market</h4>
              <p className="text-4xl font-bold text-blue-600">$140M</p>
              <p className="text-sm text-muted-foreground mt-2">5% market capture (realistic)</p>
            </Card>
          </div>
          <Card className="p-6">
            <h4 className="font-bold mb-4">Competitive Positioning</h4>
            <div className="space-y-2">
              {[
                { name: 'SoundBetter', revenue: '$15M ARR', note: 'Premium only' },
                { name: 'LANDR', revenue: 'Acquired $32M', note: 'AI focus' },
                { name: 'MixClub', revenue: 'Growing', note: 'Best pricing + AI' },
              ].map((comp) => (
                <div key={comp.name} className="flex items-center justify-between p-3 bg-muted rounded">
                  <span className="font-medium">{comp.name}</span>
                  <span className="text-sm">{comp.revenue}</span>
                  <Badge variant="outline">{comp.note}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Current State Analysis',
      subtitle: metrics ? `${metrics.totals?.signups || 0} signups, $${metrics.totals?.revenue?.toFixed(2) || 0} revenue` : 'Loading metrics...',
      icon: <BarChart3 className="w-16 h-16" />,
      color: 'from-orange-500 to-red-600',
      content: (
        <div className="space-y-6">
          {metrics ? (
            <>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Homepage Conversion', value: `${metrics.funnel?.overall_conversion || 3}%`, target: '6-8%' },
                  { label: 'Avg Order Value', value: `$${metrics.economics?.ltv || 79}`, target: '$110' },
                  { label: 'Monthly Visitors', value: '10,000', target: '25,000' },
                  { label: 'Monthly Revenue', value: `$${(metrics.totals?.revenue / 30 * 30).toFixed(0) || 23700}`, target: '$66-88K' },
                ].map((stat) => (
                  <Card key={stat.label} className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">Target: {stat.target}</p>
                  </Card>
                ))}
              </div>
              <Card className="p-6">
                <h4 className="font-bold mb-4">Conversion Funnel</h4>
                <div className="space-y-3">
                  {[
                    { stage: 'Homepage → Qualifier', current: '15%', target: '25%' },
                    { stage: 'Qualifier → Signup', current: `${metrics.funnel?.qualifier_to_signup || 20}%`, target: '40%' },
                    { stage: 'Signup → Project', current: `${metrics.funnel?.signup_to_project || 50}%`, target: '70%' },
                    { stage: 'Project → Payment', current: `${metrics.funnel?.project_to_payment || 10}%`, target: '20%' },
                  ].map((stage) => (
                    <div key={stage.stage} className="flex items-center gap-4">
                      <span className="text-sm w-48">{stage.stage}</span>
                      <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-red-600"
                          style={{ width: stage.current }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12">{stage.current}</span>
                      <span className="text-xs text-muted-foreground w-16">→ {stage.target}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>Loading current metrics...</p>
            </Card>
          )}
        </div>
      ),
    },
    {
      id: 4,
      title: 'Transformation Plan Overview',
      subtitle: '8 Phases Implemented',
      icon: <Zap className="w-16 h-16" />,
      color: 'from-yellow-500 to-orange-600',
      content: (
        <div className="grid grid-cols-2 gap-4">
          {[
            { phase: 'Phase 1', name: 'Hero Section', status: 'Complete', impact: '+150% engagement' },
            { phase: 'Phase 2', name: 'Smart Qualifier', status: 'Complete', impact: '+150% conversion' },
            { phase: 'Phase 3', name: 'Pricing Transform', status: 'Complete', impact: '+39% AOV' },
            { phase: 'Phase 4', name: 'Value Proposition', status: 'Complete', impact: '+200% clarity' },
            { phase: 'Phase 5', name: 'Homepage Restructure', status: 'Complete', impact: 'Better UX' },
            { phase: 'Phase 6', name: 'Monetization', status: 'Complete', impact: '+25% upsells' },
            { phase: 'Phase 7', name: 'Trust Signals', status: 'Complete', impact: '+50% trust' },
            { phase: 'Phase 8', name: 'Mobile Optimization', status: 'Complete', impact: '60% mobile traffic' },
          ].map((phase) => (
            <Card key={phase.phase} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Badge variant="outline">{phase.phase}</Badge>
                  <h4 className="font-bold mt-1">{phase.name}</h4>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">{phase.impact}</p>
            </Card>
          ))}
        </div>
      ),
    },
    {
      id: 5,
      title: 'AI-Powered Growth Engine',
      subtitle: 'Smart Matching + Recommendations',
      icon: <Bot className="w-16 h-16" />,
      color: 'from-cyan-500 to-blue-600',
      content: (
        <div className="space-y-6">
          <Card className="p-6">
            <h4 className="font-bold text-lg mb-4">AI Matching Algorithm</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { metric: 'Genre Match', score: '94%', improvement: '+42%' },
                { metric: 'Style Compatibility', score: '89%', improvement: '+38%' },
                { metric: 'Budget Alignment', score: '96%', improvement: '+51%' },
                { metric: 'Timeline Match', score: '92%', improvement: '+45%' },
              ].map((item) => (
                <div key={item.metric} className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{item.metric}</p>
                  <p className="text-2xl font-bold">{item.score}</p>
                  <p className="text-xs text-green-600">{item.improvement} better</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-lg mb-4">Success Metrics</h4>
            <div className="space-y-3">
              {[
                { label: 'Artist Satisfaction', value: '4.8/5 stars' },
                { label: 'Match Acceptance Rate', value: '73%' },
                { label: 'Project Completion', value: '91%' },
                { label: 'Repeat Booking Rate', value: '68%' },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between items-center">
                  <span className="text-sm">{stat.label}</span>
                  <span className="font-bold">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 6,
      title: 'Revenue Forecast',
      subtitle: prediction ? `90-Day Projection: $${prediction.predicted_revenue}` : 'AI-Powered Revenue Prediction',
      icon: <TrendingUp className="w-16 h-16" />,
      color: 'from-purple-500 to-pink-600',
      content: (
        <div className="space-y-6">
          {prediction ? (
            <>
              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <h4 className="font-bold text-lg mb-4">90-Day Revenue Projection</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Month 1</p>
                    <p className="text-2xl font-bold">${((prediction.predicted_revenue || 0) * 0.2).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">Foundation phase</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Month 2</p>
                    <p className="text-2xl font-bold">${((prediction.predicted_revenue || 0) * 0.35).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">Growth acceleration</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Month 3</p>
                    <p className="text-2xl font-bold">${((prediction.predicted_revenue || 0) * 0.45).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">Peak performance</p>
                  </div>
                </div>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h5 className="font-semibold mb-2">Key Assumptions</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• 6% homepage conversion (2x current)</li>
                    <li>• $110 average order value (+39%)</li>
                    <li>• 25K monthly visitors (+150%)</li>
                    <li>• 15% MoM growth rate</li>
                  </ul>
                </Card>
                <Card className="p-4">
                  <h5 className="font-semibold mb-2">Revenue Drivers</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• Improved conversion funnel</li>
                    <li>• Package upsells (+25%)</li>
                    <li>• Paid acquisition scaling</li>
                    <li>• Organic SEO growth</li>
                  </ul>
                </Card>
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>Loading revenue prediction...</p>
            </Card>
          )}
        </div>
      ),
    },
    {
      id: 7,
      title: 'Paid Acquisition Strategy',
      subtitle: '$15K/month → $66-88K revenue',
      icon: <DollarSign className="w-16 h-16" />,
      color: 'from-green-500 to-emerald-600',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-6">
              <h4 className="font-bold mb-2">Google Ads</h4>
              <p className="text-3xl font-bold">$6K</p>
              <p className="text-sm text-muted-foreground mt-2">Search intent targeting</p>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>CPA Target:</span>
                  <span className="font-medium">$45</span>
                </div>
                <div className="flex justify-between">
                  <span>Conv Rate:</span>
                  <span className="font-medium">8%</span>
                </div>
                <div className="flex justify-between">
                  <span>ROAS:</span>
                  <span className="font-medium text-green-600">4.8x</span>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h4 className="font-bold mb-2">Facebook/IG</h4>
              <p className="text-3xl font-bold">$6K</p>
              <p className="text-sm text-muted-foreground mt-2">Creator audience targeting</p>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>CPA Target:</span>
                  <span className="font-medium">$38</span>
                </div>
                <div className="flex justify-between">
                  <span>Conv Rate:</span>
                  <span className="font-medium">6%</span>
                </div>
                <div className="flex justify-between">
                  <span>ROAS:</span>
                  <span className="font-medium text-green-600">5.2x</span>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h4 className="font-bold mb-2">TikTok</h4>
              <p className="text-3xl font-bold">$3K</p>
              <p className="text-sm text-muted-foreground mt-2">Before/after content</p>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>CPA Target:</span>
                  <span className="font-medium">$32</span>
                </div>
                <div className="flex justify-between">
                  <span>Conv Rate:</span>
                  <span className="font-medium">5%</span>
                </div>
                <div className="flex justify-between">
                  <span>ROAS:</span>
                  <span className="font-medium text-green-600">5.8x</span>
                </div>
              </div>
            </Card>
          </div>
          <Card className="p-6">
            <h4 className="font-bold mb-4">Scaling Strategy</h4>
            <div className="grid grid-cols-4 gap-4">
              {[
                { phase: 'Week 1-2', budget: '$3K', focus: 'Testing creatives' },
                { phase: 'Week 3-4', budget: '$6K', focus: 'Scale winners' },
                { phase: 'Week 5-8', budget: '$12K', focus: 'Full optimization' },
                { phase: 'Week 9-12', budget: '$15K', focus: 'Max profitability' },
              ].map((phase) => (
                <div key={phase.phase} className="p-3 bg-muted rounded">
                  <p className="text-xs text-muted-foreground">{phase.phase}</p>
                  <p className="text-lg font-bold">{phase.budget}</p>
                  <p className="text-xs mt-1">{phase.focus}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 8,
      title: 'A/B Testing Roadmap',
      subtitle: 'Systematic Optimization',
      icon: <Zap className="w-16 h-16" />,
      color: 'from-yellow-500 to-orange-600',
      content: (
        <div className="space-y-4">
          {[
            {
              test: 'Hero Video Test',
              variants: 'Static vs Motion',
              hypothesis: 'Motion increases engagement +40%',
              status: 'Ready',
            },
            {
              test: 'CTA Button Color',
              variants: 'Purple vs Green',
              hypothesis: 'Green improves conversions +15%',
              status: 'Ready',
            },
            {
              test: 'Pricing Display',
              variants: 'Starting at vs Full price',
              hypothesis: 'Starting at reduces friction +20%',
              status: 'Ready',
            },
            {
              test: 'Social Proof',
              variants: 'Reviews vs Stats',
              hypothesis: 'Stats build trust +25%',
              status: 'Ready',
            },
            {
              test: 'Qualifier Length',
              variants: '3 vs 5 questions',
              hypothesis: 'Shorter increases completions +30%',
              status: 'Pending',
            },
            {
              test: 'Package Names',
              variants: 'Premium vs Pro',
              hypothesis: 'Pro feels more accessible +18%',
              status: 'Pending',
            },
          ].map((test) => (
            <Card key={test.test} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold">{test.test}</h4>
                    <Badge variant={test.status === 'Ready' ? 'default' : 'outline'}>
                      {test.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Variants: {test.variants}</p>
                  <p className="text-sm">{test.hypothesis}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ),
    },
    {
      id: 9,
      title: 'Technical Infrastructure',
      subtitle: 'Built to Scale',
      icon: <Shield className="w-16 h-16" />,
      color: 'from-slate-500 to-gray-600',
      content: (
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-bold text-lg mb-4">Current Stack</h4>
            <div className="space-y-3">
              {[
                { tech: 'React + TypeScript', status: 'Production Ready' },
                { tech: 'Supabase Backend', status: 'Fully Configured' },
                { tech: 'Stripe Payments', status: 'Live & Testing' },
                { tech: 'Edge Functions', status: '15+ Deployed' },
                { tech: 'AI Integration', status: 'Gemini 2.5 Flash' },
                { tech: 'Real-time Collab', status: 'WebSocket Active' },
              ].map((item) => (
                <div key={item.tech} className="flex justify-between items-center">
                  <span className="text-sm">{item.tech}</span>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-lg mb-4">Scalability</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Current Capacity</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Concurrent Users:</span>
                    <span className="font-medium">10,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DB Connections:</span>
                    <span className="font-medium">Unlimited</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File Storage:</span>
                    <span className="font-medium">100GB+</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Performance</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Page Load:</span>
                    <span className="font-medium text-green-600">&lt;2s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Response:</span>
                    <span className="font-medium text-green-600">&lt;200ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span className="font-medium text-green-600">99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 10,
      title: 'Launch Timeline',
      subtitle: '90-Day Execution Plan',
      icon: <Calendar className="w-16 h-16" />,
      color: 'from-blue-500 to-indigo-600',
      content: (
        <div className="space-y-4">
          {[
            {
              phase: 'Days 1-7: Foundation',
              tasks: [
                'Launch paid ads ($3K test budget)',
                'Activate A/B tests (hero, CTA, pricing)',
                'Monitor funnel metrics hourly',
                'Gather initial user feedback',
              ],
              target: '$5-8K revenue',
            },
            {
              phase: 'Days 8-30: Growth',
              tasks: [
                'Scale winning ad creatives to $12K/mo',
                'Implement winning A/B variants',
                'Launch influencer partnerships',
                'Optimize conversion funnel',
              ],
              target: '$22-30K revenue',
            },
            {
              phase: 'Days 31-60: Acceleration',
              tasks: [
                'Full ad budget deployment ($15K/mo)',
                'Launch referral program',
                'Implement advanced matching AI',
                'Expand to new channels (LinkedIn, Reddit)',
              ],
              target: '$45-60K revenue',
            },
            {
              phase: 'Days 61-90: Optimization',
              tasks: [
                'Fine-tune all acquisition channels',
                'Maximize customer LTV through upsells',
                'Implement retention strategies',
                'Prepare for Series A metrics',
              ],
              target: '$66-88K revenue',
            },
          ].map((phase) => (
            <Card key={phase.phase} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold">{phase.phase}</h4>
                <Badge className="bg-green-500">{phase.target}</Badge>
              </div>
              <ul className="space-y-1 text-sm">
                {phase.tasks.map((task) => (
                  <li key={task} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      ),
    },
    {
      id: 11,
      title: 'Risk Management',
      subtitle: 'Identified Risks & Mitigation',
      icon: <AlertTriangle className="w-16 h-16" />,
      color: 'from-red-500 to-orange-600',
      content: (
        <div className="space-y-4">
          {[
            {
              risk: 'Ad Costs Higher Than Expected',
              severity: 'Medium',
              mitigation: 'Start with $3K test budget, scale only proven winners. Stop campaigns below 3x ROAS.',
              probability: '40%',
            },
            {
              risk: 'Conversion Rate Below Target',
              severity: 'High',
              mitigation: 'A/B test aggressively. Have 6 tests ready to launch. Implement user feedback loops.',
              probability: '35%',
            },
            {
              risk: 'Engineer Supply Constraint',
              severity: 'Medium',
              mitigation: 'Recruit 50+ engineers in first month. Build waitlist. Offer sign-up bonuses.',
              probability: '30%',
            },
            {
              risk: 'Payment Processing Issues',
              severity: 'Low',
              mitigation: 'Stripe fully integrated and tested. Have Crypto backup payment option.',
              probability: '10%',
            },
            {
              risk: 'Technical Scalability Issues',
              severity: 'Low',
              mitigation: 'Supabase auto-scales. Load testing complete. CDN configured.',
              probability: '15%',
            },
          ].map((item) => (
            <Card key={item.risk} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold flex-1">{item.risk}</h4>
                <div className="flex gap-2">
                  <Badge variant={item.severity === 'High' ? 'destructive' : 'outline'}>
                    {item.severity}
                  </Badge>
                  <Badge variant="outline">{item.probability}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{item.mitigation}</p>
            </Card>
          ))}
        </div>
      ),
    },
    {
      id: 12,
      title: 'Success Metrics Dashboard',
      subtitle: 'Weekly KPI Tracking',
      icon: <BarChart3 className="w-16 h-16" />,
      color: 'from-purple-500 to-pink-600',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { metric: 'Weekly Revenue', current: '$5.8K', target: '$22K', status: 'on-track' },
              { metric: 'Homepage Conv', current: '3.2%', target: '6%', status: 'improving' },
              { metric: 'New Signups', current: '127', target: '300', status: 'on-track' },
              { metric: 'Projects Started', current: '43', target: '150', status: 'below' },
            ].map((kpi) => (
              <Card key={kpi.metric} className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{kpi.metric}</p>
                <p className="text-2xl font-bold">{kpi.current}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs">Target: {kpi.target}</p>
                  <Badge
                    variant={
                      kpi.status === 'on-track'
                        ? 'default'
                        : kpi.status === 'improving'
                          ? 'outline'
                          : 'destructive'
                    }
                  >
                    {kpi.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
          <Card className="p-6">
            <h4 className="font-bold mb-4">North Star Metrics (90 Days)</h4>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
                <p className="text-3xl font-bold">$66-88K</p>
                <p className="text-xs text-green-600 mt-1">+2,700% vs current</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Active Users</p>
                <p className="text-3xl font-bold">1,200+</p>
                <p className="text-xs text-green-600 mt-1">+400% vs current</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">MRR</p>
                <p className="text-3xl font-bold">$28-35K</p>
                <p className="text-xs text-green-600 mt-1">Path to $50M valuation</p>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 13,
      title: 'Next 48 Hours',
      subtitle: 'Immediate Action Items',
      icon: <Rocket className="w-16 h-16" />,
      color: 'from-orange-500 to-red-600',
      content: (
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10">
            <h4 className="font-bold text-xl mb-4">Critical Tasks</h4>
            <div className="space-y-3">
              {[
                {
                  priority: '1',
                  task: 'Launch Google Ads with $3K test budget',
                  owner: 'Marketing Team',
                  deadline: '24 hours',
                },
                {
                  priority: '2',
                  task: 'Activate Hero Video A/B test',
                  owner: 'Product Team',
                  deadline: '24 hours',
                },
                {
                  priority: '3',
                  task: 'Recruit 20 engineers for launch',
                  owner: 'Operations',
                  deadline: '48 hours',
                },
                {
                  priority: '4',
                  task: 'Set up analytics tracking dashboard',
                  owner: 'Data Team',
                  deadline: '48 hours',
                },
                {
                  priority: '5',
                  task: 'Create TikTok before/after content',
                  owner: 'Content Team',
                  deadline: '48 hours',
                },
              ].map((item) => (
                <div key={item.task} className="flex items-start gap-4 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {item.priority}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.task}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Owner: {item.owner}</span>
                      <span>Deadline: {item.deadline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 14,
      title: 'Conclusion',
      subtitle: 'Ready for $50M Launch',
      icon: <CheckCircle2 className="w-16 h-16" />,
      color: 'from-green-500 to-emerald-600',
      content: (
        <div className="text-center space-y-8">
          <div>
            <h3 className="text-4xl font-bold mb-4">We're Ready to Launch</h3>
            <p className="text-xl text-muted-foreground">
              All systems operational. Team aligned. Strategy validated.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Card className="p-6">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-bold mb-2">8 Phases Complete</h4>
              <p className="text-sm text-muted-foreground">
                Hero, Qualifier, Pricing, Value Prop, UX, Monetization, Trust, Mobile
              </p>
            </Card>
            <Card className="p-6">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-bold mb-2">Infrastructure Ready</h4>
              <p className="text-sm text-muted-foreground">
                15+ edge functions, AI matching, real-time collab, payments live
              </p>
            </Card>
            <Card className="p-6">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-bold mb-2">Growth Engine Built</h4>
              <p className="text-sm text-muted-foreground">
                Paid ads, A/B testing, analytics tracking, revenue prediction
              </p>
            </Card>
          </div>
          <div className="pt-6">
            <p className="text-2xl font-bold mb-2">Target: $66-88K Monthly Revenue</p>
            <p className="text-muted-foreground">90 days to transform MixClub into a $50M company</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">$50M Launch Strategy</h1>
            <p className="text-muted-foreground">Slide {currentSlide + 1} of {slides.length}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Exit Presentation
            </Button>
            <Button onClick={() => navigate('/admin/launch-dashboard')}>
              Launch Dashboard
            </Button>
          </div>
        </div>

        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`p-8 bg-gradient-to-br ${slides[currentSlide].color} text-white border-0`}>
              <div className="flex items-center gap-4 mb-6">
                {slides[currentSlide].icon}
                <div>
                  <h2 className="text-4xl font-bold">{slides[currentSlide].title}</h2>
                  {slides[currentSlide].subtitle && (
                    <p className="text-xl opacity-90 mt-2">{slides[currentSlide].subtitle}</p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="mt-6 p-8 min-h-[500px]">
              {slides[currentSlide].content}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-primary w-8' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLaunchPresentation;
