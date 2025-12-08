// ---------------------------------------------------------------
// seedJobsTasks.ts – Seed Jobs and Tasks
// ---------------------------------------------------------------

import prisma from '../src/lib/prisma';

const jobs = [
    { name: 'Data Scientist', slug: 'data-scientist', description: 'AI tools for data analysis and machine learning', icon: 'chart-bar', featured: true },
    { name: 'Content Creator', slug: 'content-creator', description: 'AI tools for creating engaging content', icon: 'pencil', featured: true },
    { name: 'Developer', slug: 'developer', description: 'AI tools for coding and software development', icon: 'code', featured: true },
    { name: 'Marketer', slug: 'marketer', description: 'AI tools for marketing and advertising', icon: 'megaphone', featured: true },
    { name: 'Designer', slug: 'designer', description: 'AI tools for visual design and graphics', icon: 'paint-brush', featured: true },
    { name: 'Researcher', slug: 'researcher', description: 'AI tools for research and analysis', icon: 'magnifying-glass', featured: false },
    { name: 'Student', slug: 'student', description: 'AI tools for learning and education', icon: 'academic-cap', featured: false },
    { name: 'Entrepreneur', slug: 'entrepreneur', description: 'AI tools for building businesses', icon: 'rocket-launch', featured: false },
    { name: 'Writer', slug: 'writer', description: 'AI tools for writing and editing', icon: 'document-text', featured: true },
    { name: 'Customer Support', slug: 'customer-support', description: 'AI tools for customer service', icon: 'chat-bubble', featured: false },
];

const tasks = [
    { name: 'Create Images', slug: 'create-images', description: 'Generate images from text', icon: 'photo', featured: true },
    { name: 'Write Blog Posts', slug: 'write-blog-posts', description: 'Generate blog content', icon: 'document-text', featured: true },
    { name: 'Summarize Text', slug: 'summarize-text', description: 'Condense long text into summaries', icon: 'document-duplicate', featured: true },
    { name: 'Write Code', slug: 'write-code', description: 'Generate or debug code', icon: 'code-bracket', featured: true },
    { name: 'Create Videos', slug: 'create-videos', description: 'Generate or edit videos', icon: 'video-camera', featured: true },
    { name: 'Generate Audio', slug: 'generate-audio', description: 'Create music or voice', icon: 'musical-note', featured: false },
    { name: 'Write Ad Copy', slug: 'write-ad-copy', description: 'Create advertising content', icon: 'megaphone', featured: true },
    { name: 'Create Presentations', slug: 'create-presentations', description: 'Generate slide decks', icon: 'presentation-chart-bar', featured: false },
    { name: 'Translate Text', slug: 'translate-text', description: 'Translate between languages', icon: 'language', featured: false },
    { name: 'Chat & Assist', slug: 'chat-assist', description: 'Conversational AI assistants', icon: 'chat-bubble-bottom-center-text', featured: true },
    { name: 'Create Memes', slug: 'create-memes', description: 'Generate memes and fun content', icon: 'face-smile', featured: false },
    { name: 'Analyze Data', slug: 'analyze-data', description: 'Process and analyze datasets', icon: 'chart-pie', featured: true },
    { name: 'Write Newsletters', slug: 'write-newsletters', description: 'Create email newsletters', icon: 'envelope', featured: false },
    { name: 'Create Facebook Ads', slug: 'create-facebook-ads', description: 'Generate social media ads', icon: 'rectangle-group', featured: false },
    { name: 'Create Logos', slug: 'create-logos', description: 'Design logos and branding', icon: 'sparkles', featured: false },
    { name: 'Automate Tasks', slug: 'automate-tasks', description: 'Create automation workflows', icon: 'cog', featured: true },
];

async function main() {
    console.log('🌱 Seeding Jobs and Tasks...');

    // Seed Jobs
    for (const job of jobs) {
        const existing = await prisma.job.findUnique({ where: { slug: job.slug } });
        if (!existing) {
            await prisma.job.create({ data: job });
            console.log(`  ✓ Created job: ${job.name}`);
        } else {
            console.log(`  - Job already exists: ${job.name}`);
        }
    }

    // Seed Tasks
    for (const task of tasks) {
        const existing = await prisma.task.findUnique({ where: { slug: task.slug } });
        if (!existing) {
            await prisma.task.create({ data: task });
            console.log(`  ✓ Created task: ${task.name}`);
        } else {
            console.log(`  - Task already exists: ${task.name}`);
        }
    }

    console.log('\n✅ Seeding complete!');
    console.log(`   Jobs: ${jobs.length}`);
    console.log(`   Tasks: ${tasks.length}`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
