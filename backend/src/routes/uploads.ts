import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { generateSignedUploadUrl, validateUpload } from '../lib/s3';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/uploads/sign - Generate signed upload URL
    fastify.post(
        '/uploads/sign',
        {
            preHandler: [
                async (request, reply) => {
                    // Optional auth - can be made required if needed
                    try {
                        await request.jwtVerify();
                    } catch (error) {
                        // Allow unauthenticated uploads but log warning
                        console.warn('Unauthenticated upload request');
                    }
                },
            ],
            config: {
                rateLimit: {
                    max: 10,
                    timeWindow: '1 minute',
                },
            },
            schema: {
                body: z.object({
                    fileName: z.string().min(1).max(255),
                    fileType: z.string(),
                    fileSize: z.number().positive(),
                }),
            },
        },
        async (request, reply) => {
            const { fileName, fileType, fileSize } = request.body;
            const user = request.user as any;

            try {
                // Validate upload request
                const validationError = validateUpload({
                    fileName,
                    fileType,
                    fileSize,
                });

                if (validationError) {
                    return reply.status(400).send({ error: validationError });
                }

                // Generate signed URL
                const result = await generateSignedUploadUrl(
                    { fileName, fileType, fileSize },
                    user?.id
                );

                return {
                    success: true,
                    data: {
                        uploadUrl: result.uploadUrl,
                        fileKey: result.fileKey,
                        fileUrl: result.fileUrl,
                    },
                    instructions: {
                        method: 'PUT',
                        headers: {
                            'Content-Type': fileType,
                        },
                        note: 'Use the uploadUrl to PUT your file directly. The URL expires in 15 minutes.',
                    },
                };
            } catch (error: any) {
                console.error('Error generating signed URL:', error);

                // Check if S3 credentials are missing
                if (error.message?.includes('Missing credentials')) {
                    return reply.status(503).send({
                        error: 'Upload service is not configured. Please contact the administrator.',
                    });
                }

                return reply.status(500).send({
                    error: error.message || 'Failed to generate upload URL',
                });
            }
        }
    );

    // GET /api/uploads/config - Get upload configuration (public)
    fastify.get('/uploads/config', async (request, reply) => {
        return {
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/webp',
                'image/gif',
            ],
            allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        };
    });
}
