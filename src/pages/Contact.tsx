import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, MapPin, MessageSquare, Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { z } from 'zod';
import Navigation from '@/components/Navigation';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { GlassPanel } from '@/components/crm/design/GlassPanel';
import heroContact from '@/assets/hero-contact.jpg';

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

const sectionAnim = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const contactInfo = [
  { icon: Mail, title: 'Email', detail: 'support@mixxclubonline.com', accent: 'rgba(168,85,247,0.35)' },
  { icon: Phone, title: 'Phone', detail: '1-800-MIXXCLUB', accent: 'rgba(6,182,212,0.35)' },
  { icon: MapPin, title: 'Office', detail: 'Los Angeles, CA\nUnited States', accent: 'rgba(249,115,22,0.35)' },
  { icon: MessageSquare, title: 'Live Chat', detail: 'Available Mon-Fri, 9am-6pm PST', accent: 'rgba(34,197,94,0.35)' },
];

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = contactSchema.parse(formData);

      const { data, error } = await supabase.functions.invoke('handle-contact-form', {
        body: {
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message,
        },
      });

      if (error) throw error;

      toast({
        title: 'Message Sent!',
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const zodError = error as z.ZodError;
        toast({
          title: 'Validation Error',
          description: zodError.issues[0].message,
          variant: 'destructive',
        });
      } else {
        console.error('Contact form error:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Contact Us - Get in Touch with Mixxclub Support"
        description="Have questions about our audio mixing and mastering services? Contact Mixxclub's support team. We respond within 24 hours. Email, phone, and live chat available Mon-Fri 9am-6pm PST."
        keywords="contact mixxclub, audio engineering support, mixing help, customer service"
      />

      <div className="min-h-screen bg-background relative overflow-hidden">
        <Navigation />

        {/* Atmospheric background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={heroContact} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
        </div>

        {/* Ambient glow orbs */}
        <div className="absolute top-32 -left-32 w-96 h-96 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 container max-w-6xl mx-auto px-4 py-16">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
              Get In Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <motion.div
              className="space-y-6"
              variants={sectionAnim}
              initial="hidden"
              animate="visible"
            >
              {contactInfo.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                >
                  <GlassPanel hoverable accent={item.accent}>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{item.detail}</p>
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <GlassPanel glow accent="rgba(168,85,247,0.25)" padding="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help you?"
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your project or question..."
                      rows={6}
                      className="bg-background/50"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </form>
              </GlassPanel>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10">
          <PublicFooter />
        </div>
      </div>
    </>
  );
}
