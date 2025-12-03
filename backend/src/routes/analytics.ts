import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import * as ctrl from '../controllers/analyticsController';
import { requireAdmin } from '../middleware/admin';

export default async function (app: FastifyInstance) {
    const fastify = app.withTypeProvider<ZodTypeProvider>();

    // Public Tracking Routes
    fastify.post('/analytics/track/tool-view', { schema: { body: z.object({ toolId: z.number() }) } }, ctrl.trackToolView);
    fastify.post('/analytics/track/external-click', { schema: { body: z.object({ toolId: z.number(), source: z.string().optional() }) } }, ctrl.trackExternalClick);
    fastify.post('/analytics/track/category-view', { schema: { body: z.object({ categoryId: z.number() }) } }, ctrl.trackCategoryView);
    fastify.post('/analytics/track/submission', { schema: { body: z.object({ submissionId: z.number() }) } }, ctrl.trackSubmissionEvent);

    // Admin Analytics Routes
    fastify.register(async (adminRoutes) => {
        adminRoutes.addHook('preHandler', requireAdmin);

        adminRoutes.get('/analytics/overview', ctrl.getAnalyticsOverview);
        adminRoutes.get('/analytics/top-tools', { schema: { querystring: z.object({ limit: z.string().optional(), start: z.string().optional(), end: z.string().optional(), days: z.string().optional() }) } }, ctrl.getTopTools);
        adminRoutes.get('/analytics/categories', { schema: { querystring: z.object({ limit: z.string().optional(), start: z.string().optional(), end: z.string().optional(), days: z.string().optional() }) } }, ctrl.getTopCategories);
        adminRoutes.get('/analytics/clicks', { schema: { querystring: z.object({ limit: z.string().optional(), start: z.string().optional(), end: z.string().optional(), days: z.string().optional() }) } }, ctrl.getExternalClicks);

        adminRoutes.get('/analytics/daily-trend', { schema: { querystring: z.object({ days: z.string().optional() }) } }, ctrl.getDailyTrend);
        adminRoutes.get('/analytics/daily-clicks', { schema: { querystring: z.object({ days: z.string().optional() }) } }, ctrl.getDailyClicks);

        adminRoutes.get('/analytics/submissions', { schema: { querystring: z.object({ days: z.string().optional() }) } }, ctrl.getSubmissionStats);
        adminRoutes.get('/analytics/submissions/detailed', { schema: { querystring: z.object({ days: z.string().optional() }) } }, ctrl.getSubmissionStatsDetailed);

        adminRoutes.get('/analytics/trending-tools', ctrl.getTrendingToolsSnapshot);
        adminRoutes.get('/analytics/trending-categories', ctrl.getTrendingCategoriesSnapshot);
    });
}
