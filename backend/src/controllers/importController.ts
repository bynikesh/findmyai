// ---------------------------------------------------------------
// importController.ts – Auto-Import API Controllers
// ---------------------------------------------------------------

import { FastifyReply, FastifyRequest } from 'fastify';
import * as importService from '../services/autoImportService';

/** ---------------------------------------------------------------
 * Run full import from all sources
 * --------------------------------------------------------------- */
export async function runFullImport(
    req: FastifyRequest,
    reply: FastifyReply,
) {
    try {
        const results = await importService.runImportAll();

        const summary = {
            totalFetched: results.reduce((sum, r) => sum + r.fetched, 0),
            totalImported: results.reduce((sum, r) => sum + r.imported, 0),
            totalSkipped: results.reduce((sum, r) => sum + r.skipped, 0),
            errors: results.flatMap(r => r.errors),
            details: results,
        };

        return reply.send(summary);
    } catch (error: any) {
        return reply.status(500).send({
            error: 'Import failed',
            message: error.message,
        });
    }
}

/** ---------------------------------------------------------------
 * Run import from specific source
 * --------------------------------------------------------------- */
export async function runSourceImport(
    req: FastifyRequest<{ Params: { source: string } }>,
    reply: FastifyReply,
) {
    const { source } = req.params;

    try {
        let result;

        switch (source) {
            case 'huggingface':
                result = await importService.fetchFromHuggingFace();
                break;
            case 'openrouter':
                result = await importService.fetchFromOpenRouter();
                break;
            case 'rapidapi':
                result = await importService.fetchFromRapidAPI();
                break;
            case 'github_awesome':
                result = await importService.fetchFromGithubAwesome();
                break;
            default:
                return reply.status(400).send({
                    error: 'Invalid source',
                    message: 'Source must be: huggingface, openrouter, rapidapi, or github_awesome',
                });
        }

        return reply.send(result);
    } catch (error: any) {
        return reply.status(500).send({
            error: 'Import failed',
            message: error.message,
        });
    }
}

/** ---------------------------------------------------------------
 * Get import logs
 * --------------------------------------------------------------- */
export async function getImportLogs(
    req: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply,
) {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const logs = await importService.getImportLogs(limit);

        return reply.send({ logs });
    } catch (error: any) {
        return reply.status(500).send({
            error: 'Failed to fetch logs',
            message: error.message,
        });
    }
}

/** ---------------------------------------------------------------
 * Stop running import
 * --------------------------------------------------------------- */
export async function stopImport(
    req: FastifyRequest,
    reply: FastifyReply,
) {
    try {
        importService.stopImport();
        return reply.send({ message: 'Import stop requested' });
    } catch (error: any) {
        return reply.status(500).send({
            error: 'Failed to stop import',
            message: error.message,
        });
    }
}
