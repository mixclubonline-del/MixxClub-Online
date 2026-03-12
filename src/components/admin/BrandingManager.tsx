import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Paintbrush, Eye, Save, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBrandConfig } from '@/hooks/useBrandConfig';
import { useUpdateConfig } from '@/hooks/usePlatformConfig';
import { toast } from 'sonner';

export const BrandingManager: React.FC = () => {
  const { config, isLoading } = useBrandConfig();
  const updateConfig = useUpdateConfig();

  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [accentColor, setAccentColor] = useState('');

  useEffect(() => {
    if (config) {
      setBrandName(config.brand_name);
      setLogoUrl(config.brand_logo_url || '');
      setPrimaryColor(config.brand_primary_color);
      setAccentColor(config.brand_accent_color);
    }
  }, [config]);

  const saveAll = async () => {
    try {
      await Promise.all([
        updateConfig.mutateAsync({ key: 'brand_name', value: brandName }),
        updateConfig.mutateAsync({ key: 'brand_logo_url', value: logoUrl || null }),
        updateConfig.mutateAsync({ key: 'brand_primary_color', value: primaryColor }),
        updateConfig.mutateAsync({ key: 'brand_accent_color', value: accentColor }),
      ]);
      toast.success('Brand settings saved');
    } catch {
      toast.error('Failed to save brand settings');
    }
  };

  const resetDefaults = () => {
    setBrandName('Mixx Club');
    setLogoUrl('');
    setPrimaryColor('280 100% 65%');
    setAccentColor('320 90% 60%');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Paintbrush className="h-6 w-6 text-primary" />
          White-Label Branding
        </h2>
        <p className="text-muted-foreground text-sm">Customize the platform's look and identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Brand Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Brand Name</Label>
              <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Your brand name" />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>Primary Color (HSL)</Label>
              <div className="flex gap-2">
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="280 100% 65%" className="flex-1" />
                <div className="w-10 h-10 rounded-md border border-border shrink-0" style={{ background: `hsl(${primaryColor})` }} />
              </div>
            </div>
            <div>
              <Label>Accent Color (HSL)</Label>
              <div className="flex gap-2">
                <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} placeholder="320 90% 60%" className="flex-1" />
                <div className="w-10 h-10 rounded-md border border-border shrink-0" style={{ background: `hsl(${accentColor})` }} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={saveAll} disabled={updateConfig.isPending} className="flex-1">
                <Save className="h-4 w-4 mr-1" /> Save Changes
              </Button>
              <Button variant="outline" onClick={resetDefaults}>
                <RotateCcw className="h-4 w-4 mr-1" /> Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-4 w-4" /> Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="rounded-xl overflow-hidden border border-border/50"
              style={{ background: 'hsl(var(--background))' }}
            >
              {/* Preview Header */}
              <div className="p-4 flex items-center gap-3" style={{ background: `hsl(${primaryColor} / 0.1)` }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded-md object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: `hsl(${primaryColor})`, color: 'white' }}>
                    {brandName.charAt(0)}
                  </div>
                )}
                <span className="font-bold">{brandName}</span>
              </div>

              {/* Preview Content */}
              <div className="p-4 space-y-3">
                <div className="h-3 rounded-full w-3/4" style={{ background: `hsl(${primaryColor} / 0.2)` }} />
                <div className="h-3 rounded-full w-1/2" style={{ background: `hsl(${accentColor} / 0.2)` }} />
                <div className="flex gap-2 pt-2">
                  <button
                    className="px-4 py-2 rounded-md text-sm font-medium text-white"
                    style={{ background: `hsl(${primaryColor})` }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-md text-sm font-medium border"
                    style={{ borderColor: `hsl(${accentColor})`, color: `hsl(${accentColor})` }}
                  >
                    Secondary
                  </button>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
