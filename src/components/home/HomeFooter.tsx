/**
 * Home Footer
 * 
 * Comprehensive footer with navigation and brand identity.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  MessageCircle,
  Mail,
  ExternalLink
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
  { icon: Twitter, href: 'https://twitter.com/mixclubhq', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/mixclubhq', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/@mixclubhq', label: 'YouTube' },
  { icon: MessageCircle, href: 'https://discord.gg/mixclub', label: 'Discord' },
];

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
          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
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
          </div>
          
          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
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
          </div>
          
          {/* Connect */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@mixclub.io"
                  className="flex items-center gap-2 text-muted-foreground 
                             hover:text-foreground transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  hello@mixclub.io
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/mixclub"
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
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} MixClub. All rights reserved.
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
