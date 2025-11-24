import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import prisma from '../lib/prisma';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    // GET /api/tools/:id/reviews - Get reviews for a tool (paginated)
    fastify.get(
        '/tools/:id/reviews',
        {
            schema: {
                params: z.object({
                    id: z.string(),
                }),
                querystring: z.object({
                    page: z.string().optional(),
                    perPage: z.string().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const { page = '1', perPage = '10' } = request.query;

            const take = parseInt(perPage);
            const skip = (parseInt(page) - 1) * take;

            try {
                const [reviews, total] = await Promise.all([
                    prisma.review.findMany({
                        where: { toolId: parseInt(id) },
                        take,
                        skip,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar_url: true,
                                },
                            },
                        },
                    }),
                    prisma.review.count({
                        where: { toolId: parseInt(id) },
                    }),
                ]);

                return {
                    data: reviews,
                    meta: {
                        total,
                        page: parseInt(page),
                        perPage: take,
                        totalPages: Math.ceil(total / take),
                    },
                };
            } catch (error) {
                console.error('Error fetching reviews:', error);
                return reply.status(500).send({ error: 'Failed to fetch reviews' });
            }
        }
    );

    // POST /api/tools/:id/reviews - Create a review (auth required, rate limited)
    fastify.post(
        '/tools/:id/reviews',
        {
            preHandler: [
                async (request, reply) => {
                    // Auth check
                    try {
                        await request.jwtVerify();
                    } catch (error) {
                        return reply.status(401).send({
                            error: 'Authentication required',
                        });
                    }
                },
            ],
            config: {
                // Rate limit: 5 reviews per hour per user
                rateLimit: {
                    max: 5,
                    timeWindow: '1 hour',
                },
            },
            schema: {
                params: z.object({
                    id: z.string(),
                }),
                body: z.object({
                    rating: z.number().min(1).max(5),
                    title: z.string().max(200).optional(),
                    body: z.string().max(2000).optional(),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const { rating, title, body } = request.body;
            const user = request.user as any;

            try {
                // Check if tool exists
                const tool = await prisma.tool.findUnique({
                    where: { id: parseInt(id) },
                });

                if (!tool) {
                    return reply.status(404).send({ error: 'Tool not found' });
                }

                // Check if user already reviewed this tool
                const existingReview = await prisma.review.findFirst({
                    where: {
                        toolId: parseInt(id),
                        userId: user.id,
                    },
                });

                if (existingReview) {
                    return reply.status(400).send({
                        error: 'You have already reviewed this tool',
                    });
                }

                // Create review
                const review = await prisma.review.create({
                    data: {
                        rating,
                        title,
                        body,
                        toolId: parseInt(id),
                        userId: user.id,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar_url: true,
                            },
                        },
                    },
                });

                // Update denormalized average rating and review count
                await updateToolRating(parseInt(id));

                return {
                    message: 'Review created successfully',
                    review,
                };
            } catch (error: any) {
                console.error('Error creating review:', error);
                return reply.status(500).send({
                    error: error.message || 'Failed to create review',
                });
            }
        }
    );

    // DELETE /api/tools/:toolId/reviews/:reviewId - Delete a review (auth required)
    fastify.delete(
        '/tools/:toolId/reviews/:reviewId',
        {
            preHandler: [
                async (request, reply) => {
                    try {
                        await request.jwtVerify();
                    } catch (error) {
                        return reply.status(401).send({
                            error: 'Authentication required',
                        });
                    }
                },
            ],
            schema: {
                params: z.object({
                    toolId: z.string(),
                    reviewId: z.string(),
                }),
            },
        },
        async (request, reply) => {
            const { toolId, reviewId } = request.params;
            const user = request.user as any;

            try {
                const review = await prisma.review.findUnique({
                    where: { id: parseInt(reviewId) },
                });

                if (!review) {
                    return reply.status(404).send({ error: 'Review not found' });
                }

                // Check if user owns the review or is admin
                if (review.userId !== user.id && user.role !== 'ADMIN') {
                    return reply.status(403).send({
                        error: 'You can only delete your own reviews',
                    });
                }

                // Delete review
                await prisma.review.delete({
                    where: { id: parseInt(reviewId) },
                });

                // Update denormalized average rating
                await updateToolRating(parseInt(toolId));

                return { message: 'Review deleted successfully' };
            } catch (error) {
                console.error('Error deleting review:', error);
                return reply.status(500).send({ error: 'Failed to delete review' });
            }
        }
    );
}

/**
 * Helper function to update denormalized average rating and review count
 */
async function updateToolRating(toolId: number) {
    const reviews = await prisma.review.findMany({
        where: { toolId },
        select: { rating: true },
    });

    const reviewCount = reviews.length;
    const averageRating =
        reviewCount > 0
            ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
            : 0;

    await prisma.tool.update({
        where: { id: toolId },
        data: {
            average_rating: averageRating,
            review_count: reviewCount,
        },
    });
}
