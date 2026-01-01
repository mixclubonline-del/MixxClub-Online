import { Card } from "@/components/ui/card";
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  Award, 
  Sparkles,
  CheckCircle
} from "lucide-react";

interface OpportunityStatsProps {
  analytics?: {
    matches: number;
    activeChats: number;
    completed: number;
  } | null;
  totalOpportunities: number;
  aiMatches: number;
}

export const OpportunityStats = ({ 
  analytics, 
  totalOpportunities,
  aiMatches 
}: OpportunityStatsProps) => {
  const stats = [
    {
      icon: Briefcase,
      label: "Available",
      value: totalOpportunities,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Sparkles,
      label: "AI Matches",
      value: aiMatches,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: TrendingUp,
      label: "Applications",
      value: analytics?.matches || 0,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Users,
      label: "Active Chats",
      value: analytics?.activeChats || 0,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: analytics?.completed || 0,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
