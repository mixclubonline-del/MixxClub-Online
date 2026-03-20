// Schema.org structured data generators for SEO & AEO

const BASE_URL = "https://mixxclub.lovable.app";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mixxclub",
  "description": "Professional audio mixing and mastering platform connecting artists with world-class engineers",
  "url": BASE_URL,
  "logo": `${BASE_URL}/logo.png`,
  "sameAs": [
    "https://twitter.com/mixxclub",
    "https://facebook.com/mixxclub",
    "https://instagram.com/mixxclub"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "support@mixxclubonline.com"
  }
};

export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Professional Audio Mixing & Mastering",
  "provider": {
    "@type": "Organization",
    "name": "Mixxclub"
  },
  "serviceType": "Audio Engineering",
  "areaServed": "Worldwide",
  "description": "Connect with professional audio engineers for mixing, mastering, and music production services"
};

export const generateServiceSchema = (service: {
  name: string;
  description: string;
  price: string;
  category?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.name,
  "description": service.description,
  "provider": {
    "@type": "Organization",
    "name": "Mixxclub",
    "url": BASE_URL,
  },
  "serviceType": service.category || "Audio Engineering",
  "areaServed": "Worldwide",
  "offers": {
    "@type": "Offer",
    "price": service.price.replace(/[^0-9.]/g, ''),
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
  },
});

export const generateProductSchema = (product: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  imageUrl?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.imageUrl || `${BASE_URL}/og-default.jpg`,
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": product.currency || "USD",
    "availability": "https://schema.org/InStock"
  }
});

export const generateReviewSchema = (reviews: Array<{
  author: string;
  rating: number;
  text: string;
  date: string;
}>) => ({
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "ratingValue": reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
  "reviewCount": reviews.length,
  "bestRating": 5,
  "worstRating": 1
});

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
    },
  })),
});

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Mixxclub",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web",
  "url": BASE_URL,
  "description": "AI-powered audio engineering platform connecting artists with professional engineers. Mixing, mastering, beat marketplace, and creator tools.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free tier available. Paid plans from $14.99/month.",
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "2500",
    "bestRating": "5",
    "worstRating": "1",
  },
};

export const generateSpeakableSchema = (url: string, selectors: string[]) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "url": url,
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": selectors,
  },
});
