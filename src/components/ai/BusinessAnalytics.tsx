import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { useAIGeneration } from "@/hooks/useAIGeneration";

export const BusinessAnalytics = () => {
  const [activeTab, setActiveTab] = useState("pricing");
  const [result, setResult] = useState<any>(null);

  const { generate, isGenerating } = useAIGeneration<{ analysis: any }>({
    functionName: 'business-analytics',
    successMessage: 'Analysis complete!',
    errorMessage: 'Failed to analyze',
  });

  const analyzePricing = async () => {
    const data = await generate({
      analysisType: 'pricing',
      userData: {
        serviceType: 'Mixing',
        yearsExperience: 5,
        avgDuration: '3-5 days',
        currentPrice: '$200',
        completedProjects: 150,
        avgRating: 4.7,
        location: 'United States',
      },
    });

    if (data?.analysis) {
      setResult(data.analysis);
    }
  };

  const analyzeForecast = async () => {
    const data = await generate({
      analysisType: 'forecast',
      userData: {
        monthlyProjects: [12, 15, 18, 20, 17, 19],
        avgProjectValue: 250,
        retentionRate: 65,
        pipelineProjects: 8,
        seasonality: 'Higher in Q4',
      },
    });

    if (data?.analysis) {
      setResult(data.analysis);
    }
  };

  const analyzeTrends = async () => {
    const data = await generate({
      analysisType: 'trends',
      userData: {
        primaryGenre: 'Electronic',
        services: ['Mixing', 'Mastering', 'Production'],
        targetMarket: 'Independent Artists',
      },
    });

    if (data?.analysis) {
      setResult(data.analysis);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Business Analytics</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <TrendingUp className="w-4 h-4 mr-2" />
            Forecast
          </TabsTrigger>
          <TabsTrigger value="trends">
            <BarChart3 className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Get AI-powered pricing recommendations based on your experience and market data.
          </p>
          <Button onClick={analyzePricing} disabled={isGenerating} className="w-full">
            {isGenerating ? "Analyzing..." : "Analyze My Pricing"}
          </Button>

          {result?.recommendedPrice && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recommended Range</span>
                <span className="text-lg font-bold text-primary">
                  ${result.recommendedPrice.min} - ${result.recommendedPrice.max}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{result.justification}</p>
              {result.upsellOpportunities?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Upsell Opportunities:</p>
                  <ul className="text-sm space-y-1">
                    {result.upsellOpportunities.map((opp: string, i: number) => (
                      <li key={i} className="text-muted-foreground">• {opp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Predict your revenue for the next 3 months based on your project pipeline.
          </p>
          <Button onClick={analyzeForecast} disabled={isGenerating} className="w-full">
            {isGenerating ? "Forecasting..." : "Generate Revenue Forecast"}
          </Button>

          {result?.forecast && (
            <div className="space-y-3">
              {result.forecast.map((month: any, i: number) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                  <span className="font-medium">{month.month}</span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">${month.projected.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{month.confidence} confidence</p>
                  </div>
                </div>
              ))}
              {result.recommendations?.length > 0 && (
                <div className="space-y-2 p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium">Growth Recommendations:</p>
                  <ul className="text-sm space-y-1">
                    {result.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-muted-foreground">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Stay ahead with AI analysis of current music industry trends.
          </p>
          <Button onClick={analyzeTrends} disabled={isGenerating} className="w-full">
            {isGenerating ? "Analyzing..." : "Analyze Market Trends"}
          </Button>

          {result?.trendingGenres && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Trending Genres:</p>
                {result.trendingGenres.map((genre: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">{genre.name}</span>
                    <span className="text-xs text-green-500 font-medium">{genre.growth}</span>
                  </div>
                ))}
              </div>

              {result.techniques?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Emerging Techniques:</p>
                  <ul className="text-sm space-y-1">
                    {result.techniques.map((tech: string, i: number) => (
                      <li key={i} className="text-muted-foreground">• {tech}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
