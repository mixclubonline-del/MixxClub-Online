// Schema.org structured data generators for SEO

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MixClub",
  "description": "Professional audio mixing and mastering platform connecting artists with world-class engineers",
  "url": "https://mixclub.com",
  "logo": "https://mixclub.com/logo.png",
  "sameAs": [
    "https://twitter.com/mixclub",
    "https://facebook.com/mixclub",
    "https://instagram.com/mixclub"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "support@mixclub.com"
  }
};

export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Professional Audio Mixing & Mastering",
  "provider": {
    "@type": "Organization",
    "name": "MixClub"
  },
  "serviceType": "Audio Engineering",
  "areaServed": "Worldwide",
  "description": "Connect with professional audio engineers for mixing, mastering, and music production services"
};

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
  "image": product.imageUrl || "https://mixclub.com/og-default.jpg",
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
