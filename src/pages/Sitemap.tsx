import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This component generates an XML sitemap dynamically
export default function Sitemap() {
  const navigate = useNavigate();

  useEffect(() => {
    const baseUrl = 'https://mixxclub.lovable.app';
    const currentDate = new Date().toISOString().split('T')[0];

    const routes = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/pricing', priority: '0.9', changefreq: 'weekly' },
      { url: '/home', priority: '0.9', changefreq: 'weekly' },
      { url: '/showcase', priority: '0.8', changefreq: 'daily' },
      { url: '/for-artists', priority: '0.8', changefreq: 'monthly' },
      { url: '/for-engineers', priority: '0.8', changefreq: 'monthly' },
      { url: '/for-producers', priority: '0.8', changefreq: 'monthly' },
      { url: '/for-fans', priority: '0.8', changefreq: 'monthly' },
      
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/press', priority: '0.7', changefreq: 'monthly' },
      { url: '/faq', priority: '0.6', changefreq: 'monthly' },
      { url: '/install', priority: '0.5', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
      { url: '/terms', priority: '0.4', changefreq: 'yearly' },
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Create blob and download
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Navigate back to home
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Generating Sitemap...</h1>
        <p className="text-muted-foreground">Your sitemap.xml will download automatically.</p>
      </div>
    </div>
  );
}
