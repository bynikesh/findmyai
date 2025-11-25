import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import authPlugin from './plugins/auth';
import toolRoutes from './routes/tools';
import authRoutes from './routes/auth';
import fastifyStatic from '@fastify/static';
import path from 'path';

export const buildApp = () => {
    const app = Fastify({
        logger: true,
    });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.register(cors, {
        origin: '*',
    });

    app.register(rateLimit, {
        max: 100,
        timeWindow: '15 minutes',
    });

    // Health check (Priority 1)
    app.get('/health', async (request, reply) => {
        return { status: 'ok' };
    });

    app.register(authPlugin);

    // API Routes (Priority 2)
    app.register(toolRoutes, { prefix: '/api' });
    app.register(authRoutes, { prefix: '/api' });
    app.register(import('./routes/ai'), { prefix: '/api' });
    app.register(import('./routes/admin'), { prefix: '/api' });
    app.register(import('./routes/toolsAdmin'), { prefix: '/api' });
    app.register(import('./routes/categoriesAdmin'), { prefix: '/api' });
    app.register(import('./routes/reviews'), { prefix: '/api' });
    app.register(import('./routes/uploads'), { prefix: '/api' });
    app.register(import('./routes/analytics'), { prefix: '/api' });
    app.register(import('./routes/ai-seo'), { prefix: '/api' });

    // Static Files (Priority 3)
    app.register(fastifyStatic, {
        root: path.join(__dirname, '../../frontend/dist'),
        prefix: '/',
        wildcard: false, // Don't use wildcard matching to avoid shadowing API
    });

    // SPA Catch-all (Priority 4) - Serve index.html for any non-API routes
    app.setNotFoundHandler((request, reply) => {
        if (request.raw.url?.startsWith('/api')) {
            reply.status(404).send({ error: 'Not Found' });
        } else {
            reply.sendFile('index.html');
        }
    });

    return app;
};
