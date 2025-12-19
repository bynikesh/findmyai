/**
 * SEO & AIO (AI Optimization) Utilities for FindMyAI
 * 
 * This module provides comprehensive helper functions for:
 * - Injecting dynamic SEO meta tags into HTML
 * - Building JSON-LD structured data schemas for search engines
 * - AI Optimization (AIO) for AI-powered search engines (ChatGPT, Perplexity, Gemini)
 * - Supporting server-side rendering of SEO content
 * 
 * Key SEO strategies implemented:
 * - Rich snippets via JSON-LD structured data
 * - Open Graph and Twitter Card meta tags
 * - Canonical URLs for duplicate content prevention
 * - FAQ and HowTo schemas for featured snippets
 * - SoftwareApplication schema for tool pages
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
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
    /** Optional keywords for meta keywords tag */
    keywords?: string[];
    /** Optional author name */
    author?: string;
    /** Optional published date for articles */
    publishedTime?: string;
    /** Optional modified date */
    modifiedTime?: string;
}

/**
 * Tool data for schema generation
 */
interface ToolSchemaData {
    name: string;
    slug: string;
    description?: string | null;
    short_description?: string | null;
    logo_url?: string | null;
    website?: string | null;
    pricing_type?: string[] | null;
    pricing?: string | null;
    price_range?: string | null;
    key_features?: string[] | null;
    pros?: string[] | null;
    cons?: string[] | null;
    use_cases?: string[] | null;
    categories?: { name: string; slug: string }[];
    reviews?: { rating: number }[];
}

/**
 * FAQ item structure for FAQ schema
 */
interface FAQItem {
    question: string;
    answer: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Site configuration */
const SITE_CONFIG = {
    name: 'FindMyAI',
    tagline: 'Discover the Best AI Tools',
    description: "The world's most comprehensive AI tools directory. Discover 3,000+ AI tools for any task, job, or project.",
    twitter: '@findmyai',
    locale: 'en_US',
    logoPath: '/logo.png',
    ogImagePath: '/og-image.png',
};

/**
 * Generates the default Open Graph image URL
 * @param baseUrl - The base URL of the website
 * @returns Full URL to the default OG image
 */
const defaultImage = (baseUrl: string) => `${baseUrl}${SITE_CONFIG.ogImagePath}`;

// ============================================================================
// HTML TEMPLATE FUNCTIONS
// ============================================================================

/**
 * Reads the index.html template from the built frontend directory.
 * This function is used for server-side SEO injection.
 * 
 * @returns The contents of the index.html file as a string
 * @throws Error if the file cannot be read
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
 */
export function injectSeoMeta(html: string, seo: SeoData): string {
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

    // Inject JSON-LD schema if provided (can be single object or array)
    if (seo.jsonLd) {
        const schemas = Array.isArray(seo.jsonLd) ? seo.jsonLd : [seo.jsonLd];
        const jsonLdScript = schemas
            .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
            .join('\n');
        html = replacePlaceholder('JSON_LD_SCHEMA', jsonLdScript);
    }

    return html;
}

// ============================================================================
// JSON-LD SCHEMA BUILDERS - ORGANIZATION & WEBSITE
// ============================================================================

/**
 * Builds JSON-LD Organization schema for the homepage.
 * Essential for knowledge graph and brand recognition.
 * 
 * @see https://schema.org/Organization
 */
export function buildOrganizationSchema(baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": SITE_CONFIG.name,
        "url": baseUrl,
        "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}${SITE_CONFIG.logoPath}`,
            "width": 512,
            "height": 512
        },
        "description": SITE_CONFIG.description,
        "foundingDate": "2024",
        "sameAs": [
            "https://twitter.com/findmyai",
            "https://linkedin.com/company/findmyai"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": "hello@findmyai.xyz"
        }
    };
}

/**
 * Builds JSON-LD WebSite schema with SearchAction.
 * Enables Google's sitelinks search box feature.
 * 
 * @see https://schema.org/WebSite
 */
export function buildWebsiteSchema(baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "name": SITE_CONFIG.name,
        "alternateName": "FindMyAI - AI Tools Directory",
        "url": baseUrl,
        "description": SITE_CONFIG.description,
        "publisher": {
            "@id": `${baseUrl}/#organization`
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/tools?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        },
        "inLanguage": "en-US"
    };
}

// ============================================================================
// JSON-LD SCHEMA BUILDERS - SOFTWARE APPLICATION (AI TOOLS)
// ============================================================================

/**
 * Builds comprehensive JSON-LD SoftwareApplication schema for AI tools.
 * This is critical for rich snippets in search results.
 * 
 * @see https://schema.org/SoftwareApplication
 */
export function buildToolSchema(tool: ToolSchemaData, baseUrl: string) {
    const reviews = tool.reviews || [];
    const ratingCount = reviews.length;
    const avgRating = ratingCount > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount)
        : 4.5;

    // Determine price information
    let priceValue = '0';
    let priceCurrency = 'USD';
    const pricingTypes = tool.pricing_type || [];

    if (pricingTypes.includes('Paid') || pricingTypes.includes('Freemium')) {
        const priceMatch = tool.pricing?.match(/\$?(\d+(?:\.\d{2})?)/);
        priceValue = priceMatch ? priceMatch[1] : '9.99';
    }

    const schema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${baseUrl}/tools/${tool.slug}`,
        "name": tool.name,
        "description": tool.short_description || tool.description?.substring(0, 300),
        "url": `${baseUrl}/tools/${tool.slug}`,
        "applicationCategory": tool.categories?.[0]?.name || "BusinessApplication",
        "operatingSystem": "Web, iOS, Android, Windows, macOS",
        "softwareVersion": "Latest",
        "offers": {
            "@type": "Offer",
            "price": priceValue,
            "priceCurrency": priceCurrency,
            "availability": "https://schema.org/InStock",
            "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        "publisher": {
            "@id": `${baseUrl}/#organization`
        }
    };

    // Add logo/image if available
    if (tool.logo_url) {
        schema.image = tool.logo_url;
        schema.thumbnailUrl = tool.logo_url;
    }

    // Add aggregate rating if there are reviews
    if (ratingCount > 0) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": avgRating.toFixed(1),
            "ratingCount": ratingCount,
            "bestRating": "5",
            "worstRating": "1"
        };
    }

    // Add features as application features
    if (tool.key_features && tool.key_features.length > 0) {
        schema.featureList = tool.key_features.join(', ');
    }

    // Add official website if available
    if (tool.website) {
        schema.sameAs = tool.website;
    }

    return schema;
}

/**
 * Builds FAQ schema for a tool's common questions.
 * Helps achieve FAQ rich snippets in search results.
 * 
 * @see https://schema.org/FAQPage
 */
export function buildToolFAQSchema(tool: ToolSchemaData, baseUrl: string): Record<string, unknown> | null {
    const faqs: FAQItem[] = [];

    // Generate FAQ based on tool data
    faqs.push({
        question: `What is ${tool.name}?`,
        answer: tool.short_description || tool.description?.substring(0, 200) || `${tool.name} is an AI-powered tool available on FindMyAI.`
    });

    if (tool.pricing_type && tool.pricing_type.length > 0) {
        const pricingText = tool.pricing_type.includes('Free')
            ? `${tool.name} offers a free tier.`
            : tool.pricing_type.includes('Freemium')
                ? `${tool.name} offers a freemium model with free and paid options.`
                : `${tool.name} is a paid tool. ${tool.pricing || ''}`;
        faqs.push({
            question: `Is ${tool.name} free to use?`,
            answer: pricingText
        });
    }

    if (tool.key_features && tool.key_features.length > 0) {
        faqs.push({
            question: `What are the main features of ${tool.name}?`,
            answer: `Key features of ${tool.name} include: ${tool.key_features.slice(0, 5).join(', ')}.`
        });
    }

    if (tool.use_cases && tool.use_cases.length > 0) {
        faqs.push({
            question: `What can I use ${tool.name} for?`,
            answer: `${tool.name} is great for: ${tool.use_cases.slice(0, 5).join(', ')}.`
        });
    }

    if (tool.pros && tool.pros.length > 0) {
        faqs.push({
            question: `What are the pros of ${tool.name}?`,
            answer: `The main advantages of ${tool.name} are: ${tool.pros.slice(0, 4).join(', ')}.`
        });
    }

    if (faqs.length < 2) return null;

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}

/**
 * Builds HowTo schema for tool usage instructions.
 * Targets HowTo rich snippets in search results.
 * 
 * @see https://schema.org/HowTo
 */
export function buildToolHowToSchema(tool: ToolSchemaData, baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": `How to Use ${tool.name}`,
        "description": `Step-by-step guide to getting started with ${tool.name}`,
        "image": tool.logo_url || `${baseUrl}/og-image.png`,
        "totalTime": "PT5M",
        "supply": [],
        "tool": [],
        "step": [
            {
                "@type": "HowToStep",
                "name": `Visit ${tool.name}`,
                "text": `Go to the ${tool.name} website or visit the tool page on FindMyAI.`,
                "url": `${baseUrl}/tools/${tool.slug}`
            },
            {
                "@type": "HowToStep",
                "name": "Create an Account",
                "text": `Sign up for a ${tool.pricing_type?.includes('Free') ? 'free' : ''} account to get started.`
            },
            {
                "@type": "HowToStep",
                "name": "Start Using the Tool",
                "text": tool.use_cases?.[0]
                    ? `Use ${tool.name} for ${tool.use_cases[0]}.`
                    : `Explore the features of ${tool.name} and start creating.`
            }
        ]
    };
}

// ============================================================================
// JSON-LD SCHEMA BUILDERS - BLOG & ARTICLES
// ============================================================================

/**
 * Builds comprehensive JSON-LD Article schema for blog posts.
 * Optimized for Google News and article rich snippets.
 * 
 * @see https://schema.org/BlogPosting
 */
export function buildBlogPostSchema(post: {
    title: string;
    excerpt?: string | null;
    content?: string;
    author?: string | null;
    publishedAt?: Date | null;
    updatedAt?: Date | null;
    cover_image?: string | null;
    slug: string;
    read_time?: number | null;
}, baseUrl: string) {
    const wordCount = post.content ? post.content.split(/\s+/).length : 0;

    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${baseUrl}/blog/${post.slug}`,
        "headline": post.title,
        "description": post.excerpt || '',
        "image": {
            "@type": "ImageObject",
            "url": post.cover_image || `${baseUrl}/og-image.png`,
            "width": 1200,
            "height": 630
        },
        "author": {
            "@type": "Person",
            "name": post.author || "FindMyAI Team",
            "url": baseUrl
        },
        "publisher": {
            "@id": `${baseUrl}/#organization`
        },
        "datePublished": post.publishedAt?.toISOString() || new Date().toISOString(),
        "dateModified": post.updatedAt?.toISOString() || post.publishedAt?.toISOString() || new Date().toISOString(),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${baseUrl}/blog/${post.slug}`
        },
        "wordCount": wordCount,
        "timeRequired": `PT${post.read_time || Math.ceil(wordCount / 200)}M`,
        "inLanguage": "en-US",
        "isAccessibleForFree": true
    };
}

// ============================================================================
// JSON-LD SCHEMA BUILDERS - NAVIGATION & LISTS
// ============================================================================

/**
 * Builds JSON-LD ItemList schema for list pages.
 * Used for carousels and list rich snippets.
 * 
 * @see https://schema.org/ItemList
 */
export function buildItemListSchema(items: { name: string; url: string; image?: string; description?: string }[], listName?: string) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": listName || "AI Tools List",
        "numberOfItems": items.length,
        "itemListElement": items.slice(0, 10).map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "url": item.url,
            ...(item.image && { "image": item.image }),
            ...(item.description && { "description": item.description })
        }))
    };
}

/**
 * Builds JSON-LD BreadcrumbList schema for navigation paths.
 * 
 * @see https://schema.org/BreadcrumbList
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

// ============================================================================
// JSON-LD SCHEMA BUILDERS - COLLECTION PAGES
// ============================================================================

/**
 * Builds schema for collection pages (Categories, Jobs, Tasks)
 * 
 * @see https://schema.org/CollectionPage
 */
export function buildCollectionPageSchema(
    type: 'Category' | 'Job' | 'Task',
    item: { name: string; slug: string; description?: string | null; toolCount?: number },
    baseUrl: string
) {
    const pathMap = {
        Category: 'categories',
        Job: 'jobs',
        Task: 'tasks'
    };

    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${baseUrl}/${pathMap[type]}/${item.slug}`,
        "name": `Best AI Tools for ${item.name}`,
        "description": item.description || `Discover the best AI tools for ${item.name}. Compare ${item.toolCount || 'multiple'} curated AI solutions.`,
        "url": `${baseUrl}/${pathMap[type]}/${item.slug}`,
        "isPartOf": {
            "@id": `${baseUrl}/#website`
        },
        "about": {
            "@type": "Thing",
            "name": item.name
        },
        "numberOfItems": item.toolCount || 0
    };
}

/**
 * Builds FAQ schema for category/job/task pages
 */
export function buildCollectionFAQSchema(
    type: 'Category' | 'Job' | 'Task',
    item: { name: string; description?: string | null; toolCount?: number },
    topTools?: string[]
) {
    const typeLabel = type.toLowerCase();
    const faqs: FAQItem[] = [
        {
            question: `What are the best AI tools for ${item.name}?`,
            answer: topTools && topTools.length > 0
                ? `Top AI tools for ${item.name} include: ${topTools.slice(0, 5).join(', ')}. View all ${item.toolCount || ''} tools on FindMyAI.`
                : `FindMyAI lists ${item.toolCount || 'multiple'} AI tools for ${item.name}. Browse our curated collection to find the best fit.`
        },
        {
            question: `How do I choose an AI tool for ${item.name}?`,
            answer: `Consider your specific needs, budget, and required features. Compare pricing, read reviews, and try free trials. FindMyAI helps you filter by pricing, features, and user ratings.`
        },
        {
            question: `Are there free AI tools for ${item.name}?`,
            answer: `Yes, many AI tools for ${item.name} offer free tiers or trials. Use FindMyAI's pricing filter to find free options.`
        }
    ];

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}

// ============================================================================
// AIO OPTIMIZED CONTENT HELPERS
// ============================================================================

/**
 * Generates AI-optimized summary for tool pages.
 * This summary is designed to be easily parsed by AI search engines.
 */
export function generateToolAISummary(tool: ToolSchemaData): string {
    const parts: string[] = [];

    parts.push(`${tool.name} is an AI tool`);

    if (tool.categories && tool.categories.length > 0) {
        parts.push(`categorized under ${tool.categories.map(c => c.name).join(', ')}`);
    }

    if (tool.short_description) {
        parts.push(`. ${tool.short_description}`);
    }

    if (tool.pricing_type && tool.pricing_type.length > 0) {
        parts.push(` Pricing: ${tool.pricing_type.join(', ')}.`);
    }

    if (tool.key_features && tool.key_features.length > 0) {
        parts.push(` Key features include ${tool.key_features.slice(0, 3).join(', ')}.`);
    }

    return parts.join('');
}

/**
 * Generates speakable content for voice search optimization.
 * Used in JSON-LD speakable specification.
 * 
 * @see https://schema.org/speakable
 */
export function buildSpeakableSchema(contentSelectors: string[], baseUrl: string, pageUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "url": pageUrl,
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": contentSelectors
        }
    };
}

// ============================================================================
// COMPOSITE SCHEMA BUILDERS
// ============================================================================

/**
 * Builds all schemas needed for the homepage
 */
export function buildHomepageSchemas(baseUrl: string, featuredTools?: { name: string; slug: string; logo_url?: string }[]) {
    const schemas: Record<string, unknown>[] = [
        buildOrganizationSchema(baseUrl),
        buildWebsiteSchema(baseUrl)
    ];

    if (featuredTools && featuredTools.length > 0) {
        schemas.push(buildItemListSchema(
            featuredTools.map(t => ({
                name: t.name,
                url: `${baseUrl}/tools/${t.slug}`,
                image: t.logo_url
            })),
            "Featured AI Tools"
        ));
    }

    return schemas;
}

/**
 * Builds all schemas needed for a tool detail page
 */
export function buildToolPageSchemas(tool: ToolSchemaData, baseUrl: string) {
    const schemas: Record<string, unknown>[] = [
        buildToolSchema(tool, baseUrl),
        buildBreadcrumbSchema([
            { name: 'Home', url: baseUrl },
            { name: 'AI Tools', url: `${baseUrl}/tools` },
            ...(tool.categories?.[0] ? [{
                name: tool.categories[0].name,
                url: `${baseUrl}/categories/${tool.categories[0].slug}`
            }] : []),
            { name: tool.name, url: `${baseUrl}/tools/${tool.slug}` }
        ])
    ];

    // Add FAQ schema if we have enough data
    const faqSchema = buildToolFAQSchema(tool, baseUrl);
    if (faqSchema) {
        schemas.push(faqSchema);
    }

    return schemas;
}

/**
 * Builds all schemas needed for a blog post page
 */
export function buildBlogPageSchemas(post: Parameters<typeof buildBlogPostSchema>[0], baseUrl: string) {
    return [
        buildBlogPostSchema(post, baseUrl),
        buildBreadcrumbSchema([
            { name: 'Home', url: baseUrl },
            { name: 'Blog', url: `${baseUrl}/blog` },
            { name: post.title, url: `${baseUrl}/blog/${post.slug}` }
        ])
    ];
}

/**
 * Builds all schemas for a collection page (category, job, task)
 */
export function buildCollectionPageSchemas(
    type: 'Category' | 'Job' | 'Task',
    item: { name: string; slug: string; description?: string | null; toolCount?: number },
    tools: { name: string; slug: string; logo_url?: string }[],
    baseUrl: string
) {
    const pathMap = {
        Category: 'categories',
        Job: 'jobs',
        Task: 'tasks'
    };

    return [
        buildCollectionPageSchema(type, item, baseUrl),
        buildBreadcrumbSchema([
            { name: 'Home', url: baseUrl },
            { name: `${type}s`, url: `${baseUrl}/${pathMap[type]}` },
            { name: item.name, url: `${baseUrl}/${pathMap[type]}/${item.slug}` }
        ]),
        buildItemListSchema(
            tools.map(t => ({
                name: t.name,
                url: `${baseUrl}/tools/${t.slug}`,
                image: t.logo_url
            })),
            `AI Tools for ${item.name}`
        ),
        buildCollectionFAQSchema(type, item, tools.map(t => t.name))
    ];
}
