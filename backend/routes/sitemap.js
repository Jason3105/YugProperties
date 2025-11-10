const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// Generate XML sitemap
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://yugproperties.co.in';
    const currentDate = new Date().toISOString();
    
    // Static pages
    const staticPages = [
      { url: '', changefreq: 'daily', priority: '1.0' },
      { url: '/properties', changefreq: 'daily', priority: '0.9' },
      { url: '/login', changefreq: 'monthly', priority: '0.5' },
      { url: '/signup', changefreq: 'monthly', priority: '0.5' },
    ];
    
    // Get all properties
    const properties = await Property.getAll({ status: 'available' });
    
    // Build sitemap XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    
    // Add static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });
    
    // Add property pages
    properties.forEach(property => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/properties/${property.id}</loc>\n`;
      xml += `    <lastmod>${new Date(property.updated_at || property.posted_on).toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      
      // Add property images
      if (property.images && property.images.length > 0) {
        property.images.slice(0, 5).forEach(imageUrl => {
          xml += `    <image:image>\n`;
          xml += `      <image:loc>${imageUrl}</image:loc>\n`;
          xml += `      <image:title>${property.title}</image:title>\n`;
          xml += `    </image:image>\n`;
        });
      }
      
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Generate sitemap index (for large sites)
router.get('/sitemap-index.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://yugproperties.co.in';
    const currentDate = new Date().toISOString();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/sitemap.xml</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '  </sitemap>\n';
    
    xml += '</sitemapindex>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap index generation error:', error);
    res.status(500).send('Error generating sitemap index');
  }
});

module.exports = router;
