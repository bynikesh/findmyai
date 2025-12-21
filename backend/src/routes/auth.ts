import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import * as authController from '../controllers/authController';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    fastify.post(
        '/auth/register',
        {
            schema: {
                body: z.object({
                    email: z.string().email(),
                    password: z.string().min(6),
                    name: z.string().optional(),
                }),
            },
        },
        authController.register,
    );

    fastify.post(
        '/auth/login',
        {
            schema: {
                body: z.object({
                    email: z.string().email(),
                    password: z.string(),
                }),
            },
        },
        authController.login,
    );

    // Google OAuth endpoint
    fastify.post(
        '/auth/google',
        {
            schema: {
                body: z.object({
                    credential: z.string(),
                }),
            },
        },
        authController.googleAuth,
    );

    fastify.get(
        '/auth/me',
        {
            onRequest: [app.authenticate],
        },
        authController.me,
    );
}

