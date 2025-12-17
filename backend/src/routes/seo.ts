/**
 * SEO Routes for FindMyAI
 * 
 * This module provides essential SEO files that search engines and 
 * RSS readers use to discover and index content:
 * 
 * - `/sitemap.xml` - XML sitemap with all public URLs
 * - `/robots.txt` - Crawler instructions and sitemap location
 * - `/feed.xml` - RSS feed for blog posts
 * 
 * These routes are registered without a prefix to serve from the root URL.
 * 
 * @module routes/seo
 * @see https://www.sitemaps.org/protocol.html
 * @see https://developers.google.com/search/docs/crawling-indexing/robots/intro
 */

import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

// ============================================================================
// TYPES
// ============================================================================

/** Tool data for sitemap generation */
interface ToolSitemapData {
  slug: string;
  updatedAt: Date;
}

/** Category data for sitemap generation */
interface CategorySitemapData {
  slug: string;
}

/** Job data for sitemap generation */
interface JobSitemapData {
  slug: string;
}

/** Task data for sitemap generation */
interface TaskSitemapData {
  slug: string;
}

/** Blog post data for sitemap and RSS generation */
interface BlogPostSitemapData {
  slug: string;
  updatedAt: Date;
  publishedAt: Date | null;
}

/** Page data for sitemap generation */
interface PageSitemapData {
  slug: string;
  updatedAt: Date;
}

/** Blog post data for RSS feed generation */
interface BlogPostRssData {
  title: string;
  slug: string;
  excerpt: string | null;
  author: string | null;
  publishedAt: Date | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats a Date object to ISO date string (YYYY-MM-DD).
 * Returns today's date if the input is null.
 * 
 * @param date - The date to format, or null
 * @returns ISO date string in YYYY-MM-DD format
 */
function formatDate(date: Date | null): string {
  if (!date) return new Date().toISOString().split('T')[0];
  return date.toISOString().split('T')[0];
}

/**
 * Generates a single sitemap URL entry
 * 
 * @param loc - The full URL of the page
 * @param options - Optional configuration for the URL entry
 * @returns XML string for the URL entry
 */
function generateUrlEntry(
  loc: string,
  options: {
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  } = {}
): string {
  const { lastmod, changefreq, priority } = options;

  let entry = `  <url>\n    <loc>${loc}</loc>\n`;
  if (lastmod) entry += `    <lastmod>${lastmod}</lastmod>\n`;
  if (changefreq) entry += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority !== undefined) entry += `    <priority>${priority.toFixed(1)}</priority>\n`;
  entry += `  </url>\n`;

  return entry;
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * Registers all SEO-related routes on the Fastify instance.
 * 
 * Routes registered:
 * - `GET /sitemap.xml` - Dynamic XML sitemap
 * - `GET /robots.txt` - Robots directive file
 * - `GET /feed.xml` - RSS 2.0 blog feed
 * 
 * @param fastify - The Fastify instance to register routes on
 */
export default async function seoRoutes(fastify: FastifyInstance) {
  // Get base URL from environment or default to production URL
  const baseUrl = process.env.BASE_URL || 'https://findmyai.xyz';

  // -------------------------------------------------------------------------
  // SITEMAP.XML - Dynamic sitemap for search engine crawlers
  // -------------------------------------------------------------------------
  /**
   * GET /sitemap.xml
   * 
   * Generates a dynamic XML sitemap containing all public URLs:
   * - Static pages (home, tools list, categories, etc.)
   * - Individual tool pages
   * - Category pages
   * - Job and task pages
   * - Blog posts
   * - Dynamic static pages from CMS
   * 
   * The sitemap is cached for 1 hour to reduce database load.
   * 
   * @see https://www.sitemaps.org/protocol.html
   */
  fastify.get('/sitemap.xml', async (request, reply) => {
    try {
      // Fetch all published content in parallel for efficiency
      const [tools, categories, jobs, tasks, blogPosts, pages] = await Promise.all([
        // Active tools with their update timestamps
        prisma.tool.findMany({
          where: { still_active: true },
          select: { slug: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
        }) as Promise<ToolSitemapData[]>,

        // All categories
        prisma.category.findMany({
          select: { slug: true },
          orderBy: { name: 'asc' },
        }) as Promise<CategorySitemapData[]>,

        // All job roles
        prisma.job.findMany({
          select: { slug: true },
          orderBy: { name: 'asc' },
        }) as Promise<JobSitemapData[]>,

        // All tasks
        prisma.task.findMany({
          select: { slug: true },
          orderBy: { name: 'asc' },
        }) as Promise<TaskSitemapData[]>,

        // Published blog posts
        prisma.blogPost.findMany({
          where: { published: true },
          select: { slug: true, updatedAt: true, publishedAt: true },
          orderBy: { publishedAt: 'desc' },
        }) as Promise<BlogPostSitemapData[]>,

        // Published static pages
        prisma.page.findMany({
          where: { published: true },
          select: { slug: true, updatedAt: true },
          orderBy: { title: 'asc' },
        }) as Promise<PageSitemapData[]>,
      ]);

      // Build XML sitemap
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- ========== Static Pages ========== -->
`;
      // Homepage - highest priority, updated daily
      sitemap += generateUrlEntry(`${baseUrl}/`, { changefreq: 'daily', priority: 1.0 });

      // Main listing pages
      sitemap += generateUrlEntry(`${baseUrl}/tools`, { changefreq: 'daily', priority: 0.9 });
      sitemap += generateUrlEntry(`${baseUrl}/categories`, { changefreq: 'weekly', priority: 0.8 });
      sitemap += generateUrlEntry(`${baseUrl}/jobs`, { changefreq: 'weekly', priority: 0.8 });
      sitemap += generateUrlEntry(`${baseUrl}/tasks`, { changefreq: 'weekly', priority: 0.8 });
      sitemap += generateUrlEntry(`${baseUrl}/blog`, { changefreq: 'daily', priority: 0.8 });

      // Utility pages
      sitemap += generateUrlEntry(`${baseUrl}/submit`, { changefreq: 'monthly', priority: 0.6 });
      sitemap += generateUrlEntry(`${baseUrl}/quiz`, { changefreq: 'monthly', priority: 0.6 });

      // Individual tool pages
      sitemap += `  <!-- ========== Tool Pages (${tools.length} tools) ========== -->\n`;
      for (const tool of tools) {
        sitemap += generateUrlEntry(
          `${baseUrl}/tools/${tool.slug}`,
          { lastmod: formatDate(tool.updatedAt), changefreq: 'weekly', priority: 0.8 }
        );
      }

      // Category pages
      sitemap += `  <!-- ========== Category Pages (${categories.length} categories) ========== -->\n`;
      for (const category of categories) {
        sitemap += generateUrlEntry(
          `${baseUrl}/categories/${category.slug}`,
          { changefreq: 'weekly', priority: 0.7 }
        );
      }

      // Job pages
      sitemap += `  <!-- ========== Job Pages (${jobs.length} jobs) ========== -->\n`;
      for (const job of jobs) {
        sitemap += generateUrlEntry(
          `${baseUrl}/jobs/${job.slug}`,
          { changefreq: 'weekly', priority: 0.7 }
        );
      }

      // Task pages
      sitemap += `  <!-- ========== Task Pages (${tasks.length} tasks) ========== -->\n`;
      for (const task of tasks) {
        sitemap += generateUrlEntry(
          `${baseUrl}/tasks/${task.slug}`,
          { changefreq: 'weekly', priority: 0.7 }
        );
      }

      // Blog posts
      sitemap += `  <!-- ========== Blog Posts (${blogPosts.length} posts) ========== -->\n`;
      for (const post of blogPosts) {
        sitemap += generateUrlEntry(
          `${baseUrl}/blog/${post.slug}`,
          { lastmod: formatDate(post.updatedAt || post.publishedAt), changefreq: 'monthly', priority: 0.7 }
        );
      }

      // Static CMS pages
      sitemap += `  <!-- ========== Static Pages (${pages.length} pages) ========== -->\n`;
      for (const page of pages) {
        sitemap += generateUrlEntry(
          `${baseUrl}/${page.slug}`,
          { lastmod: formatDate(page.updatedAt), changefreq: 'monthly', priority: 0.5 }
        );
      }

      sitemap += `</urlset>`;

      // Set response headers and send
      reply.header('Content-Type', 'application/xml');
      reply.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      return reply.send(sitemap);

    } catch (error) {
      console.error('Error generating sitemap:', error);
      return reply.status(500).send('Error generating sitemap');
    }
  });

  // -------------------------------------------------------------------------
  // ROBOTS.TXT - Crawler instructions
  // -------------------------------------------------------------------------
  /**
   * GET /robots.txt
   * 
   * Returns the robots.txt file that instructs search engine crawlers:
   * - Which pages to crawl (Allow)
   * - Which pages to ignore (Disallow)
   * - Where to find the sitemap
   * - Recommended crawl delay
   * 
   * @see https://developers.google.com/search/docs/crawling-indexing/robots/intro
   */
  fastify.get('/robots.txt', async (request, reply) => {
    const robotsTxt = `# FindMyAI Robots.txt
# Learn more at https://www.robotstxt.org/

User-agent: *
Allow: /

# Disallow admin and authentication routes
Disallow: /admin
Disallow: /admin/*
Disallow: /login
Disallow: /api/*

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for polite crawling (seconds between requests)
Crawl-delay: 1
`;

    reply.header('Content-Type', 'text/plain');
    reply.header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    return reply.send(robotsTxt);
  });

  // -------------------------------------------------------------------------
  // RSS FEED - Blog syndication
  // -------------------------------------------------------------------------
  /**
   * GET /feed.xml
   * 
   * Generates an RSS 2.0 feed of the latest blog posts.
   * Limited to the 20 most recent published posts.
   * 
   * RSS feeds allow users to subscribe to blog updates using
   * feed readers like Feedly, Inoreader, etc.
   * 
   * @see https://www.rssboard.org/rss-specification
   */
  fastify.get('/feed.xml', async (request, reply) => {
    try {
      // Fetch the 20 most recent published blog posts
      const posts: BlogPostRssData[] = await prisma.blogPost.findMany({
        where: { published: true },
        select: {
          title: true,
          slug: true,
          excerpt: true,
          author: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      });

      // Build RSS 2.0 feed
      let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <!-- Channel Information -->
    <title>FindMyAI Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Discover the latest AI tools, tips, and industry insights from FindMyAI</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    
    <!-- Blog Posts -->
`;

      // Add each blog post as an RSS item
      for (const post of posts) {
        // Escape special XML characters in content
        const escapedTitle = post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const escapedExcerpt = (post.excerpt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        rss += `    <item>
      <title><![CDATA[${escapedTitle}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${escapedExcerpt}]]></description>
      <author>${post.author || 'FindMyAI Team'}</author>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date().toUTCString()}</pubDate>
    </item>
`;
      }

      rss += `  </channel>
</rss>`;

      // Set response headers and send
      reply.header('Content-Type', 'application/rss+xml');
      reply.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      return reply.send(rss);

    } catch (error) {
      console.error('Error generating RSS feed:', error);
      return reply.status(500).send('Error generating RSS feed');
    }
  });
}
