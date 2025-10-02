import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, MessageCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().max(20).regex(/^[\d\s\-+()]*$/, "Invalid phone number format").optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(1000),
  budget: z.string().trim().max(50).optional(),
});

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validated = contactSchema.parse({ name, email, phone, message, budget });
      
      setLoading(true);

      // Check rate limit using email as identifier
      const { data: rateLimitData, error: rateLimitError } = await supabase.functions.invoke(
        'check-rate-limit',
        {
          body: { 
            action: 'contact_form_submit',
            identifier: validated.email 
          }
        }
      );

      if (rateLimitError) {
        throw new Error('Rate limit check failed');
      }

      if (!rateLimitData?.allowed) {
        toast.error(rateLimitData?.message || 'Too many requests. Please try again later.');
        return;
      }

      // Insert into Supabase
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
          message: validated.message,
          budget: validated.budget || null,
        }]);

      if (error) throw error;

      toast.success("Message sent! We'll get back to you within 24 hours.");
      
      // Clear form
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setBudget("");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
                  <Input 
                    placeholder="Name *" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <Input 
                    type="email" 
                    placeholder="Email *" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <Input 
                    type="tel" 
                    placeholder="Phone (optional)" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget (optional)" />
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
                  <Textarea 
                    placeholder="Project Details *" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required 
                    className="min-h-[120px]" 
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload your demo tracks (optional)<br />
                  Supported: MP3, WAV, FLAC (Max 100MB each)
                </p>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
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
