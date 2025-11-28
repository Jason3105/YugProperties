import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "Yug Properties - Premium Real Estate in Mumbai",
  description = "Find your dream home in Mumbai with Yug Properties. Explore premium residential & commercial properties in Virar, Vasai, Nallasopara & across Mumbai.",
  keywords = "real estate Mumbai, properties in Virar, flats in Mumbai, villas in Vasai, property dealers Mumbai",
  canonical,
  image = "/og-image.jpg",
  type = "website",
  schema,
  noindex = false,
  author = "Yug Properties",
  locale = "en_IN",
  alternateLanguages = []
}) => {
  const siteUrl = process.env.REACT_APP_SITE_URL || "https://yugproperties.co.in";
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const fullCanonical = canonical || window.location.href;
  const siteName = "Yug Properties";

  return (
    <Helmet>
      {/* Primary Meta Tags - Enhanced */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="publisher" content="Yug Properties" />
      <meta name="copyright" content="© 2025 Yug Properties. All rights reserved." />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="target" content="all" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />
      
      {/* Alternate Languages */}
      {alternateLanguages.map((lang) => (
        <link key={lang.hreflang} rel="alternate" hreflang={lang.hreflang} href={lang.href} />
      ))}
      <link rel="alternate" hreflang="x-default" href={siteUrl} />
      
      {/* Robots & Crawling Directives */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        </>
      )}
      
      {/* Open Graph / Facebook - Enhanced */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:secure_url" content={fullImage} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content="hi_IN" />
      <meta property="og:locale:alternate" content="mr_IN" />
      
      {/* Article specific tags for blogs */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          <meta property="article:publisher" content={siteUrl} />
        </>
      )}
      
      {/* Twitter Card - Enhanced */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Google-specific Tags */}
      <meta name="google" content="nositelinkssearchbox" />
      <meta name="google" content="notranslate" />
      
      {/* Bing Verification (add your verification code when available) */}
      {/* <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" /> */}
      
      {/* Google Site Verification (add your verification code when available) */}
      {/* <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" /> */}
      
      {/* Yandex Verification (add your verification code when available) */}
      {/* <meta name="yandex-verification" content="YOUR_YANDEX_VERIFICATION_CODE" /> */}
      
      {/* Additional SEO Tags */}
      <meta name="format-detection" content="telephone=yes" />
      <meta name="format-detection" content="address=yes" />
      
      {/* Schema.org JSON-LD */}
      {schema && (
        Array.isArray(schema) ? (
          schema.map((s, index) => (
            <script key={index} type="application/ld+json">
              {JSON.stringify(s, null, 0)}
            </script>
          ))
        ) : (
          <script type="application/ld+json">
            {JSON.stringify(schema, null, 0)}
          </script>
        )
      )}
    </Helmet>
  );
};

export default SEO;
