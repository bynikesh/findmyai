import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import authPlugin from './plugins/auth';
import toolRoutes from './routes/tools';
import authRoutes from './routes/auth';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import prisma from './lib/prisma';
import {
    getIndexHtml,
    injectSeoMeta,
    buildBlogPostSchema,
    buildBreadcrumbSchema,
    buildToolPageSchemas,
    buildCollectionPageSchemas,
    buildHomepageSchemas
} from './lib/seo';

export const buildApp = () => {
    const app = Fastify({
        logger: true,
    });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.register(cors, {
        origin: (origin, cb) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) {
                cb(null, true);
                return;
            }
            // Reflect the request origin
            cb(null, true);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    app.register(rateLimit, {
        max: 100,
        timeWindow: '15 minutes',
    });

    // Health check (Priority 1)
    app.get('/health', async (request, reply) => {
        return { status: 'ok' };
    });

    app.register(authPlugin);

    // API Routes (Priority 2)
    app.register(toolRoutes, { prefix: '/api' });
    app.register(authRoutes, { prefix: '/api' });
    app.register(import('./routes/ai'), { prefix: '/api' });
    app.register(import('./routes/admin'), { prefix: '/api' });
    app.register(import('./routes/toolsAdmin'), { prefix: '/api' });
    app.register(import('./routes/categoriesAdmin'), { prefix: '/api' });
    app.register(import('./routes/reviews'), { prefix: '/api' });
    app.register(import('./routes/uploads'), { prefix: '/api' });
    app.register(import('./routes/analytics'), { prefix: '/api' });
    app.register(import('./routes/ai-seo'), { prefix: '/api' });
    app.register(import('./routes/import'), { prefix: '/api' });
    app.register(import('./routes/jobsTasks'), { prefix: '/api' });
    app.register(import('./routes/blog'), { prefix: '/api' });
    app.register(import('./routes/pages'), { prefix: '' });

    // Static Files (Priority 3)
    app.register(fastifyStatic, {
        root: path.join(__dirname, '../../frontend/dist'),
        prefix: '/',
        wildcard: false, // Don't use wildcard matching to avoid shadowing API
    });

    // Dynamic SEO for Tool Pages (Priority 4)
    // Injects comprehensive SoftwareApplication, FAQ, and Breadcrumb schemas
    app.get('/tools/:slug', async (request, reply) => {
        const { slug } = request.params as { slug: string };
        const baseUrl = process.env.BASE_URL || 'https://findmyai.xyz';

        try {
            let html = getIndexHtml();

            // Fetch tool data with all fields needed for comprehensive SEO
            const tool = await prisma.tool.findUnique({
                where: { slug },
                select: {
                    name: true,
                    slug: true,
                    description: true,
                    short_description: true,
                    logo_url: true,
                    website: true,
                    seo_title: true,
                    seo_meta_description: true,
                    social_share_image: true,
                    pricing_type: true,
                    pricing: true,
                    price_range: true,
                    key_features: true,
                    pros: true,
                    cons: true,
                    use_cases: true,
                    categories: { select: { name: true, slug: true } },
                    reviews: { select: { rating: true } },
                }
            });

            if (tool) {
                const title = tool.seo_title || `${tool.name} - AI Tool Review & Pricing | FindMyAI`;
                const description = tool.seo_meta_description
                    || tool.short_description
                    || tool.description?.substring(0, 155) + '...'
                    || `Discover ${tool.name} - an AI tool. Read reviews, compare pricing, and explore features on FindMyAI.`;
                const image = tool.social_share_image || tool.logo_url || `${baseUrl}/og-image.png`;
                const url = `${baseUrl}/tools/${slug}`;

                // Build comprehensive JSON-LD schemas (SoftwareApplication + FAQ + Breadcrumbs)
                const schemas = buildToolPageSchemas({
                    ...tool,
                    slug,
                    categories: tool.categories,
                    reviews: tool.reviews
                }, baseUrl);

                html = injectSeoMeta(html, {
                    title,
                    description,
                    url,
                    image,
                    jsonLd: schemas
                });
            }

            return reply.type('text/html').send(html);
        } catch (error) {
            console.error('Error serving tool page SEO:', error);
            return reply.sendFile('index.html');
        }
    });

    // Dynamic SEO for Blog Posts (Priority 4b)
    app.get('/blog/:slug', async (request, reply) => {
        const { slug } = request.params as { slug: string };
        const baseUrl = process.env.BASE_URL || 'https://findmyai.xyz';

        try {
            let html = getIndexHtml();

            const post = await prisma.blogPost.findUnique({
                where: { slug },
                select: {
                    title: true,
                    excerpt: true,
                    content: true,
                    author: true,
                    publishedAt: true,
                    cover_image: true,
                    seo_title: true,
                    seo_description: true,
                }
            });

            if (post) {
                const title = post.seo_title || `${post.title} | FindMyAI Blog`;
                const description = post.seo_description || post.excerpt || 'Read the latest AI insights on FindMyAI';
                const url = `${baseUrl}/blog/${slug}`;
                const image = post.cover_image || `${baseUrl}/og-image.png`;

                const jsonLd = buildBlogPostSchema({ ...post, slug }, baseUrl);

                html = injectSeoMeta(html, {
                    title,
                    description,
                    url,
                    image,
                    jsonLd
                });
            }

            return reply.type('text/html').send(html);
        } catch (error) {
            console.error('Error serving blog page:', error);
            return reply.sendFile('index.html');
        }
    });

    // Dynamic SEO for Static Pages (About, Contact, Privacy, etc.)
    app.get('/:pageSlug', async (request, reply) => {
        const { pageSlug } = request.params as { pageSlug: string };
        const baseUrl = process.env.BASE_URL || 'https://findmyai.xyz';

        // Skip if it's a known route that should go to React
        const skipSlugs = ['tools', 'categories', 'jobs', 'tasks', 'blog', 'submit', 'quiz', 'login', 'admin'];
        if (skipSlugs.includes(pageSlug)) {
            return reply.sendFile('index.html');
        }

        try {
            let html = getIndexHtml();

            const page = await prisma.page.findUnique({
                where: { slug: pageSlug, published: true },
                select: {
                    title: true,
                    content: true,
                    seo_title: true,
                    seo_description: true,
                }
            });

            if (page) {
                const title = page.seo_title || `${page.title} | FindMyAI`;
                const description = page.seo_description || page.content?.replace(/<[^>]*>/g, '').substring(0, 160) || 'FindMyAI - Discover AI Tools';
                const url = `${baseUrl}/${pageSlug}`;

                const breadcrumbSchema = buildBreadcrumbSchema([
                    { name: 'Home', url: baseUrl },
                    { name: page.title, url }
                ]);

                html = injectSeoMeta(html, {
                    title,
                    description,
                    url,
                    jsonLd: breadcrumbSchema
                });
            }

            return reply.type('text/html').send(html);
        } catch (error) {
            console.error('Error serving static page:', error);
            return reply.sendFile('index.html');
        }
    });

    // Dynamic SEO for Job Detail Pages
    app.get('/jobs/:slug', async (request, reply) => {
        const { slug } = request.params as { slug: string };
        const baseUrl = process.env.BASE_URL || 'https://findmyai.xyz';

        try {
            let html = getIndexHtml();

            const job = await prisma.job.findUnique({
                where: { slug },
                select: {
                    name: true,
                    description: true,
                    _count: { select: { tools: true } }
                }
            });

            if (job) {
                const title = `Best AI Tools for ${job.name} | FindMyAI`;
                const description = job.description || `Discover ${job._count?.tools || 0}+ AI tools perfect for ${job.name}`;
                const url = `${baseUrl}/jobs/${slug}`;

                const breadcrumbSchema = buildBreadcrumbSchema([
                    { name: 'Home', url: baseUrl },
                    { name: 'Jobs', url: `${baseUrl}/jobs` },
                    { name: job.name, url }
                ]);

                html = injectSeoMeta(html, {
                    title,
                    description,
                    url,
                    jsonLd: breadcrumbSchema
                });
            }

            return reply.type('text/html').send(html);
        } catch (error) {
            console.error('Error serving job page:', error);
            return reply.sendFile('index.html');
        }
    });

    // Dynamic SEO for Task Detail Pages
    app.get('/tasks/:slug', async (request, reply) => {
        const { slug } = request.params as { slug: string };
        const baseUrl = process.env.BASE_URL || 'https://findmyai.xyz';

        try {
            let html = getIndexHtml();

            const task = await prisma.task.findUnique({
                where: { slug },
                select: {
                    name: true,
                    description: true,
                    _count: { select: { tools: true } }
                }
            });

            if (task) {
                const title = `Best AI Tools for ${task.name} | FindMyAI`;
                const description = task.description || `Discover ${task._count?.tools || 0}+ AI tools for ${task.name}`;
                const url = `${baseUrl}/tasks/${slug}`;

                const breadcrumbSchema = buildBreadcrumbSchema([
                    { name: 'Home', url: baseUrl },
                    { name: 'Tasks', url: `${baseUrl}/tasks` },
                    { name: task.name, url }
                ]);

                html = injectSeoMeta(html, {
                    title,
                    description,
                    url,
                    jsonLd: breadcrumbSchema
                });
            }

            return reply.type('text/html').send(html);
        } catch (error) {
            console.error('Error serving task page:', error);
            return reply.sendFile('index.html');
        }
    });

    // SEO Routes (sitemap.xml, robots.txt, feed.xml) - Register before catch-all
    app.register(import('./routes/seo'), { prefix: '' });

    // SPA Catch-all (Priority 5) - Serve index.html for any non-API routes
    app.setNotFoundHandler((request, reply) => {
        if (request.raw.url?.startsWith('/api')) {
            reply.status(404).send({ error: 'Not Found' });
        } else {
            reply.sendFile('index.html');
        }
    });

    return app;
};
