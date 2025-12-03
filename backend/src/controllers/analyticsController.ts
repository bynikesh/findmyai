// ---------------------------------------------------------------
// analyticsController.ts – all analytics endpoints
// ---------------------------------------------------------------
import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../lib/prisma';

/** Helper to parse optional start/end query params */
function parseRange(req: FastifyRequest<{ Querystring: { start?: string; end?: string; days?: string } }>) {
    let start = req.query?.start ? new Date(req.query.start) : undefined;
    const end = req.query?.end ? new Date(req.query.end) : undefined;

    if (!start && req.query?.days) {
        const d = parseInt(req.query.days);
        if (!isNaN(d)) {
            start = new Date();
            start.setDate(start.getDate() - d);
        }
    }
    return { start, end };
}

/** ---------------------------------------------------------------
 * 0️⃣ Analytics Overview (platform totals + last 7 days)
 * --------------------------------------------------------------- */
export async function getAnalyticsOverview(
    req: FastifyRequest,
    reply: FastifyReply,
) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalTools, totalUsers, totalReviews, totalViews, last7DaysViews, last7DaysSignups] = await Promise.all([
        prisma.tool.count(),
        prisma.user.count(),
        prisma.review.count(),
        prisma.toolView.count(),
        prisma.toolView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

    return reply.send({
        totals: {
            tools: totalTools,
            users: totalUsers,
            reviews: totalReviews,
            views: totalViews,
        },
        last7Days: {
            newSignups: last7DaysSignups,
            views: last7DaysViews,
        },
    });
}

/** ---------------------------------------------------------------
 * 1️⃣ Top Tools (by views)
 * --------------------------------------------------------------- */
export async function getTopTools(
    req: FastifyRequest<{
        Querystring: { limit?: string; start?: string; end?: string; days?: string };
    }>,
    reply: FastifyReply,
) {
    const { limit = '10' } = req.query;
    const { start, end } = parseRange(req);
    const where: any = {};
    if (start || end) {
        where.createdAt = {};
        if (start) where.createdAt.gte = start;
        if (end) where.createdAt.lte = end;
    }
    const viewData = await prisma.toolView.groupBy({
        by: ['toolId'],
        where,
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } } as any,
        take: Number(limit),
    } as any);
    const enriched = await Promise.all(
        viewData.map(async d => {
            const tool = await prisma.tool.findUnique({
                where: { id: d.toolId },
                select: { name: true, slug: true, categories: { select: { name: true } } },
            });
            return {
                toolId: d.toolId,
                name: tool?.name ?? '',
                slug: tool?.slug ?? '',
                category: tool?.categories?.[0]?.name ?? '',
                views: (d._count as any)._all,
            };
        }),
    );
    return reply.send({ data: enriched });
}

/** ---------------------------------------------------------------
 * 2️⃣ Top Categories (by views)
 * --------------------------------------------------------------- */
export async function getTopCategories(
    req: FastifyRequest<{
        Querystring: { limit?: string; start?: string; end?: string; days?: string };
    }>,
    reply: FastifyReply,
) {
    const { limit = '5' } = req.query;
    const { start, end } = parseRange(req);
    const where: any = {};
    if (start || end) {
        where.createdAt = {};
        if (start) where.createdAt.gte = start;
        if (end) where.createdAt.lte = end;
    }
    const catData = await prisma.categoryView.groupBy({
        by: ['categoryId'],
        where,
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } } as any,
        take: Number(limit),
    } as any);
    const enriched = await Promise.all(
        catData.map(async d => {
            const cat = await prisma.category.findUnique({
                where: { id: d.categoryId },
                select: { name: true, slug: true },
            });
            return {
                categoryId: d.categoryId,
                name: cat?.name ?? '',
                slug: cat?.slug ?? '',
                views: (d._count as any)._all,
            };
        }),
    );
    return reply.send({ data: enriched });
}

/** ---------------------------------------------------------------
 * 3️⃣ External Clicks (by tool)
 * --------------------------------------------------------------- */
export async function getExternalClicks(
    req: FastifyRequest<{
        Querystring: { limit?: string; start?: string; end?: string; days?: string };
    }>,
    reply: FastifyReply,
) {
    const { limit = '10' } = req.query;
    const { start, end } = parseRange(req);
    const where: any = {};
    if (start || end) {
        where.createdAt = {};
        if (start) where.createdAt.gte = start;
        if (end) where.createdAt.lte = end;
    }
    const clickData = await prisma.externalClick.groupBy({
        by: ['toolId'],
        where,
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } } as any,
        take: Number(limit),
    } as any);
    const enriched = await Promise.all(
        clickData.map(async d => {
            const tool = await prisma.tool.findUnique({
                where: { id: d.toolId },
                select: { name: true, slug: true },
            });
            return {
                toolId: d.toolId,
                name: tool?.name ?? '',
                slug: tool?.slug ?? '',
                clicks: (d._count as any)._all,
            };
        }),
    );
    return reply.send({ data: enriched });
}

/** ---------------------------------------------------------------
 * 4️⃣ Daily Views Trend
 * --------------------------------------------------------------- */
export async function getDailyTrend(
    req: FastifyRequest<{
        Querystring: { days?: string };
    }>,
    reply: FastifyReply,
) {
    const days = Number(req.query.days ?? 30);
    const from = new Date();
    from.setDate(from.getDate() - days + 1);
    const iso = from.toISOString().split('T')[0];
    const rows = await prisma.$queryRaw<
        { date: string; views: number }[]
    >`
    SELECT DATE("createdAt") AS "date", COUNT(*) AS "views"
    FROM "ToolView"
    WHERE DATE("createdAt") >= CAST(${iso} AS DATE)
    GROUP BY DATE("createdAt")
    ORDER BY "date" ASC
  `;
    return reply.send({ data: rows });
}

/** ---------------------------------------------------------------
 * 5️⃣ Daily Clicks Trend
 * --------------------------------------------------------------- */
export async function getDailyClicks(
    req: FastifyRequest<{
        Querystring: { days?: string };
    }>,
    reply: FastifyReply,
) {
    const days = Number(req.query.days ?? 30);
    const from = new Date();
    from.setDate(from.getDate() - days + 1);
    const iso = from.toISOString().split('T')[0];
    const rows = await prisma.$queryRaw<
        { date: string; clicks: number }[]
    >`
    SELECT DATE("createdAt") AS "date", COUNT(*) AS "clicks"
    FROM "ExternalClick"
    WHERE DATE("createdAt") >= CAST(${iso} AS DATE)
    GROUP BY DATE("createdAt")
    ORDER BY "date" ASC
  `;
    return reply.send({ data: rows });
}

/** ---------------------------------------------------------------
 * 6️⃣ Submission Stats (daily counts)
 * --------------------------------------------------------------- */
export async function getSubmissionStats(
    req: FastifyRequest<{
        Querystring: { days?: string };
    }>,
    reply: FastifyReply,
) {
    const days = Number(req.query.days ?? 30);
    const from = new Date();
    from.setDate(from.getDate() - days + 1);
    const iso = from.toISOString().split('T')[0];
    const rows = await prisma.$queryRaw<
        { date: string; count: number }[]
    >`
    SELECT DATE("createdAt") AS "date", COUNT(*) AS "count"
    FROM "Submission"
    WHERE DATE("createdAt") >= CAST(${iso} AS DATE)
    GROUP BY DATE("createdAt")
    ORDER BY "date" ASC
  `;
    return reply.send({ data: rows });
}

/** ---------------------------------------------------------------
 * 7️⃣ Detailed Submission Stats (by status)
 * --------------------------------------------------------------- */
export async function getSubmissionStatsDetailed(
    req: FastifyRequest<{
        Querystring: { days?: string };
    }>,
    reply: FastifyReply,
) {
    const days = Number(req.query.days ?? 30);
    const from = new Date();
    from.setDate(from.getDate() - days + 1);
    const iso = from.toISOString().split('T')[0];
    const rows = await prisma.$queryRaw<
        { date: string; status: string; count: number }[]
    >`
    SELECT DATE("createdAt") AS "date", "status", COUNT(*) AS "count"
    FROM "Submission"
    WHERE DATE("createdAt") >= ${iso}
    GROUP BY DATE("createdAt"), "status"
    ORDER BY "date" ASC
  `;
    // Transform into map date -> { APPROVED, REJECTED, PENDING }
    const map: Record<string, Record<string, number>> = {};
    rows.forEach(r => {
        if (!map[r.date]) map[r.date] = { APPROVED: 0, REJECTED: 0, PENDING: 0 };
        map[r.date][r.status] = (map[r.date][r.status] ?? 0) + Number(r.count);
    });
    const data = Object.entries(map).map(([date, stats]) => ({
        date,
        approved: stats.APPROVED,
        rejected: stats.REJECTED,
        pending: stats.PENDING,
        total: stats.APPROVED + stats.REJECTED + stats.PENDING,
    }));
    return reply.send({ data });
}

/** ---------------------------------------------------------------
 * 8️⃣ Trending Tools Snapshot (latest)
 * --------------------------------------------------------------- */
export async function getTrendingToolsSnapshot(
    req: FastifyRequest,
    reply: FastifyReply,
) {
    const latest = await prisma.trendingTool.findFirst({
        orderBy: { snapshotAt: 'desc' },
        include: { tool: { select: { name: true, slug: true, trending_score: true } } },
    });
    return reply.send({ data: latest });
}

/** ---------------------------------------------------------------
 * 9️⃣ Trending Categories Snapshot (latest)
 * --------------------------------------------------------------- */
export async function getTrendingCategoriesSnapshot(
    req: FastifyRequest,
    reply: FastifyReply,
) {
    const latest = await prisma.trendingCategory.findFirst({
        orderBy: { snapshotAt: 'desc' },
        include: { category: { select: { name: true, slug: true } } },
    });
    return reply.send({ data: latest });
}

/** ---------------------------------------------------------------
 * 🔟 Tracking Endpoints
 * --------------------------------------------------------------- */
export async function trackToolView(req: FastifyRequest<{ Body: { toolId: number } }>, reply: FastifyReply) {
    const { toolId } = req.body;
    await prisma.toolView.create({ data: { toolId } });
    return reply.send({ success: true });
}

export async function trackExternalClick(req: FastifyRequest<{ Body: { toolId: number; source?: string } }>, reply: FastifyReply) {
    const { toolId, source } = req.body;
    await prisma.externalClick.create({ data: { toolId, source } });
    return reply.send({ success: true });
}

export async function trackCategoryView(req: FastifyRequest<{ Body: { categoryId: number } }>, reply: FastifyReply) {
    const { categoryId } = req.body;
    await prisma.categoryView.create({ data: { categoryId } });
    return reply.send({ success: true });
}

export async function trackSubmissionEvent(req: FastifyRequest<{ Body: { submissionId: number } }>, reply: FastifyReply) {
    const { submissionId } = req.body;
    await prisma.submissionEvent.create({ data: { submissionId } });
    return reply.send({ success: true });
}
