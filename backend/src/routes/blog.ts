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

    // GET /api/blog - List published blog posts
    fastify.get(
        '/blog',
        {
            schema: {
                querystring: z.object({
                    page: z.string().optional().default('1'),
                    perPage: z.string().optional().default('10'),
                    featured: z.string().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { page, perPage, featured } = request.query;
            const take = parseInt(perPage);
            const skip = (parseInt(page) - 1) * take;

            const where: any = { published: true };
            if (featured === 'true') {
                where.featured = true;
            }

            try {
                const [posts, total] = await Promise.all([
                    prisma.blogPost.findMany({
                        where,
                        take,
                        skip,
                        orderBy: { publishedAt: 'desc' },
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            excerpt: true,
                            cover_image: true,
                            author: true,
                            read_time: true,
                            featured: true,
                            publishedAt: true,
                        },
                    }),
                    prisma.blogPost.count({ where }),
                ]);

                return reply.send({
                    posts,
                    meta: {
                        total,
                        page: parseInt(page),
                        perPage: take,
                        totalPages: Math.ceil(total / take),
                    },
                });
            } catch (error) {
                console.error('Error fetching blog posts:', error);
                return reply.status(500).send({ error: 'Failed to fetch blog posts' });
            }
        }
    );

    // GET /api/blog/:slug - Get single blog post
    fastify.get(
        '/blog/:slug',
        {
            schema: {
                params: z.object({ slug: z.string() }),
            },
        },
        async (request, reply) => {
            const { slug } = request.params;

            try {
                const post = await prisma.blogPost.findUnique({
                    where: { slug },
                    include: {
                        related_tools: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                short_description: true,
                                logo_url: true,
                                pricing_type: true,
                                verified: true,
                                categories: { select: { name: true, slug: true } },
                            },
                        },
                    },
                });

                if (!post || (!post.published && (request as any).user?.role !== 'ADMIN')) {
                    return reply.status(404).send({ error: 'Blog post not found' });
                }

                return reply.send({ post });
            } catch (error) {
                console.error('Error fetching blog post:', error);
                return reply.status(500).send({ error: 'Failed to fetch blog post' });
            }
        }
    );

    // ---------------------------------------------------------------
    // ADMIN ROUTES
    // ---------------------------------------------------------------

    // GET /api/admin/blog - List all posts (including unpublished)
    fastify.get(
        '/admin/blog',
        {
            preHandler: [requireAdmin],
            schema: {
                querystring: z.object({
                    page: z.string().optional().default('1'),
                    perPage: z.string().optional().default('20'),
                }),
            },
        },
        async (request, reply) => {
            const { page, perPage } = request.query;
            const take = parseInt(perPage);
            const skip = (parseInt(page) - 1) * take;

            try {
                const [posts, total] = await Promise.all([
                    prisma.blogPost.findMany({
                        take,
                        skip,
                        orderBy: { createdAt: 'desc' },
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            excerpt: true,
                            author: true,
                            published: true,
                            featured: true,
                            publishedAt: true,
                            createdAt: true,
                        },
                    }),
                    prisma.blogPost.count(),
                ]);

                return reply.send({
                    posts,
                    meta: {
                        total,
                        page: parseInt(page),
                        perPage: take,
                        totalPages: Math.ceil(total / take),
                    },
                });
            } catch (error) {
                console.error('Error fetching admin blog posts:', error);
                return reply.status(500).send({ error: 'Failed to fetch blog posts' });
            }
        }
    );

    // POST /api/admin/blog - Create blog post
    fastify.post(
        '/admin/blog',
        {
            preHandler: [requireAdmin],
            schema: {
                body: z.object({
                    title: z.string(),
                    slug: z.string().optional(),
                    excerpt: z.string().optional(),
                    content: z.string(),
                    cover_image: z.string().optional(),
                    seo_title: z.string().optional(),
                    seo_description: z.string().optional(),
                    author: z.string().optional(),
                    published: z.boolean().optional().default(false),
                    featured: z.boolean().optional().default(false),
                    read_time: z.number().optional(),
                    relatedToolIds: z.array(z.number()).optional(),
                }),
            },
        },
        async (request, reply) => {
            const { relatedToolIds, ...postData } = request.body;
            const slug = postData.slug || postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            try {
                // Calculate read time if not provided (avg 200 words/min)
                const wordCount = postData.content.split(/\s+/).length;
                const calculatedReadTime = Math.ceil(wordCount / 200);

                const post = await prisma.blogPost.create({
                    data: {
                        ...postData,
                        slug,
                        read_time: postData.read_time || calculatedReadTime,
                        publishedAt: postData.published ? new Date() : null,
                        related_tools: relatedToolIds?.length
                            ? { connect: relatedToolIds.map(id => ({ id })) }
                            : undefined,
                    },
                });

                return reply.status(201).send({ post });
            } catch (error: any) {
                console.error('Error creating blog post:', error);
                if (error.code === 'P2002') {
                    return reply.status(400).send({ error: 'A post with this slug already exists' });
                }
                return reply.status(500).send({ error: 'Failed to create blog post' });
            }
        }
    );

    // PUT /api/admin/blog/:id - Update blog post
    fastify.put(
        '/admin/blog/:id',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({ id: z.string() }),
                body: z.object({
                    title: z.string().optional(),
                    slug: z.string().optional(),
                    excerpt: z.string().optional(),
                    content: z.string().optional(),
                    cover_image: z.string().optional().nullable(),
                    seo_title: z.string().optional().nullable(),
                    seo_description: z.string().optional().nullable(),
                    author: z.string().optional().nullable(),
                    published: z.boolean().optional(),
                    featured: z.boolean().optional(),
                    read_time: z.number().optional().nullable(),
                    relatedToolIds: z.array(z.number()).optional(),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const { relatedToolIds, ...postData } = request.body;

            try {
                // If publishing for first time, set publishedAt
                let publishedAt: Date | null | undefined = undefined;
                if (postData.published === true) {
                    const existing = await prisma.blogPost.findUnique({ where: { id: parseInt(id) } });
                    if (!existing?.publishedAt) {
                        publishedAt = new Date();
                    }
                }

                const post = await prisma.blogPost.update({
                    where: { id: parseInt(id) },
                    data: {
                        ...postData,
                        ...(publishedAt && { publishedAt }),
                        ...(relatedToolIds && {
                            related_tools: { set: relatedToolIds.map(id => ({ id })) },
                        }),
                    },
                });

                return reply.send({ post });
            } catch (error) {
                console.error('Error updating blog post:', error);
                return reply.status(500).send({ error: 'Failed to update blog post' });
            }
        }
    );

    // DELETE /api/admin/blog/:id - Delete blog post
    fastify.delete(
        '/admin/blog/:id',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({ id: z.string() }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            try {
                await prisma.blogPost.delete({
                    where: { id: parseInt(id) },
                });

                return reply.send({ message: 'Blog post deleted successfully' });
            } catch (error) {
                console.error('Error deleting blog post:', error);
                return reply.status(500).send({ error: 'Failed to delete blog post' });
            }
        }
    );
}
