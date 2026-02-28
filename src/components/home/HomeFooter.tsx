/**
 * Home Footer
 * 
 * Comprehensive footer with navigation and brand identity.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const footerLinks = {
  services: [
    { label: 'Mixing', href: '/services/mixing' },
    { label: 'Mastering', href: '/services/mastering' },
    { label: 'AI Mastering', href: '/services/ai-mastering' },
    { label: 'Distribution', href: '/services/distribution' },
    { label: 'Pricing', href: '/pricing' },
  ],
  company: [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'For Artists', href: '/for-artists' },
    { label: 'For Engineers', href: '/for-engineers' },
    { label: 'FAQ', href: '/faq' },
    { label: 'About', href: '/about' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/mixxclubhq', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/mixxclubhq', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/@mixxclubhq', label: 'YouTube' },
  { icon: MessageCircle, href: 'https://discord.gg/mixxclub', label: 'Discord' },
];

// Mobile accordion section component
function MobileFooterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-border/30 md:border-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 md:hidden"
      >
        <h4 className="font-semibold text-foreground">{title}</h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>
      
      {/* Desktop: always visible */}
      <div className="hidden md:block">
        <h4 className="font-semibold text-foreground mb-4">{title}</h4>
        {children}
      </div>
      
      {/* Mobile: accordion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden md:hidden pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HomeFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative overflow-hidden border-t border-border/50">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/20" />
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent 
                               bg-clip-text text-transparent">
                MIXXCLUB
              </span>
            </Link>
            
            <p className="text-muted-foreground mb-6 max-w-sm">
              The hip-hop network connecting artists with professional engineers. 
              From bedroom to billboard.
            </p>
            
            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted 
                             text-muted-foreground hover:text-primary
                             transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
          
          {/* Services */}
          <MobileFooterSection title="Services">
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground 
                               transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </MobileFooterSection>
          
          {/* Company */}
          <MobileFooterSection title="Company">
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground 
                               transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </MobileFooterSection>
          
          {/* Connect */}
          <MobileFooterSection title="Connect">
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@mixxclubonline.com"
                  className="flex items-center gap-2 text-muted-foreground 
                             hover:text-foreground transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  hello@mixxclubonline.com
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/mixxclub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground 
                             hover:text-foreground transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Join Discord
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
            
            {/* Newsletter teaser */}
            <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">
                Get updates on new features
              </p>
              <Link
                to="/auth?mode=signup"
                className="text-sm font-medium text-primary hover:text-primary/80 
                           transition-colors"
              >
                Join the community →
              </Link>
            </div>
          </MobileFooterSection>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Mixxclub. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground 
                             transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
