import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { generateSEOContent } from '../lib/claude-seo';
import { requireAdmin } from '../middleware/admin';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/ai/seo - Generate SEO content for category or tool
    fastify.post(
        '/ai/seo',
        {
            preHandler: [requireAdmin], // Only admins can generate SEO content
            schema: {
                body: z.object({
                    toolId: z.number().optional(),
                    categoryId: z.number().optional(),
                    categorySlug: z.string().optional(),
                    saveToDb: z.boolean().optional().default(true),
                }),
            },
        },
        async (request, reply) => {
            const { toolId, categoryId, categorySlug, saveToDb } = request.body;

            try {
                // Validate: must provide either toolId or category identifier
                if (!toolId && !categoryId && !categorySlug) {
                    return reply.status(400).send({
                        error: 'Must provide either toolId, categoryId, or categorySlug',
                    });
                }

                // Fetch category or tool data
                let category = null;
                let tool = null;

                if (categoryId) {
                    category = await prisma.category.findUnique({
                        where: { id: categoryId },
                        include: { tools: { select: { id: true } } },
                    });
                    if (!category) {
                        return reply.status(404).send({ error: 'Category not found' });
                    }
                } else if (categorySlug) {
                    category = await prisma.category.findUnique({
                        where: { slug: categorySlug },
                        include: { tools: { select: { id: true } } },
                    });
                    if (!category) {
                        return reply.status(404).send({ error: 'Category not found' });
                    }
                } else if (toolId) {
                    tool = await prisma.tool.findUnique({
                        where: { id: toolId },
                    });
                    if (!tool) {
                        return reply.status(404).send({ error: 'Tool not found' });
                    }
                }

                // Generate SEO content using Claude
                let seoContent;

                if (category) {
                    seoContent = await generateSEOContent({
                        type: 'category',
                        categoryName: category.name,
                        categorySlug: category.slug,
                        toolCount: category.tools.length,
                    });

                    // Save to database if requested
                    if (saveToDb) {
                        await prisma.category.update({
                            where: { id: category.id },
                            data: {
                                seo_title: seoContent.seo_title,
                                seo_description: seoContent.seo_description,
                                seo_h1: seoContent.seo_h1,
                                seo_content: seoContent.seo_content,
                            },
                        });
                    }
                } else if (tool) {
                    seoContent = await generateSEOContent({
                        type: 'tool',
                        toolName: tool.name,
                        toolDescription: tool.description,
                    });

                    // Note: If you want to save SEO for tools, add those fields to Tool model
                    // For now, we just return the content without saving
                }

                return {
                    success: true,
                    data: seoContent,
                    saved: saveToDb && category !== null,
                    message: saveToDb && category
                        ? 'SEO content generated and saved to database'
                        : 'SEO content generated (not saved)',
                };
            } catch (error: any) {
                console.error('Error generating SEO content:', error);

                if (error.message === 'Claude API not configured') {
                    return reply.status(503).send({
                        error: 'AI service not configured. Please contact administrator.',
                    });
                }

                return reply.status(500).send({
                    error: error.message || 'Failed to generate SEO content',
                });
            }
        }
    );
}
