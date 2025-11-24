import { PrismaClient } from '@prisma/client';
import fetch from 'cross-fetch';

const prisma = new PrismaClient();

const AWESOME_AI_URL = 'https://github.com/openbestof/awesome-ai/raw/refs/heads/main/readme.md';

async function fetchReadme(): Promise<string> {
    console.log('Fetching README from', AWESOME_AI_URL);
    const response = await fetch(AWESOME_AI_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch README: ${response.statusText}`);
    }
    return response.text();
}

interface ParsedTool {
    name: string;
    url: string;
    category: string;
}

function parseReadme(content: string): ParsedTool[] {
    const lines = content.split('\n');
    const tools: ParsedTool[] = [];
    let currentCategory = '';

    // Regex to match markdown links: [Name](URL)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;

    for (const line of lines) {
        // Check for category header (## Category Name)
        if (line.startsWith('## ')) {
            currentCategory = line.substring(3).trim();
            continue;
        }

        // Skip if no category is set yet
        if (!currentCategory) continue;

        // Check for tool link
        const match = line.match(linkRegex);
        if (match) {
            const name = match[1].trim();
            const url = match[2].trim();

            // Filter out internal links or non-tool links if necessary
            if (!url.startsWith('http')) continue;

            tools.push({
                name,
                url,
                category: currentCategory,
            });
        }
    }

    return tools;
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function seed() {
    try {
        const content = await fetchReadme();
        const tools = parseReadme(content);

        console.log(`Found ${tools.length} tools in ${new Set(tools.map(t => t.category)).size} categories.`);

        for (const tool of tools) {
            const slug = generateSlug(tool.name);

            // 1. Upsert Category
            const categorySlug = generateSlug(tool.category);
            const category = await prisma.category.upsert({
                where: { slug: categorySlug },
                update: {},
                create: {
                    name: tool.category,
                    slug: categorySlug,
                    seo_title: `${tool.category} AI Tools`,
                    seo_description: `Best AI tools for ${tool.category}`,
                },
            });

            // 2. Upsert Tool
            // We use the slug as a unique identifier. If it exists, we update the category connection.
            // Note: We are not overwriting existing descriptions if they exist and are different, 
            // but for simplicity here we just ensure it exists.

            await prisma.tool.upsert({
                where: { slug },
                update: {
                    categories: {
                        connect: { id: category.id }
                    }
                },
                create: {
                    name: tool.name,
                    slug,
                    description: `AI tool for ${tool.category}. Discovered in Awesome AI collection.`,
                    website: tool.url,
                    pricing: 'Unknown', // Default
                    verified: true,
                    categories: {
                        connect: { id: category.id }
                    }
                },
            });

            process.stdout.write('.');
        }

        console.log('\nSeeding completed successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
