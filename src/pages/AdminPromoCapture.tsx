import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, Download, Sparkles, Image as ImageIcon, 
  AudioWaveform, Users, Bot, Sliders, RefreshCw, Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import promo images
import studioConsoleHero from '@/assets/promo/studio-console-hero.jpg';
import pluginShowcaseHero from '@/assets/promo/plugin-showcase-hero.jpg';
import collaborationHero from '@/assets/promo/collaboration-hero.jpg';
import primebotAvatar from '@/assets/promo/primebot-avatar.jpg';
import dawInterfaceHero from '@/assets/promo/daw-interface-hero.jpg';

interface PromoAsset {
  id: string;
  name: string;
  category: string;
  imageSrc: string;
  context: string;
  status: 'new' | 'synced' | 'pending';
}

const promoAssets: PromoAsset[] = [
  { 
    id: 'studio-console', 
    name: 'Studio Console Hero', 
    category: 'promo', 
    imageSrc: studioConsoleHero,
    context: 'promo_studio',
    status: 'new'
  },
  { 
    id: 'plugin-showcase', 
    name: 'MixxMaster Plugin', 
    category: 'promo', 
    imageSrc: pluginShowcaseHero,
    context: 'promo_plugin',
    status: 'new'
  },
  { 
    id: 'collaboration', 
    name: 'Collaboration Scene', 
    category: 'promo', 
    imageSrc: collaborationHero,
    context: 'promo_collab',
    status: 'new'
  },
  { 
    id: 'primebot', 
    name: 'PrimeBot Avatar', 
    category: 'promo', 
    imageSrc: primebotAvatar,
    context: 'promo_primebot',
    status: 'new'
  },
  { 
    id: 'daw-interface', 
    name: 'DAW Interface', 
    category: 'promo', 
    imageSrc: dawInterfaceHero,
    context: 'promo_daw',
    status: 'new'
  },
];

export default function AdminPromoCapture() {
  const [assets, setAssets] = useState(promoAssets);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());

  const handleSyncToStorage = async (asset: PromoAsset) => {
    setSyncing(asset.id);
    try {
      // Download the image and upload to Supabase storage
      const response = await fetch(asset.imageSrc);
      const blob = await response.blob();
      
      const fileName = `promo/${asset.id}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      // Insert into brand_assets table
      const { error: dbError } = await supabase
        .from('brand_assets')
        .insert({
          name: asset.name,
          asset_type: 'image',
          category: 'promo',
          asset_context: asset.context,
          storage_path: fileName,
          public_url: urlData.publicUrl,
          is_active: true,
        });

      if (dbError) throw dbError;

      setAssets(prev => prev.map(a => 
        a.id === asset.id ? { ...a, status: 'synced' as const } : a
      ));
      
      toast.success(`${asset.name} synced to storage`);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync asset');
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncAll = async () => {
    for (const asset of assets.filter(a => a.status !== 'synced')) {
      await handleSyncToStorage(asset);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedAssets(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      <Helmet>
        <title>Promo Capture — Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Camera className="w-8 h-8 text-primary" />
                Promo Capture Center
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-generated promotional assets for MixClub marketing
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSyncAll}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync All to Storage
              </Button>
              <Button>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{assets.length}</p>
                    <p className="text-sm text-muted-foreground">Total Assets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Check className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{assets.filter(a => a.status === 'synced').length}</p>
                    <p className="text-sm text-muted-foreground">Synced</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-accent-pink" />
                  <div>
                    <p className="text-2xl font-bold">{assets.filter(a => a.status === 'new').length}</p>
                    <p className="text-sm text-muted-foreground">New</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Download className="w-8 h-8 text-accent-blue" />
                  <div>
                    <p className="text-2xl font-bold">{selectedAssets.size}</p>
                    <p className="text-sm text-muted-foreground">Selected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Assets</TabsTrigger>
              <TabsTrigger value="studio">Studio</TabsTrigger>
              <TabsTrigger value="plugins">Plugins</TabsTrigger>
              <TabsTrigger value="collab">Collaboration</TabsTrigger>
              <TabsTrigger value="primebot">PrimeBot</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map((asset) => (
                  <Card 
                    key={asset.id}
                    className={`overflow-hidden cursor-pointer transition-all duration-300 ${
                      selectedAssets.has(asset.id) ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => toggleSelection(asset.id)}
                  >
                    <div className="relative aspect-video">
                      <img 
                        src={asset.imageSrc} 
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={asset.status === 'synced' ? 'default' : 'secondary'}>
                          {asset.status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{asset.name}</h4>
                          <p className="text-sm text-muted-foreground">{asset.context}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={syncing === asset.id || asset.status === 'synced'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSyncToStorage(asset);
                          }}
                        >
                          {syncing === asset.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : asset.status === 'synced' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Other tabs show filtered content */}
            {['studio', 'plugins', 'collab', 'primebot'].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assets.filter(a => a.context.includes(tab)).map((asset) => (
                    <Card key={asset.id} className="overflow-hidden">
                      <div className="relative aspect-video">
                        <img 
                          src={asset.imageSrc} 
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold">{asset.name}</h4>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </AdminLayout>
    </>
  );
}
