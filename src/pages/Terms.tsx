import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container max-w-4xl py-12 px-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="space-y-8">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Terms of Service</h1>
              <p className="text-muted-foreground mt-2">Last Updated: January 2025</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using MixClub ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Service Description</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                MixClub is an online platform that connects music artists with audio engineers for mixing, mastering, and other audio production services. The Service includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Project management and collaboration tools</li>
                <li>Audio file storage and transfer</li>
                <li>Payment processing for services</li>
                <li>Communication features between artists and engineers</li>
                <li>Educational content and resources</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">3.1 Registration</h3>
              <p className="text-muted-foreground leading-relaxed">
                You must create an account to use certain features of the Service. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">3.2 Account Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Payments and Refunds</h2>
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">4.1 Payment Processing</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                All payments are processed securely through our payment partners (Stripe, PayPal, Coinbase Commerce). We support:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Credit and debit cards</li>
                <li>PayPal and Venmo</li>
                <li>Cryptocurrency (Bitcoin, Ethereum, USDC)</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">4.2 Service Fees</h3>
              <p className="text-muted-foreground leading-relaxed">
                MixClub charges a platform fee on each transaction. Engineers receive 70% of the project payment, while 30% goes to platform fees and payment processing.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">4.3 Refund Policy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Refunds are handled on a case-by-case basis. If you are not satisfied with the service provided, please contact support@mixclubonline.com within 7 days of project completion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Intellectual Property</h2>
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">5.1 User Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                You retain all rights to the audio content you upload. By using the Service, you grant MixClub a limited license to store, process, and transmit your content solely for the purpose of providing the Service.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">5.2 Work Product</h3>
              <p className="text-muted-foreground leading-relaxed">
                All work product created by engineers through the Service belongs to the client (artist) upon full payment. Engineers may not use, reproduce, or distribute the work product without explicit written permission from the client.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Prohibited Activities</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Use the Service for any illegal purpose</li>
                <li>Upload content that infringes on others&apos; intellectual property rights</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to circumvent payment processing</li>
                <li>Reverse engineer or attempt to access the Service&apos;s source code</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                MixClub acts as an intermediary platform. We are not responsible for the quality of work provided by engineers or the actions of users. Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If resolution cannot be achieved, disputes shall be resolved through binding arbitration in accordance with applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may terminate your account at any time by contacting support. Upon termination, you will lose access to all content and data associated with your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-foreground font-medium">MixClub Support</p>
                <p className="text-muted-foreground">Email: legal@mixclubonline.com</p>
                <p className="text-muted-foreground">Address: [Your Business Address]</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <footer className="border-t border-border py-8 bg-card mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 MixClub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
