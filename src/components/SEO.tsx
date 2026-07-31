import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getMetaDescription } from '../utils/seoUtils';

interface SEOProps {
  title: string;
  descriptionType?: 'home' | 'marketplace' | 'login' | 'signup' | 'profile' | 'category' | 'listing' | 'about' | 'contact' | 'faq' | 'privacy' | 'terms';
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

  // Base origin for absolute URLs in metadata (using www.revoshelf.com domain name for canonical URLs)
  const canonicalOrigin = 'https://www.revoshelf.com';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.revoshelf.com';
  const defaultImage = `${origin}/logo.svg`;

  // Compute description using dynamic type utility or manual description / default fallback
  const metaDescription = descriptionType
    ? getMetaDescription(descriptionType, descriptionDetails)
    : (description || getMetaDescription('default'));

  // Ensure image and URL are absolute (pointing to www.revoshelf.com canonical domain)
  const ogImage = image
    ? (image.startsWith('http') ? image : `${origin}${image.startsWith('/') ? '' : '/'}${image}`)
    : defaultImage;

  // Trim trailing slash from url if present, except for root page
  let cleanUrlPath = url || '';
  if (cleanUrlPath.startsWith('/')) {
    cleanUrlPath = cleanUrlPath.substring(1);
  }
  if (cleanUrlPath.endsWith('/') && cleanUrlPath !== '/') {
    cleanUrlPath = cleanUrlPath.substring(0, cleanUrlPath.length - 1);
  }

  const ogUrl = url
    ? (url.startsWith('http') ? url : `${canonicalOrigin}/${cleanUrlPath}`)
    : (typeof window !== 'undefined' ? window.location.href.replace(window.location.origin, canonicalOrigin) : `${canonicalOrigin}/`);

  const ogType = type || 'website';

  // Global Website Schema with SearchAction
  const globalWebSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'RevoShelf',
    'alternateName': 'Revo Shelf',
    'url': 'https://www.revoshelf.com',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://www.revoshelf.com/search?query={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  // Global Organization Schema
  const globalOrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'RevoShelf',
    'url': 'https://www.revoshelf.com',
    'logo': 'https://www.revoshelf.com/logo.png'
  };

  // Normalize structured data to array and combine with global schemas
  const customSchemas = structuredData
    ? (Array.isArray(structuredData) ? structuredData : [structuredData])
    : [];

  const schemas = [globalWebSiteSchema, globalOrganizationSchema, ...customSchemas];

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
      <meta property="og:site_name" content="RevoShelf" />

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
