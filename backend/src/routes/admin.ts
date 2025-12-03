import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAdmin } from '../middleware/admin';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    // GET /api/admin/submissions - List all submissions
    fastify.get(
        '/admin/submissions',
        {
            preHandler: [requireAdmin],
            schema: {
                querystring: z.object({
                    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
                    page: z.string().optional(),
                    perPage: z.string().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { status, page = '1', perPage = '20' } = request.query;

            const pageNum = Math.max(1, parseInt(page));
            const take = parseInt(perPage);
            const skip = (pageNum - 1) * take;

            const where: any = {};
            if (status) {
                where.status = status;
            }

            try {
                const [submissions, total] = await Promise.all([
                    prisma.submission.findMany({
                        where,
                        take,
                        skip,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    }),
                    prisma.submission.count({ where }),
                ]);

                return {
                    data: submissions,
                    meta: {
                        total,
                        page: pageNum,
                        perPage: take,
                        totalPages: Math.ceil(total / take),
                    },
                };
            } catch (error) {
                console.error('Error fetching submissions:', error);
                return reply.status(500).send({ error: 'Failed to fetch submissions' });
            }
        }
    );

    // GET /api/admin/submissions/:id - Get single submission
    fastify.get(
        '/admin/submissions/:id',
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
                const submission = await prisma.submission.findUnique({
                    where: { id: parseInt(id) },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                });

                if (!submission) {
                    return reply.status(404).send({ error: 'Submission not found' });
                }

                return submission;
            } catch (error) {
                console.error('Error fetching submission:', error);
                return reply.status(500).send({ error: 'Failed to fetch submission' });
            }
        }
    );

    // POST /api/admin/submissions/:id/approve - Approve submission and create tool
    fastify.post(
        '/admin/submissions/:id/approve',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({
                    id: z.string(),
                }),
                body: z.object({
                    editedToolData: z.any().optional(), // Allows admin to edit before approval
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const { editedToolData } = request.body;

            try {
                const submission = await prisma.submission.findUnique({
                    where: { id: parseInt(id) },
                });

                if (!submission) {
                    return reply.status(404).send({ error: 'Submission not found' });
                }

                if (submission.status !== 'PENDING') {
                    return reply.status(400).send({
                        error: `Submission is already ${submission.status.toLowerCase()}`,
                    });
                }

                // Use edited data if provided, otherwise use original
                const toolData = editedToolData || submission.toolData;

                // Create the tool
                const tool = await prisma.tool.create({
                    data: {
                        name: (toolData as any).name,
                        slug: (toolData as any).slug || (toolData as any).name.toLowerCase().replace(/\s+/g, '-'),
                        description: (toolData as any).description,
                        website: (toolData as any).website,
                        pricing: (toolData as any).pricing || null,
                        platforms: (toolData as any).platforms || [],
                        models_used: (toolData as any).models_used || [],
                        logo_url: (toolData as any).logo_url || null,
                        screenshots: (toolData as any).screenshots || [],
                        verified: true,
                    },
                });

                // Update submission status
                await prisma.submission.update({
                    where: { id: parseInt(id) },
                    data: { status: 'APPROVED' },
                });

                return {
                    message: 'Submission approved and tool created',
                    tool,
                };
            } catch (error: any) {
                console.error('Error approving submission:', error);
                return reply.status(500).send({
                    error: error.message || 'Failed to approve submission',
                });
            }
        }
    );

    // POST /api/admin/submissions/:id/reject - Reject submission
    fastify.post(
        '/admin/submissions/:id/reject',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({
                    id: z.string(),
                }),
                body: z.object({
                    reason: z.string().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const { reason } = request.body;

            try {
                const submission = await prisma.submission.findUnique({
                    where: { id: parseInt(id) },
                });

                if (!submission) {
                    return reply.status(404).send({ error: 'Submission not found' });
                }

                if (submission.status !== 'PENDING') {
                    return reply.status(400).send({
                        error: `Submission is already ${submission.status.toLowerCase()}`,
                    });
                }

                // Update submission status with optional rejection reason
                const updatedSubmission = await prisma.submission.update({
                    where: { id: parseInt(id) },
                    data: {
                        status: 'REJECTED',
                        toolData: {
                            ...(submission.toolData as any),
                            rejectionReason: reason,
                        },
                    },
                });

                return {
                    message: 'Submission rejected',
                    submission: updatedSubmission,
                };
            } catch (error) {
                console.error('Error rejecting submission:', error);
                return reply.status(500).send({ error: 'Failed to reject submission' });
            }
        }
    );
}
