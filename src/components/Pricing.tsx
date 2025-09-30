import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm text-primary font-medium">Pricing Plans</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Affordable Professional Quality</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No hidden fees, no subscriptions. Just transparent pricing for professional mixing and mastering services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">Basic</CardTitle>
              <p className="text-sm text-muted-foreground">Perfect for single tracks and independent artists</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary">$49</span>
                <span className="text-muted-foreground">/ track</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Professional Mixing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>AI Enhancement</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Stem Separation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>2 Revisions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>48-hour delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>High-quality MP3 & WAV</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}>Order Basic</Button>
            </CardFooter>
          </Card>

          <Card className="border-primary bg-card relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <p className="text-sm text-muted-foreground">Complete package for serious artists and producers</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary">$99</span>
                <span className="text-muted-foreground">/ track</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Professional Mixing & Mastering</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Advanced AI Enhancements</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Stem Separation & Isolation</span>
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
                  <span>Multiple formats (MP3, WAV, FLAC)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Radio-ready master</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}>Order Pro</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Add-ons Section */}
        <Card className="border-border bg-card max-w-4xl mx-auto">
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

        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">100% Satisfaction Guarantee</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Not happy with your mix? We'll keep working until you love it.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
