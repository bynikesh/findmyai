import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import * as toolController from '../controllers/toolController';
import { requireAdmin } from '../middleware/admin';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    // GET /api/admin/tools - List all tools (admin)
    fastify.get(
        '/admin/tools',
        {
            preHandler: [requireAdmin],
            schema: {
                querystring: z.object({
                    query: z.string().optional(),
                    status: z.enum(['verified', 'pending', 'all']).optional(),
                    page: z.string().optional(),
                    perPage: z.string().optional(),
                    sort: z.string().optional(),
                }),
            },
        },
        toolController.getAdminTools as any,
    );

    // PUT /api/admin/tools/:id - Update tool
    fastify.put(
        '/admin/tools/:id',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({
                    id: z.string(),
                }),
                body: z.object({
                    name: z.string().optional(),
                    slug: z.string().optional(),
                    tagline: z.string().optional(),
                    short_description: z.string().optional(),
                    description: z.string().optional(),
                    website: z.string().url().optional(),
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
                    platforms: z.string().optional(),
                    models_used: z.string().optional(),
                    primary_model: z.string().optional(),
                    integrations: z.array(z.string()).optional(),
                    api_available: z.boolean().optional(),
                    api_docs_url: z.string().optional(),
                    logo_url: z.string().optional(),
                    brand_color_primary: z.string().optional(),
                    brand_color_secondary: z.string().optional(),
                    screenshots: z.string().optional(),
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
        toolController.updateTool as any,
    );

    // DELETE /api/admin/tools/:id - Delete tool
    fastify.delete(
        '/admin/tools/:id',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({
                    id: z.string(),
                }),
            },
        },
        toolController.deleteTool as any,
    );

    // POST /api/admin/tools/fetch-metadata - Auto-fetch metadata
    fastify.post(
        '/admin/tools/fetch-metadata',
        {
            preHandler: [requireAdmin],
            schema: {
                body: z.object({
                    url: z.string().url(),
                }),
            },
        },
        toolController.fetchMetadata as any,
    );

    // POST /api/admin/tools/generate-description - Generate description with AI
    fastify.post(
        '/admin/tools/generate-description',
        {
            preHandler: [requireAdmin],
            schema: {
                body: z.object({
                    name: z.string(),
                    website: z.string().url(),
                    tagline: z.string().optional(),
                    features: z.array(z.string()).optional(),
                }),
            },
        },
        toolController.generateDescription as any,
    );
}
