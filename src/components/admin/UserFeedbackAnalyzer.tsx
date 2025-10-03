import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ThumbsUp, ThumbsDown, MessageCircle, TrendingUp } from "lucide-react";

const sentimentData = [
  { name: 'Very Positive', value: 145 },
  { name: 'Positive', value: 320 },
  { name: 'Neutral', value: 180 },
  { name: 'Negative', value: 65 },
  { name: 'Very Negative', value: 20 },
];

const featureRequestData = [
  { category: 'Audio Features', count: 45 },
  { category: 'Collaboration', count: 38 },
  { category: 'UI/UX', count: 32 },
  { category: 'Mobile App', count: 28 },
  { category: 'Integration', count: 24 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#991b1b'];

const topFeedback = [
  { id: 1, text: 'Love the real-time collaboration features!', sentiment: 'positive', votes: 24 },
  { id: 2, text: 'Need better export options for stems', sentiment: 'neutral', votes: 18 },
  { id: 3, text: 'Mobile app would be amazing', sentiment: 'positive', votes: 15 },
  { id: 4, text: 'Payment processing needs improvement', sentiment: 'negative', votes: 12 },
];

export function UserFeedbackAnalyzer() {
  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'positive') return <ThumbsUp className="h-4 w-4 text-green-500" />;
    if (sentiment === 'negative') return <ThumbsDown className="h-4 w-4 text-red-500" />;
    return <MessageCircle className="h-4 w-4 text-blue-500" />;
  };

  const totalFeedback = sentimentData.reduce((sum, item) => sum + item.value, 0);
  const positiveFeedback = sentimentData.slice(0, 2).reduce((sum, item) => sum + item.value, 0);
  const satisfactionRate = Math.round((positiveFeedback / totalFeedback) * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeedback}</div>
            <div className="flex items-center gap-1 mt-1 text-sm text-green-500">
              <TrendingUp className="h-4 w-4" />
              <span>+12% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Satisfaction Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{satisfactionRate}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              {positiveFeedback} positive responses
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Feature Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">167</div>
            <div className="text-sm text-muted-foreground mt-1">
              Across 5 categories
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
            <CardDescription>Overall user sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Requests by Category</CardTitle>
            <CardDescription>Most requested features</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={featureRequestData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="category" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top User Feedback</CardTitle>
          <CardDescription>Most voted feedback from users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getSentimentIcon(feedback.sentiment)}
                  <span>{feedback.text}</span>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {feedback.votes}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
