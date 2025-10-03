import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Search, CheckCircle, AlertCircle, XCircle, 
  TrendingUp, Eye, Link, FileText
} from "lucide-react";

interface SEOCheck {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  score: number;
}

const seoChecks: SEOCheck[] = [
  {
    name: 'Title Tag',
    status: 'passed',
    message: 'Title is 58 characters (optimal: 50-60)',
    score: 100
  },
  {
    name: 'Meta Description',
    status: 'passed',
    message: 'Description is 155 characters (optimal: 150-160)',
    score: 100
  },
  {
    name: 'URL Structure',
    status: 'passed',
    message: 'Clean, descriptive URL with target keywords',
    score: 100
  },
  {
    name: 'Headings Structure',
    status: 'passed',
    message: 'Proper H1-H6 hierarchy with keywords',
    score: 100
  },
  {
    name: 'Keyword Density',
    status: 'warning',
    message: 'Primary keyword appears 8 times (recommended: 10-15)',
    score: 75
  },
  {
    name: 'Image Alt Tags',
    status: 'warning',
    message: '2 of 5 images missing alt text',
    score: 60
  },
  {
    name: 'Internal Links',
    status: 'passed',
    message: '7 internal links found (good)',
    score: 90
  },
  {
    name: 'External Links',
    status: 'passed',
    message: '3 authoritative external links',
    score: 95
  },
  {
    name: 'Content Length',
    status: 'passed',
    message: '2,847 words (excellent for SEO)',
    score: 100
  },
  {
    name: 'Readability Score',
    status: 'passed',
    message: 'Flesch Reading Ease: 68 (standard)',
    score: 85
  },
  {
    name: 'Mobile Friendly',
    status: 'passed',
    message: 'Content is mobile-optimized',
    score: 100
  },
  {
    name: 'Page Load Speed',
    status: 'warning',
    message: 'Load time: 2.3s (aim for <2s)',
    score: 70
  }
];

export function SEOOptimizer() {
  const getStatusIcon = (status: SEOCheck['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: SEOCheck['status']) => {
    const variants: Record<string, any> = {
      passed: 'default',
      warning: 'secondary',
      failed: 'destructive'
    };
    return variants[status];
  };

  const overallScore = Math.round(
    seoChecks.reduce((sum, check) => sum + check.score, 0) / seoChecks.length
  );

  const passedCount = seoChecks.filter(c => c.status === 'passed').length;
  const warningCount = seoChecks.filter(c => c.status === 'warning').length;
  const failedCount = seoChecks.filter(c => c.status === 'failed').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO Optimizer
        </CardTitle>
        <CardDescription>Analyze and improve search engine optimization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="p-6 border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{overallScore}/100</div>
            <div className="text-sm text-muted-foreground mb-4">Overall SEO Score</div>
            <Progress value={overallScore} className="h-3" />
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <Badge className="gap-1">
                <CheckCircle className="h-3 w-3" />
                {passedCount} Passed
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {warningCount} Warnings
              </Badge>
              {failedCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  {failedCount} Failed
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 border rounded-lg bg-card text-center">
            <Eye className="h-5 w-5 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">2,847</div>
            <div className="text-xs text-muted-foreground">Words</div>
          </div>

          <div className="p-4 border rounded-lg bg-card text-center">
            <Search className="h-5 w-5 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">8</div>
            <div className="text-xs text-muted-foreground">Keywords</div>
          </div>

          <div className="p-4 border rounded-lg bg-card text-center">
            <Link className="h-5 w-5 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">10</div>
            <div className="text-xs text-muted-foreground">Links</div>
          </div>

          <div className="p-4 border rounded-lg bg-card text-center">
            <FileText className="h-5 w-5 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">68</div>
            <div className="text-xs text-muted-foreground">Readability</div>
          </div>
        </div>

        {/* SEO Checks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">SEO Analysis</h3>
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Suggestions
            </Button>
          </div>

          {seoChecks.map((check) => (
            <div
              key={check.name}
              className="flex items-start gap-3 p-3 border rounded-lg bg-card"
            >
              {getStatusIcon(check.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{check.name}</span>
                  <Badge variant={getStatusBadge(check.status)} className="text-xs">
                    {check.score}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{check.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1">
            Export Report
          </Button>
          <Button variant="outline" className="flex-1">
            View Details
          </Button>
          <Button className="flex-1">
            Apply Suggestions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
