import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import * as toolController from '../controllers/toolController';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    fastify.get(
        '/tools',
        {
            schema: {
                querystring: z.object({
                    query: z.string().optional(),
                    search: z.string().optional(),
                    category: z.string().optional(),
                    tags: z.string().optional(),
                    pricing: z.string().optional(),
                    platform: z.string().optional(),
                    model: z.string().optional(),
                    sort: z.enum(['newest', 'popular']).optional(),
                    page: z.string().optional(),
                    perPage: z.string().optional(),
                }),
            },
        },
        toolController.getTools,
    );

    fastify.get('/tools/trending', toolController.getTrendingTools);

    fastify.get(
        '/tools/:slug',
        {
            schema: {
                params: z.object({
                    slug: z.string(),
                }),
            },
        },
        toolController.getToolBySlug,
    );

    fastify.post(
        '/tools',
        {
            onRequest: [app.authenticate],
            schema: {
                body: z.object({
                    name: z.string(),
                    slug: z.string(),
                    tagline: z.string().optional(),
                    short_description: z.string().optional(),
                    description: z.string(),
                    website: z.string().url(),
                    key_features: z.array(z.string()).optional(),
                    pros: z.array(z.string()).optional(),
                    cons: z.array(z.string()).optional(),
                    ideal_for: z.string().optional(),
                    pricing_type: z.string().optional(),
                    pricing: z.string().optional(),
                    price_range: z.string().optional(),
                    free_trial: z.boolean().optional(),
                    open_source: z.boolean().optional(),
                    repo_url: z.string().optional(),
                    platforms: z.string().optional(), // Frontend sends comma-separated string
                    models_used: z.string().optional(), // Frontend sends comma-separated string
                    primary_model: z.string().optional(),
                    integrations: z.array(z.string()).optional(),
                    api_available: z.boolean().optional(),
                    api_docs_url: z.string().optional(),
                    logo_url: z.string().optional(),
                    brand_color_primary: z.string().optional(),
                    brand_color_secondary: z.string().optional(),
                    screenshots: z.string().optional(), // Frontend sends comma-separated string
                    release_year: z.coerce.number().optional(),
                    company_name: z.string().optional(),
                    company_size: z.string().optional(),
                    seo_title: z.string().optional(),
                    seo_meta_description: z.string().optional(),
                    social_share_image: z.string().optional(),
                    use_cases: z.array(z.string()).optional(),
                    allow_reviews: z.boolean().optional(),
                    verified: z.boolean().optional(),
                    featured: z.boolean().optional(),
                    trending: z.boolean().optional(),
                    editors_choice: z.boolean().optional(),
                    still_active: z.boolean().optional(),
                    categoryIds: z.array(z.number()).optional(),
                }),
            },
        },
        toolController.createTool,
    );

    // PUT and DELETE routes are handled in toolsAdmin.ts



    fastify.post(
        '/submissions',
        {
            schema: {
                body: z.object({
                    submitterName: z.string(),
                    submitterEmail: z.string().email(),
                    toolData: z.any(),
                }),
            },
        },
        toolController.createSubmission,
    );

    fastify.get('/categories', async () => {
        const { default: prisma } = await import('../lib/prisma');
        return prisma.category.findMany();
    });

    fastify.get('/categories/featured', async () => {
        const { default: prisma } = await import('../lib/prisma');
        return prisma.category.findMany({
            where: { featured: true },
            include: {
                _count: {
                    select: { tools: true }
                }
            }
        });
    });

    fastify.get('/tags', async () => {
        const { default: prisma } = await import('../lib/prisma');
        return prisma.tag.findMany();
    });
}
