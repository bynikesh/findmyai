import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const register = async (
    request: FastifyRequest<{ Body: { email: string; password: string; name?: string } }>,
    reply: FastifyReply,
) => {
    const { email, password, name } = request.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return reply.status(400).send({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            name,
        },
    });

    const token = await reply.jwtSign({ id: user.id, email: user.email, role: user.role });

    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
};

export const login = async (
    request: FastifyRequest<{ Body: { email: string; password: string } }>,
    reply: FastifyReply,
) => {
    const { email, password } = request.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return reply.status(401).send({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        return reply.status(401).send({ message: 'Invalid credentials' });
    }

    const token = await reply.jwtSign({ id: user.id, email: user.email, role: user.role });

    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
};

export const me = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const userId = (request.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return reply.status(404).send({ message: 'User not found' });

    return { id: user.id, email: user.email, name: user.name, role: user.role };
};
