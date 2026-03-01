/**
 * PublicFooter — Shared footer for all public/marketing pages.
 * Cross-links, legal pages, social media links.
 */

import { Link } from 'react-router-dom';
import mixclub3DLogo from '@/assets/mixxclub-3d-logo.png';

const FOOTER_SECTIONS = [
  {
    title: 'Platform',
    links: [
      { label: 'How It Works', path: '/how-it-works' },
      { label: 'Pricing', path: '/pricing' },
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

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/mixxclub',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'X / Twitter',
    href: 'https://x.com/mixxclub',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@mixxclub',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@mixxclub',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.18 8.18 0 005.58 2.18V11.7a4.82 4.82 0 01-3.77-1.24V6.69h3.77z" />
      </svg>
    ),
  },
  {
    label: 'SoundCloud',
    href: 'https://soundcloud.com/mixxclub',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.05-.1-.1-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.172 1.3c.013.06.045.094.104.094.053 0 .09-.04.104-.094l.198-1.3-.198-1.332c-.014-.057-.051-.094-.104-.094m1.809-1.108c-.064 0-.104.044-.112.1l-.209 2.434.209 2.347c.008.06.048.1.112.1.063 0 .1-.04.116-.1l.24-2.347-.24-2.434c-.016-.06-.053-.1-.116-.1m.89-.432c-.074 0-.112.047-.12.107l-.193 2.866.193 2.77c.008.064.046.107.12.107.073 0 .108-.043.121-.107l.217-2.77-.217-2.866c-.013-.06-.048-.107-.121-.107m.888-.195c-.08 0-.116.05-.127.11l-.18 3.061.18 2.942c.011.065.047.11.127.11.079 0 .112-.045.127-.11l.204-2.942-.204-3.061c-.015-.06-.048-.11-.127-.11m.897-.252c-.088 0-.122.053-.133.117l-.165 3.313.165 3.065c.011.068.045.117.133.117.086 0 .118-.049.133-.117l.188-3.065-.188-3.313c-.015-.064-.047-.117-.133-.117m.91-.203c-.094 0-.128.056-.139.12l-.15 3.516.15 3.148c.011.07.045.12.14.12.09 0 .124-.05.139-.12l.172-3.148-.173-3.516c-.014-.064-.048-.12-.139-.12m.899-.161c-.1 0-.133.058-.145.126l-.138 3.677.138 3.2c.012.072.045.126.145.126.098 0 .13-.054.145-.126l.156-3.2-.156-3.677c-.015-.068-.047-.126-.145-.126m.912-.128c-.106 0-.138.062-.15.131l-.123 3.805.123 3.25c.012.075.044.131.15.131.105 0 .134-.056.15-.131l.14-3.25-.14-3.805c-.016-.069-.045-.131-.15-.131m.912-.085c-.112 0-.144.064-.155.137l-.11 3.89.11 3.3c.011.077.043.137.155.137.111 0 .14-.06.155-.137l.126-3.3-.126-3.89c-.015-.073-.044-.137-.155-.137m1.831.384a2.85 2.85 0 00-1.33.332c-.112 0-.144.066-.155.139l-.097 3.474.098 3.32c.01.079.043.139.154.139.11 0 .14-.06.156-.139l.115-3.32-.115-3.474c-.015-.073-.045-.139-.155-.139a2.84 2.84 0 012.84 2.84c0 1.57-1.272 2.84-2.84 2.84" />
      </svg>
    ),
  },
];

export function PublicFooter() {
  return (
    <footer className="relative z-20 border-t border-border/30 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={mixclub3DLogo} alt="MixxClub" className="w-8 h-6 object-contain" />
              <span className="font-black text-sm tracking-wider">MIXXCLUB</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              From bedroom to billboard. AI-powered music production, collaboration, and distribution.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
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
            <Link to="/how-it-works" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
