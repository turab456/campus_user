import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getMetaDescription } from '../utils/seoUtils';

interface SEOProps {
  title: string;
  descriptionType?: 'home' | 'marketplace' | 'login' | 'signup' | 'profile' | 'category' | 'listing';
  descriptionDetails?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
  meta?: Array<{ name: string; content: string }>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  descriptionType,
  descriptionDetails,
  description,
  keywords,
  image,
  url,
  type,
  structuredData,
  meta = [],
}) => {
  const defaultKeywords = 'marketplace, college, textbooks, notes, sell, buy, student, campus';
  
  // Base origin for absolute URLs in metadata (using revoshelf.com domain name for canonical URLs)
  const canonicalOrigin = 'https://revoshelf.com';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.revoshelf.com';
  const defaultImage = `${origin}/logo.svg`;

  // Compute description using dynamic type utility or manual description / default fallback
  const metaDescription = descriptionType
    ? getMetaDescription(descriptionType, descriptionDetails)
    : (description || getMetaDescription('default'));

  // Ensure image and URL are absolute (pointing to revoshelf.com canonical domain)
  const ogImage = image
    ? (image.startsWith('http') ? image : `${origin}${image.startsWith('/') ? '' : '/'}${image}`)
    : defaultImage;

  const ogUrl = url
    ? (url.startsWith('http') ? url : `${canonicalOrigin}${url.startsWith('/') ? '' : '/'}${url}`)
    : (typeof window !== 'undefined' ? window.location.href.replace(window.location.origin, canonicalOrigin) : `${canonicalOrigin}/`);

  const ogType = type || 'website';

  // Normalize structured data to array
  const schemas = structuredData
    ? (Array.isArray(structuredData) ? structuredData : [structuredData])
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={ogUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />

      {meta.map(({ name, content }) => (
        <meta key={name} name={name} content={content} />
      ))}

      {/* Structured Data JSON-LD */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
