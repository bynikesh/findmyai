import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import prisma from '../lib/prisma';

interface JwtPayload {
    id: number;
    email: string;
    role: string;
}

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    // Get current user's favorites
    fastify.get(
        '/favorites',
        {
            onRequest: [app.authenticate],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const userId = (request.user as JwtPayload).id;

            const favorites = await prisma.favorite.findMany({
                where: { userId },
                include: {
                    tool: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            short_description: true,
                            logo_url: true,
                            pricing_type: true,
                            average_rating: true,
                            categories: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            return {
                favorites: favorites.map((f) => ({
                    id: f.id,
                    toolId: f.toolId,
                    createdAt: f.createdAt,
                    tool: f.tool,
                })),
            };
        },
    );

    // Get favorite IDs only (for quick lookup)
    fastify.get(
        '/favorites/ids',
        {
            onRequest: [app.authenticate],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const userId = (request.user as JwtPayload).id;

            const favorites = await prisma.favorite.findMany({
                where: { userId },
                select: { toolId: true },
            });

            return {
                favoriteIds: favorites.map((f) => f.toolId),
            };
        },
    );

    // Add a tool to favorites
    fastify.post(
        '/favorites/:toolId',
        {
            onRequest: [app.authenticate],
            schema: {
                params: z.object({
                    toolId: z.string().transform((val) => parseInt(val, 10)),
                }),
            },
        },
        async (request: FastifyRequest<{ Params: { toolId: number } }>, reply: FastifyReply) => {
            const userId = (request.user as JwtPayload).id;
            const { toolId } = request.params;

            // Check if tool exists
            const tool = await prisma.tool.findUnique({
                where: { id: toolId },
            });

            if (!tool) {
                return reply.status(404).send({ message: 'Tool not found' });
            }

            // Check if already favorited
            const existing = await prisma.favorite.findUnique({
                where: {
                    userId_toolId: { userId, toolId },
                },
            });

            if (existing) {
                return reply.status(409).send({ message: 'Tool already in favorites' });
            }

            const favorite = await prisma.favorite.create({
                data: { userId, toolId },
            });

            return { message: 'Added to favorites', favorite };
        },
    );

    // Remove a tool from favorites
    fastify.delete(
        '/favorites/:toolId',
        {
            onRequest: [app.authenticate],
            schema: {
                params: z.object({
                    toolId: z.string().transform((val) => parseInt(val, 10)),
                }),
            },
        },
        async (request: FastifyRequest<{ Params: { toolId: number } }>, reply: FastifyReply) => {
            const userId = (request.user as JwtPayload).id;
            const { toolId } = request.params;

            const favorite = await prisma.favorite.findUnique({
                where: {
                    userId_toolId: { userId, toolId },
                },
            });

            if (!favorite) {
                return reply.status(404).send({ message: 'Favorite not found' });
            }

            await prisma.favorite.delete({
                where: { id: favorite.id },
            });

            return { message: 'Removed from favorites' };
        },
    );

    // Check if a specific tool is favorited
    fastify.get(
        '/favorites/check/:toolId',
        {
            onRequest: [app.authenticate],
            schema: {
                params: z.object({
                    toolId: z.string().transform((val) => parseInt(val, 10)),
                }),
            },
        },
        async (request: FastifyRequest<{ Params: { toolId: number } }>, reply: FastifyReply) => {
            const userId = (request.user as JwtPayload).id;
            const { toolId } = request.params;

            const favorite = await prisma.favorite.findUnique({
                where: {
                    userId_toolId: { userId, toolId },
                },
            });

            return { isFavorited: !!favorite };
        },
    );
}
