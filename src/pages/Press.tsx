import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import Navigation from "@/components/Navigation";
import { PublicFooter } from "@/components/layouts/PublicFooter";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { usePressBrandAssets } from "@/hooks/usePressBrandAssets";
import { 
  Download, 
  Image as ImageIcon, 
  FileText, 
  Mail, 
  ExternalLink,
  Users,
  Headphones,
  Star,
  DollarSign,
  Palette,
  Loader2
} from "lucide-react";

const Press = () => {
  const { displayStats } = usePlatformStats();
  const { download, loadingPath } = usePressBrandAssets();

  const brandColors = [
    { name: "Primary", hex: "#8B5CF6", cssVar: "hsl(262, 83%, 58%)" },
    { name: "Background", hex: "#0A0A0A", cssVar: "hsl(0, 0%, 4%)" },
    { name: "Foreground", hex: "#FAFAFA", cssVar: "hsl(0, 0%, 98%)" },
    { name: "Accent", hex: "#6366F1", cssVar: "hsl(239, 84%, 67%)" },
  ];

  const keyStats = [
    { label: "Active Users", value: displayStats.users, icon: <Users className="w-5 h-5" /> },
    { label: "Engineers", value: displayStats.engineers, icon: <Headphones className="w-5 h-5" /> },
    { label: "Avg Rating", value: `${displayStats.rating}★`, icon: <Star className="w-5 h-5" /> },
    { label: "Revenue Split", value: "70-85%", icon: <DollarSign className="w-5 h-5" /> },
  ];

  return (
    <>
      <SEOHead
        title="Press Kit"
        description="Mixxclub press resources, brand assets, and media information. Download logos, screenshots, and learn about our mission to democratize professional music production."
        keywords="mixclub press, media kit, brand assets, music production news"
      />

      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="pt-20">
          {/* Hero */}
          <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-6">
                <FileText className="w-4 h-4 mr-2" />
                Press Kit
              </Badge>

              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Mixxclub Press Resources
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Everything you need to write about Mixxclub. Download brand assets, 
                get key statistics, and contact our press team.
              </p>

              <Button
                size="lg"
                className="gap-2"
                disabled={loadingPath === 'press/full-kit'}
                onClick={() => download('press/full-kit', 'mixxclub-full-press-kit')}
              >
                {loadingPath === 'press/full-kit' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Download Full Press Kit
              </Button>
            </div>
          </section>

          {/* Quick Stats */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-2xl font-bold text-center mb-8">Key Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {keyStats.map((stat, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* About MixClub */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>About Mixxclub</CardTitle>
                  <CardDescription>For press and media use</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <h3 className="text-lg font-semibold mb-3">Short Description (50 words)</h3>
                  <p className="text-muted-foreground mb-6">
                    Mixxclub is a professional audio engineering platform connecting artists with 
                    world-class mixing and mastering engineers. Powered by AI-enhanced tools and 
                    real-time collaboration, Mixxclub transforms bedroom recordings into billboard-ready 
                    productions, starting at just $29.
                  </p>

                  <h3 className="text-lg font-semibold mb-3">Long Description (150 words)</h3>
                  <p className="text-muted-foreground mb-6">
                    Mixxclub is revolutionizing the music production industry by democratizing access 
                    to professional mixing and mastering services. Our platform combines cutting-edge 
                    AI technology with human expertise, enabling artists worldwide to achieve 
                    studio-quality sound from anywhere.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Founded on the belief that every artist deserves professional-quality production, 
                    Mixxclub offers tiered pricing from $29 to $149+, making premium audio engineering 
                    accessible to independent musicians and major labels alike. Our network of 
                    verified engineers earns industry-leading 70-85% revenue splits, attracting top 
                    talent from around the globe.
                  </p>
                  <p className="text-muted-foreground">
                    Key features include AI-powered audio analysis, real-time collaboration studios, 
                    instant payments, and a gamified progression system that rewards quality and 
                    consistency. Mixxclub is where technology meets artistry.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Brand Colors */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center justify-center gap-2 mb-8">
                <Palette className="w-5 h-5" />
                <h2 className="text-2xl font-bold">Brand Colors</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brandColors.map((color, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div 
                        className="w-full h-20 rounded-lg mb-4 border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="font-semibold">{color.name}</div>
                      <div className="text-sm text-muted-foreground">{color.hex}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Assets */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-2xl font-bold text-center mb-8">Downloadable Assets</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Logo Pack</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      SVG, PNG, and EPS formats in light and dark variants
                    </p>
                    <Button
                      variant="outline"
                      className="gap-2 w-full"
                      disabled={loadingPath === 'press/logos'}
                      onClick={() => download('press/logos', 'mixxclub-logos')}
                    >
                      {loadingPath === 'press/logos' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Download Logos
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Screenshots</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      High-resolution product screenshots and mockups
                    </p>
                    <Button
                      variant="outline"
                      className="gap-2 w-full"
                      disabled={loadingPath === 'press/screenshots'}
                      onClick={() => download('press/screenshots', 'mixxclub-screenshots')}
                    >
                      {loadingPath === 'press/screenshots' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Download Screenshots
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Fact Sheet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Company overview, statistics, and key information
                    </p>
                    <Button
                      variant="outline"
                      className="gap-2 w-full"
                      disabled={loadingPath === 'press/fact-sheet'}
                      onClick={() => download('press/fact-sheet', 'mixxclub-fact-sheet')}
                    >
                      {loadingPath === 'press/fact-sheet' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold mb-4">Press Contact</h2>
              <p className="text-muted-foreground mb-6">
                For press inquiries, interviews, or additional information, please contact our media team.
              </p>
              <Button size="lg" className="gap-2">
                <Mail className="w-5 h-5" />
                press@mixxclubonline.com
              </Button>
            </div>
          </section>
        </div>

        <PublicFooter />
      </div>
    </>
  );
};

export default Press;
