import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, CheckCircle, AlertTriangle, XCircle, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

interface SEOCheck {
  item: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
}

export const SEOOptimizer = () => {
  const [seoChecks] = useState<SEOCheck[]>([
    {
      item: 'Page Title',
      status: 'pass',
      description: 'Title is optimized (58 characters)'
    },
    {
      item: 'Meta Description',
      status: 'pass',
      description: 'Description is within 155-160 characters'
    },
    {
      item: 'H1 Tag',
      status: 'pass',
      description: 'Single H1 tag present with target keyword'
    },
    {
      item: 'Image Alt Text',
      status: 'warning',
      description: '3 images missing alt text'
    },
    {
      item: 'Mobile Responsive',
      status: 'pass',
      description: 'Page is mobile-friendly'
    },
    {
      item: 'Page Speed',
      status: 'warning',
      description: 'Load time: 2.1s (target: <2s)'
    },
    {
      item: 'SSL Certificate',
      status: 'pass',
      description: 'HTTPS enabled'
    },
    {
      item: 'Structured Data',
      status: 'fail',
      description: 'Missing schema markup for services'
    }
  ]);

  const [metaData, setMetaData] = useState({
    title: 'Mixxclub - Professional Audio Mixing & Mastering Platform',
    description: 'Connect with top audio engineers for professional mixing and mastering. AI-powered matching, real-time collaboration, and quality guaranteed.',
    keywords: 'audio mixing, mastering, music production, audio engineers, mixing services'
  });

  const passCount = seoChecks.filter(c => c.status === 'pass').length;
  const seoScore = Math.round((passCount / seoChecks.length) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Health Score
          </CardTitle>
          <CardDescription>
            Current optimization status and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{seoScore}%</span>
              <Badge variant={seoScore >= 80 ? 'default' : seoScore >= 60 ? 'secondary' : 'destructive'}>
                {seoScore >= 80 ? 'Excellent' : seoScore >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
            <Progress value={seoScore} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {passCount} of {seoChecks.length} checks passed
            </p>
          </div>

          <div className="space-y-2">
            {seoChecks.map((check, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                {check.status === 'pass' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                {check.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                {check.status === 'fail' && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                <div className="flex-1">
                  <p className="font-medium text-sm">{check.item}</p>
                  <p className="text-xs text-muted-foreground">{check.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meta Tags Editor</CardTitle>
          <CardDescription>
            Optimize your page metadata for search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta-title">Page Title</Label>
            <Input
              id="meta-title"
              value={metaData.title}
              onChange={(e) => setMetaData({ ...metaData, title: e.target.value })}
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              {metaData.title.length}/60 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              value={metaData.description}
              onChange={(e) => setMetaData({ ...metaData, description: e.target.value })}
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {metaData.description.length}/160 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-keywords">Keywords</Label>
            <Input
              id="meta-keywords"
              value={metaData.keywords}
              onChange={(e) => setMetaData({ ...metaData, keywords: e.target.value })}
              placeholder="Comma-separated keywords"
            />
          </div>

          <Button className="w-full">
            Update Meta Tags
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Search Rankings
          </CardTitle>
          <CardDescription>
            Current keyword rankings and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { keyword: 'audio mixing services', position: 12, change: +3 },
              { keyword: 'online mastering', position: 8, change: +2 },
              { keyword: 'music mixing engineer', position: 15, change: -1 },
              { keyword: 'professional mixing', position: 22, change: +5 }
            ].map((ranking, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{ranking.keyword}</p>
                  <p className="text-xs text-muted-foreground">Position {ranking.position}</p>
                </div>
                <Badge variant={ranking.change > 0 ? 'default' : 'secondary'}>
                  {ranking.change > 0 ? '↑' : '↓'} {Math.abs(ranking.change)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
