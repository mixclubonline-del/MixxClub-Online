
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsService, type DailyAnalytics } from '@/services/AnalyticsService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Loader2, TrendingUp, Users, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DailyAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await AnalyticsService.recordMockDailyStats(); // Ensure we have data for the demo
    const stats = await AnalyticsService.getDailyStats(7);
    setData(stats);
    setLoading(false);
  };

  // Aggregate data for charts
  const aggregatedByDate = data.reduce((acc, curr) => {
     const existing = acc.find(item => item.date === curr.date);
     if (existing) {
        existing.views += curr.views;
        existing.likes += curr.likes;
     } else {
        acc.push({ date: curr.date, views: curr.views, likes: curr.likes });
     }
     return acc;
  }, [] as { date: string, views: number, likes: number }[]);

  const aggregatedByPlatform = data.reduce((acc, curr) => {
     const existing = acc.find(item => item.name === curr.platform);
     if (existing) {
        existing.totalViews += curr.views;
     } else {
        acc.push({ name: curr.platform, totalViews: curr.views });
     }
     return acc;
  }, [] as { name: string, totalViews: number }[]);

  const totalViews = data.reduce((sum, item) => sum + item.views, 0);
  const totalEngagement = data.reduce((sum, item) => sum + item.likes + item.shares + item.comments, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       
       {/* Top Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views (7d)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Engagement (7d)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{totalEngagement.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Engagement Rate</CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">
                   {totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(1) : 0}%
                </div>
             </CardContent>
          </Card>
       </div>

       {/* Charts Row */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
             <CardHeader>
                <CardTitle>Views Trend</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={aggregatedByDate}>
                         <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                               <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                         <XAxis dataKey="date" />
                         <YAxis />
                         <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }} />
                         <Area type="monotone" dataKey="views" stroke="#8884d8" fillOpacity={1} fill="url(#colorViews)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </CardContent>
          </Card>

          <Card>
             <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={aggregatedByPlatform}>
                         <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                         <XAxis dataKey="name" />
                         <YAxis />
                         <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }} />
                         <Bar dataKey="totalViews" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </CardContent>
          </Card>
       </div>
       
       <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => { localStorage.clear(); loadData(); }}>
             Regenerate Mock Data
          </Button>
       </div>
    </div>
  );
}
