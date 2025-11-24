import fp from 'fastify-plugin';
import fastifyJwt, { FastifyJWTOptions } from '@fastify/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';

import { FastifyPluginOptions } from 'fastify';

export default fp<FastifyPluginOptions>(async (fastify, opts) => {
    fastify.register(fastifyJwt, {
        secret: process.env.JWT_SECRET || 'supersecret',
    });

    fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
});

declare module 'fastify' {
    export interface FastifyInstance {
        authenticate: any;
    }
}
