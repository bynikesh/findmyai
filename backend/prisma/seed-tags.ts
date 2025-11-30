import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Find ChatGPT
    const tool = await prisma.tool.findFirst({
        where: { name: 'ChatGPT' },
    });

    if (!tool) {
        console.log('ChatGPT not found');
        return;
    }

    // Create a tag
    const tag = await prisma.tag.upsert({
        where: { name: 'chatbot' },
        update: {},
        create: { name: 'chatbot' },
    });

    // Connect tag to tool
    await prisma.tool.update({
        where: { id: tool.id },
        data: {
            tags: {
                connect: { id: tag.id },
            },
        },
    });

    console.log(`Added tag 'chatbot' to tool '${tool.name}'`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
