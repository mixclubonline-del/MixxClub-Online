import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Image, FileText, Share2, Megaphone, Download, Save, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { usePrimeMarketing, CopyType } from '@/hooks/usePrimeMarketing';
import { useMarketingExport, CampaignAssets, CampaignBrief, AdVariant } from '@/hooks/useMarketingExport';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export default function MarketingCommandCenter() {
  const [activeTab, setActiveTab] = useState('brief');
  const [brief, setBrief] = useState<CampaignBrief>({
    name: '',
    campaignType: 'launch',
    targetAudience: 'both',
    tone: 'authentic',
    keyMessage: ''
  });
  
  const [campaignAssets, setCampaignAssets] = useState<CampaignAssets>({
    visuals: {},
    copy: {},
    social: {},
    ads: {}
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState<string | null>(null);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [isGeneratingAds, setIsGeneratingAds] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const { generateCopy, isGenerating, generatedCopy } = usePrimeMarketing();
  const { exportLaunchKit } = useMarketingExport();

  const buildContext = () => {
    return `Campaign: ${brief.name}. Target: ${brief.targetAudience}. Tone: ${brief.tone}. Message: ${brief.keyMessage}`;
  };

  const handleGenerateCopy = async (type: CopyType) => {
    await generateCopy(type, buildContext());
    
    // Accumulate into campaign assets
    if (generatedCopy?.content) {
      setCampaignAssets(prev => ({
        ...prev,
        copy: {
          ...prev.copy,
          [type === 'landing-hero' ? 'hero' : type === 'email-welcome' ? 'emailWelcome' : type === 'email-promo' ? 'emailPromo' : type]: generatedCopy.content
        }
      }));
    }
  };

  const handleGenerateAll = async () => {
    const types: CopyType[] = ['landing-hero', 'tagline', 'email-welcome', 'email-promo'];
    for (const type of types) {
      await generateCopy(type, buildContext());
    }
    toast.success('All copy generated!');
  };

  // Visual generation using generate-landing-image edge function
  const handleGenerateVisual = async (visualType: 'hero' | 'socialBanner' | 'adCreative') => {
    setIsGeneratingVisual(visualType);
    try {
      const prompts: Record<string, string> = {
        hero: `Cinematic hero image for ${brief.name} campaign. ${brief.keyMessage}. Target: ${brief.targetAudience}. Tone: ${brief.tone}. Professional music industry aesthetic.`,
        socialBanner: `Social media banner for ${brief.name}. Eye-catching, ${brief.tone} style. Music production theme.`,
        adCreative: `Ad creative for ${brief.name}. Clean, modern, ${brief.tone} aesthetic. Music industry focused.`
      };

      const contexts: Record<string, string> = {
        hero: 'landing_campaign_hero',
        socialBanner: 'social_banner',
        adCreative: 'ad_creative'
      };

      const { data, error } = await supabase.functions.invoke('generate-landing-image', {
        body: { prompt: prompts[visualType], context: contexts[visualType] }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setCampaignAssets(prev => ({
          ...prev,
          visuals: { ...prev.visuals, [visualType]: data.imageUrl }
        }));
        toast.success(`${visualType} image generated!`);
      }
    } catch (error) {
      console.error('Visual generation error:', error);
      toast.error('Failed to generate visual');
    } finally {
      setIsGeneratingVisual(null);
    }
  };

  // Social posts generation using generate-social-posts edge function
  const handleGenerateSocial = async (platform?: 'instagram' | 'twitter' | 'tiktok' | 'facebook') => {
    setIsGeneratingSocial(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-social-posts', {
        body: {
          trackName: brief.name,
          genre: brief.campaignType,
          mood: brief.tone,
          vibe: brief.keyMessage,
          additionalDetails: `Target audience: ${brief.targetAudience}`,
          targetPlatform: platform || 'all'
        }
      });

      if (error) throw error;

      if (data?.posts) {
        setCampaignAssets(prev => ({
          ...prev,
          social: {
            ...prev.social,
            ...(data.posts.instagram && { instagram: data.posts.instagram }),
            ...(data.posts.twitter && { twitter: data.posts.twitter }),
            ...(data.posts.tiktok && { tiktok: data.posts.tiktok }),
            ...(data.posts.facebook && { linkedin: data.posts.facebook }) // Map facebook to linkedin
          }
        }));
        toast.success('Social posts generated!');
      }
    } catch (error) {
      console.error('Social generation error:', error);
      toast.error('Failed to generate social posts');
    } finally {
      setIsGeneratingSocial(false);
    }
  };

  // Ad copy generation using generate-ad-copy edge function
  const handleGenerateAds = async (platform: 'google' | 'facebook' | 'tiktok' | 'instagram') => {
    setIsGeneratingAds(platform);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ad-copy', {
        body: {
          platform,
          targetAudience: brief.targetAudience === 'both' ? 'artists and engineers' : brief.targetAudience,
          genre: brief.campaignType,
          tone: brief.tone,
          variantCount: 3
        }
      });

      if (error) throw error;

      if (data?.variants) {
        setCampaignAssets(prev => ({
          ...prev,
          ads: { ...prev.ads, [platform]: data.variants as AdVariant[] }
        }));
        toast.success(`${platform} ad variants generated!`);
      }
    } catch (error) {
      console.error('Ad generation error:', error);
      toast.error('Failed to generate ad copy');
    } finally {
      setIsGeneratingAds(null);
    }
  };

  const handleGenerateAllAds = async () => {
    const platforms: ('google' | 'facebook' | 'tiktok' | 'instagram')[] = ['google', 'facebook', 'tiktok', 'instagram'];
    for (const platform of platforms) {
      await handleGenerateAds(platform);
    }
  };

  const handleSaveCampaign = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save campaigns');
        return;
      }

      const { error } = await supabase.from('marketing_campaigns').insert([{
        user_id: user.id,
        name: brief.name,
        campaign_type: brief.campaignType,
        target_audience: brief.targetAudience,
        tone: brief.tone,
        key_message: brief.keyMessage,
        generated_assets: campaignAssets.visuals as unknown as Json,
        generated_copy: campaignAssets.copy as unknown as Json,
        social_posts: campaignAssets.social as unknown as Json,
        ad_variants: campaignAssets.ads as unknown as Json,
        status: 'complete'
      }]);

      if (error) throw error;
      toast.success('Campaign saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    exportLaunchKit(brief, campaignAssets);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied to clipboard');
  };

  const formatOutput = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  };

  const hasContent = Object.keys(campaignAssets.copy).length > 0 || 
    Object.keys(campaignAssets.social).length > 0 || 
    Object.keys(campaignAssets.ads).length > 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Marketing Command Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Build complete marketing campaigns using MixxTech's own AI tools
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveCampaign} disabled={isSaving || !brief.name}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Campaign
            </Button>
            <Button onClick={handleExport} disabled={!hasContent || !brief.name}>
              <Download className="h-4 w-4 mr-2" />
              Export Kit
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="brief" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Brief
            </TabsTrigger>
            <TabsTrigger value="visuals" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Visuals
            </TabsTrigger>
            <TabsTrigger value="copy" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Copy
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Ads
            </TabsTrigger>
          </TabsList>

          {/* Campaign Brief Tab */}
          <TabsContent value="brief" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Brief</CardTitle>
                <CardDescription>Define your campaign parameters to generate targeted content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Summer Launch 2024"
                      value={brief.name}
                      onChange={(e) => setBrief({ ...brief, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Campaign Type</Label>
                    <Select
                      value={brief.campaignType}
                      onValueChange={(v) => setBrief({ ...brief, campaignType: v as CampaignBrief['campaignType'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="launch">Product Launch</SelectItem>
                        <SelectItem value="feature">Feature Highlight</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                        <SelectItem value="awareness">Brand Awareness</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select
                      value={brief.targetAudience}
                      onValueChange={(v) => setBrief({ ...brief, targetAudience: v as CampaignBrief['targetAudience'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="artists">Artists</SelectItem>
                        <SelectItem value="engineers">Engineers</SelectItem>
                        <SelectItem value="both">Artists & Engineers</SelectItem>
                        <SelectItem value="fans">Fans & Listeners</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tone</Label>
                    <Select
                      value={brief.tone}
                      onValueChange={(v) => setBrief({ ...brief, tone: v as CampaignBrief['tone'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hype">Hype / Energetic</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="authentic">Authentic / Real</SelectItem>
                        <SelectItem value="aspirational">Aspirational</SelectItem>
                        <SelectItem value="edgy">Edgy / Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Key Message</Label>
                  <Textarea
                    id="message"
                    placeholder="What's the core message or value proposition for this campaign?"
                    value={brief.keyMessage}
                    onChange={(e) => setBrief({ ...brief, keyMessage: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab('copy')} disabled={!brief.name || !brief.keyMessage}>
                    Continue to Copy Generation
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visual Assets Tab */}
          <TabsContent value="visuals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visual Assets</CardTitle>
                <CardDescription>Generate campaign visuals using Dream Engine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { type: 'hero' as const, label: 'Hero Image', size: '1920x1080' },
                    { type: 'socialBanner' as const, label: 'Social Banner', size: '1200x630' },
                    { type: 'adCreative' as const, label: 'Ad Creative', size: '1080x1080' }
                  ].map(({ type, label, size }) => (
                    <Card key={type} className="border-dashed">
                      <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                        {campaignAssets.visuals[type] ? (
                          <div className="relative w-full">
                            <img 
                              src={campaignAssets.visuals[type]} 
                              alt={label}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Badge className="absolute top-2 right-2" variant="secondary">
                              {size}
                            </Badge>
                          </div>
                        ) : (
                          <Image className="h-12 w-12 text-muted-foreground mb-4" />
                        )}
                        <p className="text-sm font-medium mt-2">{label}</p>
                        <Badge variant="outline" className="text-xs mt-1">{size}</Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => handleGenerateVisual(type)}
                          disabled={isGeneratingVisual === type || !brief.keyMessage}
                        >
                          {isGeneratingVisual === type ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          {campaignAssets.visuals[type] ? 'Regenerate' : 'Generate'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    For full creative control, use the{' '}
                  </p>
                  <Button variant="link" size="sm" asChild>
                    <a href="/dream-engine">
                      Dream Engine <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Copy Suite Tab */}
          <TabsContent value="copy" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Generation Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Copy Generation</CardTitle>
                  <CardDescription>Generate marketing copy powered by Prime</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Campaign Context</p>
                    <p className="text-sm text-muted-foreground">{buildContext() || 'Fill in campaign brief first'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'landing-hero' as CopyType, label: 'Hero Copy' },
                      { type: 'tagline' as CopyType, label: 'Taglines' },
                      { type: 'email-welcome' as CopyType, label: 'Welcome Email' },
                      { type: 'email-promo' as CopyType, label: 'Promo Email' },
                    ].map(({ type, label }) => (
                      <Button
                        key={type}
                        variant="outline"
                        onClick={() => handleGenerateCopy(type)}
                        disabled={isGenerating || !brief.keyMessage}
                        className="justify-start"
                      >
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        {label}
                      </Button>
                    ))}
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleGenerateAll}
                    disabled={isGenerating || !brief.keyMessage}
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Generate All Copy
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Output */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Generated Copy</CardTitle>
                    <CardDescription>
                      {generatedCopy?.type ? `Type: ${generatedCopy.type}` : 'Results will appear here'}
                    </CardDescription>
                  </div>
                  {generatedCopy?.content && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedCopy.content, 'main')}
                    >
                      {copiedField === 'main' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {generatedCopy?.content ? (
                    <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto max-h-[400px] whitespace-pre-wrap">
                      {formatOutput(generatedCopy.content)}
                    </pre>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a copy type to generate</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Package Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Package</CardTitle>
                <CardDescription>Generate platform-optimized social posts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { platform: 'instagram' as const, label: 'Instagram', limit: '2200 chars' },
                    { platform: 'twitter' as const, label: 'Twitter/X', limit: '280 chars' },
                    { platform: 'tiktok' as const, label: 'TikTok', limit: '2200 chars' },
                    { platform: 'facebook' as const, label: 'LinkedIn', limit: '3000 chars' }
                  ].map(({ platform, label, limit }) => (
                    <Card key={platform}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{label}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Badge variant="outline" className="text-xs">{limit}</Badge>
                        
                        {/* Show generated posts */}
                        {campaignAssets.social[platform === 'facebook' ? 'linkedin' : platform]?.length ? (
                          <div className="space-y-2 max-h-[150px] overflow-y-auto">
                            {(campaignAssets.social[platform === 'facebook' ? 'linkedin' : platform] || []).slice(0, 3).map((post, idx) => (
                              <div key={idx} className="p-2 bg-muted rounded text-xs relative group">
                                <p className="line-clamp-3">{typeof post === 'string' ? post : JSON.stringify(post)}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                                  onClick={() => copyToClipboard(typeof post === 'string' ? post : JSON.stringify(post), `${platform}-${idx}`)}
                                >
                                  {copiedField === `${platform}-${idx}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleGenerateSocial(platform)}
                          disabled={isGeneratingSocial || !brief.keyMessage}
                        >
                          {isGeneratingSocial ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                          Generate 3 Posts
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button 
                  className="w-full"
                  onClick={() => handleGenerateSocial()}
                  disabled={isGeneratingSocial || !brief.keyMessage}
                >
                  {isGeneratingSocial ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                  Generate Full Social Package
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ad Creatives Tab */}
          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ad Creatives</CardTitle>
                <CardDescription>Generate platform-specific ad copy variants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { platform: 'google' as const, label: 'Google Ads', specs: 'Headlines: 30 chars | Descriptions: 90 chars' },
                    { platform: 'facebook' as const, label: 'Facebook/Instagram', specs: 'Primary: 125 chars | Headline: 40 chars' },
                    { platform: 'tiktok' as const, label: 'TikTok Ads', specs: 'Text: 100 chars | Headline: 34 chars' },
                    { platform: 'instagram' as const, label: 'Instagram Ads', specs: 'Primary: 125 chars | Headline: 40 chars' }
                  ].map(({ platform, label, specs }) => (
                    <Card key={platform}>
                      <CardHeader>
                        <CardTitle className="text-base">{label}</CardTitle>
                        <CardDescription className="text-xs">{specs}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Show generated ad variants */}
                        {campaignAssets.ads[platform]?.length ? (
                          <div className="space-y-3 max-h-[200px] overflow-y-auto">
                            {campaignAssets.ads[platform]?.map((ad, idx) => (
                              <div key={idx} className="p-3 bg-muted rounded-lg relative group">
                                <Badge variant="secondary" className="text-xs mb-2">Variant {idx + 1}</Badge>
                                <p className="font-medium text-sm">{ad.headline}</p>
                                <p className="text-xs text-muted-foreground mt-1">{ad.description}</p>
                                <Badge className="mt-2 text-xs">{ad.cta}</Badge>
                                {ad.focus && (
                                  <p className="text-xs text-primary mt-2">Focus: {ad.focus}</p>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                                  onClick={() => copyToClipboard(JSON.stringify(ad, null, 2), `ad-${platform}-${idx}`)}
                                >
                                  {copiedField === `ad-${platform}-${idx}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleGenerateAds(platform)}
                          disabled={isGeneratingAds === platform || !brief.keyMessage}
                        >
                          {isGeneratingAds === platform ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          Generate 3 Variants
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleGenerateAllAds}
                  disabled={!!isGeneratingAds || !brief.keyMessage}
                >
                  <Megaphone className="h-4 w-4 mr-2" />
                  Generate All Ad Variants
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
