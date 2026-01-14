import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Image, FileText, Share2, Megaphone, Download, Save, Loader2, Copy, Check } from 'lucide-react';
import { usePrimeMarketing, CopyType } from '@/hooks/usePrimeMarketing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

interface CampaignBrief {
  name: string;
  campaignType: 'launch' | 'feature' | 'seasonal' | 'awareness' | 'promotional';
  targetAudience: 'artists' | 'engineers' | 'both' | 'fans';
  tone: 'hype' | 'professional' | 'authentic' | 'aspirational' | 'edgy';
  keyMessage: string;
}

interface GeneratedContent {
  hero?: string;
  taglines?: string[];
  emailWelcome?: string;
  emailPromo?: string;
  socialPosts?: Record<string, unknown>[];
  adVariants?: Record<string, unknown>[];
}

export default function MarketingCommandCenter() {
  const [activeTab, setActiveTab] = useState('brief');
  const [brief, setBrief] = useState<CampaignBrief>({
    name: '',
    campaignType: 'launch',
    targetAudience: 'both',
    tone: 'authentic',
    keyMessage: ''
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({});
  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const { generateCopy, isGenerating, generatedCopy } = usePrimeMarketing();

  const buildContext = () => {
    return `Campaign: ${brief.name}. Target: ${brief.targetAudience}. Tone: ${brief.tone}. Message: ${brief.keyMessage}`;
  };

  const handleGenerateCopy = async (type: CopyType) => {
    await generateCopy(type, buildContext());
  };

  const handleGenerateAll = async () => {
    const types: CopyType[] = ['landing-hero', 'tagline', 'email-welcome', 'social-post'];
    for (const type of types) {
      await generateCopy(type, buildContext());
    }
    toast.success('All copy generated!');
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
        generated_copy: JSON.parse(JSON.stringify(generatedContent)) as Json,
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
            <Button disabled={!generatedCopy}>
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
                  {['Hero Image', 'Social Banner', 'Ad Creative'].map((type) => (
                    <Card key={type} className="border-dashed">
                      <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                        <Image className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium">{type}</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          Generate
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Visual generation integrates with Dream Engine. Navigate to{' '}
                  <a href="/dream-engine" className="text-primary underline">/dream-engine</a> for full control.
                </p>
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
                  {['Instagram', 'Twitter/X', 'TikTok', 'LinkedIn'].map((platform) => (
                    <Card key={platform}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{platform}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Badge variant="outline" className="text-xs">
                          {platform === 'Twitter/X' ? '280 chars' : platform === 'LinkedIn' ? '3000 chars' : '2200 chars'}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleGenerateCopy('social-post')}
                          disabled={isGenerating}
                        >
                          Generate 3 Posts
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button 
                  className="w-full"
                  onClick={() => handleGenerateCopy('social-post')}
                  disabled={isGenerating || !brief.keyMessage}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
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
                    { platform: 'Google Ads', specs: 'Headlines: 30 chars | Descriptions: 90 chars' },
                    { platform: 'Facebook/Instagram', specs: 'Primary: 125 chars | Headline: 40 chars' },
                    { platform: 'TikTok Ads', specs: 'Text: 100 chars | Headline: 34 chars' },
                    { platform: 'YouTube', specs: 'Headline: 30 chars | Description: 90 chars' }
                  ].map(({ platform, specs }) => (
                    <Card key={platform}>
                      <CardHeader>
                        <CardTitle className="text-base">{platform}</CardTitle>
                        <CardDescription className="text-xs">{specs}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full" disabled={isGenerating}>
                          Generate 3 Variants
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button className="w-full" disabled={isGenerating || !brief.keyMessage}>
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
