// ---------------------------------------------------------------
// jobsTasksRoutes.ts – Jobs and Tasks API Routes
// ---------------------------------------------------------------

import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAdmin } from '../middleware/admin';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    // ---------------------------------------------------------------
    // PUBLIC ROUTES
    // ---------------------------------------------------------------

    // GET /api/jobs - List all jobs
    fastify.get('/jobs', async (request, reply) => {
        try {
            const jobs = await prisma.job.findMany({
                orderBy: { name: 'asc' },
                include: {
                    _count: { select: { tools: true } }
                }
            });
            return reply.send({ jobs });
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return reply.status(500).send({ error: 'Failed to fetch jobs' });
        }
    });

    // GET /api/jobs/:slug - Get job with tools
    fastify.get(
        '/jobs/:slug',
        {
            schema: {
                params: z.object({ slug: z.string() }),
                querystring: z.object({
                    page: z.string().optional(),
                    perPage: z.string().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { slug } = request.params;
            const { page = '1', perPage = '20' } = request.query;

            const take = parseInt(perPage);
            const skip = (parseInt(page) - 1) * take;

            try {
                const job = await prisma.job.findUnique({
                    where: { slug },
                });

                if (!job) {
                    return reply.status(404).send({ error: 'Job not found' });
                }

                const [tools, total] = await Promise.all([
                    prisma.tool.findMany({
                        where: {
                            jobs: { some: { id: job.id } },
                            verified: true,
                        },
                        take,
                        skip,
                        orderBy: { trending_score: 'desc' },
                        include: {
                            categories: true,
                            jobs: true,
                            tasks: true,
                        },
                    }),
                    prisma.tool.count({
                        where: {
                            jobs: { some: { id: job.id } },
                            verified: true,
                        },
                    }),
                ]);

                return reply.send({
                    job,
                    tools,
                    meta: {
                        total,
                        page: parseInt(page),
                        perPage: take,
                        totalPages: Math.ceil(total / take),
                    },
                });
            } catch (error) {
                console.error('Error fetching job:', error);
                return reply.status(500).send({ error: 'Failed to fetch job' });
            }
        }
    );

    // GET /api/tasks - List all tasks
    fastify.get('/tasks', async (request, reply) => {
        try {
            const tasks = await prisma.task.findMany({
                orderBy: { name: 'asc' },
                include: {
                    _count: { select: { tools: true } }
                }
            });
            return reply.send({ tasks });
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return reply.status(500).send({ error: 'Failed to fetch tasks' });
        }
    });

    // GET /api/tasks/:slug - Get task with tools
    fastify.get(
        '/tasks/:slug',
        {
            schema: {
                params: z.object({ slug: z.string() }),
                querystring: z.object({
                    page: z.string().optional(),
                    perPage: z.string().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { slug } = request.params;
            const { page = '1', perPage = '20' } = request.query;

            const take = parseInt(perPage);
            const skip = (parseInt(page) - 1) * take;

            try {
                const task = await prisma.task.findUnique({
                    where: { slug },
                });

                if (!task) {
                    return reply.status(404).send({ error: 'Task not found' });
                }

                const [tools, total] = await Promise.all([
                    prisma.tool.findMany({
                        where: {
                            tasks: { some: { id: task.id } },
                            verified: true,
                        },
                        take,
                        skip,
                        orderBy: { trending_score: 'desc' },
                        include: {
                            categories: true,
                            jobs: true,
                            tasks: true,
                        },
                    }),
                    prisma.tool.count({
                        where: {
                            tasks: { some: { id: task.id } },
                            verified: true,
                        },
                    }),
                ]);

                return reply.send({
                    task,
                    tools,
                    meta: {
                        total,
                        page: parseInt(page),
                        perPage: take,
                        totalPages: Math.ceil(total / take),
                    },
                });
            } catch (error) {
                console.error('Error fetching task:', error);
                return reply.status(500).send({ error: 'Failed to fetch task' });
            }
        }
    );

    // ---------------------------------------------------------------
    // ADMIN ROUTES
    // ---------------------------------------------------------------

    // POST /api/admin/jobs - Create job
    fastify.post(
        '/admin/jobs',
        {
            preHandler: [requireAdmin],
            schema: {
                body: z.object({
                    name: z.string(),
                    slug: z.string().optional(),
                    description: z.string().optional(),
                    icon: z.string().optional(),
                    featured: z.boolean().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { name, slug, description, icon, featured } = request.body;
            const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            try {
                const job = await prisma.job.create({
                    data: { name, slug: finalSlug, description, icon, featured },
                });
                return reply.status(201).send({ job });
            } catch (error) {
                console.error('Error creating job:', error);
                return reply.status(500).send({ error: 'Failed to create job' });
            }
        }
    );

    // POST /api/admin/tasks - Create task
    fastify.post(
        '/admin/tasks',
        {
            preHandler: [requireAdmin],
            schema: {
                body: z.object({
                    name: z.string(),
                    slug: z.string().optional(),
                    description: z.string().optional(),
                    icon: z.string().optional(),
                    featured: z.boolean().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { name, slug, description, icon, featured } = request.body;
            const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            try {
                const task = await prisma.task.create({
                    data: { name, slug: finalSlug, description, icon, featured },
                });
                return reply.status(201).send({ task });
            } catch (error) {
                console.error('Error creating task:', error);
                return reply.status(500).send({ error: 'Failed to create task' });
            }
        }
    );

    // PUT /api/admin/tools/:id/categorize - Categorize tool with jobs/tasks
    fastify.put(
        '/admin/tools/:id/categorize',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({ id: z.string() }),
                body: z.object({
                    jobIds: z.array(z.number()).optional(),
                    taskIds: z.array(z.number()).optional(),
                    categoryIds: z.array(z.number()).optional(),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const { jobIds, taskIds, categoryIds } = request.body;

            try {
                const tool = await prisma.tool.update({
                    where: { id: parseInt(id) },
                    data: {
                        ...(jobIds && { jobs: { set: jobIds.map(id => ({ id })) } }),
                        ...(taskIds && { tasks: { set: taskIds.map(id => ({ id })) } }),
                        ...(categoryIds && { categories: { set: categoryIds.map(id => ({ id })) } }),
                    },
                    include: {
                        categories: true,
                        jobs: true,
                        tasks: true,
                    },
                });
                return reply.send({ tool });
            } catch (error) {
                console.error('Error categorizing tool:', error);
                return reply.status(500).send({ error: 'Failed to categorize tool' });
            }
        }
    );

    // PUT /api/admin/jobs/:id - Update job
    fastify.put(
        '/admin/jobs/:id',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({ id: z.string() }),
                body: z.object({
                    name: z.string().optional(),
                    slug: z.string().optional(),
                    description: z.string().optional(),
                    icon: z.string().optional(),
                    featured: z.boolean().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            try {
                const job = await prisma.job.update({
                    where: { id: parseInt(id) },
                    data: request.body as any,
                    include: { _count: { select: { tools: true } } },
                });
                return reply.send({ job });
            } catch (error) {
                console.error('Error updating job:', error);
                return reply.status(500).send({ error: 'Failed to update job' });
            }
        }
    );

    // DELETE /api/admin/jobs/:id - Delete job
    fastify.delete(
        '/admin/jobs/:id',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({ id: z.string() }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const jobId = parseInt(id);

            try {
                // Disconnect tools first, then delete
                await prisma.$transaction([
                    prisma.job.update({
                        where: { id: jobId },
                        data: { tools: { set: [] } },
                    }),
                    prisma.job.delete({ where: { id: jobId } }),
                ]);
                return reply.send({ message: 'Job deleted successfully' });
            } catch (error) {
                console.error('Error deleting job:', error);
                return reply.status(500).send({ error: 'Failed to delete job' });
            }
        }
    );

    // PUT /api/admin/tasks/:id - Update task
    fastify.put(
        '/admin/tasks/:id',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({ id: z.string() }),
                body: z.object({
                    name: z.string().optional(),
                    slug: z.string().optional(),
                    description: z.string().optional(),
                    icon: z.string().optional(),
                    featured: z.boolean().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            try {
                const task = await prisma.task.update({
                    where: { id: parseInt(id) },
                    data: request.body as any,
                    include: { _count: { select: { tools: true } } },
                });
                return reply.send({ task });
            } catch (error) {
                console.error('Error updating task:', error);
                return reply.status(500).send({ error: 'Failed to update task' });
            }
        }
    );

    // DELETE /api/admin/tasks/:id - Delete task
    fastify.delete(
        '/admin/tasks/:id',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({ id: z.string() }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const taskId = parseInt(id);

            try {
                // Disconnect tools first, then delete
                await prisma.$transaction([
                    prisma.task.update({
                        where: { id: taskId },
                        data: { tools: { set: [] } },
                    }),
                    prisma.task.delete({ where: { id: taskId } }),
                ]);
                return reply.send({ message: 'Task deleted successfully' });
            } catch (error) {
                console.error('Error deleting task:', error);
                return reply.status(500).send({ error: 'Failed to delete task' });
            }
        }
    );
}
