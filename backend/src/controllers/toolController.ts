import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../lib/prisma';
import { z } from 'zod';

export const getTools = async (
    request: FastifyRequest<{
        Querystring: {
            query?: string;
            category?: string;
            tags?: string;
            pricing?: string;
            platform?: string;
            model?: string;
            sort?: 'newest' | 'popular';
            page?: string;
            perPage?: string;
        };
    }>,
    reply: FastifyReply,
) => {
    const { query, category, tags, pricing, platform, model, sort, page = '1', perPage = '10' } = request.query;

    const take = parseInt(perPage);
    const skip = (parseInt(page) - 1) * take;

    const where: any = {
        verified: true,
    };

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
        ];
    }

    if (category) {
        where.categories = { some: { slug: category } };
    }

    if (tags) {
        const tagList = tags.split(',');
        where.tags = { some: { name: { in: tagList } } };
    }

    if (pricing) {
        where.pricing = pricing;
    }

    if (platform) {
        where.platforms = { has: platform };
    }

    if (model) {
        where.models_used = { has: model };
    }

    const orderBy: any = {};
    if (sort === 'popular') {
        // Assuming popular means most views or reviews, for now let's use views count if we had it, or just id
        orderBy.id = 'desc';
    } else {
        orderBy.createdAt = 'desc';
    }

    const [tools, total] = await Promise.all([
        prisma.tool.findMany({
            where,
            take,
            skip,
            orderBy,
            include: {
                categories: true,
                tags: true,
            },
        }),
        prisma.tool.count({ where }),
    ]);

    return {
        data: tools,
        meta: {
            total,
            page: parseInt(page),
            perPage: take,
            totalPages: Math.ceil(total / take),
        },
    };
};

export const getToolBySlug = async (
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply,
) => {
    const { slug } = request.params;
    const tool = await prisma.tool.findUnique({
        where: { slug },
        include: {
            categories: true,
            tags: true,
            reviews: {
                include: { user: { select: { name: true, avatar_url: true } } },
            },
        },
    });

    if (!tool) {
        return reply.status(404).send({ message: 'Tool not found' });
    }

    return tool;
};

export const createTool = async (
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply,
) => {
    const body = request.body as any;
    const { categoryIds, ...toolData } = body;

    const tool = await prisma.tool.create({
        data: {
            ...toolData,
            categories: categoryIds?.length > 0 ? {
                connect: categoryIds.map((id: number) => ({ id }))
            } : undefined,
        },
        include: {
            categories: true,
            tags: true,
        },
    });
    return tool;
};

export const createReview = async (
    request: FastifyRequest<{ Params: { id: string }; Body: { rating: number; title?: string; body?: string } }>,
    reply: FastifyReply,
) => {
    const { id } = request.params;
    const { rating, title, body } = request.body;
    const userId = (request.user as any).id;

    const review = await prisma.review.create({
        data: {
            rating,
            title,
            body,
            toolId: parseInt(id),
            userId,
        },
    });

    return review;
};

export const createSubmission = async (
    request: FastifyRequest<{ Body: { submitterName: string; submitterEmail: string; toolData: any } }>,
    reply: FastifyReply,
) => {
    const { submitterName, submitterEmail, toolData } = request.body;

    const submission = await prisma.submission.create({
        data: {
            submitterName,
            submitterEmail,
            toolData,
        },
    });

    return submission;
};
