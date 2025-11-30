import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../lib/prisma';
import { z } from 'zod';

export const getTools = async (
    request: FastifyRequest<{
        Querystring: {
            query?: string;
            search?: string;
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
    const { query, search, category, tags, pricing, platform, model, sort, page = '1', perPage = '10' } = request.query;

    const take = parseInt(perPage);
    const skip = (parseInt(page) - 1) * take;

    const where: any = {
        verified: true,
    };

    const searchQuery = search || query;

    if (searchQuery) {
        where.OR = [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { tags: { some: { name: { contains: searchQuery, mode: 'insensitive' } } } },
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
        // Case-insensitive check for pricing type
        where.pricing_type = { equals: pricing, mode: 'insensitive' };
    }

    if (platform) {
        where.platforms = { has: platform };
    }

    if (model) {
        where.models_used = { has: model };
    }

    const orderBy: any = {};
    if (sort === 'popular') {
        orderBy.trending_score = 'desc';
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

export const getTrendingTools = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const trendingTools = await prisma.tool.findMany({
            where: { is_trending: true },
            orderBy: { trending_score: 'desc' },
            take: 5, // Limit to 5 as requested
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                logo_url: true,
                average_rating: true,
                review_count: true,
                trending_score: true,
                categories: {
                    select: {
                        name: true,
                        slug: true
                    },
                    take: 1
                }
            },
        });

        return trendingTools;
    } catch (error) {
        console.error('Error fetching trending tools:', error);
        return reply.status(500).send({ message: 'Failed to fetch trending tools' });
    }
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

    // Helper to split string to array
    const splitToArray = (val: any) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    };

    const dataToSave = {
        ...toolData,
        platforms: splitToArray(toolData.platforms),
        models_used: splitToArray(toolData.models_used),
        screenshots: splitToArray(toolData.screenshots),
        categories: categoryIds?.length > 0 ? {
            connect: categoryIds.map((id: number) => ({ id }))
        } : undefined,
    };

    const tool = await prisma.tool.create({
        data: dataToSave,
        include: {
            categories: true,
            tags: true,
        },
    });
    return tool;
};

export const updateTool = async (
    request: FastifyRequest<{ Params: { id: string }; Body: any }>,
    reply: FastifyReply,
) => {
    const { id } = request.params;
    const body = request.body as any;
    const { categoryIds, ...toolData } = body;

    // Helper to split string to array
    const splitToArray = (val: any) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
        return undefined; // Return undefined if not provided to avoid overwriting with empty array
    };

    try {
        const dataToUpdate: any = {
            ...toolData,
            categories: categoryIds ? {
                set: categoryIds.map((catId: number) => ({ id: catId }))
            } : undefined,
        };

        if (toolData.platforms !== undefined) dataToUpdate.platforms = splitToArray(toolData.platforms) || [];
        if (toolData.models_used !== undefined) dataToUpdate.models_used = splitToArray(toolData.models_used) || [];
        if (toolData.screenshots !== undefined) dataToUpdate.screenshots = splitToArray(toolData.screenshots) || [];

        const tool = await prisma.tool.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
            include: {
                categories: true,
                tags: true,
            },
        });
        return tool;
    } catch (error) {
        console.error('Error updating tool:', error);
        return reply.status(500).send({ message: 'Failed to update tool' });
    }
};

export const deleteTool = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    const { id } = request.params;

    try {
        await prisma.tool.delete({
            where: { id: parseInt(id) },
        });
        return { message: 'Tool deleted successfully' };
    } catch (error) {
        return reply.status(500).send({ message: 'Failed to delete tool', error });
    }
};

import * as cheerio from 'cheerio';

export const fetchMetadata = async (request: FastifyRequest, reply: FastifyReply) => {
    const { url } = request.body as { url: string };
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content') || '';
        const icon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '';

        const resolveUrl = (rel: string) => {
            try {
                return new URL(rel, url).toString();
            } catch {
                return rel;
            }
        };

        return reply.send({
            title: title.trim(),
            description: description.trim(),
            image: image ? resolveUrl(image) : '',
            icon: icon ? resolveUrl(icon) : '',
        });
    } catch (error) {
        return reply.status(500).send({ message: 'Failed to fetch metadata', error });
    }
};

import { generateToolDescription } from '../lib/claude';

export const generateDescription = async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, website, tagline, features } = request.body as {
        name: string;
        website: string;
        tagline?: string;
        features?: string[];
    };

    try {
        const descriptionData = await generateToolDescription({
            name,
            website,
            tagline,
            features,
        });

        return reply.send(descriptionData);
    } catch (error: any) {
        console.error('Error generating description:', error);
        return reply.status(500).send({
            message: 'Failed to generate description',
            error: error.message,
        });
    }
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
