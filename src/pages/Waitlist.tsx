import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Sparkles, 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Twitter, 
  Linkedin,
  Mail,
  Rocket,
  Gift,
  Crown,
  Zap
} from "lucide-react";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [position, setPosition] = useState(0);
  const [copied, setCopied] = useState(false);

  // Check for referral code in URL
  const urlParams = new URLSearchParams(window.location.search);
  const referredBy = urlParams.get('ref');

  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      const newReferralCode = generateReferralCode();
      
      // Get current max position
      const { data: maxData } = await supabase
        .from('waitlist_signups')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);
      
      const newPosition = (maxData?.length || 0) + 1;
      
      const { error } = await supabase
        .from('waitlist_signups')
        .insert({
          email,
          referral_code: newReferralCode,
          role: 'artist',
          source: referredBy || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("This email is already on the waitlist!");
        } else {
          throw error;
        }
        return;
      }

      setReferralCode(newReferralCode);
      setPosition(newPosition);
      setIsSubmitted(true);
      toast.success("You're on the list! 🎉");
    } catch (error) {
      console.error("Waitlist error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const referralLink = `${window.location.origin}/waitlist?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = `I just joined the MixClub waitlist! Professional mixing & mastering for artists, powered by AI. Join me and let's level up our music together 🎵`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareByEmail = () => {
    const subject = "Join me on MixClub!";
    const body = `Hey! I just joined the MixClub waitlist - it's a professional mixing & mastering platform for artists. Check it out: ${referralLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const benefits = [
    { icon: <Gift className="w-5 h-5" />, text: "Early access to all features" },
    { icon: <Crown className="w-5 h-5" />, text: "Founding member badge" },
    { icon: <Zap className="w-5 h-5" />, text: "20% lifetime discount" },
    { icon: <Users className="w-5 h-5" />, text: "Private community access" },
  ];

  return (
    <>
      <SEOHead
        title="Join the Waitlist"
        description="Be the first to access MixClub - the professional mixing & mastering platform that's transforming the music industry. Get early access and exclusive founding member benefits."
        keywords="mixclub waitlist, early access, music production, mixing mastering"
      />

      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="pt-20">
          {/* Hero */}
          <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.1),transparent_50%)]" />
            
            <div className="container mx-auto max-w-4xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Badge variant="secondary" className="mb-6 text-base px-4 py-2">
                  <Rocket className="w-4 h-4 mr-2" />
                  Launching Soon
                </Badge>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  The Future of Music Production
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                  Join the waitlist to get early access to MixClub - where AI meets human creativity 
                  to transform your music.
                </p>

                {!isSubmitted ? (
                  <Card className="max-w-md mx-auto border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Get Early Access
                      </CardTitle>
                      <CardDescription>
                        {referredBy && "You were referred by a friend! "}
                        Join now for exclusive founding member benefits.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="text-lg py-6"
                        />
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="w-full gap-2 text-lg py-6"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            "Joining..."
                          ) : (
                            <>
                              <Rocket className="w-5 h-5" />
                              Join the Waitlist
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="max-w-md mx-auto border-2 border-primary/20">
                      <CardHeader>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <Check className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">You're on the list!</CardTitle>
                        <CardDescription className="text-lg">
                          You're #{position} in line
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">
                            Share your link to move up the waitlist:
                          </p>
                          <div className="flex gap-2">
                            <Input
                              value={referralLink}
                              readOnly
                              className="text-sm"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={copyToClipboard}
                            >
                              {copied ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Share on:</p>
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" onClick={shareOnTwitter} className="gap-2">
                              <Twitter className="w-4 h-4" />
                              Twitter
                            </Button>
                            <Button variant="outline" size="sm" onClick={shareOnLinkedIn} className="gap-2">
                              <Linkedin className="w-4 h-4" />
                              LinkedIn
                            </Button>
                            <Button variant="outline" size="sm" onClick={shareByEmail} className="gap-2">
                              <Mail className="w-4 h-4" />
                              Email
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold text-center mb-12">
                Founding Member Benefits
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          {benefit.icon}
                        </div>
                        <p className="text-lg font-medium">{benefit.text}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Waitlist;
