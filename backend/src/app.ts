import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import authPlugin from './plugins/auth';
import toolRoutes from './routes/tools';
import authRoutes from './routes/auth';

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

    app.register(authPlugin);

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

    app.get('/health', async (request, reply) => {
        return { status: 'ok' };
    });

    return app;
};
