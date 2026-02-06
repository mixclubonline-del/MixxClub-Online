import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image, Layers, Eye } from 'lucide-react';
import { format } from 'date-fns';

export const AdminAssetsHub = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [contexts, setContexts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetsData();
  }, []);

  const fetchAssetsData = async () => {
    try {
      const [{ data: assetsData }, { data: contextsData }] = await Promise.all([
        supabase.from('brand_assets').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('asset_contexts').select('*').order('name'),
      ]);

      setAssets(assetsData || []);
      setContexts(contextsData || []);
    } catch (error) {
      console.error('Failed to fetch assets data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeAssets = assets.filter(a => a.is_active);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10"><Image className="w-5 h-5 text-purple-500" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{assets.length}</p>
              <p className="text-xs text-muted-foreground">Total Assets</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><Eye className="w-5 h-5 text-green-500" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeAssets.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Layers className="w-5 h-5 text-blue-500" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{contexts.length}</p>
              <p className="text-xs text-muted-foreground">Contexts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Contexts */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="w-4 h-4" /> Asset Contexts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {contexts.map((ctx) => (
              <Badge key={ctx.id} variant="outline" className="text-sm">
                {ctx.icon && <span className="mr-1">{ctx.icon}</span>}
                {ctx.name}
                <span className="ml-1 opacity-60 text-xs">({ctx.context_prefix})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Image className="w-4 h-4" /> Brand Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {assets.slice(0, 20).map((asset) => (
              <div key={asset.id} className="group relative rounded-lg overflow-hidden border border-border/30 bg-muted/30">
                {asset.thumbnail_url || asset.public_url ? (
                  <img
                    src={asset.thumbnail_url || asset.public_url}
                    alt={asset.name}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 bg-muted flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium text-foreground truncate">{asset.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-[10px]">{asset.asset_context || asset.asset_type}</Badge>
                    {asset.is_active && (
                      <span className="w-2 h-2 rounded-full bg-green-500" title="Active" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
