import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Package, FileCode, Image, FileText } from 'lucide-react';

interface BundleInfo {
  name: string;
  size: string;
  percentage: number;
  type: 'js' | 'css' | 'image' | 'other';
}

export const BundleAnalyzer = () => {
  // This is a simplified view - in production you'd get this from webpack-bundle-analyzer
  const bundleData: BundleInfo[] = [
    { name: 'React & React-DOM', size: '~140 KB', percentage: 35, type: 'js' },
    { name: 'Supabase Client', size: '~80 KB', percentage: 20, type: 'js' },
    { name: 'Radix UI Components', size: '~60 KB', percentage: 15, type: 'js' },
    { name: 'Lucide Icons', size: '~40 KB', percentage: 10, type: 'js' },
    { name: 'React Query', size: '~30 KB', percentage: 8, type: 'js' },
    { name: 'Application Code', size: '~50 KB', percentage: 12, type: 'js' },
  ];

  const totalSize = '~400 KB';

  const getIcon = (type: BundleInfo['type']) => {
    switch (type) {
      case 'js':
        return <FileCode className="h-4 w-4" />;
      case 'css':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: BundleInfo['type']) => {
    switch (type) {
      case 'js':
        return 'text-yellow-600';
      case 'css':
        return 'text-blue-600';
      case 'image':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Bundle Analysis
        </CardTitle>
        <CardDescription>
          Estimated bundle composition (Total: {totalSize} gzipped)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {bundleData.map((bundle) => (
          <div key={bundle.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={getTypeColor(bundle.type)}>
                  {getIcon(bundle.type)}
                </span>
                <span className="text-sm font-medium">{bundle.name}</span>
              </div>
              <Badge variant="outline">
                {bundle.size}
              </Badge>
            </div>
            <Progress value={bundle.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {bundle.percentage}% of total bundle
            </p>
          </div>
        ))}

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Optimization Tips:</strong>
          </p>
          <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-4">
            <li>• Use lazy loading for routes (already implemented)</li>
            <li>• Consider tree-shaking unused exports</li>
            <li>• Optimize images with WebP format</li>
            <li>• Split vendor chunks for better caching</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
