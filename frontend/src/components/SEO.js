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
  noindex = false
}) => {
  const siteUrl = process.env.REACT_APP_SITE_URL || "https://yugproperties.co.in";
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const fullCanonical = canonical || window.location.href;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Yug Properties" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonical} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
