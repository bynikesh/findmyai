import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

interface GoogleUserPayload {
    email: string;
    name: string;
    picture: string;
    sub: string; // Google ID
}

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
            provider: 'email',
        },
    });

    const token = await reply.jwtSign({ id: user.id, email: user.email, role: user.role, name: user.name });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar_url: user.avatar_url,
        }
    };
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

    // Check if this is an OAuth user (no password)
    if (!user.passwordHash) {
        return reply.status(401).send({
            message: 'This account uses Google Sign-In. Please use the Google login button.',
            provider: user.provider
        });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        return reply.status(401).send({ message: 'Invalid credentials' });
    }

    const token = await reply.jwtSign({ id: user.id, email: user.email, role: user.role, name: user.name });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar_url: user.avatar_url,
        }
    };
};

export const googleAuth = async (
    request: FastifyRequest<{ Body: { credential: string } }>,
    reply: FastifyReply,
) => {
    const { credential } = request.body;

    try {
        // Decode the Google ID token (base64 encoded)
        // The credential is a JWT from Google Sign-In
        const parts = credential.split('.');
        if (parts.length !== 3) {
            return reply.status(400).send({ message: 'Invalid Google credential' });
        }

        const payload: GoogleUserPayload = JSON.parse(
            Buffer.from(parts[1], 'base64').toString('utf-8')
        );

        const { email, name, picture, sub: googleId } = payload;

        // Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            // Update existing user with Google info if not already linked
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId,
                        avatar_url: user.avatar_url || picture,
                        provider: user.provider || 'google',
                    },
                });
            }
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    googleId,
                    avatar_url: picture,
                    provider: 'google',
                },
            });
        }

        const token = await reply.jwtSign({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar_url: user.avatar_url,
            }
        };
    } catch (error) {
        console.error('Google auth error:', error);
        return reply.status(401).send({ message: 'Invalid Google credential' });
    }
};

export const me = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const userId = (request.user as { id: number }).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return reply.status(404).send({ message: 'User not found' });

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url,
    };
};
