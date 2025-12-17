/**
 * Static Pages Routes for FindMyAI
 * 
 * This module provides CRUD operations for managing static pages like:
 * - About Us
 * - Contact
 * - Privacy Policy
 * - Terms of Service
 * - etc.
 * 
 * Routes are divided into:
 * - Public routes: For fetching published pages
 * - Admin routes: For full CRUD operations (requires authentication)
 * 
 * @module routes/pages
 */

import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { requireAdmin } from '../middleware/admin';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Request body structure for creating/updating pages
 */
interface PageBody {
    /** The display title of the page */
    title: string;
    /** URL-friendly slug (must be unique) */
    slug: string;
    /** HTML content of the page */
    content: string;
    /** Optional SEO title override */
    seo_title?: string;
    /** Optional SEO meta description */
    seo_description?: string;
    /** Whether the page is publicly visible */
    published?: boolean;
    /** Whether to show this page in the footer */
    showInFooter?: boolean;
    /** Which footer column to display in (e.g., 'company', 'legal', 'resources') */
    footerColumn?: string;
    /** Optional icon for footer display */
    icon?: string;
}

/**
 * Seed page data structure (includes all fields for initial population)
 */
interface SeedPageData extends PageBody {
    published: boolean;
    showInFooter: boolean;
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * Registers all page-related routes on the Fastify instance.
 * 
 * Public Routes:
 * - `GET /api/pages` - List all published pages
 * - `GET /api/pages/:slug` - Get a single published page by slug
 * 
 * Admin Routes (require authentication):
 * - `GET /api/admin/pages` - List all pages (including drafts)
 * - `GET /api/admin/pages/:id` - Get a page by ID
 * - `POST /api/admin/pages` - Create a new page
 * - `PUT /api/admin/pages/:id` - Update an existing page
 * - `DELETE /api/admin/pages/:id` - Delete a page
 * - `POST /api/admin/pages/seed` - Seed initial pages
 * 
 * @param fastify - The Fastify instance to register routes on
 */
export default async function pagesRoutes(fastify: FastifyInstance) {

    // =========================================================================
    // PUBLIC ROUTES
    // =========================================================================

    /**
     * GET /api/pages
     * 
     * Retrieves all published pages. Used for displaying footer links
     * and building navigation menus.
     * 
     * @returns Object containing array of published pages
     */
    fastify.get('/api/pages', async (request, reply) => {
        try {
            const pages = await prisma.page.findMany({
                where: { published: true },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    seo_title: true,
                    seo_description: true,
                    showInFooter: true,
                    footerColumn: true,
                    icon: true,
                },
                orderBy: { title: 'asc' },
            });
            return reply.send({ pages });
        } catch (error) {
            console.error('Error fetching pages:', error);
            return reply.status(500).send({ error: 'Failed to fetch pages' });
        }
    });

    /**
     * GET /api/pages/:slug
     * 
     * Retrieves a single published page by its URL slug.
     * Returns 404 if the page doesn't exist or is not published.
     * 
     * @param slug - The URL slug of the page to retrieve
     * @returns Object containing the page data
     */
    fastify.get('/api/pages/:slug', async (request, reply) => {
        try {
            const { slug } = request.params as { slug: string };

            const page = await prisma.page.findUnique({
                where: { slug, published: true },
            });

            if (!page) {
                return reply.status(404).send({ error: 'Page not found' });
            }

            return reply.send({ page });
        } catch (error) {
            console.error('Error fetching page:', error);
            return reply.status(500).send({ error: 'Failed to fetch page' });
        }
    });

    // =========================================================================
    // ADMIN ROUTES (Protected)
    // =========================================================================

    /**
     * GET /api/admin/pages
     * 
     * Retrieves all pages including unpublished drafts.
     * Sorted by most recently updated.
     * 
     * @requires Admin authentication
     * @returns Object containing array of all pages
     */
    fastify.get('/api/admin/pages', { preHandler: [requireAdmin] }, async (request, reply) => {
        try {
            const pages = await prisma.page.findMany({
                orderBy: { updatedAt: 'desc' },
            });
            return reply.send({ pages });
        } catch (error) {
            console.error('Error fetching pages:', error);
            return reply.status(500).send({ error: 'Failed to fetch pages' });
        }
    });

    /**
     * GET /api/admin/pages/:id
     * 
     * Retrieves a single page by its database ID.
     * Used for loading page data in the admin editor.
     * 
     * @requires Admin authentication
     * @param id - The database ID of the page
     * @returns Object containing the page data
     */
    fastify.get('/api/admin/pages/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            const page = await prisma.page.findUnique({
                where: { id: parseInt(id) },
            });

            if (!page) {
                return reply.status(404).send({ error: 'Page not found' });
            }

            return reply.send({ page });
        } catch (error) {
            console.error('Error fetching page:', error);
            return reply.status(500).send({ error: 'Failed to fetch page' });
        }
    });

    /**
     * POST /api/admin/pages
     * 
     * Creates a new static page. The slug must be unique.
     * 
     * @requires Admin authentication
     * @body PageBody - The page data to create
     * @returns Object containing the created page (status 201)
     */
    fastify.post('/api/admin/pages', { preHandler: [requireAdmin] }, async (request, reply) => {
        try {
            const body = request.body as PageBody;

            // Validate slug uniqueness
            const existing = await prisma.page.findUnique({ where: { slug: body.slug } });
            if (existing) {
                return reply.status(400).send({ error: 'A page with this slug already exists' });
            }

            const page = await prisma.page.create({
                data: {
                    title: body.title,
                    slug: body.slug,
                    content: body.content,
                    seo_title: body.seo_title,
                    seo_description: body.seo_description,
                    published: body.published ?? true,
                    showInFooter: body.showInFooter ?? false,
                    footerColumn: body.footerColumn,
                    icon: body.icon,
                },
            });

            return reply.status(201).send({ page });
        } catch (error) {
            console.error('Error creating page:', error);
            return reply.status(500).send({ error: 'Failed to create page' });
        }
    });

    /**
     * PUT /api/admin/pages/:id
     * 
     * Updates an existing page. If changing the slug,
     * validates that the new slug is not already in use.
     * 
     * @requires Admin authentication
     * @param id - The database ID of the page to update
     * @body Partial<PageBody> - The fields to update
     * @returns Object containing the updated page
     */
    fastify.put('/api/admin/pages/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as Partial<PageBody>;

            // Check if page exists
            const existing = await prisma.page.findUnique({ where: { id: parseInt(id) } });
            if (!existing) {
                return reply.status(404).send({ error: 'Page not found' });
            }

            // Validate slug uniqueness if changing
            if (body.slug && body.slug !== existing.slug) {
                const slugExists = await prisma.page.findUnique({ where: { slug: body.slug } });
                if (slugExists) {
                    return reply.status(400).send({ error: 'A page with this slug already exists' });
                }
            }

            const page = await prisma.page.update({
                where: { id: parseInt(id) },
                data: {
                    title: body.title,
                    slug: body.slug,
                    content: body.content,
                    seo_title: body.seo_title,
                    seo_description: body.seo_description,
                    published: body.published,
                    showInFooter: body.showInFooter,
                    footerColumn: body.footerColumn,
                    icon: body.icon,
                },
            });

            return reply.send({ page });
        } catch (error) {
            console.error('Error updating page:', error);
            return reply.status(500).send({ error: 'Failed to update page' });
        }
    });

    /**
     * DELETE /api/admin/pages/:id
     * 
     * Permanently deletes a page from the database.
     * 
     * @requires Admin authentication
     * @param id - The database ID of the page to delete
     * @returns Object with success status
     */
    fastify.delete('/api/admin/pages/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            await prisma.page.delete({
                where: { id: parseInt(id) },
            });

            return reply.send({ success: true });
        } catch (error) {
            console.error('Error deleting page:', error);
            return reply.status(500).send({ error: 'Failed to delete page' });
        }
    });

    // =========================================================================
    // SEED ROUTE
    // =========================================================================

    /**
     * POST /api/admin/pages/seed
     * 
     * Seeds the database with initial static pages. Only creates pages
     * that don't already exist (based on slug).
     * 
     * This is useful for:
     * - Initial deployment setup
     * - Restoring default pages after deletion
     * 
     * @requires Admin authentication
     * @returns Object with success status and results array
     */
    fastify.post('/api/admin/pages/seed', { preHandler: [requireAdmin] }, async (request, reply) => {
        try {
            // Define initial pages to seed
            const initialPages: SeedPageData[] = [
                // -------------------------------------------------------------
                // Company Pages
                // -------------------------------------------------------------
                {
                    title: 'About Us',
                    slug: 'about',
                    content: generateAboutContent(),
                    seo_title: 'About FindMyAI - Your AI Tools Discovery Platform',
                    seo_description: 'Learn about FindMyAI, the comprehensive AI tools directory helping you discover, compare, and find the perfect AI solutions for your needs.',
                    published: true,
                    showInFooter: true,
                    footerColumn: 'company',
                },
                {
                    title: 'Contact Us',
                    slug: 'contact',
                    content: generateContactContent(),
                    seo_title: 'Contact FindMyAI - Get in Touch',
                    seo_description: 'Contact the FindMyAI team for questions, partnerships, or support. We\'re here to help you find the perfect AI tools.',
                    published: true,
                    showInFooter: true,
                    footerColumn: 'company',
                },
                {
                    title: 'Careers',
                    slug: 'careers',
                    content: generateCareersContent(),
                    seo_title: 'Careers at FindMyAI - Join Our Team',
                    seo_description: 'Explore career opportunities at FindMyAI. Join our mission to help everyone discover the best AI tools.',
                    published: true,
                    showInFooter: true,
                    footerColumn: 'company',
                },
                {
                    title: 'Press Kit',
                    slug: 'press',
                    content: generatePressContent(),
                    seo_title: 'Press Kit - FindMyAI Media Resources',
                    seo_description: 'Download FindMyAI\'s press kit including logos, brand assets, and company information for media use.',
                    published: true,
                    showInFooter: true,
                    footerColumn: 'company',
                },

                // -------------------------------------------------------------
                // Legal Pages
                // -------------------------------------------------------------
                {
                    title: 'Privacy Policy',
                    slug: 'privacy',
                    content: generatePrivacyContent(),
                    seo_title: 'Privacy Policy - FindMyAI',
                    seo_description: 'Read FindMyAI\'s privacy policy to understand how we collect, use, and protect your personal information.',
                    published: true,
                    showInFooter: true,
                    footerColumn: 'legal',
                },
                {
                    title: 'Terms of Service',
                    slug: 'terms',
                    content: generateTermsContent(),
                    seo_title: 'Terms of Service - FindMyAI',
                    seo_description: 'Read FindMyAI\'s terms of service to understand the rules and guidelines for using our AI tools directory.',
                    published: true,
                    showInFooter: true,
                    footerColumn: 'legal',
                },
                {
                    title: 'Cookie Policy',
                    slug: 'cookies',
                    content: generateCookiesContent(),
                    seo_title: 'Cookie Policy - FindMyAI',
                    seo_description: 'Learn about how FindMyAI uses cookies to improve your browsing experience and how you can manage your cookie preferences.',
                    published: true,
                    showInFooter: true,
                    footerColumn: 'legal',
                },

                // -------------------------------------------------------------
                // Resource Pages
                // -------------------------------------------------------------
                {
                    title: 'Advertise With Us',
                    slug: 'advertise',
                    content: generateAdvertiseContent(),
                    seo_title: 'Advertise on FindMyAI - Reach AI Enthusiasts',
                    seo_description: 'Advertise your AI tool or service on FindMyAI and reach thousands of targeted users actively looking for AI solutions.',
                    published: true,
                    showInFooter: true,
                    footerColumn: 'resources',
                },
                {
                    title: 'API Access',
                    slug: 'api',
                    content: generateApiContent(),
                    seo_title: 'FindMyAI API - Programmatic Access to AI Tools Database',
                    seo_description: 'Access FindMyAI\'s comprehensive AI tools database through our upcoming API. Join the waitlist for early access.',
                    published: true,
                    showInFooter: true,
                    footerColumn: 'resources',
                },
            ];

            // Process each page, skipping existing ones
            const results: { status: string; title: string }[] = [];

            for (const page of initialPages) {
                const existing = await prisma.page.findUnique({ where: { slug: page.slug } });

                if (!existing) {
                    const created = await prisma.page.create({ data: page });
                    results.push({ status: 'created', title: created.title });
                } else {
                    results.push({ status: 'exists', title: page.title });
                }
            }

            return reply.send({ success: true, results });
        } catch (error) {
            console.error('Error seeding pages:', error);
            return reply.status(500).send({ error: 'Failed to seed pages' });
        }
    });
}

// ============================================================================
// CONTENT GENERATORS
// ============================================================================
// These functions generate the HTML content for each seed page.
// Extracted to keep the route handler clean and readable.

/**
 * Generates HTML content for the About Us page
 */
function generateAboutContent(): string {
    return `<h1>About FindMyAI</h1>
<p>FindMyAI is the world's most comprehensive directory of AI tools and platforms. Our mission is to help individuals and businesses discover the perfect AI solutions for their needs.</p>

<h2>Our Story</h2>
<p>Founded in 2024, FindMyAI was born out of a simple observation: the AI landscape is growing exponentially, and finding the right tool for your specific needs has become increasingly challenging. We set out to create a curated, organized, and trustworthy directory that makes discovering AI tools effortless.</p>

<h2>What Sets Us Apart</h2>
<ul>
<li><strong>Handpicked &amp; Verified</strong> - Every tool in our directory is manually reviewed to ensure quality and accuracy.</li>
<li><strong>Smart Matching</strong> - Our intelligent categorization by jobs, tasks, and categories helps you find exactly what you need.</li>
<li><strong>Transparent Pricing</strong> - We clearly display pricing information so you know what to expect upfront.</li>
<li><strong>Always Fresh</strong> - Our database is updated daily with the latest AI tools and updates.</li>
</ul>

<h2>Our Team</h2>
<p>We're a passionate team of AI enthusiasts, developers, and tech writers dedicated to making AI accessible to everyone. We believe that the right AI tool can transform how you work, create, and innovate.</p>

<h2>Join Our Community</h2>
<p>Whether you're a developer looking for the latest AI APIs, a content creator seeking creative tools, or a business owner wanting to automate processes, FindMyAI is here to guide you through the AI revolution.</p>`;
}

/**
 * Generates HTML content for the Contact Us page
 */
function generateContactContent(): string {
    return `<h1>Contact Us</h1>
<p>We'd love to hear from you! Whether you have questions, feedback, or partnership inquiries, our team is here to help.</p>

<h2>Get in Touch</h2>
<p>📧 <strong>General Inquiries:</strong> hello@findmyai.xyz</p>
<p>🤝 <strong>Partnerships:</strong> partners@findmyai.xyz</p>
<p>📰 <strong>Press &amp; Media:</strong> press@findmyai.xyz</p>
<p>🛠️ <strong>Tool Submissions:</strong> <a href="/submit">Submit your AI tool</a></p>

<h2>Support</h2>
<p>Need help with something? Check out our resources:</p>
<ul>
<li>Browse our <a href="/blog">Blog</a> for tips and guides</li>
<li>Take our <a href="/quiz">AI Tool Finder Quiz</a> for personalized recommendations</li>
<li>Explore <a href="/tools">All Tools</a> to discover what's available</li>
</ul>

<h2>Social Media</h2>
<p>Follow us for the latest AI tool discoveries and industry news:</p>
<ul>
<li>Twitter: @findmyai</li>
<li>LinkedIn: FindMyAI</li>
<li>YouTube: FindMyAI</li>
</ul>

<h2>Office</h2>
<p>FindMyAI Pty Ltd<br>
Sydney, Australia</p>

<p>We typically respond to inquiries within 24-48 business hours.</p>`;
}

/**
 * Generates HTML content for the Careers page
 */
function generateCareersContent(): string {
    return `<h1>Careers at FindMyAI</h1>
<p>Join our mission to make AI accessible to everyone.</p>

<div style="background: #f0fdf4; border: 1px solid #86efac; padding: 24px; border-radius: 12px; margin: 24px 0;">
<h2 style="color: #166534; margin-top: 0;">🌱 We're Growing!</h2>
<p style="margin-bottom: 0;">We're a small but mighty team passionate about AI. While we don't have open positions right now, we're always interested in hearing from talented individuals.</p>
</div>

<h2>Why FindMyAI?</h2>
<ul>
<li><strong>Remote-First</strong> - Work from anywhere in the world</li>
<li><strong>Flexible Hours</strong> - We value results over hours logged</li>
<li><strong>Cutting-Edge Tech</strong> - Work with the latest AI tools and technologies</li>
<li><strong>Impact</strong> - Help millions discover AI tools that transform their work</li>
</ul>

<h2>Roles We May Hire For</h2>
<ul>
<li>Full-Stack Developer (React, Node.js)</li>
<li>AI/ML Engineer</li>
<li>Content Writer (AI/Tech focus)</li>
<li>Growth Marketing Manager</li>
<li>Community Manager</li>
</ul>

<h2>Get in Touch</h2>
<p>Think you'd be a great fit? Send us your resume and tell us about yourself:</p>
<p>📧 <strong>Email:</strong> careers@findmyai.xyz</p>

<p>We'd love to hear from you!</p>`;
}

/**
 * Generates HTML content for the Press Kit page
 */
function generatePressContent(): string {
    return `<h1>Press Kit</h1>
<p>Resources for journalists, bloggers, and media professionals.</p>

<h2>About FindMyAI</h2>
<p><strong>Founded:</strong> 2024<br>
<strong>Headquarters:</strong> Sydney, Australia<br>
<strong>Tools Indexed:</strong> 3,000+<br>
<strong>Mission:</strong> Making AI accessible to everyone</p>

<h2>Quick Facts</h2>
<ul>
<li>Comprehensive AI tools directory with 3,000+ verified tools</li>
<li>Organized by categories, job roles, and tasks</li>
<li>Daily updates and new tool additions</li>
<li>Free to use for all visitors</li>
</ul>

<h2>Brand Assets</h2>
<p>Download our logo and brand assets for use in articles and publications:</p>
<ul>
<li><strong>Logo (PNG, SVG)</strong> - Available upon request</li>
<li><strong>Screenshots</strong> - Available upon request</li>
<li><strong>Brand Colors:</strong> Pink (#ec4899) to Violet (#8b5cf6) gradient</li>
</ul>

<h2>Press Contact</h2>
<p>For media inquiries, interviews, or additional information:</p>
<p>📧 <strong>Email:</strong> press@findmyai.xyz</p>

<h2>Recent Coverage</h2>
<p>Coming soon - we'd love to be featured in your publication!</p>

<h2>Usage Guidelines</h2>
<ul>
<li>Please use our official logo without modifications</li>
<li>Credit "FindMyAI" when mentioning our platform</li>
<li>Link to findmyai.xyz when possible</li>
</ul>`;
}

/**
 * Generates HTML content for the Privacy Policy page
 */
function generatePrivacyContent(): string {
    return `<h1>Privacy Policy</h1>
<p><strong>Last updated:</strong> December 2024</p>

<h2>Introduction</h2>
<p>FindMyAI ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website.</p>

<h2>Information We Collect</h2>
<h3>Information You Provide</h3>
<ul>
<li>Account information (email, name) when you sign up</li>
<li>Tool submissions and reviews you create</li>
<li>Newsletter subscriptions</li>
<li>Contact form submissions</li>
</ul>

<h3>Information Collected Automatically</h3>
<ul>
<li>Device and browser information</li>
<li>IP address (anonymized)</li>
<li>Pages visited and actions taken</li>
<li>Referring website</li>
</ul>

<h2>How We Use Your Information</h2>
<ul>
<li>To provide and improve our services</li>
<li>To send you newsletters (if subscribed)</li>
<li>To respond to your inquiries</li>
<li>To analyze website usage and trends</li>
<li>To prevent fraud and ensure security</li>
</ul>

<h2>Data Sharing</h2>
<p>We do not sell your personal data. We may share data with:</p>
<ul>
<li>Service providers who help us operate our website</li>
<li>Analytics providers (Google Analytics)</li>
<li>Legal authorities when required by law</li>
</ul>

<h2>Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access your personal data</li>
<li>Correct inaccurate data</li>
<li>Delete your account and data</li>
<li>Opt out of marketing communications</li>
</ul>

<h2>Contact Us</h2>
<p>For privacy-related questions, contact us at privacy@findmyai.xyz</p>`;
}

/**
 * Generates HTML content for the Terms of Service page
 */
function generateTermsContent(): string {
    return `<h1>Terms of Service</h1>
<p><strong>Last updated:</strong> December 2024</p>

<h2>Agreement to Terms</h2>
<p>By accessing FindMyAI, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

<h2>Use of Service</h2>
<h3>Permitted Use</h3>
<ul>
<li>Browse and search our AI tools directory</li>
<li>Create an account and submit reviews</li>
<li>Submit AI tools for listing consideration</li>
<li>Subscribe to our newsletter</li>
</ul>

<h3>Prohibited Use</h3>
<ul>
<li>Scraping or automated data collection without permission</li>
<li>Submitting false or misleading information</li>
<li>Attempting to access unauthorized areas</li>
<li>Using the service for illegal purposes</li>
</ul>

<h2>User Content</h2>
<p>By submitting content (reviews, tool submissions), you grant us a non-exclusive license to use, display, and distribute that content on our platform.</p>

<h2>Third-Party Links</h2>
<p>Our directory contains links to external AI tools. We are not responsible for the content, privacy practices, or availability of these third-party websites.</p>

<h2>Disclaimer</h2>
<p>FindMyAI provides information about AI tools for educational purposes. We do not guarantee the accuracy, completeness, or reliability of tool information. Always verify details with the tool providers directly.</p>

<h2>Limitation of Liability</h2>
<p>FindMyAI shall not be liable for any indirect, incidental, or consequential damages arising from your use of our service.</p>

<h2>Changes to Terms</h2>
<p>We may update these terms at any time. Continued use of the service constitutes acceptance of the updated terms.</p>

<h2>Contact</h2>
<p>Questions about these terms? Contact us at legal@findmyai.xyz</p>`;
}

/**
 * Generates HTML content for the Cookie Policy page
 */
function generateCookiesContent(): string {
    return `<h1>Cookie Policy</h1>
<p><strong>Last updated:</strong> December 2024</p>

<h2>What Are Cookies</h2>
<p>Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences and improve your experience.</p>

<h2>How We Use Cookies</h2>

<h3>Essential Cookies</h3>
<p>Required for the website to function properly:</p>
<ul>
<li>Authentication and login sessions</li>
<li>Security features</li>
<li>Load balancing</li>
</ul>

<h3>Analytics Cookies</h3>
<p>Help us understand how visitors interact with our site:</p>
<ul>
<li>Google Analytics - to analyze traffic and usage patterns</li>
<li>Page view tracking</li>
<li>Feature usage metrics</li>
</ul>

<h3>Preference Cookies</h3>
<p>Remember your settings and preferences:</p>
<ul>
<li>Theme preferences (dark/light mode)</li>
<li>Filter and sort preferences</li>
<li>Recently viewed tools</li>
</ul>

<h2>Managing Cookies</h2>
<p>You can control cookies through your browser settings:</p>
<ul>
<li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
<li><strong>Firefox:</strong> Settings → Privacy &amp; Security → Cookies</li>
<li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
</ul>

<p>Note: Disabling certain cookies may affect website functionality.</p>

<h2>Contact Us</h2>
<p>Questions about our cookie policy? Contact us at privacy@findmyai.xyz</p>`;
}

/**
 * Generates HTML content for the Advertise With Us page
 */
function generateAdvertiseContent(): string {
    return `<h1>Advertise With FindMyAI</h1>
<p>Reach thousands of AI enthusiasts, developers, and business professionals actively looking for AI solutions.</p>

<h2>Why Advertise With Us?</h2>
<ul>
<li><strong>Targeted Audience</strong> - Our visitors are actively searching for AI tools and solutions</li>
<li><strong>High-Intent Traffic</strong> - Users come to discover and compare AI tools they want to use</li>
<li><strong>Growing Platform</strong> - 3,000+ AI tools indexed with daily updates</li>
<li><strong>Quality Traffic</strong> - Developers, entrepreneurs, and business decision-makers</li>
</ul>

<h2>Advertising Options</h2>

<h3>🌟 Featured Listings</h3>
<p>Get your AI tool prominently displayed at the top of search results and category pages.</p>

<h3>📰 Sponsored Content</h3>
<p>Publish sponsored blog posts and reviews to showcase your tool's capabilities.</p>

<h3>🎯 Banner Advertising</h3>
<p>Display banners across our high-traffic pages to increase brand visibility.</p>

<h3>📧 Newsletter Sponsorship</h3>
<p>Reach our subscriber base with dedicated email placements.</p>

<h2>Get Started</h2>
<p>Interested in advertising? Contact our partnerships team:</p>
<p>📧 <strong>Email:</strong> advertise@findmyai.xyz</p>

<p>We'll work with you to create a custom advertising package that meets your goals and budget.</p>`;
}

/**
 * Generates HTML content for the API Access page
 */
function generateApiContent(): string {
    return `<h1>FindMyAI API</h1>
<p class="text-xl text-gray-600">Access our comprehensive AI tools database programmatically.</p>

<div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 24px; border-radius: 12px; margin: 24px 0;">
<h2 style="color: white; margin-top: 0;">🚀 Coming Soon</h2>
<p style="margin-bottom: 0;">We're building a powerful API to give developers programmatic access to our AI tools database. Join the waitlist to be notified when it launches!</p>
</div>

<h2>Planned Features</h2>
<ul>
<li><strong>Tools Endpoint</strong> - Search and filter 3,000+ AI tools</li>
<li><strong>Categories</strong> - Access our categorization taxonomy</li>
<li><strong>Jobs &amp; Tasks</strong> - Query tools by job roles and tasks</li>
<li><strong>Real-time Updates</strong> - Get notified of new tools</li>
<li><strong>Pricing Data</strong> - Access pricing information</li>
</ul>

<h2>Use Cases</h2>
<ul>
<li>Build AI tool recommendation engines</li>
<li>Create comparison websites</li>
<li>Power chatbots with AI tool knowledge</li>
<li>Integrate AI discovery into your app</li>
<li>Research and analytics</li>
</ul>

<h2>Join the Waitlist</h2>
<p>Be the first to know when our API launches:</p>
<p>📧 <strong>Email:</strong> api@findmyai.xyz</p>

<p>Include your use case and we'll prioritize accordingly!</p>`;
}
