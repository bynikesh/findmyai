import Fastify from 'fastify';
import cors from '@fastify/cors';

export const buildApp = () => {
    const app = Fastify({
        logger: true,
    });

    app.register(cors, {
        origin: '*', // Configure this for production
    });

    app.get('/', async (request, reply) => {
        return { hello: 'world' };
    });

    app.get('/health', async (request, reply) => {
        return { status: 'ok' };
    });

    return app;
};
