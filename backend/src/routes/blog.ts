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
                    tag: z.string().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { page, perPage, featured, tag } = request.query;
            const take = parseInt(perPage);
            const skip = (parseInt(page) - 1) * take;

            const where: any = { published: true };
            if (featured === 'true') {
                where.featured = true;
            }
            if (tag) {
                where.tags = { some: { slug: tag } };
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
                            tags: { select: { id: true, name: true, slug: true } },
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

    // GET /api/blog/tags - Get all blog tags
    fastify.get('/blog/tags', async (_request, reply) => {
        try {
            const tags = await prisma.blogTag.findMany({
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    _count: { select: { posts: true } },
                },
            });
            return reply.send({ tags });
        } catch (error) {
            console.error('Error fetching blog tags:', error);
            return reply.status(500).send({ error: 'Failed to fetch tags' });
        }
    });

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
                        tags: { select: { id: true, name: true, slug: true } },
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
                    status: z.string().optional(), // 'published', 'draft', 'all'
                    tag: z.string().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { page, perPage, status, tag } = request.query;
            const take = parseInt(perPage);
            const skip = (parseInt(page) - 1) * take;

            const where: any = {};
            if (status === 'published') where.published = true;
            else if (status === 'draft') where.published = false;
            if (tag) where.tags = { some: { slug: tag } };

            try {
                const [posts, total] = await Promise.all([
                    prisma.blogPost.findMany({
                        where,
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
                            updatedAt: true,
                            tags: { select: { id: true, name: true, slug: true } },
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
                console.error('Error fetching admin blog posts:', error);
                return reply.status(500).send({ error: 'Failed to fetch blog posts' });
            }
        }
    );

    // GET /api/admin/blog/:id - Get single post for editing
    fastify.get(
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
                const post = await prisma.blogPost.findUnique({
                    where: { id: parseInt(id) },
                    include: {
                        tags: { select: { id: true, name: true, slug: true } },
                        related_tools: { select: { id: true, name: true, slug: true } },
                    },
                });

                if (!post) {
                    return reply.status(404).send({ error: 'Blog post not found' });
                }

                return reply.send({ post });
            } catch (error) {
                console.error('Error fetching blog post:', error);
                return reply.status(500).send({ error: 'Failed to fetch blog post' });
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
                    cover_image: z.string().optional().nullable(),
                    seo_title: z.string().optional().nullable(),
                    seo_description: z.string().optional().nullable(),
                    author: z.string().optional().nullable(),
                    published: z.boolean().optional().default(false),
                    featured: z.boolean().optional().default(false),
                    read_time: z.number().optional().nullable(),
                    tagIds: z.array(z.number()).optional(),
                    relatedToolIds: z.array(z.number()).optional(),
                }),
            },
        },
        async (request, reply) => {
            const { tagIds, relatedToolIds, ...postData } = request.body;
            const slug = postData.slug || postData.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            try {
                // Calculate read time if not provided (avg 200 words/min)
                const wordCount = postData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
                const calculatedReadTime = Math.ceil(wordCount / 200) || 1;

                const post = await prisma.blogPost.create({
                    data: {
                        ...postData,
                        slug,
                        read_time: postData.read_time || calculatedReadTime,
                        publishedAt: postData.published ? new Date() : null,
                        tags: tagIds?.length
                            ? { connect: tagIds.map(id => ({ id })) }
                            : undefined,
                        related_tools: relatedToolIds?.length
                            ? { connect: relatedToolIds.map(id => ({ id })) }
                            : undefined,
                    },
                    include: {
                        tags: { select: { id: true, name: true, slug: true } },
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
                    excerpt: z.string().optional().nullable(),
                    content: z.string().optional(),
                    cover_image: z.string().optional().nullable(),
                    seo_title: z.string().optional().nullable(),
                    seo_description: z.string().optional().nullable(),
                    author: z.string().optional().nullable(),
                    published: z.boolean().optional(),
                    featured: z.boolean().optional(),
                    read_time: z.number().optional().nullable(),
                    tagIds: z.array(z.number()).optional(),
                    relatedToolIds: z.array(z.number()).optional(),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const { tagIds, relatedToolIds, ...postData } = request.body;

            try {
                // If publishing for first time, set publishedAt
                let publishedAt: Date | null | undefined = undefined;
                if (postData.published === true) {
                    const existing = await prisma.blogPost.findUnique({ where: { id: parseInt(id) } });
                    if (!existing?.publishedAt) {
                        publishedAt = new Date();
                    }
                }

                // Recalculate read time if content changed
                let readTime = postData.read_time;
                if (postData.content && !postData.read_time) {
                    const wordCount = postData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
                    readTime = Math.ceil(wordCount / 200) || 1;
                }

                const post = await prisma.blogPost.update({
                    where: { id: parseInt(id) },
                    data: {
                        ...postData,
                        read_time: readTime,
                        ...(publishedAt && { publishedAt }),
                        ...(tagIds !== undefined && {
                            tags: { set: tagIds.map(id => ({ id })) },
                        }),
                        ...(relatedToolIds !== undefined && {
                            related_tools: { set: relatedToolIds.map(id => ({ id })) },
                        }),
                    },
                    include: {
                        tags: { select: { id: true, name: true, slug: true } },
                    },
                });

                return reply.send({ post });
            } catch (error: any) {
                console.error('Error updating blog post:', error);
                if (error.code === 'P2002') {
                    return reply.status(400).send({ error: 'A post with this slug already exists' });
                }
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

    // ---------------------------------------------------------------
    // TAG MANAGEMENT ROUTES
    // ---------------------------------------------------------------

    // GET /api/admin/blog/tags - List all tags (admin)
    fastify.get(
        '/admin/blog/tags',
        {
            preHandler: [requireAdmin],
        },
        async (_request, reply) => {
            try {
                const tags = await prisma.blogTag.findMany({
                    orderBy: { name: 'asc' },
                    include: {
                        _count: { select: { posts: true } },
                    },
                });
                return reply.send({ tags });
            } catch (error) {
                console.error('Error fetching tags:', error);
                return reply.status(500).send({ error: 'Failed to fetch tags' });
            }
        }
    );

    // POST /api/admin/blog/tags - Create tag
    fastify.post(
        '/admin/blog/tags',
        {
            preHandler: [requireAdmin],
            schema: {
                body: z.object({
                    name: z.string().min(1),
                }),
            },
        },
        async (request, reply) => {
            const { name } = request.body;
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

            try {
                const tag = await prisma.blogTag.create({
                    data: { name, slug },
                });
                return reply.status(201).send({ tag });
            } catch (error: any) {
                console.error('Error creating tag:', error);
                if (error.code === 'P2002') {
                    return reply.status(400).send({ error: 'A tag with this name already exists' });
                }
                return reply.status(500).send({ error: 'Failed to create tag' });
            }
        }
    );

    // PUT /api/admin/blog/tags/:id - Update tag
    fastify.put(
        '/admin/blog/tags/:id',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({ id: z.string() }),
                body: z.object({
                    name: z.string().min(1),
                }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const { name } = request.body;
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

            try {
                const tag = await prisma.blogTag.update({
                    where: { id: parseInt(id) },
                    data: { name, slug },
                });
                return reply.send({ tag });
            } catch (error: any) {
                console.error('Error updating tag:', error);
                if (error.code === 'P2002') {
                    return reply.status(400).send({ error: 'A tag with this name already exists' });
                }
                return reply.status(500).send({ error: 'Failed to update tag' });
            }
        }
    );

    // DELETE /api/admin/blog/tags/:id - Delete tag
    fastify.delete(
        '/admin/blog/tags/:id',
        {
            preHandler: [requireAdmin],
            schema: {
                params: z.object({ id: z.string() }),
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            try {
                await prisma.blogTag.delete({
                    where: { id: parseInt(id) },
                });
                return reply.send({ message: 'Tag deleted successfully' });
            } catch (error) {
                console.error('Error deleting tag:', error);
                return reply.status(500).send({ error: 'Failed to delete tag' });
            }
        }
    );
}
