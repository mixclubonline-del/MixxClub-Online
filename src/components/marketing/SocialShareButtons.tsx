import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Twitter, Facebook, Linkedin, Link2, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface SocialShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
}

export const SocialShareButtons = ({ 
  url = window.location.href,
  title = "Mixxclub - Connect with Top Audio Engineers",
  description = "Professional audio mixing and mastering platform"
}: SocialShareButtonsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    
    toast({
      title: "Opening Twitter",
      description: "Share Mixxclub with your followers!"
    });
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
    
    toast({
      title: "Opening Facebook",
      description: "Share Mixxclub with your network!"
    });
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
    
    toast({
      title: "Opening LinkedIn",
      description: "Share Mixxclub with professionals!"
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard"
    });

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Mixxclub</CardTitle>
        <CardDescription>
          Help us grow by sharing with your network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleTwitterShare}
            className="gap-2"
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </Button>

          <Button
            variant="outline"
            onClick={handleFacebookShare}
            className="gap-2"
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </Button>

          <Button
            variant="outline"
            onClick={handleLinkedInShare}
            className="gap-2"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="share-link">Share Link</Label>
          <div className="flex gap-2">
            <Input
              id="share-link"
              value={url}
              readOnly
              className="flex-1"
            />
            <Button
              variant={copied ? "default" : "outline"}
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Referral Rewards</h4>
          <p className="text-sm text-muted-foreground">
            Share your unique referral link and earn 10% commission on every project your referrals complete!
          </p>
          <Button variant="link" className="p-0 h-auto">
            Get Your Referral Link →
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">234</p>
            <p className="text-xs text-muted-foreground">Shares</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">89</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">$1,240</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
