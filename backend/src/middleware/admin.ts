import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Admin authentication middleware
 * Verifies that the user is authenticated and has admin role
 */
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
    try {
        // Verify JWT token
        await request.jwtVerify();

        const user = request.user as any;

        // Check if user has admin role
        if (!user || user.role !== 'ADMIN') {
            return reply.status(403).send({
                error: 'Forbidden: Admin access required',
            });
        }
    } catch (error) {
        return reply.status(401).send({
            error: 'Unauthorized: Valid authentication required',
        });
    }
}
