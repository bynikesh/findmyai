import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create Categories
    const categories = await Promise.all([
        prisma.category.upsert({ where: { slug: 'chatbots' }, update: {}, create: { name: 'Chatbots', slug: 'chatbots' } }),
        prisma.category.upsert({ where: { slug: 'image-generation' }, update: {}, create: { name: 'Image Generation', slug: 'image-generation' } }),
        prisma.category.upsert({ where: { slug: 'coding-assistants' }, update: {}, create: { name: 'Coding Assistants', slug: 'coding-assistants' } }),
        prisma.category.upsert({ where: { slug: 'writing' }, update: {}, create: { name: 'Writing', slug: 'writing' } }),
        prisma.category.upsert({ where: { slug: 'productivity' }, update: {}, create: { name: 'Productivity', slug: 'productivity' } }),
    ]);

    console.log('Categories seeded:', categories.length);

    // Create Tools
    const toolsData = Array.from({ length: 10 }).map((_, i) => ({
        name: `AI Tool ${i + 1}`,
        slug: `ai-tool-${i + 1}`,
        description: `This is a description for AI Tool ${i + 1}. It is very useful.`,
        website: `https://example.com/tool-${i + 1}`,
        pricing: i % 2 === 0 ? 'Free' : 'Paid',
        platforms: ['Web', 'iOS'],
        models_used: ['GPT-4', 'DALL-E 3'],
        verified: i % 3 === 0,
        categories: {
            connect: [{ id: categories[i % 5].id }],
        },
    }));

    for (const tool of toolsData) {
        await prisma.tool.upsert({
            where: { slug: tool.slug },
            update: {},
            create: tool,
        });
    }

    console.log('Tools seeded: 10');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
