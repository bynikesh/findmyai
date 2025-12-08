import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAdmin } from '../middleware/admin';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/admin/categories - Create category
    fastify.post(
        '/admin/categories',
        {
            preHandler: [requireAdmin],
            schema: {
                body: z.object({
                    name: z.string(),
                    slug: z.string(),
                    seo_description: z.string().optional().nullable(),
                    featured: z.boolean().optional(),
                }),
            },
        },
        async (request, reply) => {
            try {
                const category = await prisma.category.create({
                    data: request.body as any,
                });
                return category;
            } catch (error: any) {
                console.error('Error creating category:', error);
                return reply.status(500).send({
                    error: error.message || 'Failed to create category',
                });
            }
        }
    );

    // PUT /api/admin/categories/:id - Update category
    fastify.put(
        '/admin/categories/:id',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({
                    id: z.string(),
                }),
                body: z.object({
                    name: z.string().optional(),
                    slug: z.string().optional(),
                    seo_description: z.string().optional().nullable(),
                    featured: z.boolean().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            try {
                const category = await prisma.category.update({
                    where: { id: parseInt(id) },
                    data: request.body as any,
                });
                return category;
            } catch (error: any) {
                console.error('Error updating category:', error);
                return reply.status(500).send({
                    error: error.message || 'Failed to update category',
                });
            }
        }
    );

    // DELETE /api/admin/categories/:id - Delete category
    fastify.delete(
        '/admin/categories/:id',
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
            const categoryId = parseInt(id);

            try {
                // Delete related records first
                await prisma.$transaction([
                    // Delete category views
                    prisma.categoryView.deleteMany({ where: { categoryId } }),
                    // Delete trending category snapshots
                    prisma.trendingCategory.deleteMany({ where: { categoryId } }),
                    // Disconnect tools from this category (don't delete tools)
                    prisma.category.update({
                        where: { id: categoryId },
                        data: { tools: { set: [] } },
                    }),
                    // Delete the category
                    prisma.category.delete({ where: { id: categoryId } }),
                ]);
                return { message: 'Category deleted successfully' };
            } catch (error: any) {
                console.error('Error deleting category:', error);
                return reply.status(500).send({
                    error: error.message || 'Failed to delete category',
                });
            }
        }
    );
}
