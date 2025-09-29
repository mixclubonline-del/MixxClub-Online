import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MessageCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
  };

  return (
    <section id="contact" className="py-24 bg-card">
      <div className="container px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm text-primary font-medium">Get In Touch</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Send us your tracks and let's discuss how we can transform your music into professional, radio-ready quality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="border-border bg-background">
            <CardHeader>
              <CardTitle>Start Your Project</CardTitle>
              <p className="text-sm text-muted-foreground">Fill out the form below and we'll get back to you within 24 hours</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input placeholder="Name *" required />
                </div>
                <div>
                  <Input type="email" placeholder="Email *" required />
                </div>
                <div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Mixing ($49)</SelectItem>
                      <SelectItem value="pro">Pro Package ($99)</SelectItem>
                      <SelectItem value="custom">Custom Quote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="49-99">$49-99</SelectItem>
                      <SelectItem value="100-299">$100-299</SelectItem>
                      <SelectItem value="300-599">$300-599</SelectItem>
                      <SelectItem value="600+">$600+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Textarea placeholder="Project Details *" required className="min-h-[120px]" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload your demo tracks (optional)<br />
                  Supported: MP3, WAV, FLAC (Max 100MB each)
                </p>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border bg-background">
              <CardHeader>
                <CardTitle className="text-lg">Get In Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">hello@mixclubonline.com</p>
                    <p className="text-xs text-muted-foreground mt-1">Best for detailed project discussions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-xs text-muted-foreground mt-1">Quick consultations and urgent matters</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Discord</p>
                    <p className="text-sm text-muted-foreground">MixClub#1234</p>
                    <p className="text-xs text-muted-foreground mt-1">Real-time collaboration and updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-background">
              <CardHeader>
                <CardTitle className="text-lg">Quick FAQ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-sm mb-1">What file formats do you accept?</p>
                  <p className="text-xs text-muted-foreground">We accept WAV, AIFF, FLAC, and high-quality MP3 files. 24-bit/48kHz or higher preferred.</p>
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">How long does mixing take?</p>
                  <p className="text-xs text-muted-foreground">Standard turnaround is 48 hours. Rush delivery (12 hours) available for +$25.</p>
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Do you offer revisions?</p>
                  <p className="text-xs text-muted-foreground">Basic package includes 2 revisions. Pro package includes unlimited revisions.</p>
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Can you work with stems?</p>
                  <p className="text-xs text-muted-foreground">Yes! We can work with individual stems or use AI to separate your mixed track.</p>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium mb-1">Quick Response Guarantee</p>
              <p className="text-xs text-muted-foreground">
                We respond to all inquiries within 24 hours. For urgent projects, reach out via Discord for immediate assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
