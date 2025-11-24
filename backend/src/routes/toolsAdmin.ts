import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAdmin } from '../middleware/admin';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

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
                    description: z.string().optional(),
                    website: z.string().url().optional(),
                    pricing: z.string().optional().nullable(),
                    platforms: z.array(z.string()).optional(),
                    models_used: z.array(z.string()).optional(),
                    logo_url: z.string().optional().nullable(),
                    screenshots: z.array(z.string()).optional(),
                    verified: z.boolean().optional(),
                    categoryIds: z.array(z.number()).optional(),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const body = request.body as any;
            const { categoryIds, ...toolData } = body;

            try {
                const tool = await prisma.tool.update({
                    where: { id: parseInt(id) },
                    data: {
                        ...toolData,
                        categories: categoryIds ? {
                            set: categoryIds.map((id: number) => ({ id }))
                        } : undefined,
                    },
                    include: {
                        categories: true,
                        tags: true,
                    },
                });

                return tool;
            } catch (error: any) {
                console.error('Error updating tool:', error);
                return reply.status(500).send({
                    error: error.message || 'Failed to update tool',
                });
            }
        }
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
        async (request, reply) => {
            const { id } = request.params;

            try {
                await prisma.tool.delete({
                    where: { id: parseInt(id) },
                });

                return { message: 'Tool deleted successfully' };
            } catch (error: any) {
                console.error('Error deleting tool:', error);
                return reply.status(500).send({
                    error: error.message || 'Failed to delete tool',
                });
            }
        }
    );
}
