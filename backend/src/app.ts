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

    // Static Files (Priority 3)
    app.register(fastifyStatic, {
        root: path.join(__dirname, '../../frontend/dist'),
        prefix: '/',
        wildcard: false, // Don't use wildcard matching to avoid shadowing API
    });

    // Dynamic SEO for Tool Pages (Priority 4)
    app.get('/tools/:slug', async (request, reply) => {
        const { slug } = request.params as { slug: string };
        const baseUrl = process.env.BASE_URL || 'https://findmyai.xyz';

        try {
            // Read the built index.html
            const indexPath = path.join(__dirname, '../../frontend/dist/index.html');
            let html = fs.readFileSync(indexPath, 'utf-8');

            // Fetch tool data from database with additional fields for JSON-LD
            const tool = await prisma.tool.findUnique({
                where: { slug },
                select: {
                    name: true,
                    description: true,
                    short_description: true,
                    logo_url: true,
                    screenshots: true,
                    seo_title: true,
                    seo_meta_description: true,
                    social_share_image: true,
                    pricing_type: true,
                    pricing: true,
                    price_range: true,
                    categories: { select: { name: true } },
                    reviews: { select: { rating: true } },
                }
            });

            if (tool) {
                const title = tool.seo_title || `${tool.name} - AI Tool Review | FindMyAI`;
                const description = tool.seo_meta_description || tool.short_description || tool.description?.substring(0, 160) || 'Discover this AI tool on FindMyAI';
                const image = tool.social_share_image || tool.logo_url || `${baseUrl}/og-image.png`;
                const url = `${baseUrl}/tools/${slug}`;

                // Calculate aggregate rating
                const reviews = tool.reviews || [];
                const ratingCount = reviews.length;
                const avgRating = ratingCount > 0
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount).toFixed(1)
                    : '4.5'; // Default rating if no reviews

                // Determine price for schema
                let priceValue = '0.00';
                if (tool.pricing_type === 'Paid' || tool.pricing_type === 'Freemium') {
                    // Try to extract a number from pricing string
                    const priceMatch = tool.pricing?.match(/\$?(\d+(?:\.\d{2})?)/);
                    priceValue = priceMatch ? priceMatch[1] : '9.99';
                }

                // Build JSON-LD schema
                const jsonLdSchema: Record<string, unknown> = {
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": tool.name,
                    "description": tool.short_description || tool.description?.substring(0, 300),
                    "image": image,
                    "url": url,
                    "applicationCategory": tool.categories?.[0]?.name || "BusinessApplication",
                    "operatingSystem": "Web",
                    "offers": {
                        "@type": "Offer",
                        "price": priceValue,
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    }
                };

                // Add aggregate rating if there are reviews
                if (ratingCount > 0) {
                    jsonLdSchema.aggregateRating = {
                        "@type": "AggregateRating",
                        "ratingValue": avgRating,
                        "ratingCount": ratingCount.toString(),
                        "bestRating": "5",
                        "worstRating": "1"
                    };
                }

                const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(jsonLdSchema)}</script>`;

                // Replace placeholders with actual values
                // Using a helper function for cleaner replacements
                const replacePlaceholder = (tag: string, value: string) => {
                    const regex = new RegExp(`<!--${tag}-->.*?<!--/${tag}-->`, 'gs');
                    return html.replace(regex, value);
                };

                html = replacePlaceholder('SEO_TITLE', title);
                html = replacePlaceholder('SEO_DESC', description);
                html = replacePlaceholder('SEO_URL', url);
                html = replacePlaceholder('SEO_OG_TITLE', title);
                html = replacePlaceholder('SEO_OG_DESC', description);
                html = replacePlaceholder('SEO_IMAGE', image);
                html = replacePlaceholder('SEO_TWITTER_URL', url);
                html = replacePlaceholder('SEO_TWITTER_TITLE', title);
                html = replacePlaceholder('SEO_TWITTER_DESC', description);
                html = replacePlaceholder('SEO_TWITTER_IMAGE', image);
                html = replacePlaceholder('SEO_CANONICAL', url);
                html = replacePlaceholder('JSON_LD_SCHEMA', jsonLdScript);
            }

            return reply.type('text/html').send(html);
        } catch (error) {
            // Fallback to serving index.html without modifications
            console.error('Error serving dynamic SEO page:', error);
            return reply.sendFile('index.html');
        }
    });

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
