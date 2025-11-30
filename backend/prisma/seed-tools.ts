import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create categories first
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'writing' },
            update: {},
            create: { name: 'Writing', slug: 'writing', featured: true },
        }),
        prisma.category.upsert({
            where: { slug: 'coding' },
            update: {},
            create: { name: 'Coding', slug: 'coding', featured: true },
        }),
        prisma.category.upsert({
            where: { slug: 'image-generation' },
            update: {},
            create: { name: 'Image Generation', slug: 'image-generation', featured: true },
        }),
    ]);

    // Create sample tools
    const tools = [
        {
            name: 'ChatGPT',
            slug: 'chatgpt',
            tagline: 'AI-powered conversational assistant',
            short_description: 'ChatGPT is an advanced AI chatbot that can help with writing, coding, and answering questions.',
            description: 'ChatGPT is a state-of-the-art language model developed by OpenAI that can engage in natural conversations, write content, debug code, and much more.',
            website: 'https://chat.openai.com',
            pricing: 'Free / $20/month',
            pricing_type: 'Freemium',
            key_features: ['Natural conversation', 'Code generation', 'Content writing', 'Problem solving'],
            pros: ['Very capable', 'Easy to use', 'Free tier available'],
            cons: ['Can be inaccurate', 'Requires internet'],
            platforms: ['Web', 'iOS', 'Android'],
            models_used: ['GPT-4', 'GPT-3.5'],
            primary_model: 'GPT-4',
            logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
            verified: true,
            featured: true,
            still_active: true,
            categories: {
                connect: [{ id: categories[0].id }, { id: categories[1].id }],
            },
        },
        {
            name: 'Midjourney',
            slug: 'midjourney',
            tagline: 'AI art generation from text',
            short_description: 'Midjourney creates stunning images from text descriptions using advanced AI.',
            description: 'Midjourney is an independent research lab that produces an AI program that creates images from textual descriptions. It is one of the most popular AI art generators.',
            website: 'https://midjourney.com',
            pricing: '$10-60/month',
            pricing_type: 'Paid',
            key_features: ['Text-to-image', 'High quality output', 'Style variations', 'Upscaling'],
            pros: ['Amazing quality', 'Active community', 'Regular updates'],
            cons: ['Requires Discord', 'No free tier', 'Learning curve'],
            platforms: ['Discord'],
            models_used: ['Midjourney V6'],
            primary_model: 'Midjourney V6',
            verified: true,
            featured: true,
            still_active: true,
            categories: {
                connect: [{ id: categories[2].id }],
            },
        },
        {
            name: 'GitHub Copilot',
            slug: 'github-copilot',
            tagline: 'AI pair programmer',
            short_description: 'GitHub Copilot suggests code and entire functions in real-time from your editor.',
            description: 'GitHub Copilot is an AI coding assistant that helps you write code faster by suggesting whole lines or entire functions right inside your editor.',
            website: 'https://github.com/features/copilot',
            pricing: '$10/month',
            pricing_type: 'Paid',
            key_features: ['Code completion', 'Multi-language support', 'Context-aware suggestions', 'IDE integration'],
            pros: ['Speeds up coding', 'Learns your style', 'Great documentation'],
            cons: ['Subscription required', 'Can suggest incorrect code'],
            platforms: ['VS Code', 'JetBrains', 'Neovim'],
            models_used: ['Codex'],
            primary_model: 'Codex',
            api_available: true,
            verified: true,
            still_active: true,
            categories: {
                connect: [{ id: categories[1].id }],
            },
        },
        {
            name: 'Claude',
            slug: 'claude',
            tagline: 'AI assistant by Anthropic',
            short_description: 'Claude is a helpful, harmless, and honest AI assistant.',
            description: 'Claude is an AI assistant created by Anthropic to be helpful, harmless, and honest. It excels at analysis, coding, and creative tasks.',
            website: 'https://claude.ai',
            pricing: 'Free / $20/month',
            pricing_type: 'Freemium',
            key_features: ['Long context window', 'Document analysis', 'Coding assistance', 'Safe responses'],
            pros: ['Very capable', 'Large context', 'Ethical design'],
            cons: ['Limited free tier', 'Slower than GPT-4'],
            platforms: ['Web'],
            models_used: ['Claude 3.5 Sonnet', 'Claude 3 Opus'],
            primary_model: 'Claude 3.5 Sonnet',
            verified: true,
            still_active: true,
            categories: {
                connect: [{ id: categories[0].id }, { id: categories[1].id }],
            },
        },
        {
            name: 'DALL-E 3',
            slug: 'dall-e-3',
            tagline: 'Advanced AI image generator',
            short_description: 'DALL-E 3 creates realistic images and art from text descriptions.',
            description: 'DALL-E 3 is OpenAI\'s latest image generation model that can create highly detailed and accurate images from text prompts.',
            website: 'https://openai.com/dall-e-3',
            pricing: 'Included with ChatGPT Plus',
            pricing_type: 'Paid',
            key_features: ['Text-to-image', 'High fidelity', 'ChatGPT integration', 'Prompt understanding'],
            pros: ['Excellent quality', 'Easy to use', 'Integrated with ChatGPT'],
            cons: ['Requires subscription', 'Content policy restrictions'],
            platforms: ['Web', 'API'],
            models_used: ['DALL-E 3'],
            primary_model: 'DALL-E 3',
            api_available: true,
            verified: true,
            still_active: true,
            categories: {
                connect: [{ id: categories[2].id }],
            },
        },
    ];

    for (const toolData of tools) {
        await prisma.tool.upsert({
            where: { slug: toolData.slug },
            update: toolData,
            create: toolData,
        });
    }

    console.log('✅ Seeded 5 AI tools and 3 categories');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
