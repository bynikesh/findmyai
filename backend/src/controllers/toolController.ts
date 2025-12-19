import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../lib/prisma';
import { z } from 'zod';
import fetch from 'cross-fetch';

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
            featured?: string;
            trending?: string;
            sort?: 'newest' | 'popular';
            page?: string;
            perPage?: string;
        };
    }>,
    reply: FastifyReply,
) => {
    const { query, search, category, tags, pricing, platform, model, featured, trending, sort, page = '1', perPage = '10' } = request.query;

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
        // Support multi-select pricing filter
        const pricingList = pricing.split(',').map(p => {
            // Basic capitalization strategy to match DB: "free" -> "Free"
            return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
        });
        where.pricing_type = { hasSome: pricingList };
    }

    if (platform) {
        where.platforms = { has: platform };
    }

    if (model) {
        where.models_used = { has: model };
    }

    if (featured === 'true') {
        where.featured = true;
    }

    if (trending === 'true') {
        where.trending = true;
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

export const getAdminTools = async (
    request: FastifyRequest<{
        Querystring: {
            query?: string;
            status?: 'verified' | 'pending' | 'all';
            page?: string;
            perPage?: string;
            sort?: string;
        };
    }>,
    reply: FastifyReply,
) => {
    const { query, status = 'all', page = '1', perPage = '10', sort = 'newest' } = request.query;

    const take = parseInt(perPage);
    const skip = (parseInt(page) - 1) * take;

    const where: any = {};

    if (status === 'verified') {
        where.verified = true;
    } else if (status === 'pending') {
        where.verified = false;
    }

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
        ];
    }

    const orderBy: any = {};
    if (sort === 'oldest') {
        orderBy.createdAt = 'asc';
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

export const getAdminToolById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    const { id } = request.params;
    const tool = await prisma.tool.findUnique({
        where: { id: parseInt(id) },
        include: {
            categories: true,
            jobs: true,
            tasks: true,
            tags: true,
        },
    });

    if (!tool) {
        return reply.status(404).send({ message: 'Tool not found' });
    }

    return tool;
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
    const { categoryIds, jobIds, taskIds, ...toolData } = body;

    // Helper to split string to array
    const splitToArray = (val: any) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    };

    const dataToSave: any = {
        ...toolData,
        platforms: splitToArray(toolData.platforms),
        models_used: splitToArray(toolData.models_used),
        screenshots: splitToArray(toolData.screenshots),
        categories: categoryIds?.length > 0 ? {
            connect: categoryIds.map((id: number) => ({ id }))
        } : undefined,
        jobs: jobIds?.length > 0 ? {
            connect: jobIds.map((id: number) => ({ id }))
        } : undefined,
        tasks: taskIds?.length > 0 ? {
            connect: taskIds.map((id: number) => ({ id }))
        } : undefined,
    };

    const tool = await prisma.tool.create({
        data: dataToSave,
        include: {
            categories: true,
            jobs: true,
            tasks: true,
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
    const { categoryIds, jobIds, taskIds, ...toolData } = body;

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
            jobs: jobIds ? {
                set: jobIds.map((jobId: number) => ({ id: jobId }))
            } : undefined,
            tasks: taskIds ? {
                set: taskIds.map((taskId: number) => ({ id: taskId }))
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
                jobs: true,
                tasks: true,
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
    const toolId = parseInt(id);

    try {
        // Delete related records first (due to foreign key constraints)
        await prisma.$transaction([
            prisma.review.deleteMany({ where: { toolId } }),
            prisma.view.deleteMany({ where: { toolId } }),
            prisma.toolView.deleteMany({ where: { toolId } }),
            prisma.externalClick.deleteMany({ where: { toolId } }),
            prisma.trendingTool.deleteMany({ where: { toolId } }),
            prisma.tool.delete({ where: { id: toolId } }),
        ]);
        return { message: 'Tool deleted successfully' };
    } catch (error: any) {
        console.error('Error deleting tool:', error);
        return reply.status(500).send({ message: 'Failed to delete tool', error: error.message });
    }
};

import { fetchUrlMetadata } from '../services/metadataService';

export const fetchMetadata = async (request: FastifyRequest, reply: FastifyReply) => {
    const { url } = request.body as { url: string };
    try {
        const metadata = await fetchUrlMetadata(url);
        return reply.send(metadata);
    } catch (error) {
        console.error('Metadata fetch error:', error);
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

/**
 * Fetch logo from a website URL
 * Uses multiple strategies: Open Graph, Apple touch icon, link icon, meta images, favicon
 */
export const fetchLogo = async (request: FastifyRequest, reply: FastifyReply) => {
    const { url } = request.body as { url: string };

    try {
        // Fetch the page HTML
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/*,*/*;q=0.8',
            }
        });

        const html = await response.text();
        const urlObj = new URL(url);
        const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;

        const resolveUrl = (relative: string) => {
            try {
                return new URL(relative, url).toString();
            } catch {
                return relative;
            }
        };

        // Try multiple selectors in order of preference
        const selectors = [
            // High-quality logos
            { regex: /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i },
            { regex: /<meta[^>]*property="og:logo"[^>]*content="([^"]+)"/i },
            { regex: /<link[^>]*rel="apple-touch-icon"[^>]*href="([^"]+)"/i },
            { regex: /<link[^>]*rel="apple-touch-icon-precomposed"[^>]*href="([^"]+)"/i },
            // Standard icons
            { regex: /<link[^>]*rel="icon"[^>]*href="([^"]+)"/i },
            { regex: /<link[^>]*rel="shortcut icon"[^>]*href="([^"]+)"/i },
            // Meta images
            { regex: /<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i },
            { regex: /<meta[^>]*itemprop="image"[^>]*content="([^"]+)"/i },
        ];

        for (const { regex } of selectors) {
            const match = html.match(regex);
            if (match && match[1]) {
                const logoUrl = resolveUrl(match[1]);
                // Prefer larger images (skip small favicons if we can)
                if (!logoUrl.includes('favicon.ico') || selectors.indexOf({ regex }) > 4) {
                    return reply.send({ logo_url: logoUrl });
                }
            }
        }

        // Fallback: try common favicon paths
        const commonPaths = [
            '/apple-touch-icon.png',
            '/apple-touch-icon-180x180.png',
            '/favicon-196.png',
            '/icon-192.png',
            '/favicon-32x32.png',
            '/favicon.ico'
        ];

        for (const path of commonPaths) {
            try {
                const checkUrl = `${baseUrl}${path}`;
                const checkRes = await fetch(checkUrl, { method: 'HEAD' });
                if (checkRes.ok) {
                    return reply.send({ logo_url: checkUrl });
                }
            } catch {
                // Continue to next path
            }
        }

        // Final fallback: Google Favicon service
        const googleFavicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
        return reply.send({ logo_url: googleFavicon });

    } catch (error) {
        console.error('Logo fetch error:', error);
        // Fallback to Google Favicon
        try {
            const urlObj = new URL(url);
            return reply.send({
                logo_url: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`
            });
        } catch {
            return reply.status(500).send({ message: 'Failed to fetch logo' });
        }
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
