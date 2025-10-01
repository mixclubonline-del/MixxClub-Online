import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Award, TrendingUp, DollarSign, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyAward {
  id: string;
  period_month: number;
  period_year: number;
  award_category: string;
  award_value: number;
  award_description: string;
  awarded_at: string;
  winner: {
    full_name: string;
  };
}

export const MonthlyAwards = () => {
  const [awards, setAwards] = useState<MonthlyAward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const { data, error } = await supabase
      .from('monthly_awards')
      .select(`
        *,
        winner:profiles!monthly_awards_winner_id_fkey(full_name)
      `)
      .eq('period_month', currentMonth)
      .eq('period_year', currentYear)
      .order('awarded_at', { ascending: false });

    if (!error && data) {
      setAwards(data as any);
    }
    setLoading(false);
  };

  const getAwardIcon = (category: string) => {
    switch (category) {
      case 'top_earner': return <DollarSign className="h-6 w-6" />;
      case 'top_rated': return <TrendingUp className="h-6 w-6" />;
      case 'most_projects': return <Briefcase className="h-6 w-6" />;
      default: return <Award className="h-6 w-6" />;
    }
  };

  const getAwardTitle = (category: string) => {
    switch (category) {
      case 'top_earner': return 'Top Earner';
      case 'top_rated': return 'Highest Rated';
      case 'most_projects': return 'Most Productive';
      default: return category;
    }
  };

  const getAwardColor = (category: string) => {
    switch (category) {
      case 'top_earner': return 'bg-gradient-to-br from-yellow-500 to-amber-600';
      case 'top_rated': return 'bg-gradient-to-br from-blue-500 to-indigo-600';
      case 'most_projects': return 'bg-gradient-to-br from-green-500 to-emerald-600';
      default: return 'bg-gradient-to-br from-purple-500 to-pink-600';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading awards...</div>;
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Monthly Awards - {currentMonth}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {awards.map((award) => (
          <Card 
            key={award.id} 
            className="relative overflow-hidden"
          >
            <div className={`absolute inset-0 opacity-10 ${getAwardColor(award.award_category)}`} />
            
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-full ${getAwardColor(award.award_category)} text-white`}>
                  {getAwardIcon(award.award_category)}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {currentMonth}
                </Badge>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-1">
                  {getAwardTitle(award.award_category)}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {award.award_description}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t">
                <Avatar>
                  <AvatarFallback>
                    {award.winner?.full_name?.charAt(0) || 'W'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{award.winner?.full_name || 'Winner'}</p>
                  <p className="text-sm text-muted-foreground">
                    {award.award_category === 'top_earner' && `$${award.award_value}`}
                    {award.award_category === 'top_rated' && `${award.award_value.toFixed(1)} ⭐`}
                    {award.award_category === 'most_projects' && `${award.award_value} projects`}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {awards.length === 0 && (
          <Card className="col-span-3 p-12 text-center">
            <Award className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h4 className="font-semibold mb-2">No Awards Yet</h4>
            <p className="text-sm text-muted-foreground">
              Awards will be announced at the end of this month
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
