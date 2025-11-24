import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { getRedisClient } from '../lib/redis';
import { generateToolSummary, generateToolComparison, generateChatResponse } from '../lib/claude';

const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    // ========================================================================
    // POST /api/ai/summary - Generate AI summary with caching
    // ========================================================================
    fastify.post(
        '/ai/summary',
        {
            schema: {
                body: z.object({
                    toolId: z.number().optional(),
                    toolData: z
                        .object({
                            name: z.string(),
                            description: z.string(),
                            features: z.array(z.string()).optional(),
                        })
                        .optional(),
                }),
            },
        },
        async (request, reply) => {
            const { toolId, toolData } = request.body;

            if (!toolId && !toolData) {
                return reply.status(400).send({
                    error: 'Either toolId or toolData must be provided',
                });
            }

            try {
                let cacheKey: string;
                let data = toolData;

                if (toolId) {
                    cacheKey = `ai:summary:tool:${toolId}`;

                    const redis = getRedisClient();
                    if (redis) {
                        const cached = await redis.get(cacheKey);
                        if (cached) {
                            return JSON.parse(cached);
                        }
                    }

                    const tool = await prisma.tool.findUnique({
                        where: { id: toolId },
                        select: {
                            name: true,
                            description: true,
                        },
                    });

                    if (!tool) {
                        return reply.status(404).send({ error: 'Tool not found' });
                    }

                    data = {
                        name: tool.name,
                        description: tool.description,
                    };
                } else {
                    cacheKey = `ai:summary:data:${Buffer.from(
                        JSON.stringify(toolData)
                    ).toString('base64')}`;

                    const redis = getRedisClient();
                    if (redis) {
                        const cached = await redis.get(cacheKey);
                        if (cached) {
                            return JSON.parse(cached);
                        }
                    }
                }

                const result = await generateToolSummary({ toolData: data });

                const redis = getRedisClient();
                if (redis) {
                    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
                }

                return result;
            } catch (error: any) {
                console.error('Error generating AI summary:', error);
                return reply.status(500).send({
                    error: error.message || 'Failed to generate AI summary',
                });
            }
        }
    );

    // ========================================================================
    // POST /api/ai/compare - Generate side-by-side tool comparison
    // ========================================================================
    fastify.post(
        '/ai/compare',
        {
            schema: {
                body: z.object({
                    toolIds: z.array(z.number()).min(2).max(5),
                    focus: z.string().optional(),
                }),
            },
        },
        async (request, reply) => {
            const { toolIds, focus } = request.body;

            try {
                const sortedIds = [...toolIds].sort((a, b) => a - b);
                const cacheKey = `ai:compare:${sortedIds.join('-')}:${focus || 'general'}`;

                const redis = getRedisClient();
                if (redis) {
                    const cached = await redis.get(cacheKey);
                    if (cached) {
                        return JSON.parse(cached);
                    }
                }

                const tools = await prisma.tool.findMany({
                    where: {
                        id: { in: toolIds },
                    },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        pricing: true,
                        website: true,
                        platforms: true,
                        models_used: true,
                    },
                });

                if (tools.length !== toolIds.length) {
                    const foundIds = tools.map((t: any) => t.id);
                    const missing = toolIds.filter(id => !foundIds.includes(id));
                    return reply.status(404).send({
                        error: `Tools not found: ${missing.join(', ')}`,
                    });
                }

                const sortedTools = toolIds.map(id => tools.find((t: any) => t.id === id)!);

                const result = await generateToolComparison(
                    { toolIds, focus },
                    sortedTools as any
                );

                if (redis) {
                    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
                }

                return result;
            } catch (error: any) {
                console.error('Error generating tool comparison:', error);
                return reply.status(500).send({
                    error: error.message || 'Failed to generate comparison',
                });
            }
        }
    );

    // ========================================================================
    // POST /api/ai/chat - Conversational assistant for tool recommendations
    // ========================================================================
    fastify.post(
        '/ai/chat',
        {
            schema: {
                body: z.object({
                    sessionId: z.string(),
                    messages: z.array(
                        z.object({
                            role: z.enum(['user', 'assistant']),
                            content: z.string(),
                        })
                    ),
                    userProfile: z
                        .object({
                            industry: z.string().optional(),
                            teamSize: z.string().optional(),
                            budget: z.string().optional(),
                        })
                        .optional(),
                }),
            },
        },
        async (request, reply) => {
            const { sessionId, messages, userProfile } = request.body;

            try {
                const cacheKey = `ai:chat:${sessionId}:${messages.length}`;

                const redis = getRedisClient();
                if (redis) {
                    const cached = await redis.get(cacheKey);
                    if (cached) {
                        return JSON.parse(cached);
                    }
                }

                const tools = await prisma.tool.findMany({
                    where: { verified: true },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        pricing: true,
                        categories: {
                            select: { name: true },
                        },
                    },
                    take: 50,
                    orderBy: { createdAt: 'desc' },
                });

                const result = await generateChatResponse(
                    { sessionId, messages, userProfile },
                    tools
                );

                if (redis) {
                    await redis.setex(cacheKey, 60 * 60, JSON.stringify(result));
                }

                return result;
            } catch (error: any) {
                console.error('Error generating chat response:', error);
                return reply.status(500).send({
                    error: error.message || 'Failed to generate chat response',
                });
            }
        }
    );

    // ========================================================================
    // Legacy GET endpoint (kept for backward compatibility)
    // ========================================================================
    fastify.get(
        '/ai/summary',
        {
            schema: {
                querystring: z.object({
                    toolId: z.string(),
                }),
            },
        },
        async (request, reply) => {
            const { toolId } = request.query;

            await new Promise((resolve) => setTimeout(resolve, 1000));

            return {
                summary: `This is a placeholder summary for tool ID ${toolId}. Configure ANTHROPIC_API_KEY to enable AI-powered summaries.`,
            };
        }
    );
}
