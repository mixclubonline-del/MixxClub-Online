import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePrimeMarketing, CopyType } from '@/hooks/usePrimeMarketing';
import { Sparkles, Copy, FileText, Mail, MessageSquare, Zap, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

const copyTypes: { type: CopyType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'landing-hero', label: 'Hero Section', icon: <Zap className="h-4 w-4" />, description: 'Headline, subheadline & CTA' },
  { type: 'landing-features', label: 'Features', icon: <FileText className="h-4 w-4" />, description: '3 feature descriptions' },
  { type: 'email-welcome', label: 'Welcome Email', icon: <Mail className="h-4 w-4" />, description: 'New user onboarding' },
  { type: 'email-promo', label: 'Promo Email', icon: <Mail className="h-4 w-4" />, description: 'Promotional campaign' },
  { type: 'social-post', label: 'Social Posts', icon: <MessageSquare className="h-4 w-4" />, description: 'Multi-platform content' },
  { type: 'tagline', label: 'Taglines', icon: <Sparkles className="h-4 w-4" />, description: '5 tagline variations' },
];

export default function PrimeMarketingCopy() {
  const { generateCopy, isGenerating, generatedCopy } = usePrimeMarketing();
  const [context, setContext] = useState('');
  const [selectedType, setSelectedType] = useState<CopyType>('landing-hero');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    generateCopy(selectedType, context || 'General Mixxclub marketing');
  };

  const handleCopy = () => {
    if (generatedCopy?.content) {
      navigator.clipboard.writeText(generatedCopy.content);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Prime Marketing Copy</h1>
            <p className="text-muted-foreground">AI-powered marketing content generator</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate Copy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Copy Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {copyTypes.map(({ type, label, icon, description }) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedType === type
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {icon}
                        <span className="font-medium text-sm">{label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Context (optional)</label>
                <Textarea
                  placeholder="E.g., 'Target audience: independent hip-hop artists', 'Promote new mastering feature', 'Holiday sale campaign'..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Prime is writing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with Prime
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Generated Copy</CardTitle>
              {generatedCopy && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {generatedCopy ? (
                <div className="space-y-3">
                  <Badge variant="secondary">{generatedCopy.type}</Badge>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-[400px] whitespace-pre-wrap">
                    {formatOutput(generatedCopy.content)}
                  </pre>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p>Generated copy will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
