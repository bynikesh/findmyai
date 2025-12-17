/**
 * SEO Utilities for FindMyAI
 * 
 * This module provides helper functions for:
 * - Injecting dynamic SEO meta tags into HTML
 * - Building JSON-LD structured data schemas
 * - Supporting server-side rendering of SEO content
 * 
 * @module lib/seo
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * SEO data structure for meta tag injection
 */
interface SeoData {
    /** The page title for <title> and og:title tags */
    title: string;
    /** The meta description for description and og:description tags */
    description: string;
    /** The canonical URL for the page */
    url: string;
    /** Optional Open Graph/Twitter image URL */
    image?: string;
    /** Optional Open Graph type (e.g., 'article', 'website') */
    type?: string;
    /** Optional JSON-LD structured data object */
    jsonLd?: Record<string, unknown>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Generates the default Open Graph image URL
 * @param baseUrl - The base URL of the website
 * @returns Full URL to the default OG image
 */
const defaultImage = (baseUrl: string) => `${baseUrl}/og-image.png`;

// ============================================================================
// HTML TEMPLATE FUNCTIONS
// ============================================================================

/**
 * Reads the index.html template from the built frontend directory.
 * This function is used for server-side SEO injection.
 * 
 * @returns The contents of the index.html file as a string
 * @throws Error if the file cannot be read
 * 
 * @example
 * const html = getIndexHtml();
 * const seoHtml = injectSeoMeta(html, seoData);
 */
export function getIndexHtml(): string {
    const indexPath = path.join(__dirname, '../../../frontend/dist/index.html');
    return fs.readFileSync(indexPath, 'utf-8');
}

/**
 * Injects SEO meta tag values into HTML by replacing placeholder comments.
 * 
 * The HTML should contain placeholder comments in the format:
 * `<!--TAG_NAME-->default value<!--/TAG_NAME-->`
 * 
 * @param html - The HTML string containing placeholder comments
 * @param seo - The SEO data to inject
 * @returns The HTML with SEO values injected
 * 
 * @example
 * const seoData = {
 *   title: 'My Page',
 *   description: 'Page description',
 *   url: 'https://example.com/page'
 * };
 * const result = injectSeoMeta(html, seoData);
 */
export function injectSeoMeta(html: string, seo: SeoData): string {
    /**
     * Replaces a specific placeholder tag with the given value
     * @param tag - The placeholder tag name (without <!-- and -->)
     * @param value - The value to replace the placeholder with
     */
    const replacePlaceholder = (tag: string, value: string): string => {
        const regex = new RegExp(`<!--${tag}-->.*?<!--/${tag}-->`, 'gs');
        return html.replace(regex, value);
    };

    // Extract base URL from the full URL for image fallbacks
    const baseUrl = seo.url.split('/').slice(0, 3).join('/');

    // Replace all SEO placeholders
    html = replacePlaceholder('SEO_TITLE', seo.title);
    html = replacePlaceholder('SEO_DESC', seo.description);
    html = replacePlaceholder('SEO_URL', seo.url);
    html = replacePlaceholder('SEO_OG_TITLE', seo.title);
    html = replacePlaceholder('SEO_OG_DESC', seo.description);
    html = replacePlaceholder('SEO_IMAGE', seo.image || defaultImage(baseUrl));
    html = replacePlaceholder('SEO_TWITTER_URL', seo.url);
    html = replacePlaceholder('SEO_TWITTER_TITLE', seo.title);
    html = replacePlaceholder('SEO_TWITTER_DESC', seo.description);
    html = replacePlaceholder('SEO_TWITTER_IMAGE', seo.image || defaultImage(baseUrl));
    html = replacePlaceholder('SEO_CANONICAL', seo.url);

    // Inject JSON-LD schema if provided
    if (seo.jsonLd) {
        const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(seo.jsonLd)}</script>`;
        html = replacePlaceholder('JSON_LD_SCHEMA', jsonLdScript);
    }

    return html;
}

// ============================================================================
// JSON-LD SCHEMA BUILDERS
// ============================================================================

/**
 * Builds JSON-LD Organization schema for the homepage.
 * Used to provide search engines with structured data about FindMyAI.
 * 
 * @see https://schema.org/Organization
 * 
 * @param baseUrl - The base URL of the website
 * @returns Organization schema object
 * 
 * @example
 * const schema = buildOrganizationSchema('https://findmyai.xyz');
 * // Use in <script type="application/ld+json">
 */
export function buildOrganizationSchema(baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "FindMyAI",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.png`,
        "description": "The world's most comprehensive AI tools directory. Discover 3,000+ AI tools for any task, job, or project.",
        "sameAs": [
            "https://twitter.com/findmyai",
            "https://linkedin.com/company/findmyai"
        ]
    };
}

/**
 * Builds JSON-LD WebSite schema with SearchAction.
 * Enables Google's sitelinks search box feature.
 * 
 * @see https://schema.org/WebSite
 * @see https://developers.google.com/search/docs/appearance/sitelinks-searchbox
 * 
 * @param baseUrl - The base URL of the website
 * @returns WebSite schema object with search action
 * 
 * @example
 * const schema = buildWebsiteSchema('https://findmyai.xyz');
 */
export function buildWebsiteSchema(baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "FindMyAI",
        "url": baseUrl,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/tools?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };
}

/**
 * Builds JSON-LD BlogPosting schema for blog articles.
 * Helps search engines understand blog post content and structure.
 * 
 * @see https://schema.org/BlogPosting
 * 
 * @param post - The blog post data
 * @param post.title - The title of the blog post
 * @param post.excerpt - Optional excerpt/summary of the post
 * @param post.content - Optional full content (not used in schema, but included for type safety)
 * @param post.author - Optional author name
 * @param post.publishedAt - Optional publication date
 * @param post.cover_image - Optional cover image URL
 * @param post.slug - The URL slug for the post
 * @param baseUrl - The base URL of the website
 * @returns BlogPosting schema object
 * 
 * @example
 * const schema = buildBlogPostSchema({
 *   title: 'Top AI Tools for 2024',
 *   excerpt: 'A comprehensive guide...',
 *   slug: 'top-ai-tools-2024'
 * }, 'https://findmyai.xyz');
 */
export function buildBlogPostSchema(post: {
    title: string;
    excerpt?: string | null;
    content?: string;
    author?: string | null;
    publishedAt?: Date | null;
    cover_image?: string | null;
    slug: string;
}, baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt || '',
        "image": post.cover_image || `${baseUrl}/og-image.png`,
        "author": {
            "@type": "Person",
            "name": post.author || "FindMyAI Team"
        },
        "publisher": {
            "@type": "Organization",
            "name": "FindMyAI",
            "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/logo.png`
            }
        },
        "datePublished": post.publishedAt?.toISOString() || new Date().toISOString(),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${baseUrl}/blog/${post.slug}`
        }
    };
}

/**
 * Builds JSON-LD ItemList schema for list pages.
 * Used for displaying ranked/ordered lists of items (e.g., top tools, categories).
 * 
 * @see https://schema.org/ItemList
 * 
 * @param items - Array of items with name and url properties
 * @returns ItemList schema object (limited to first 10 items)
 * 
 * @example
 * const schema = buildItemListSchema([
 *   { name: 'ChatGPT', url: 'https://findmyai.xyz/tools/chatgpt' },
 *   { name: 'Midjourney', url: 'https://findmyai.xyz/tools/midjourney' }
 * ]);
 */
export function buildItemListSchema(items: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": items.slice(0, 10).map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "url": item.url
        }))
    };
}

/**
 * Builds JSON-LD BreadcrumbList schema for navigation paths.
 * Helps search engines understand site structure and display breadcrumbs in search results.
 * 
 * @see https://schema.org/BreadcrumbList
 * @see https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 * 
 * @param breadcrumbs - Array of breadcrumb items with name and url
 * @returns BreadcrumbList schema object
 * 
 * @example
 * const schema = buildBreadcrumbSchema([
 *   { name: 'Home', url: 'https://findmyai.xyz' },
 *   { name: 'Tools', url: 'https://findmyai.xyz/tools' },
 *   { name: 'ChatGPT', url: 'https://findmyai.xyz/tools/chatgpt' }
 * ]);
 */
export function buildBreadcrumbSchema(breadcrumbs: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.url
        }))
    };
}
