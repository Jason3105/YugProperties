# 🔐 Search Engine Verification Codes

This file contains placeholder locations for search engine verification codes.  
**Add these AFTER deploying to production** to verify ownership in search consoles.

---

## 📍 Where to Add Verification Codes

All verification meta tags should be added to:
```
frontend/public/index.html
```

Add them inside the `<head>` section, after the existing meta tags.

---

## 🔍 Google Search Console

### Steps to Get Verification Code:
1. Go to: https://search.google.com/search-console
2. Click "Add Property"
3. Enter: `https://yugproperties.co.in`
4. Choose verification method: **HTML tag**
5. Copy the meta tag

### Add to index.html:
```html
<!-- Google Search Console Verification -->
<meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE_HERE" />
```

**Example:**
```html
<meta name="google-site-verification" content="abc123XYZ456def789GHI012jkl345MNO678pqr901" />
```

---

## 🅱️ Bing Webmaster Tools

### Steps to Get Verification Code:
1. Go to: https://www.bing.com/webmasters
2. Click "Add Site"
3. Enter: `https://yugproperties.co.in`
4. Choose verification method: **Meta tag**
5. Copy the meta tag

### Add to index.html:
```html
<!-- Bing Webmaster Tools Verification -->
<meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE_HERE" />
```

**Example:**
```html
<meta name="msvalidate.01" content="ABC123DEF456GHI789JKL012MNO345PQR678STU901" />
```

---

## 🔎 Yandex Webmaster

### Steps to Get Verification Code:
1. Go to: https://webmaster.yandex.com
2. Click "Add Site"
3. Enter: `https://yugproperties.co.in`
4. Choose verification method: **Meta tag**
5. Copy the meta tag

### Add to index.html:
```html
<!-- Yandex Verification -->
<meta name="yandex-verification" content="YOUR_YANDEX_VERIFICATION_CODE_HERE" />
```

**Example:**
```html
<meta name="yandex-verification" content="abcdef1234567890ghijklmnopqrstuv" />
```

---

## 📊 Google Analytics (GA4)

### Steps to Get Tracking Code:
1. Go to: https://analytics.google.com
2. Create account or sign in
3. Create property: "Yug Properties"
4. Get Measurement ID (format: `G-XXXXXXXXXX`)

### Add to index.html (before </head>):
```html
<!-- Google Analytics GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Replace `G-XXXXXXXXXX` with your actual Measurement ID**

---

## 🏷️ Google Tag Manager (Optional)

### Steps to Get GTM Code:
1. Go to: https://tagmanager.google.com
2. Create account or sign in
3. Create container: "Yug Properties"
4. Get Container ID (format: `GTM-XXXXXXX`)

### Add to index.html:

**In <head> section:**
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

**Right after opening <body> tag:**
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

**Replace `GTM-XXXXXXX` with your actual Container ID**

---

## 🌐 Facebook Domain Verification

### Steps to Get Verification Code:
1. Go to: https://business.facebook.com
2. Business Settings → Brand Safety → Domains
3. Add domain: `yugproperties.co.in`
4. Choose verification method: **Meta tag**
5. Copy the meta tag

### Add to index.html:
```html
<!-- Facebook Domain Verification -->
<meta name="facebook-domain-verification" content="YOUR_FACEBOOK_VERIFICATION_CODE_HERE" />
```

---

## 📌 Pinterest Site Verification

### Steps to Get Verification Code:
1. Go to: https://www.pinterest.com/settings/claim
2. Enter: `yugproperties.co.in`
3. Choose verification method: **HTML tag**
4. Copy the meta tag

### Add to index.html:
```html
<!-- Pinterest Site Verification -->
<meta name="p:domain_verify" content="YOUR_PINTEREST_VERIFICATION_CODE_HERE" />
```

---

## 🏢 Google My Business (Local SEO)

### Steps to Set Up:
1. Go to: https://www.google.com/business
2. Click "Manage now"
3. Enter business name: "Yug Properties"
4. Choose category: "Real estate agency"
5. Add location: Virar West, Mumbai, Maharashtra 401303
6. Add phone: +91-8805117788
7. Add website: https://yugproperties.co.in
8. Verify business (postcard/phone/email)

### Benefits:
- ✅ Appear in Google Maps
- ✅ Show in local search results ("real estate near me")
- ✅ Display business hours, photos, reviews
- ✅ Get customer reviews (boost SEO)

---

## 📍 Current Placeholder in index.html

Currently, these placeholders exist in `frontend/public/index.html`:

```html
<!-- Bing Verification (add your verification code when available) -->
<!-- <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" /> -->

<!-- Google Site Verification (add your verification code when available) -->
<!-- <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" /> -->

<!-- Yandex Verification (add your verification code when available) -->
<!-- <meta name="yandex-verification" content="YOUR_YANDEX_VERIFICATION_CODE" /> -->
```

**Simply uncomment and replace with your actual codes.**

---

## ✅ Verification Checklist

After deploying to production:

- [ ] Set up Google Search Console
  - [ ] Add property (yugproperties.co.in)
  - [ ] Add HTML verification meta tag
  - [ ] Submit sitemap (https://yugproperties.co.in/sitemap.xml)
  - [ ] Request indexing for homepage

- [ ] Set up Bing Webmaster Tools
  - [ ] Add site (yugproperties.co.in)
  - [ ] Add verification meta tag
  - [ ] Submit sitemap

- [ ] Set up Google Analytics (GA4)
  - [ ] Create property
  - [ ] Add tracking code to index.html
  - [ ] Verify tracking is working

- [ ] Set up Google My Business
  - [ ] Create business profile
  - [ ] Verify business
  - [ ] Add photos and details
  - [ ] Get reviews from customers

- [ ] Set up Facebook Business
  - [ ] Verify domain
  - [ ] Create Facebook page
  - [ ] Add link to website footer

- [ ] Optional: Set up additional tools
  - [ ] Google Tag Manager
  - [ ] Pinterest verification
  - [ ] Yandex Webmaster
  - [ ] LinkedIn Company Page

---

## 🚨 Important Notes

1. **Deploy First, Verify Later**
   - Deploy website to production FIRST
   - THEN add verification codes
   - Verification only works on live sites

2. **Don't Share Verification Codes**
   - Keep codes private
   - Don't commit to public GitHub repos
   - Use environment variables if possible

3. **Test After Adding**
   - Always test website after adding codes
   - Ensure no breaking changes
   - Check Google Analytics is tracking

4. **Update This File**
   - When you add codes, update this file with dates
   - Keep track of which services are active
   - Document any issues

---

## 📅 Verification Timeline

### Before Deployment
- ✅ SEO optimization completed
- ✅ Structured data added
- ✅ Sitemap created
- ✅ Robots.txt configured

### After Deployment (Day 1)
- [ ] Add Google Search Console verification
- [ ] Submit sitemap to GSC
- [ ] Request homepage indexing

### Week 1
- [ ] Add Bing verification
- [ ] Set up Google Analytics
- [ ] Set up Google My Business

### Week 2
- [ ] Monitor GSC for indexing
- [ ] Check analytics traffic
- [ ] Verify GMB listing

### Month 1
- [ ] Check search rankings
- [ ] Monitor analytics data
- [ ] Get customer reviews on GMB

---

**Last Updated:** November 28, 2025  
**Maintained by:** The xDEVs Co for Yug Properties
