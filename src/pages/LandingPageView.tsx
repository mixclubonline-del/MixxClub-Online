/**
 * Public landing page renderer.
 * Reads the slug from the URL, fetches the page config, and renders the blocks.
 */

import { useParams } from 'react-router-dom';
import { useLandingPage } from '@/hooks/useLandingPages';
import { BlockRenderer } from '@/components/landing-builder/BlockRenderer';
import { SEOHead } from '@/components/SEOHead';
import Navigation from '@/components/Navigation';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { Loader2 } from 'lucide-react';

export default function LandingPageView() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = useLandingPage(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page || error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
            <p className="text-muted-foreground">The page you're looking for doesn't exist or isn't published.</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={page.title}
        description={page.description || `${page.title} — Mixxclub`}
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        {page.blocks.map(block => (
          <BlockRenderer key={block.id} block={block} />
        ))}
        <PublicFooter />
      </div>
    </>
  );
}
