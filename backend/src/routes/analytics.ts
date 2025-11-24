import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAdmin } from '../middleware/admin';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/tools/:id/view - Record a tool view
    fastify.post(
        '/tools/:id/view',
        {
            schema: {
                params: z.object({
                    id: z.string(),
                }),
                body: z.object({
                    sessionId: z.string().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const { sessionId } = request.body;

            try {
                // Create view record
                await prisma.view.create({
                    data: {
                        toolId: parseInt(id),
                        sessionId: sessionId || `anon-${Date.now()}-${Math.random()}`,
                    },
                });

                return { success: true };
            } catch (error) {
                console.error('Error recording view:', error);
                return reply.status(500).send({ error: 'Failed to record view' });
            }
        }
    );

    // GET /api/analytics/overview - Admin analytics overview
    fastify.get(
        '/analytics/overview',
        {
            preHandler: [requireAdmin],
        },
        async (request, reply) => {
            try {
                const now = new Date();
                const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

                // Get total counts
                const [totalTools, totalUsers, totalReviews, totalViews] = await Promise.all([
                    prisma.tool.count(),
                    prisma.user.count(),
                    prisma.review.count(),
                    prisma.view.count(),
                ]);

                // Get new signups (last 7 days)
                const newSignups = await prisma.user.count({
                    where: { createdAt: { gte: last7Days } },
                });

                // Get views last 7 days
                const viewsLast7Days = await prisma.view.count({
                    where: { createdAt: { gte: last7Days } },
                });

                return {
                    totals: {
                        tools: totalTools,
                        users: totalUsers,
                        reviews: totalReviews,
                        views: totalViews,
                    },
                    last7Days: {
                        newSignups,
                        views: viewsLast7Days,
                    },
                };
            } catch (error) {
                console.error('Error fetching analytics overview:', error);
                return reply.status(500).send({ error: 'Failed to fetch analytics' });
            }
        }
    );

    // GET /api/analytics/top-tools - Top tools by views
    fastify.get(
        '/analytics/top-tools',
        {
            preHandler: [requireAdmin],
            schema: {
                querystring: z.object({
                    limit: z.string().optional(),
                    days: z.string().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { limit = '10', days = '7' } = request.query;

            try {
                const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

                // Get view counts grouped by tool
                const viewCounts = await prisma.view.groupBy({
                    by: ['toolId'],
                    where: {
                        createdAt: { gte: daysAgo },
                    },
                    _count: {
                        id: true,
                    },
                    orderBy: {
                        _count: {
                            id: 'desc',
                        },
                    },
                    take: parseInt(limit),
                });

                // Fetch tool details
                const toolIds = viewCounts.map((v: any) => v.toolId);
                const tools = await prisma.tool.findMany({
                    where: { id: { in: toolIds } },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo_url: true,
                        average_rating: true,
                        review_count: true,
                    },
                });

                // Combine data
                const results = viewCounts.map((vc: any) => {
                    const tool = tools.find((t: any) => t.id === vc.toolId);
                    return {
                        ...tool,
                        viewCount: vc._count.id,
                    };
                });

                return results;
            } catch (error) {
                console.error('Error fetching top tools:', error);
                return reply.status(500).send({ error: 'Failed to fetch top tools' });
            }
        }
    );

    // GET /api/analytics/trending - Get trending tools
    fastify.get('/analytics/trending', async (request, reply) => {
        try {
            const trendingTools = await prisma.tool.findMany({
                where: { is_trending: true },
                orderBy: { trending_score: 'desc' },
                take: 10,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    logo_url: true,
                    average_rating: true,
                    review_count: true,
                    trending_score: true,
                },
            });

            return trendingTools;
        } catch (error) {
            console.error('Error fetching trending tools:', error);
            return reply.status(500).send({ error: 'Failed to fetch trending tools' });
        }
    });

    // GET /api/analytics/signups - Signup stats over time
    fastify.get(
        '/analytics/signups',
        {
            preHandler: [requireAdmin],
            schema: {
                querystring: z.object({
                    days: z.string().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { days = '30' } = request.query;

            try {
                const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

                // Get signups grouped by date
                const signups = await prisma.$queryRaw<
                    Array<{ date: Date; count: bigint }>
                >`
                    SELECT DATE(created_at) as date, COUNT(*) as count
                    FROM "User"
                    WHERE created_at >= ${daysAgo}
                    GROUP BY DATE(created_at)
                    ORDER BY date ASC
                `;

                return signups.map((s: any) => ({
                    date: s.date,
                    count: Number(s.count),
                }));
            } catch (error) {
                console.error('Error fetching signup stats:', error);
                return reply.status(500).send({ error: 'Failed to fetch signup stats' });
            }
        }
    );
}
