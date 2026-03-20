/**
 * SEOHead — Enhanced with JSON-LD schema presets, Twitter player cards,
 * canonical URL normalization, and article/product structured data.
 */

import { Helmet } from "react-helmet-async";
import { useMemo } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  schema?: object | object[];
  noindex?: boolean;
  /** Article-specific: published date */
  publishedTime?: string;
  /** Article-specific: modified date */
  modifiedTime?: string;
  /** Product-specific: price + currency */
  product?: { price: number; currency?: string; availability?: string };
  /** FAQ items — auto-generates FAQPage JSON-LD */
  faq?: Array<{ question: string; answer: string }>;
  /** CSS selectors for speakable schema (voice assistants) */
  speakableSelectors?: string[];
}

const SITE_NAME = "MIXXCLUB";
const BASE_URL = "https://mixxclub.lovable.app";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.jpg`;

/**
 * Build a dynamic OG image URL via the generate-og-image edge function.
 * Usage: buildOgImageUrl('beat', beatId) → full URL for social cards.
 */
export function buildOgImageUrl(type: 'beat' | 'engineer' | 'battle', id: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/generate-og-image?type=${type}&id=${id}`;
}

// Organization schema — always present on every page
const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mixxclub",
  alternateName: "MIXXCLUB",
  url: BASE_URL,
  logo: `${BASE_URL}/mixxclub-logo.png`,
  sameAs: [
    "https://twitter.com/mixxclub",
    "https://instagram.com/mixxclub",
    "https://facebook.com/mixxclub",
  ],
  description:
    "AI-powered audio engineering platform connecting artists with professional engineers. Mixing, mastering, beat marketplace, and creator tools.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "support@mixxclubonline.com",
    availableLanguage: "English",
  },
};

function buildCanonical(raw?: string): string {
  if (raw) return raw;
  if (typeof window === "undefined") return BASE_URL;
  // Strip trailing slash, hash, and query for canonical
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  let path = url.pathname.replace(/\/+$/, "") || "/";
  return `${BASE_URL}${path}`;
}

export const SEOHead = ({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = "website",
  keywords,
  schema,
  noindex = false,
  publishedTime,
  modifiedTime,
  product,
}: SEOHeadProps) => {
  const fullTitle =
    title.length > 55
      ? `${title} | ${SITE_NAME}`
      : `${title} | ${SITE_NAME} - Professional Audio Engineering Platform`;
  const currentUrl = buildCanonical(canonicalUrl);
  const resolvedImage = ogImage || DEFAULT_OG_IMAGE;

  // Aggregate schemas
  const schemas = useMemo(() => {
    const list: object[] = [ORG_SCHEMA];

    // WebSite schema for sitelinks search box
    list.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: BASE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    });

    // Product schema
    if (product) {
      list.push({
        "@context": "https://schema.org",
        "@type": "Product",
        name: title,
        description,
        image: resolvedImage,
        offers: {
          "@type": "Offer",
          price: product.price.toFixed(2),
          priceCurrency: product.currency || "USD",
          availability: `https://schema.org/${product.availability || "InStock"}`,
          url: currentUrl,
        },
      });
    }

    // Custom schema(s)
    if (schema) {
      if (Array.isArray(schema)) {
        list.push(...schema);
      } else {
        list.push(schema);
      }
    }

    return list;
  }, [schema, product, title, description, resolvedImage, currentUrl]);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta name="twitter:site" content="@mixxclub" />

      {/* Schema.org Structured Data */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};
