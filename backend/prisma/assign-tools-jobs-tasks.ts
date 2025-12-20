/**
 * Assign Tools to Jobs and Tasks
 * 
 * This script automatically assigns the 100 seeded tools to relevant
 * jobs and tasks based on their categories.
 * 
 * Run with: npx ts-node prisma/assign-tools-jobs-tasks.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// CATEGORY TO JOBS/TASKS MAPPING
// ============================================================================

// Maps category slugs to relevant job slugs
const categoryToJobs: Record<string, string[]> = {
    'ai-chat-assistant': ['software-developer', 'content-creator', 'researcher', 'entrepreneur-solopreneur', 'student-learner', 'consultant'],
    'image-generators': ['graphic-designer', 'content-creator', 'digital-marketer', 'social-media-manager', 'blogger-influencer', 'ux-ui-designer'],
    'video-generators': ['video-editor-creator', 'content-creator', 'digital-marketer', 'social-media-manager', 'podcaster'],
    'text-to-speech': ['content-creator', 'podcaster', 'educator-teacher', 'video-editor-creator'],
    'writing-web-seo': ['writer-author', 'copywriter', 'content-creator', 'blogger-influencer', 'seo-specialist', 'digital-marketer'],
    'productivity': ['entrepreneur-solopreneur', 'project-manager', 'freelancer', 'administrative-assistant', 'consultant'],
    'project-management': ['project-manager', 'entrepreneur-solopreneur', 'product-manager'],
    'seo': ['seo-specialist', 'digital-marketer', 'blogger-influencer', 'content-creator'],
    'ai-detection': ['educator-teacher', 'writer-author', 'content-creator', 'journalist'],
    'storytelling-generator': ['writer-author', 'content-creator', 'game-developer'],
    'face-swap': ['content-creator', 'video-editor-creator', 'social-media-manager'],
    'video-edition': ['video-editor-creator', 'content-creator', 'social-media-manager', 'podcaster'],
    'image-editing': ['photographer', 'graphic-designer', 'content-creator', 'social-media-manager', 'digital-marketer'],
    'websites-design': ['ux-ui-designer', 'graphic-designer', 'entrepreneur-solopreneur', 'digital-marketer', 'freelancer'],
    'email': ['digital-marketer', 'sales-professional', 'ecommerce-owner', 'freelancer'],
    'logo-creation': ['graphic-designer', 'entrepreneur-solopreneur', 'freelancer', 'digital-marketer'],
    'e-commerce': ['ecommerce-owner', 'digital-marketer', 'entrepreneur-solopreneur', 'sales-professional'],
    'human-resources': ['hr-specialist', 'freelancer', 'student-learner'],
    'memory': ['student-learner', 'researcher', 'educator-teacher'],
    'life-assistants': ['freelancer', 'entrepreneur-solopreneur'],
    'assistant-code': ['software-developer', 'data-scientist', 'game-developer'],
    'design': ['ux-ui-designer', 'graphic-designer', 'product-manager'],
    'advertising': ['digital-marketer', 'social-media-manager', 'ecommerce-owner'],
    'video': ['video-editor-creator', 'content-creator', 'digital-marketer'],
    'marketing': ['digital-marketer', 'social-media-manager', 'copywriter', 'ecommerce-owner'],
    'llm-models': ['software-developer', 'data-scientist', 'researcher'],
    'healthcare': ['healthcare-professional', 'therapist-counselor'],
    'avatars': ['content-creator', 'digital-marketer', 'video-editor-creator'],
    'games': ['game-developer', 'content-creator'],
    'art': ['graphic-designer', 'content-creator', 'ux-ui-designer'],
    'audio-editing': ['podcaster', 'musician-composer', 'content-creator'],
};

// Maps category slugs to relevant task slugs
const categoryToTasks: Record<string, string[]> = {
    'ai-chat-assistant': ['text-generation', 'brainstorming-ideas', 'text-summarization', 'code-writing', 'research-synthesis'],
    'image-generators': ['image-generation', 'graphic-design', 'logo-design'],
    'video-generators': ['video-generation', 'video-editing', 'subtitle-generation'],
    'text-to-speech': ['voice-synthesis', 'speech-transcription'],
    'writing-web-seo': ['text-generation', 'content-writing', 'seo-optimization', 'grammar-checking'],
    'productivity': ['task-automation', 'scheduling', 'note-taking'],
    'project-management': ['task-automation', 'scheduling'],
    'seo': ['seo-optimization', 'content-writing', 'lead-generation'],
    'ai-detection': ['plagiarism-detection', 'grammar-checking'],
    'storytelling-generator': ['text-generation', 'brainstorming-ideas'],
    'face-swap': ['face-swapping', 'video-editing'],
    'video-edition': ['video-editing', 'video-generation', 'subtitle-generation'],
    'image-editing': ['image-editing', 'background-removal', 'image-generation'],
    'websites-design': ['website-building', 'graphic-design'],
    'email': ['email-marketing', 'content-writing', 'lead-generation'],
    'logo-creation': ['logo-design', 'graphic-design'],
    'e-commerce': ['image-editing', 'email-marketing', 'personalized-recommendations', 'virtual-try-on'],
    'human-resources': ['resume-building', 'scheduling'],
    'memory': ['note-taking', 'text-summarization'],
    'life-assistants': ['brainstorming-ideas', 'scheduling'],
    'assistant-code': ['code-writing', 'code-debugging'],
    'design': ['graphic-design', 'website-building', 'presentation-creation'],
    'advertising': ['image-generation', 'content-writing', 'lead-generation'],
    'video': ['video-editing', 'video-generation'],
    'marketing': ['social-media-management', 'email-marketing', 'content-writing', 'lead-generation'],
    'llm-models': ['text-generation', 'code-writing', 'text-summarization'],
    'healthcare': ['emotional-support', 'brainstorming-ideas'],
    'avatars': ['video-generation', 'voice-synthesis'],
    'games': ['brainstorming-ideas', 'graphic-design'],
    'art': ['image-generation', 'graphic-design'],
    'audio-editing': ['music-composition', 'voice-synthesis', 'speech-transcription'],
};

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
    console.log('🔗 Starting to assign tools to jobs and tasks...\n');

    // Step 1: Get all tools with their categories
    const tools = await prisma.tool.findMany({
        include: {
            categories: { select: { slug: true } },
        },
    });
    console.log(`📦 Found ${tools.length} tools to process\n`);

    // Step 2: Get all jobs and tasks
    const jobs = await prisma.job.findMany();
    const tasks = await prisma.task.findMany();

    const jobSlugToId = Object.fromEntries(jobs.map(j => [j.slug, j.id]));
    const taskSlugToId = Object.fromEntries(tasks.map(t => [t.slug, t.id]));

    console.log(`👔 Available jobs: ${jobs.length}`);
    console.log(`📋 Available tasks: ${tasks.length}\n`);

    // Step 3: Process each tool
    let assignedJobs = 0;
    let assignedTasks = 0;

    for (const tool of tools) {
        const toolCategorySlugs = tool.categories.map(c => c.slug);

        // Collect unique job IDs for this tool
        const jobIdsToAssign = new Set<number>();
        const taskIdsToAssign = new Set<number>();

        for (const catSlug of toolCategorySlugs) {
            // Find matching jobs
            const matchingJobSlugs = categoryToJobs[catSlug] || [];
            for (const jobSlug of matchingJobSlugs) {
                if (jobSlugToId[jobSlug]) {
                    jobIdsToAssign.add(jobSlugToId[jobSlug]);
                }
            }

            // Find matching tasks
            const matchingTaskSlugs = categoryToTasks[catSlug] || [];
            for (const taskSlug of matchingTaskSlugs) {
                if (taskSlugToId[taskSlug]) {
                    taskIdsToAssign.add(taskSlugToId[taskSlug]);
                }
            }
        }

        // Update tool with jobs and tasks
        if (jobIdsToAssign.size > 0 || taskIdsToAssign.size > 0) {
            await prisma.tool.update({
                where: { id: tool.id },
                data: {
                    jobs: jobIdsToAssign.size > 0 ? {
                        connect: Array.from(jobIdsToAssign).map(id => ({ id })),
                    } : undefined,
                    tasks: taskIdsToAssign.size > 0 ? {
                        connect: Array.from(taskIdsToAssign).map(id => ({ id })),
                    } : undefined,
                },
            });

            if (jobIdsToAssign.size > 0) assignedJobs++;
            if (taskIdsToAssign.size > 0) assignedTasks++;
        }
    }

    console.log('✅ Assignment complete!');
    console.log(`   - Tools with jobs: ${assignedJobs}`);
    console.log(`   - Tools with tasks: ${assignedTasks}`);
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
