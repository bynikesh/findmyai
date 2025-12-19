/**
 * SEO Component for FindMyAI
 * 
 * A comprehensive SEO component using react-helmet-async that handles:
 * - Title and meta description
 * - Open Graph tags
 * - Twitter Card tags
 * - JSON-LD structured data
 * - Canonical URLs
 * - Article metadata for blog posts
 * 
 * This component is optimized for both traditional SEO and AIO (AI Optimization)
 * for better visibility in AI-powered search engines.
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

// ============================================================================
// INTERFACES
// ============================================================================

interface SEOProps {
    /** Page title - will be appended with site name */
    title: string;
    /** Meta description - should be 150-160 characters */
    description: string;
    /** Canonical URL for the page */
    url?: string;
    /** Open Graph image URL */
    image?: string;
    /** Open Graph type (website, article, product) */
    type?: 'website' | 'article' | 'product';
    /** Additional keywords for meta keywords tag */
    keywords?: string[];
    /** Author name (for articles) */
    author?: string;
    /** Published date (for articles) */
    publishedTime?: string;
    /** Modified date (for articles) */
    modifiedTime?: string;
    /** JSON-LD structured data object(s) */
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
    /** Whether to append site name to title */
    appendSiteName?: boolean;
    /** Prevent indexing */
    noIndex?: boolean;
}

interface ToolSEOProps {
    tool: {
        name: string;
        slug: string;
        description?: string | null;
        short_description?: string | null;
        logo_url?: string | null;
        seo_title?: string | null;
        seo_meta_description?: string | null;
        social_share_image?: string | null;
        pricing_type?: string[] | null;
        pricing?: string | null;
        key_features?: string[] | null;
        categories?: { name: string; slug: string }[];
        reviews?: { rating: number }[];
    };
}

interface BlogSEOProps {
    post: {
        title: string;
        slug: string;
        excerpt?: string | null;
        content?: string;
        author?: string | null;
        publishedAt?: string | null;
        updatedAt?: string | null;
        cover_image?: string | null;
        seo_title?: string | null;
        seo_description?: string | null;
        read_time?: number | null;
    };
}

interface CollectionSEOProps {
    type: 'Category' | 'Job' | 'Task';
    item: {
        name: string;
        slug: string;
        description?: string | null;
    };
    toolCount?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BASE_URL = 'https://findmyai.xyz';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'FindMyAI';
const TWITTER_HANDLE = '@findmyai';

// ============================================================================
// MAIN SEO COMPONENT
// ============================================================================

/**
 * Primary SEO component that handles all meta tag injection
 */
export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    url,
    image = DEFAULT_IMAGE,
    type = 'website',
    keywords = [],
    author,
    publishedTime,
    modifiedTime,
    jsonLd,
    appendSiteName = true,
    noIndex = false,
}) => {
    const fullTitle = appendSiteName ? `${title} | ${SITE_NAME}` : title;
    const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : BASE_URL);
    const fullUrl = canonicalUrl.startsWith('http') ? canonicalUrl : `${BASE_URL}${canonicalUrl}`;

    // Ensure description is within optimal length
    const metaDescription = description.length > 160
        ? description.substring(0, 157) + '...'
        : description;

    // Build keywords string
    const keywordsString = [
        'AI tools',
        'artificial intelligence',
        ...keywords
    ].join(', ');

    // Prepare JSON-LD scripts
    const jsonLdScripts = jsonLd
        ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
        : [];

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={keywordsString} />
            {author && <meta name="author" content={author} />}

            {/* Robots */}
            <meta
                name="robots"
                content={noIndex
                    ? "noindex, nofollow"
                    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
                }
            />

            {/* Canonical URL */}
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={image} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content="en_US" />

            {/* Article-specific OG tags */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {type === 'article' && modifiedTime && (
                <meta property="article:modified_time" content={modifiedTime} />
            )}
            {type === 'article' && author && (
                <meta property="article:author" content={author} />
            )}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={TWITTER_HANDLE} />
            <meta name="twitter:creator" content={TWITTER_HANDLE} />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={image} />

            {/* JSON-LD Structured Data */}
            {jsonLdScripts.map((schema, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
};

// ============================================================================
// SPECIALIZED SEO COMPONENTS
// ============================================================================

/**
 * SEO component optimized for Tool detail pages
 */
export const ToolSEO: React.FC<ToolSEOProps> = ({ tool }) => {
    const title = tool.seo_title || `${tool.name} - AI Tool Review & Pricing`;
    const description = tool.seo_meta_description
        || tool.short_description
        || tool.description?.substring(0, 160)
        || `Discover ${tool.name} - an AI tool. Read reviews, compare pricing, and see features.`;
    const image = tool.social_share_image || tool.logo_url || DEFAULT_IMAGE;
    const url = `${BASE_URL}/tools/${tool.slug}`;

    // Build keywords from categories and features
    const keywords = [
        tool.name,
        `${tool.name} review`,
        `${tool.name} pricing`,
        `${tool.name} alternative`,
        ...(tool.categories?.map(c => c.name) || []),
        ...(tool.key_features?.slice(0, 3) || []),
    ];

    // Calculate rating for schema
    const reviews = tool.reviews || [];
    const ratingCount = reviews.length;
    const avgRating = ratingCount > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount).toFixed(1)
        : '4.5';

    // Determine price
    let priceValue = '0';
    const pricingTypes = tool.pricing_type || [];
    if (pricingTypes.includes('Paid') || pricingTypes.includes('Freemium')) {
        const priceMatch = tool.pricing?.match(/\$?(\d+(?:\.\d{2})?)/);
        priceValue = priceMatch ? priceMatch[1] : '9.99';
    }

    // Build JSON-LD schemas
    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": tool.name,
        "description": description,
        "url": url,
        "image": image,
        "applicationCategory": tool.categories?.[0]?.name || "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": priceValue,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        },
        ...(ratingCount > 0 && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": avgRating,
                "ratingCount": ratingCount,
                "bestRating": "5",
                "worstRating": "1"
            }
        })
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "AI Tools", "item": `${BASE_URL}/tools` },
            ...(tool.categories?.[0] ? [{
                "@type": "ListItem",
                "position": 3,
                "name": tool.categories[0].name,
                "item": `${BASE_URL}/categories/${tool.categories[0].slug}`
            }] : []),
            { "@type": "ListItem", "position": tool.categories?.[0] ? 4 : 3, "name": tool.name, "item": url }
        ]
    };

    // FAQ Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `What is ${tool.name}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": tool.short_description || `${tool.name} is an AI-powered tool available on FindMyAI.`
                }
            },
            {
                "@type": "Question",
                "name": `Is ${tool.name} free?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": pricingTypes.includes('Free')
                        ? `Yes, ${tool.name} offers a free tier.`
                        : pricingTypes.includes('Freemium')
                            ? `${tool.name} offers a freemium model with free and paid options.`
                            : `${tool.name} is a paid tool. Check their website for current pricing.`
                }
            },
            ...(tool.key_features && tool.key_features.length > 0 ? [{
                "@type": "Question",
                "name": `What are the main features of ${tool.name}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Key features include: ${tool.key_features.slice(0, 5).join(', ')}.`
                }
            }] : [])
        ]
    };

    return (
        <SEO
            title={title}
            description={description}
            url={url}
            image={image}
            type="product"
            keywords={keywords}
            jsonLd={[softwareSchema, breadcrumbSchema, faqSchema]}
            appendSiteName={!tool.seo_title}
        />
    );
};

/**
 * SEO component optimized for Blog posts
 */
export const BlogSEO: React.FC<BlogSEOProps> = ({ post }) => {
    const title = post.seo_title || post.title;
    const description = post.seo_description
        || post.excerpt
        || 'Read the latest AI insights and tools guides on FindMyAI Blog.';
    const image = post.cover_image || DEFAULT_IMAGE;
    const url = `${BASE_URL}/blog/${post.slug}`;

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": description,
        "image": image,
        "url": url,
        "datePublished": post.publishedAt || new Date().toISOString(),
        "dateModified": post.updatedAt || post.publishedAt || new Date().toISOString(),
        "author": {
            "@type": "Person",
            "name": post.author || "FindMyAI Team"
        },
        "publisher": {
            "@type": "Organization",
            "name": "FindMyAI",
            "logo": {
                "@type": "ImageObject",
                "url": `${BASE_URL}/logo.png`
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        },
        ...(post.read_time && { "timeRequired": `PT${post.read_time}M` })
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog` },
            { "@type": "ListItem", "position": 3, "name": post.title, "item": url }
        ]
    };

    return (
        <SEO
            title={title}
            description={description}
            url={url}
            image={image}
            type="article"
            author={post.author || "FindMyAI Team"}
            publishedTime={post.publishedAt || undefined}
            modifiedTime={post.updatedAt || post.publishedAt || undefined}
            keywords={['AI blog', 'AI tools guide', 'artificial intelligence']}
            jsonLd={[articleSchema, breadcrumbSchema]}
            appendSiteName={!post.seo_title}
        />
    );
};

/**
 * SEO component for Collection pages (Categories, Jobs, Tasks)
 */
export const CollectionSEO: React.FC<CollectionSEOProps> = ({ type, item, toolCount }) => {
    const pathMap = {
        Category: 'categories',
        Job: 'jobs',
        Task: 'tasks'
    };

    const title = `Best AI Tools for ${item.name}`;
    const description = item.description
        || `Discover ${toolCount || 'the best'} AI tools for ${item.name}. Compare features, pricing, and reviews to find the perfect AI solution.`;
    const url = `${BASE_URL}/${pathMap[type]}/${item.slug}`;

    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": title,
        "description": description,
        "url": url,
        "numberOfItems": toolCount || 0,
        "about": {
            "@type": "Thing",
            "name": item.name
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": `${type}s`, "item": `${BASE_URL}/${pathMap[type]}` },
            { "@type": "ListItem", "position": 3, "name": item.name, "item": url }
        ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `What are the best AI tools for ${item.name}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `FindMyAI lists ${toolCount || 'multiple'} curated AI tools for ${item.name}. Browse our collection to find the best fit for your needs.`
                }
            },
            {
                "@type": "Question",
                "name": `Are there free AI tools for ${item.name}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Yes, many AI tools for ${item.name} offer free tiers or trials. Use FindMyAI's pricing filter to find free options.`
                }
            }
        ]
    };

    return (
        <SEO
            title={title}
            description={description}
            url={url}
            type="website"
            keywords={[item.name, `AI tools for ${item.name}`, `${item.name} AI`, type.toLowerCase()]}
            jsonLd={[collectionSchema, breadcrumbSchema, faqSchema]}
        />
    );
};

/**
 * SEO component for the Homepage
 */
export const HomeSEO: React.FC<{ featuredTools?: string[] }> = ({ featuredTools }) => {
    const title = "Discover 3000+ Best AI Tools for Any Task";
    const description = "The world's most comprehensive AI tools directory. Find and compare AI tools for writing, coding, design, marketing, and more. Free and paid options available.";

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "FindMyAI",
        "url": BASE_URL,
        "description": description,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${BASE_URL}/tools?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "FindMyAI",
        "url": BASE_URL,
        "logo": `${BASE_URL}/logo.png`,
        "description": description,
        "sameAs": [
            "https://twitter.com/findmyai",
            "https://linkedin.com/company/findmyai"
        ]
    };

    return (
        <SEO
            title={title}
            description={description}
            url={BASE_URL}
            type="website"
            keywords={[
                'AI tools directory',
                'best AI tools',
                'AI software',
                'artificial intelligence tools',
                'ChatGPT alternatives',
                'AI writing tools',
                'AI image generator'
            ]}
            jsonLd={[websiteSchema, organizationSchema]}
            appendSiteName={false}
        />
    );
};

/**
 * SEO component for the Tools List page
 */
export const ToolsListSEO: React.FC<{
    category?: string;
    search?: string;
    totalTools?: number;
}> = ({ category, search, totalTools }) => {
    let title = "Browse All AI Tools";
    let description = `Explore ${totalTools || '3000+'} AI tools. Filter by category, pricing, and features to find the perfect AI solution for your needs.`;

    if (category) {
        title = `Best AI Tools for ${category}`;
        description = `Discover AI tools for ${category}. Compare features, pricing, and reviews to find the best ${category} AI tools.`;
    }

    if (search) {
        title = `AI Tools for "${search}"`;
        description = `Find AI tools matching "${search}". Browse our directory of ${totalTools || '3000+'} AI tools.`;
    }

    return (
        <SEO
            title={title}
            description={description}
            url={`${BASE_URL}/tools`}
            type="website"
            keywords={['AI tools', 'AI software', category || 'all categories', 'AI directory']}
        />
    );
};

/**
 * SEO component for Static pages (About, Contact, Privacy, etc.)
 */
export const StaticPageSEO: React.FC<{
    title: string;
    slug: string;
    description?: string;
    seo_title?: string | null;
    seo_description?: string | null;
}> = ({ title, slug, description, seo_title, seo_description }) => {
    const pageTitle = seo_title || title;
    const pageDescription = seo_description || description || `${title} - FindMyAI AI Tools Directory`;

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": title, "item": `${BASE_URL}/${slug}` }
        ]
    };

    return (
        <SEO
            title={pageTitle}
            description={pageDescription}
            url={`${BASE_URL}/${slug}`}
            type="website"
            jsonLd={[breadcrumbSchema]}
        />
    );
};

export default SEO;
