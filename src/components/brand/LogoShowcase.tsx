import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import all logo variants (optimized WebP)
import eqCrownLogo from '@/assets/brand/eq-crown-logo.webp';
import waveformCircuitLogo from '@/assets/brand/waveform-circuit-logo.webp';
import infinityCircuitLogo from '@/assets/brand/infinity-circuit-logo.webp';
import vinylWaveformLogo from '@/assets/brand/vinyl-waveform-logo.webp';

import AnimatedBrandLogo, { LogoVariant, LogoContext } from './AnimatedBrandLogo';

interface LogoAsset {
  variant: LogoVariant;
  name: string;
  description: string;
  src: string;
  useCases: string[];
}

const logoAssets: LogoAsset[] = [
  {
    variant: 'crown',
    name: 'EQ Crown',
    description: 'Primary brand mark with equalizer bars forming a crown',
    src: eqCrownLogo,
    useCases: ['Hero sections', 'Marketing materials', 'Splash screens'],
  },
  {
    variant: 'waveform',
    name: 'Waveform Circuit',
    description: 'Transparent circuit waveform for versatile use',
    src: waveformCircuitLogo,
    useCases: ['Favicons', 'App icons', 'Watermarks'],
  },
  {
    variant: 'infinity',
    name: 'Infinity Circuit',
    description: '3D infinity symbol with neural circuitry',
    src: infinityCircuitLogo,
    useCases: ['Tech contexts', 'AI features', 'Loading states'],
  },
  {
    variant: 'vinyl',
    name: 'Vinyl Waveform',
    description: 'Classic vinyl/speaker with frequency waveforms',
    src: vinylWaveformLogo,
    useCases: ['Studio pages', 'Audio features', 'Music production'],
  },
];

const contextPresets: { context: LogoContext; label: string }[] = [
  { context: 'hero', label: 'Hero' },
  { context: 'navigation', label: 'Navigation' },
  { context: 'loading', label: 'Loading' },
  { context: 'splash', label: 'Splash' },
  { context: 'static', label: 'Static' },
];

export const LogoShowcase = () => {
  const [selectedVariant, setSelectedVariant] = useState<LogoVariant>('crown');
  const [previewContext, setPreviewContext] = useState<LogoContext>('hero');

  const handleDownload = (src: string, name: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `mixxclub-${name.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Live Preview Section */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            {/* Context selector */}
            <div className="flex flex-wrap gap-2 justify-center">
              {contextPresets.map(({ context, label }) => (
                <Button
                  key={context}
                  variant={previewContext === context ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewContext(context)}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Preview area */}
            <div className="relative w-full max-w-md h-64 bg-background/50 rounded-xl border border-border/30 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <AnimatedBrandLogo
                context={previewContext}
                startVariant={selectedVariant}
                showWordmark={previewContext === 'hero' || previewContext === 'splash'}
              />
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {previewContext === 'navigation' && 'Hover over the logo to see cycling animation'}
              {previewContext === 'hero' && 'Dramatic crossfade cycle with high glow'}
              {previewContext === 'loading' && 'Fast spin cycle for loading states'}
              {previewContext === 'splash' && 'Morphing entrance animation'}
              {previewContext === 'static' && 'No animation, clean display'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logo Variants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logoAssets.map((asset) => (
          <motion.div
            key={asset.variant}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 ${
                selectedVariant === asset.variant
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'bg-card/50 hover:bg-card/80'
              }`}
              onClick={() => setSelectedVariant(asset.variant)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Logo preview */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-background/50 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={asset.src}
                      alt={asset.name}
                      className="w-20 h-20 object-contain"
                    />
                    {selectedVariant === asset.variant && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{asset.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {asset.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {asset.useCases.map((useCase) => (
                        <span
                          key={useCase}
                          className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Download button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(asset.src, asset.name);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Usage Guide */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Usage Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg">
              <code className="text-primary">context="hero"</code>
              <p className="text-muted-foreground mt-1">
                Large, dramatic cycling with high glow. Use for landing pages.
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <code className="text-primary">context="navigation"</code>
              <p className="text-muted-foreground mt-1">
                Compact, cycles on hover only. Perfect for headers.
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <code className="text-primary">context="loading"</code>
              <p className="text-muted-foreground mt-1">
                Fast spin cycle for loading states and progress indicators.
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <code className="text-primary">context="static"</code>
              <p className="text-muted-foreground mt-1">
                Single logo, no animation. Use where motion is distracting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogoShowcase;
