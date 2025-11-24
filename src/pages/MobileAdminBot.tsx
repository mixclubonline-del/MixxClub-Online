import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SecureAdminBot from "@/components/admin/SecureAdminBot";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingUp, Users, DollarSign, Lightbulb, Calendar, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOBILE_QUICK_ACTIONS = [
  { label: "📊 Overview", icon: BarChart3, prompt: "Give me a quick status overview of the platform - key metrics and health." },
  { label: "💰 Revenue", icon: DollarSign, prompt: "Show me today's revenue and recent payment activity." },
  { label: "🎯 Growth", icon: TrendingUp, prompt: "What are the top 3 immediate growth opportunities?" },
  { label: "👥 Engineers", icon: Users, prompt: "Show me active engineer stats and any issues to address." },
  { label: "💡 Insights", icon: Lightbulb, prompt: "Provide 3 actionable insights based on recent data." },
  { label: "📅 Calendar", icon: Calendar, prompt: "What's on my admin calendar this week?" },
  { label: "🎯 Priorities", icon: Target, prompt: "What are the most urgent admin tasks right now?" },
];

export default function MobileAdminBot() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!loading && !user) {
        navigate('/auth');
        return;
      }

      if (user) {
        const { data, error } = await supabase.rpc('has_role', { 
          _user_id: user.id,
          _role: 'admin'
        });
        
        if (error || !data) {
          navigate('/');
          return;
        }
        
        setIsAdmin(Boolean(data));
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, loading, navigate]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
          <span className="ml-2">Loading Admin Bot...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-6 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground mb-4">
            This page is only accessible to administrators.
          </p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-purple-600 text-white p-4 flex items-center gap-3 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin')}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-bold text-lg">AI Admin Control</h1>
          <p className="text-xs text-white/80">Manage MixClub from anywhere</p>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white">
          MOBILE
        </Badge>
      </div>

      {/* Info Banner */}
      <div className="bg-muted/50 p-3 border-b">
        <p className="text-xs text-muted-foreground text-center">
          🔒 <strong>Secure Mode</strong> • All actions logged • Read-only AI analysis
        </p>
      </div>

      {/* Full Screen Chatbot */}
      <div className="flex-1 overflow-hidden">
        <SecureAdminBot 
          isFullScreen={true}
          quickActions={MOBILE_QUICK_ACTIONS}
        />
      </div>

      {/* Mobile Bottom Info */}
      <div className="bg-muted/30 p-2 text-center border-t">
        <p className="text-[10px] text-muted-foreground">
          Powered by AI • Enterprise Security • Real-time Data
        </p>
      </div>
    </div>
  );
}
