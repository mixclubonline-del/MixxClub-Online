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
      title: 'Revenue Prediction',
      subtitle: prediction ? `Predicted Revenue: $${prediction.predicted_revenue}` : 'Loading prediction...',
      icon: <DollarSign className="w-16 h-16" />,
      color: 'from-purple-500 to-pink-600',
      content: (
        <div className="text-center">
          {prediction ? (
            <p className="text-2xl font-bold">{`Predicted Revenue: $${prediction.predicted_revenue}`}</p>
          ) : (
            <p>Loading prediction...</p>
          )}
        </div>
      ),
    },
    {
      id: 6,
      title: 'Next Steps',
      subtitle: 'Action Items for the Team',
      icon: <Users className="w-16 h-16" />,
      color: 'from-teal-500 to-cyan-600',
      content: (
        <div className="space-y-4">
          <p>1. Finalize marketing strategy.</p>
          <p>2. Prepare for launch event.</p>
          <p>3. Monitor metrics closely post-launch.</p>
        </div>
      ),
    },
    {
      id: 7,
      title: 'Q&A',
      subtitle: 'Questions from the Team',
      icon: <AlertTriangle className="w-16 h-16" />,
      color: 'from-red-500 to-orange-600',
      content: (
        <div className="space-y-4">
          <p>1. What are the biggest risks?</p>
          <p>2. How will we handle customer feedback?</p>
          <p>3. What are our contingency plans?</p>
        </div>
      ),
    },
    {
      id: 8,
      title: 'Conclusion',
      subtitle: 'Summary of the Presentation',
      icon: <CheckCircle2 className="w-16 h-16" />,
      color: 'from-green-500 to-emerald-600',
      content: (
        <div className="text-center">
          <p>Thank you for your attention!</p>
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
