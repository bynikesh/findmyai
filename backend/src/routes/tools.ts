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
                    description: z.string(),
                    website: z.string().url(),
                    pricing: z.string().optional(),
                    platforms: z.array(z.string()),
                    models_used: z.array(z.string()),
                    logo_url: z.string().optional(),
                    screenshots: z.array(z.string()),
                    verified: z.boolean().optional(),
                }),
            },
        },
        toolController.createTool,
    );



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
