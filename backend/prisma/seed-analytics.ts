import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAnalytics() {
    console.log('🌱 Seeding analytics data...');

    // Get all tools and categories
    const tools = await prisma.tool.findMany({ take: 10 });
    const categories = await prisma.category.findMany({ take: 5 });

    if (tools.length === 0) {
        console.log('⚠️  No tools found. Please seed tools first.');
        return;
    }

    if (categories.length === 0) {
        console.log('⚠️  No categories found. Please seed categories first.');
        return;
    }

    // Generate data for the last 30 days
    const now = new Date();
    const daysToGenerate = 30;

    console.log('📊 Creating tool views...');
    const toolViewsData = [];
    for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Create 10-50 views per day for random tools
        const viewsPerDay = Math.floor(Math.random() * 40) + 10;

        for (let j = 0; j < viewsPerDay; j++) {
            const randomTool = tools[Math.floor(Math.random() * tools.length)];
            toolViewsData.push({
                toolId: randomTool.id,
                createdAt: date,
                ipHash: `hash_${Math.random().toString(36).substring(7)}`,
            });
        }
    }
    await prisma.toolView.createMany({ data: toolViewsData });
    console.log(`   ✓ Created ${toolViewsData.length} tool views`);

    console.log('🖱️  Creating external clicks...');
    const clicksData = [];
    for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Create 5-25 clicks per day
        const clicksPerDay = Math.floor(Math.random() * 20) + 5;

        for (let j = 0; j < clicksPerDay; j++) {
            const randomTool = tools[Math.floor(Math.random() * tools.length)];
            clicksData.push({
                toolId: randomTool.id,
                createdAt: date,
                source: ['website', 'detail_page', 'card'][Math.floor(Math.random() * 3)],
            });
        }
    }
    await prisma.externalClick.createMany({ data: clicksData });
    console.log(`   ✓ Created ${clicksData.length} external clicks`);

    console.log('📁 Creating category views...');
    const categoryViewsData = [];
    for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Create 5-20 category views per day
        const viewsPerDay = Math.floor(Math.random() * 15) + 5;

        for (let j = 0; j < viewsPerDay; j++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            categoryViewsData.push({
                categoryId: randomCategory.id,
                createdAt: date,
            });
        }
    }
    await prisma.categoryView.createMany({ data: categoryViewsData });
    console.log(`   ✓ Created ${categoryViewsData.length} category views`);

    console.log('📝 Creating submissions and events...');
    const submissionsData = [];
    for (let i = 0; i < 15; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - Math.floor(Math.random() * daysToGenerate));

        submissionsData.push({
            submitterName: `User ${i + 1}`,
            submitterEmail: `user${i + 1}@example.com`,
            toolData: {
                name: `Sample Tool ${i + 1}`,
                website: `https://example${i + 1}.com`,
                description: 'Sample tool submission',
            },
            status: ['PENDING', 'APPROVED', 'REJECTED'][Math.floor(Math.random() * 3)] as any,
            createdAt: date,
        });
    }

    // Create submissions one by one to get IDs for events
    const submissionIds = [];
    for (const subData of submissionsData) {
        const submission = await prisma.submission.create({ data: subData });
        submissionIds.push({ id: submission.id, createdAt: submission.createdAt });
    }
    console.log(`   ✓ Created ${submissionIds.length} submissions`);

    // Create submission events
    const submissionEventsData = submissionIds.map(sub => ({
        submissionId: sub.id,
        createdAt: sub.createdAt,
    }));
    await prisma.submissionEvent.createMany({ data: submissionEventsData });
    console.log(`   ✓ Created ${submissionEventsData.length} submission events`);

    console.log('\n✅ Analytics data seeded successfully!');

    // Print summary
    const totalToolViews = await prisma.toolView.count();
    const totalClicks = await prisma.externalClick.count();
    const totalCategoryViews = await prisma.categoryView.count();
    const totalSubmissionEvents = await prisma.submissionEvent.count();

    console.log('\n📈 Summary:');
    console.log(`   Tool Views: ${totalToolViews}`);
    console.log(`   External Clicks: ${totalClicks}`);
    console.log(`   Category Views: ${totalCategoryViews}`);
    console.log(`   Submission Events: ${totalSubmissionEvents}`);
}

seedAnalytics()
    .catch((e) => {
        console.error('❌ Error seeding analytics:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
