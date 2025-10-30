# SEO Implementation Guide

This document outlines the SEO best practices and implementations in the Epic Stack marketing site.

## Overview

The marketing site is built with Astro and follows modern SEO best practices to ensure optimal search engine visibility and user experience.

## Core SEO Features

### 1. Sitemap Generation

**Location:** Configured in `astro.config.mjs`

The site automatically generates a sitemap at `/sitemap-index.xml` using the official `@astrojs/sitemap` integration.

**Configuration:**
- Filters out preview and API routes
- Sets weekly change frequency
- Includes all public pages
- Updates last modified date on build

**Best Practices:**
- Sitemap is automatically submitted to search engines via `robots.txt`
- All pages are included except those in preview mode or API endpoints
- The sitemap regenerates on every build

### 2. Robots.txt

**Location:** `/public/robots.txt`

The robots.txt file controls search engine crawler access and directs them to the sitemap.

**Configuration:**
- Allows all user agents to crawl the site
- Disallows crawling of preview and API routes
- Points to the sitemap location

### 3. Meta Tags

**Component:** `src/components/SEO.astro`

The SEO component provides comprehensive meta tag coverage:

#### Basic Meta Tags
- `<title>` - Page title (optimized for search)
- `<meta name="description">` - Page description (150-160 characters recommended)
- `<link rel="canonical">` - Canonical URL to prevent duplicate content issues
- `<meta name="robots">` - Controls indexing and following
- `<meta name="author">` - Content author
- `<meta name="keywords">` - Page keywords (optional, less important for modern SEO)

#### Open Graph (Facebook, LinkedIn, etc.)
- `og:type` - Content type (website or article)
- `og:url` - Canonical URL
- `og:title` - Title for social sharing
- `og:description` - Description for social sharing
- `og:image` - Social share image (1200x630px recommended)
- `og:image:width` / `og:image:height` - Image dimensions
- `og:site_name` - Site name
- Article-specific tags for blog posts

#### Twitter Card
- `twitter:card` - Card type (summary or summary_large_image)
- `twitter:title` - Title for Twitter
- `twitter:description` - Description for Twitter
- `twitter:image` - Image for Twitter card
- `twitter:site` / `twitter:creator` - Twitter handles

### 4. Structured Data (JSON-LD)

**Implemented in:** `src/components/SEO.astro`

Structured data helps search engines understand your content better:

- **WebSite Schema** - For general pages
- **Article Schema** - For blog posts
  - Includes headline, description, image
  - Includes publication and modification dates
  - Includes author information

### 5. Layout Optimizations

**Component:** `src/layouts/MarketingLayout.astro`

#### HTML Attributes
- `lang="en"` - Specifies content language
- `dir="ltr"` - Text direction (left-to-right)

#### Performance Optimizations
- `preconnect` for external domains
- `dns-prefetch` for faster DNS resolution
- Optimized viewport meta tag
- IE compatibility meta tag

#### Favicons & Web App Manifest
- Multiple favicon formats for cross-browser compatibility
- Apple touch icon for iOS devices
- Web app manifest for PWA support

## Usage

### Using the SEO Component

Import and use the SEO component in any page:

```astro
---
import SEO from '../components/SEO.astro'
---

<MarketingLayout>
  <Fragment slot="head">
    <SEO
      title="Your Page Title"
      description="Your page description (150-160 characters)"
      image="/path/to/image.jpg"
      type="website"
      keywords={['keyword1', 'keyword2']}
    />
  </Fragment>

  <!-- Your content -->
</MarketingLayout>
```

### Blog Post SEO

For blog posts, use the `article` type:

```astro
<SEO
  title={post.title}
  description={post.description}
  image={post.image}
  type="article"
  publishedTime={post.publishedAt}
  modifiedTime={post.updatedAt}
  author={post.author}
/>
```

### Preventing Indexing

For pages that shouldn't be indexed (e.g., admin pages, staging):

```astro
<SEO
  title="Admin Dashboard"
  description="Internal admin area"
  noindex={true}
  nofollow={true}
/>
```

## SEO Best Practices

### Content Guidelines

1. **Title Tags**
   - Keep under 60 characters
   - Include target keywords near the beginning
   - Make them unique for each page
   - Use brand name consistently

2. **Meta Descriptions**
   - Keep between 150-160 characters
   - Include a clear call-to-action
   - Make them unique and compelling
   - Include target keywords naturally

3. **Headings**
   - Use a single H1 per page
   - Use H2-H6 to create content hierarchy
   - Include keywords in headings naturally

4. **Images**
   - Always include descriptive alt text
   - Optimize image file sizes
   - Use appropriate dimensions (1200x630px for social sharing)
   - Use modern formats (WebP, AVIF) where supported

5. **URLs**
   - Keep URLs short and descriptive
   - Use hyphens to separate words
   - Include target keywords
   - Avoid special characters

### Technical SEO

1. **Performance**
   - Optimize Core Web Vitals (LCP, FID, CLS)
   - Minimize JavaScript bundle size
   - Use image optimization
   - Enable compression
   - Leverage browser caching

2. **Mobile Optimization**
   - Ensure responsive design
   - Test on real mobile devices
   - Optimize for touch interactions
   - Ensure readable font sizes

3. **Internal Linking**
   - Create a clear site hierarchy
   - Use descriptive anchor text
   - Link to related content
   - Ensure all pages are reachable

4. **External Links**
   - Use `rel="nofollow"` for untrusted content
   - Use `rel="noopener"` for security
   - Open external links in new tabs when appropriate

## Monitoring and Maintenance

### Regular SEO Tasks

1. **Monitor Search Console**
   - Check for crawl errors
   - Monitor search performance
   - Submit sitemaps
   - Fix mobile usability issues

2. **Update Content**
   - Keep content fresh and relevant
   - Update old blog posts
   - Fix broken links
   - Add new internal links

3. **Performance Monitoring**
   - Run Lighthouse audits regularly
   - Monitor Core Web Vitals
   - Check page load times
   - Optimize as needed

4. **Competitive Analysis**
   - Monitor competitor rankings
   - Analyze their content strategy
   - Identify keyword opportunities
   - Stay updated on SEO trends

## Tools and Resources

### SEO Analysis Tools
- Google Search Console
- Google Analytics
- Lighthouse (Chrome DevTools)
- Screaming Frog SEO Spider
- Ahrefs / SEMrush / Moz

### Testing Tools
- Google's Rich Results Test
- Facebook Sharing Debugger
- Twitter Card Validator
- Schema.org Validator

### Performance Tools
- PageSpeed Insights
- WebPageTest
- GTmetrix

## Troubleshooting

### Common Issues

1. **Pages not appearing in search results**
   - Check robots.txt isn't blocking pages
   - Verify sitemap is accessible
   - Check for noindex tags
   - Submit sitemap to Google Search Console

2. **Duplicate content issues**
   - Ensure canonical tags are correct
   - Use 301 redirects for moved content
   - Set up proper URL structure

3. **Poor social sharing previews**
   - Validate Open Graph tags
   - Ensure images are accessible
   - Check image dimensions (1200x630px)
   - Clear Facebook/Twitter cache

## Additional Resources

- [Astro SEO Documentation](https://docs.astro.build/en/guides/seo/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

## Checklist

Use this checklist when adding new pages:

- [ ] Add unique, descriptive title (under 60 characters)
- [ ] Add compelling meta description (150-160 characters)
- [ ] Include relevant keywords naturally
- [ ] Add Open Graph tags
- [ ] Add Twitter Card tags
- [ ] Add appropriate structured data
- [ ] Optimize images with alt text
- [ ] Set canonical URL
- [ ] Use proper heading hierarchy
- [ ] Add internal links to related content
- [ ] Test mobile responsiveness
- [ ] Run Lighthouse audit
- [ ] Validate with SEO tools
