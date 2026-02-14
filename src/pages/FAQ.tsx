import { useState } from 'react';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, MessageCircle, Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "What file formats do you accept?",
          a: "We accept WAV, AIFF, FLAC, and high-quality MP3 files (320kbps). For best results, we recommend 24-bit/48kHz WAV files or higher. Stems should be exported at the same sample rate and bit depth."
        },
        {
          q: "How do I get started with MixClub?",
          a: "Simply create a free account, choose your role (artist or engineer), complete your profile, and start exploring. Artists can post projects or try our AI mastering. Engineers can browse job opportunities and build their portfolio."
        },
        {
          q: "Is there a free trial?",
          a: "Yes! Try our AI mastering service with one free track. You can also browse the platform, connect with engineers, and explore all features before committing to a paid package."
        }
      ]
    },
    {
      category: "Pricing & Payments",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit/debit cards (Visa, Mastercard, Amex), PayPal, Venmo, Apple Pay, and Google Pay. All payments are processed securely through Stripe."
        },
        {
          q: "What's your refund policy?",
          a: "We offer a 100% money-back guarantee if you're not satisfied with your first mix. Request a refund within 7 days of delivery, and we'll issue a full refund - no questions asked. Additional revisions are always free."
        },
        {
          q: "How does engineer payment work?",
          a: "Engineers receive 70% of the project fee, paid directly to their account within 24 hours of project completion and client approval. We handle all payment processing and provide monthly statements."
        },
        {
          q: "Are there any hidden fees?",
          a: "No hidden fees ever. The price you see is the price you pay. Add-on services (vocal tuning, stem mastering, etc.) are clearly listed with transparent pricing."
        }
      ]
    },
    {
      category: "Services & Features",
      questions: [
        {
          q: "What's the difference between AI and professional mixing?",
          a: "AI mastering is instant, automated, and perfect for demos or quick releases. Professional mixing/mastering is done by experienced engineers who provide creative input, unlimited revisions, and genre-specific expertise."
        },
        {
          q: "How long does mixing/mastering take?",
          a: "Standard packages: 48-72 hours. Professional packages: 24-48 hours. Premium packages: 12-24 hours. Rush delivery (6-12 hours) available for an additional fee. AI mastering is instant."
        },
        {
          q: "Do you offer unlimited revisions?",
          a: "Professional and Premium packages include unlimited revisions until you're 100% satisfied. Standard packages include 2 free revisions (additional revisions available for $15 each)."
        },
        {
          q: "Can I collaborate in real-time?",
          a: "Yes! Our live collaboration feature lets you listen along with your engineer in real-time, provide instant feedback via voice or text, and hear changes as they happen. It's like being in the studio together."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "What if I have technical issues uploading files?",
          a: "We support files up to 2GB. If you're having trouble, try: 1) Check your internet connection, 2) Use a different browser, 3) Compress large files, or 4) Contact support for a direct upload link."
        },
        {
          q: "How do I download my finished tracks?",
          a: "Once your project is complete, you'll receive an email notification. Log in to your dashboard, navigate to the project, and download your files in WAV or MP3 format. Files are stored for 90 days."
        },
        {
          q: "Do you provide stems or individual tracks?",
          a: "Yes! Professional and Premium packages include stems/multitracks upon request. This is perfect for future remixes, live performances, or additional production work."
        }
      ]
    },
    {
      category: "For Engineers",
      questions: [
        {
          q: "How do I become a verified engineer?",
          a: "Complete your profile with your experience, portfolio, and gear list. Submit 3 before/after samples of your work. Our team reviews applications within 48 hours. Verified engineers get priority job placement."
        },
        {
          q: "How much can I earn as an engineer?",
          a: "Engineers typically earn $500-$3,000+ per month depending on experience and volume. Top engineers earn $5,000-$10,000/month. You keep 70% of every project fee."
        },
        {
          q: "Can I set my own rates?",
          a: "Yes and no. We maintain competitive platform rates to ensure consistency, but verified engineers can offer premium services at custom rates. You can also offer add-ons and upsells."
        }
      ]
    },
    {
      category: "Security & Privacy",
      questions: [
        {
          q: "Is my music safe and secure?",
          a: "Absolutely. All files are encrypted in transit (256-bit SSL) and at rest. We never share, sell, or use your music without permission. You retain 100% ownership of your masters."
        },
        {
          q: "Do you sign NDAs?",
          a: "For high-profile clients, we're happy to sign NDAs. Contact our support team to arrange this before starting your project."
        },
        {
          q: "What happens to my files after project completion?",
          a: "Your files are securely stored for 90 days, then permanently deleted from our servers. You can download all files (including project files) anytime during this period."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      qa => 
        qa.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qa.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about MixClub. Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredFaqs.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((qa, index) => (
                    <AccordionItem key={index} value={`${category.category}-${index}`}>
                      <AccordionTrigger className="text-left font-medium hover:text-primary">
                        {qa.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {qa.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold mb-4 text-center">Still have questions?</h3>
            <p className="text-center text-muted-foreground mb-6">
              Our support team is here to help you succeed
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex flex-col h-auto py-4">
                <MessageCircle className="w-6 h-6 mb-2" />
                <span className="font-semibold">Live Chat</span>
                <span className="text-xs text-muted-foreground">Available 24/7</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-4">
                <Mail className="w-6 h-6 mb-2" />
                <span className="font-semibold">Email Support</span>
                <span className="text-xs text-muted-foreground">support@mixclub.com</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-4">
                <Phone className="w-6 h-6 mb-2" />
                <span className="font-semibold">Phone</span>
                <span className="text-xs text-muted-foreground">1-800-MIXCLUB</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <PublicFooter />
    </div>
  );
}
