// ---------------------------------------------------------------
// import.ts – Auto-Import Routes
// ---------------------------------------------------------------

import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import * as ctrl from '../controllers/importController';
import { requireAdmin } from '../middleware/admin';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    // All import routes require admin authentication
    fastify.register(async (adminRoutes) => {
        adminRoutes.addHook('preHandler', requireAdmin);

        // Run full import from all sources
        adminRoutes.post('/import/run', ctrl.runFullImport);

        // Stop import
        adminRoutes.post('/import/stop', ctrl.stopImport);

        // Run import from specific source
        adminRoutes.post(
            '/import/run/:source',
            {
                schema: {
                    params: z.object({
                        source: z.enum(['huggingface', 'openrouter', 'rapidapi']),
                    }),
                },
            },
            ctrl.runSourceImport,
        );

        // Get import logs
        adminRoutes.get(
            '/import/logs',
            {
                schema: {
                    querystring: z.object({
                        limit: z.string().optional(),
                    }),
                },
            },
            ctrl.getImportLogs,
        );
    });
}
