import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { ComparisonTable } from "./home/ComparisonTable";
import { BulkPricingSection } from "./home/BulkPricingSection";
import { ScarcityTimer } from "./home/ScarcityTimer";

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm text-primary font-medium">Pricing Plans</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Up to 70% Less Than Traditional Studios</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Compare our transparent pricing to competitors: LANDR ($9-19/track), eMastered ($9+/track), CloudBounce ($3.99+/track). 
            Get premium results with real engineers + AI power.
          </p>
          
          {/* Competitor Comparison */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg max-w-2xl mx-auto">
            <div className="text-sm font-medium mb-2">💡 Why choose us over automation-only services?</div>
            <div className="text-xs text-muted-foreground">
              Unlike fully automated services, you get human expertise + AI enhancement for guaranteed professional results
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {/* Starter Plan */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">Starter</CardTitle>
              <p className="text-sm text-muted-foreground">Perfect for bedroom producers and new artists - matched with rising engineers gaining experience</p>
              <div className="mt-4 space-y-1">
                <div className="text-sm text-muted-foreground line-through">$89 at traditional studios</div>
                <div>
                  <span className="text-4xl font-bold text-primary">$29</span>
                  <span className="text-muted-foreground">/ track</span>
                </div>
                <div className="text-xs text-green-600 font-medium">Save $60 per track!</div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>AI-Enhanced Mixing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Stem Separation (4 stems)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Basic Mastering</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>1 Revision</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>72-hour delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>MP3 & WAV files</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/mixing#packages">Start with Starter</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Professional Plan */}
          <Card className="border-primary bg-card relative scale-105 shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-2 rounded-full text-sm font-medium">
              🔥 Most Popular - 67% of artists choose this
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl">Professional</CardTitle>
              <p className="text-sm text-muted-foreground">Industry-standard results for serious artists</p>
              <div className="mt-4 space-y-1">
                <div className="text-sm text-muted-foreground line-through">$250 at traditional studios</div>
                <div>
                  <span className="text-4xl font-bold text-primary">$79</span>
                  <span className="text-muted-foreground">/ track</span>
                </div>
                <div className="text-xs text-green-600 font-medium">Save $171 per track!</div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Pro Mixing + Mastering</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Experienced engineer + AI tools for studio-quality results</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Stem Separation (8+ stems)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Unlimited Revisions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>24-hour priority delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>All formats + Hi-Res</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Radio-ready + streaming optimized</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Real-time collaboration workspace</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full text-lg" asChild>
                <Link to="/mixing#packages">Choose Professional</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <p className="text-sm text-muted-foreground">For labels and top-tier productions</p>
              <div className="mt-4 space-y-1">
                <div className="text-sm text-muted-foreground line-through">$500+ at traditional studios</div>
                <div>
                  <span className="text-4xl font-bold text-primary">$149</span>
                  <span className="text-muted-foreground">/ track</span>
                </div>
                <div className="text-xs text-green-600 font-medium">Save $351+ per track!</div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Top-tier mixing + mastering with verified veteran engineers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Multiple verified engineer options to match your needs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Full stem package (16+ stems)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Unlimited revisions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>12-hour express delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Master for all platforms</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Vocal tuning + editing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Dedicated project manager</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/mixing#packages">Go Premium</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Add-ons Section */}
        <Card className="border-border bg-card max-w-4xl mx-auto mb-12">
          <CardHeader>
            <CardTitle className="text-xl">Add-ons</CardTitle>
            <p className="text-sm text-muted-foreground">Enhance your order with these optional services</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-sm font-medium mb-1">Rush Delivery (12hrs)</p>
                <p className="text-primary font-bold">+$25</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-sm font-medium mb-1">Additional Stem Mix</p>
                <p className="text-primary font-bold">+$15</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-sm font-medium mb-1">Vocal Tuning</p>
                <p className="text-primary font-bold">+$20</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-sm font-medium mb-1">Extra Revision</p>
                <p className="text-primary font-bold">+$10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scarcity Timer */}
        <ScarcityTimer />

        {/* Comparison Table */}
        <ComparisonTable />

        {/* Bulk Pricing */}
        <BulkPricingSection />

        {/* Value Proposition Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Why MixClub Beats the Competition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">🤖 Automated Services (LANDR, eMastered)</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">❌</span>
                      <span>No human expertise</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">❌</span>
                      <span>Limited customization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">❌</span>
                      <span>No real-time collaboration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">❌</span>
                      <span>Generic results</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">🎯 MixClub</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      <span>Real engineers at every level + AI enhancement</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      <span>Unlimited revisions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      <span>Live collaboration workspace</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      <span>Custom stems + full control</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg border border-primary/30">
            <Check className="w-5 h-5 text-primary" />
            <span className="font-medium">7-Day Money-Back Guarantee</span>
          </div>
          <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
            Not satisfied? Get 100% refund. Join 50,000+ artists who chose professional quality over automated guessing.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;