import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Calculate trending score for all tools
 * 
 * Formula:
 * trending_score = (views_last_7_days * 0.7) + (views_last_1_day * 0.3) + newness_boost
 * 
 * Newness boost: Tools created in last 7 days get +50 points
 * Trending threshold: Tools with score >= 10 are marked as trending
 */
async function calculateTrendingScores() {
    console.log('Starting trending score calculation...');

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last1Day = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

    try {
        // Get all tools
        const tools = await prisma.tool.findMany({
            select: {
                id: true,
                createdAt: true,
            },
        });

        console.log(`Processing ${tools.length} tools...`);

        for (const tool of tools) {
            // Count views in last 7 days
            const viewsLast7Days = await prisma.view.count({
                where: {
                    toolId: tool.id,
                    createdAt: { gte: last7Days },
                },
            });

            // Count views in last 1 day
            const viewsLast1Day = await prisma.view.count({
                where: {
                    toolId: tool.id,
                    createdAt: { gte: last1Day },
                },
            });

            // Calculate newness boost
            const daysSinceCreation =
                (now.getTime() - tool.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            const newnessBoost = daysSinceCreation <= 7 ? 50 : 0;

            // Calculate trending score
            const trendingScore =
                viewsLast7Days * 0.7 + viewsLast1Day * 0.3 + newnessBoost;

            // Determine if trending (threshold: 10)
            const isTrending = trendingScore >= 10;

            // Update tool
            await prisma.tool.update({
                where: { id: tool.id },
                data: {
                    trending_score: trendingScore,
                    is_trending: isTrending,
                },
            });

            if (isTrending) {
                console.log(
                    `  ✓ Tool #${tool.id}: score=${trendingScore.toFixed(2)} (7d=${viewsLast7Days}, 1d=${viewsLast1Day}, boost=${newnessBoost})`
                );
            }
        }

        // Get trending stats
        const trendingCount = await prisma.tool.count({
            where: { is_trending: true },
        });

        console.log(`\nCompleted! ${trendingCount} tools are now trending.`);

        // Show top 10 trending tools
        const topTrending = await prisma.tool.findMany({
            where: { is_trending: true },
            orderBy: { trending_score: 'desc' },
            take: 10,
            select: {
                id: true,
                name: true,
                trending_score: true,
            },
        });

        console.log('\nTop 10 Trending Tools:');
        topTrending.forEach((tool, idx) => {
            console.log(
                `  ${idx + 1}. ${tool.name} (score: ${tool.trending_score?.toFixed(2)})`
            );
        });
    } catch (error) {
        console.error('Error calculating trending scores:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if executed directly
if (require.main === module) {
    calculateTrendingScores()
        .then(() => {
            console.log('\n✅ Trending calculation complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Trending calculation failed:', error);
            process.exit(1);
        });
}

export { calculateTrendingScores };
