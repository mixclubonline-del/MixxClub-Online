/**
 * PublicFooter — Shared footer for all public/marketing pages.
 * Links to legal, info, role pages, and social presence.
 */

import { Link } from 'react-router-dom';
import mixclub3DLogo from '@/assets/mixclub-3d-logo.png';

const FOOTER_SECTIONS = [
  {
    title: 'Platform',
    links: [
      { label: 'How It Works', path: '/how-it-works' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'Choose Your Path', path: '/choose-path' },
      { label: 'Showcase', path: '/showcase' },
      { label: 'FAQ', path: '/faq' },
    ],
  },
  {
    title: 'For Creatives',
    links: [
      { label: 'For Artists', path: '/for-artists' },
      { label: 'For Engineers', path: '/for-engineers' },
      { label: 'For Producers', path: '/for-producers' },
      { label: 'For Fans', path: '/for-fans' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', path: '/about' },
      { label: 'Press', path: '/press' },
      { label: 'Contact', path: '/contact' },
      { label: 'Enterprise', path: '/enterprise' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border/30 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={mixclub3DLogo} alt="MixxClub" className="w-8 h-6 object-contain" />
              <span className="font-black text-sm tracking-wider">MIXXCLUB</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              From bedroom to billboard. AI-powered music production, collaboration, and distribution.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Mixxed AI Technology Company. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              Sign In
            </Link>
            <Link to="/choose-path" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
