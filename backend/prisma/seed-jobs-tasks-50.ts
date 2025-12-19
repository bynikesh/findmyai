/**
 * Seed Script: 50 Jobs & 50 Tasks Categories
 * 
 * This script deletes existing jobs/tasks and seeds 50 curated job categories
 * and 50 task categories optimized for SEO (long-tail keywords like 
 * "best AI tools for graphic designers 2025").
 * 
 * Run with: npx ts-node prisma/seed-jobs-tasks-50.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// 50 JOB CATEGORIES
// ============================================================================

const jobsData = [
    { name: 'Content Creator', slug: 'content-creator', description: 'AI tools for multimedia production, viral content creation, video editing, and content optimization. Perfect for YouTubers, TikTokers, and digital creators.', icon: '🎬', featured: true },
    { name: 'Digital Marketer', slug: 'digital-marketer', description: 'AI-powered marketing tools for campaigns, ads, analytics, and customer engagement. Essential for modern marketing professionals.', icon: '📈', featured: true },
    { name: 'Software Developer', slug: 'software-developer', description: 'AI coding assistants, code completion, debugging tools, and development accelerators for programmers and engineers.', icon: '💻', featured: true },
    { name: 'Graphic Designer', slug: 'graphic-designer', description: 'AI tools for creating visuals, logos, layouts, and stunning graphics. Essential for creative professionals.', icon: '🎨', featured: true },
    { name: 'Writer/Author', slug: 'writer-author', description: 'AI writing assistants for drafting, editing, brainstorming, and publishing. Perfect for novelists, bloggers, and content writers.', icon: '✍️', featured: true },
    { name: 'Educator/Teacher', slug: 'educator-teacher', description: 'AI tools for lesson planning, student engagement, grading automation, and personalized learning experiences.', icon: '📚', featured: true },
    { name: 'Researcher', slug: 'researcher', description: 'AI-powered research tools for literature review, data synthesis, citation management, and academic writing.', icon: '🔬', featured: true },
    { name: 'Entrepreneur/Solopreneur', slug: 'entrepreneur-solopreneur', description: 'All-in-one AI tools for business planning, automation, productivity, and scaling your startup or side business.', icon: '🚀', featured: true },
    { name: 'Sales Professional', slug: 'sales-professional', description: 'AI tools for lead generation, CRM automation, sales analytics, and closing more deals faster.', icon: '💼', featured: true },
    { name: 'HR Specialist', slug: 'hr-specialist', description: 'AI recruitment tools, resume screening, employee engagement, and HR process automation.', icon: '👥', featured: true },
    { name: 'Data Analyst', slug: 'data-analyst', description: 'AI visualization, data processing, insights generation, and analytics tools for data professionals.', icon: '📊', featured: true },
    { name: 'Project Manager', slug: 'project-manager', description: 'AI task tracking, team coordination, timeline optimization, and project automation tools.', icon: '📋', featured: true },
    { name: 'Customer Support Agent', slug: 'customer-support-agent', description: 'AI chatbots, response automation, ticket management, and customer satisfaction tools.', icon: '🎧', featured: false },
    { name: 'Video Editor/Creator', slug: 'video-editor-creator', description: 'AI video editing, effects, transitions, and post-production tools for video professionals.', icon: '🎥', featured: true },
    { name: 'Social Media Manager', slug: 'social-media-manager', description: 'AI scheduling, content creation, analytics, and engagement tools for social media professionals.', icon: '📱', featured: true },
    { name: 'SEO Specialist', slug: 'seo-specialist', description: 'AI keyword research, content optimization, ranking analysis, and SEO automation tools.', icon: '🔍', featured: true },
    { name: 'Copywriter', slug: 'copywriter', description: 'AI copywriting tools for ads, marketing copy, landing pages, and persuasive content creation.', icon: '📝', featured: true },
    { name: 'Podcaster', slug: 'podcaster', description: 'AI audio editing, transcription, voice enhancement, and podcast production tools.', icon: '🎙️', featured: false },
    { name: 'E-commerce Owner', slug: 'ecommerce-owner', description: 'AI product listings, pricing optimization, ad creation, and e-commerce automation tools.', icon: '🛒', featured: true },
    { name: 'Freelancer', slug: 'freelancer', description: 'AI tools for proposals, invoicing, project management, and freelance business optimization.', icon: '🏠', featured: false },
    { name: 'Student/Learner', slug: 'student-learner', description: 'AI study aids, flashcards, note-taking, tutoring, and learning optimization tools.', icon: '🎓', featured: true },
    { name: 'Healthcare Professional', slug: 'healthcare-professional', description: 'AI diagnostics, patient management, medical research, and healthcare automation tools.', icon: '🏥', featured: false },
    { name: 'Lawyer/Legal Professional', slug: 'lawyer-legal', description: 'AI legal research, document drafting, contract analysis, and case management tools.', icon: '⚖️', featured: false },
    { name: 'Accountant/Finance Pro', slug: 'accountant-finance', description: 'AI forecasting, expense tracking, financial analysis, and accounting automation tools.', icon: '💰', featured: false },
    { name: 'Musician/Composer', slug: 'musician-composer', description: 'AI music generation, composition, mixing, mastering, and audio production tools.', icon: '🎵', featured: false },
    { name: 'Photographer', slug: 'photographer', description: 'AI photo enhancement, editing, organization, and photography workflow tools.', icon: '📷', featured: false },
    { name: 'Blogger/Influencer', slug: 'blogger-influencer', description: 'AI content ideation, SEO optimization, engagement analysis, and blogging tools.', icon: '💡', featured: true },
    { name: 'UX/UI Designer', slug: 'ux-ui-designer', description: 'AI prototyping, wireframing, user testing, and interface design tools.', icon: '🖌️', featured: true },
    { name: 'Data Scientist', slug: 'data-scientist', description: 'AI modeling, machine learning, data processing, and predictive analytics tools.', icon: '🧠', featured: true },
    { name: 'Consultant', slug: 'consultant', description: 'AI report generation, insights synthesis, presentation creation, and consulting tools.', icon: '📑', featured: false },
    { name: 'Journalist', slug: 'journalist', description: 'AI research, fact-checking, article drafting, and news production tools.', icon: '📰', featured: false },
    { name: 'Product Manager', slug: 'product-manager', description: 'AI roadmapping, feature prioritization, user feedback analysis, and product tools.', icon: '🎯', featured: true },
    { name: 'Real Estate Agent', slug: 'real-estate-agent', description: 'AI property listings, virtual tours, market analysis, and real estate automation tools.', icon: '🏡', featured: false },
    { name: 'Fitness Trainer', slug: 'fitness-trainer', description: 'AI workout planning, nutrition tracking, client management, and fitness tools.', icon: '💪', featured: false },
    { name: 'Event Planner', slug: 'event-planner', description: 'AI scheduling, invitation management, venue suggestions, and event coordination tools.', icon: '🎉', featured: false },
    { name: 'Translator', slug: 'translator', description: 'AI multilingual translation, localization, and language processing tools.', icon: '🌐', featured: false },
    { name: 'Architect', slug: 'architect', description: 'AI design simulation, 3D modeling, blueprint generation, and architecture tools.', icon: '🏗️', featured: false },
    { name: 'Chef/Culinary Professional', slug: 'chef-culinary', description: 'AI recipe generation, menu planning, ingredient optimization, and culinary tools.', icon: '👨‍🍳', featured: false },
    { name: 'Therapist/Counselor', slug: 'therapist-counselor', description: 'AI mental health support, session notes, patient tracking, and therapy tools.', icon: '🧘', featured: false },
    { name: 'Nonprofit Manager', slug: 'nonprofit-manager', description: 'AI fundraising, grant writing, donor management, and nonprofit tools.', icon: '❤️', featured: false },
    { name: 'Supply Chain Manager', slug: 'supply-chain-manager', description: 'AI forecasting, inventory management, logistics optimization, and supply chain tools.', icon: '📦', featured: false },
    { name: 'Manufacturing Engineer', slug: 'manufacturing-engineer', description: 'AI quality control, process optimization, defect detection, and manufacturing tools.', icon: '⚙️', featured: false },
    { name: 'Cybersecurity Analyst', slug: 'cybersecurity-analyst', description: 'AI threat detection, vulnerability scanning, security automation, and cybersecurity tools.', icon: '🔐', featured: true },
    { name: 'Environmental Scientist', slug: 'environmental-scientist', description: 'AI climate modeling, data analysis, environmental monitoring, and sustainability tools.', icon: '🌍', featured: false },
    { name: 'Librarian/Information Specialist', slug: 'librarian-info-specialist', description: 'AI research curation, cataloging, information retrieval, and library tools.', icon: '📖', featured: false },
    { name: 'Travel Agent', slug: 'travel-agent', description: 'AI itinerary planning, booking optimization, travel recommendations, and tourism tools.', icon: '✈️', featured: false },
    { name: 'Fashion Designer', slug: 'fashion-designer', description: 'AI trend prediction, design generation, fabric selection, and fashion tools.', icon: '👗', featured: false },
    { name: 'Game Developer', slug: 'game-developer', description: 'AI asset creation, level design, NPC behavior, and game development tools.', icon: '🎮', featured: true },
    { name: 'Public Relations Specialist', slug: 'public-relations', description: 'AI media monitoring, press release writing, reputation management, and PR tools.', icon: '📣', featured: false },
    { name: 'Administrative Assistant', slug: 'administrative-assistant', description: 'AI scheduling, email management, document organization, and administrative tools.', icon: '📅', featured: false },
];

// ============================================================================
// 50 TASK CATEGORIES
// ============================================================================

const tasksData = [
    { name: 'Image Generation', slug: 'image-generation', description: 'AI text-to-image creation tools for generating stunning visuals, art, and graphics from text descriptions.', icon: '🖼️', featured: true },
    { name: 'Text Generation', slug: 'text-generation', description: 'AI writing tools for generating articles, copy, stories, and any text content automatically.', icon: '📄', featured: true },
    { name: 'Video Generation', slug: 'video-generation', description: 'AI text-to-video tools for creating video content from prompts and scripts.', icon: '🎬', featured: true },
    { name: 'Image Editing', slug: 'image-editing', description: 'AI photo retouching, enhancement, background removal, and advanced image manipulation tools.', icon: '✨', featured: true },
    { name: 'Code Writing', slug: 'code-writing', description: 'AI programming assistants for writing, completing, and generating code in any language.', icon: '💻', featured: true },
    { name: 'Text Summarization', slug: 'text-summarization', description: 'AI tools for condensing long documents, articles, and content into concise summaries.', icon: '📋', featured: true },
    { name: 'SEO Optimization', slug: 'seo-optimization', description: 'AI keyword research, content optimization, and search ranking improvement tools.', icon: '🔍', featured: true },
    { name: 'Content Writing', slug: 'content-writing', description: 'AI blog writing, marketing content, and professional copywriting tools.', icon: '✍️', featured: true },
    { name: 'Graphic Design', slug: 'graphic-design', description: 'AI layout creation, visual design, and graphic production tools.', icon: '🎨', featured: true },
    { name: 'Language Translation', slug: 'language-translation', description: 'AI multilingual translation tools for accurate and natural language conversion.', icon: '🌐', featured: true },
    { name: 'Data Analysis', slug: 'data-analysis', description: 'AI insights generation, data visualization, and analytical processing tools.', icon: '📊', featured: true },
    { name: 'Email Marketing', slug: 'email-marketing', description: 'AI email campaign creation, automation, and optimization tools.', icon: '📧', featured: true },
    { name: 'Social Media Management', slug: 'social-media-management', description: 'AI posting, scheduling, analytics, and engagement tools for social platforms.', icon: '📱', featured: true },
    { name: 'Website Building', slug: 'website-building', description: 'AI no-code website creation, design, and development tools.', icon: '🌐', featured: true },
    { name: 'Logo Design', slug: 'logo-design', description: 'AI brand identity and logo creation tools for businesses and startups.', icon: '🏷️', featured: true },
    { name: 'Resume Building', slug: 'resume-building', description: 'AI CV optimization, formatting, and professional resume creation tools.', icon: '📄', featured: true },
    { name: 'Presentation Creation', slug: 'presentation-creation', description: 'AI slide design, deck generation, and presentation tools.', icon: '📊', featured: true },
    { name: 'Note Taking', slug: 'note-taking', description: 'AI organization, summarization, and intelligent note management tools.', icon: '📝', featured: false },
    { name: 'Task Automation', slug: 'task-automation', description: 'AI workflow automation, process optimization, and repetitive task tools.', icon: '⚡', featured: true },
    { name: 'Voice Synthesis', slug: 'voice-synthesis', description: 'AI text-to-speech, voice cloning, and audio generation tools.', icon: '🔊', featured: true },
    { name: 'Music Composition', slug: 'music-composition', description: 'AI music generation, scoring, and audio composition tools.', icon: '🎵', featured: true },
    { name: 'Video Editing', slug: 'video-editing', description: 'AI video cuts, effects, transitions, and post-production tools.', icon: '🎥', featured: true },
    { name: 'Plagiarism Detection', slug: 'plagiarism-detection', description: 'AI originality checking, content verification, and academic integrity tools.', icon: '🔎', featured: false },
    { name: 'Grammar Checking', slug: 'grammar-checking', description: 'AI proofreading, spelling correction, and writing improvement tools.', icon: '✓', featured: true },
    { name: 'Sentiment Analysis', slug: 'sentiment-analysis', description: 'AI emotion detection, opinion mining, and text sentiment tools.', icon: '😊', featured: false },
    { name: 'Predictive Modeling', slug: 'predictive-modeling', description: 'AI forecasting, trend prediction, and machine learning modeling tools.', icon: '📈', featured: false },
    { name: 'Face Swapping', slug: 'face-swapping', description: 'AI face replacement, deepfake creation, and facial manipulation tools.', icon: '🎭', featured: false },
    { name: 'Background Removal', slug: 'background-removal', description: 'AI photo cleanup, background deletion, and image isolation tools.', icon: '✂️', featured: true },
    { name: 'Chatbot Development', slug: 'chatbot-development', description: 'AI conversational bot creation, dialog design, and chat automation tools.', icon: '🤖', featured: true },
    { name: 'Research Synthesis', slug: 'research-synthesis', description: 'AI literature review, academic research, and source aggregation tools.', icon: '🔬', featured: false },
    { name: 'Scheduling', slug: 'scheduling', description: 'AI calendar management, appointment booking, and time optimization tools.', icon: '📅', featured: false },
    { name: 'Invoice Processing', slug: 'invoice-processing', description: 'AI billing automation, expense tracking, and financial document tools.', icon: '💳', featured: false },
    { name: 'Customer Support Automation', slug: 'customer-support-automation', description: 'AI helpdesk, ticket management, and customer query resolution tools.', icon: '🎧', featured: true },
    { name: 'Lead Generation', slug: 'lead-generation', description: 'AI sales prospecting, contact discovery, and lead qualification tools.', icon: '🎯', featured: true },
    { name: 'Trend Forecasting', slug: 'trend-forecasting', description: 'AI market insights, trend prediction, and future analysis tools.', icon: '📉', featured: false },
    { name: 'Personalized Recommendations', slug: 'personalized-recommendations', description: 'AI product suggestions, content curation, and recommendation engine tools.', icon: '💡', featured: false },
    { name: 'Defect Detection', slug: 'defect-detection', description: 'AI quality control, visual inspection, and manufacturing error tools.', icon: '🔧', featured: false },
    { name: 'Speech Transcription', slug: 'speech-transcription', description: 'AI audio-to-text, meeting transcription, and voice recognition tools.', icon: '🎤', featured: true },
    { name: 'Subtitle Generation', slug: 'subtitle-generation', description: 'AI video captioning, accessibility, and subtitle creation tools.', icon: '💬', featured: false },
    { name: 'Code Debugging', slug: 'code-debugging', description: 'AI error detection, bug fixing, and code quality improvement tools.', icon: '🐛', featured: true },
    { name: 'Brainstorming Ideas', slug: 'brainstorming-ideas', description: 'AI creativity enhancement, ideation, and concept generation tools.', icon: '💭', featured: true },
    { name: 'Document Summarization', slug: 'document-summarization', description: 'AI long-form content condensation and key point extraction tools.', icon: '📑', featured: false },
    { name: 'Virtual Try-On', slug: 'virtual-try-on', description: 'AI fashion fitting, product visualization, and e-commerce preview tools.', icon: '👔', featured: false },
    { name: 'Recipe Generation', slug: 'recipe-generation', description: 'AI culinary ideas, meal planning, and cooking suggestion tools.', icon: '🍳', featured: false },
    { name: 'Workout Planning', slug: 'workout-planning', description: 'AI fitness routines, exercise programs, and health optimization tools.', icon: '💪', featured: false },
    { name: 'Travel Itinerary', slug: 'travel-itinerary', description: 'AI trip planning, destination recommendations, and travel organization tools.', icon: '✈️', featured: false },
    { name: 'Financial Forecasting', slug: 'financial-forecasting', description: 'AI budgeting, investment analysis, and financial planning tools.', icon: '💰', featured: false },
    { name: 'Threat Detection', slug: 'threat-detection', description: 'AI cybersecurity monitoring, vulnerability scanning, and security tools.', icon: '🛡️', featured: false },
    { name: 'Protein Structure Prediction', slug: 'protein-structure-prediction', description: 'AI biotech, molecular modeling, and scientific research tools.', icon: '🧬', featured: false },
    { name: 'Emotional Support', slug: 'emotional-support', description: 'AI mental health, therapy-like conversations, and wellbeing tools.', icon: '❤️', featured: false },
];

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function main() {
    console.log('🌱 Starting to seed 50 Jobs & 50 Tasks...\n');

    // Step 1: Delete existing jobs and tasks (disconnect from tools first)
    console.log('🗑️ Removing existing jobs and tasks...');

    // First, disconnect all tools from jobs and tasks
    await prisma.$executeRaw`UPDATE "_JobToTool" SET "A" = "A" WHERE 1=0`; // No-op to check table exists
    await prisma.$executeRaw`DELETE FROM "_JobToTool"`;
    await prisma.$executeRaw`DELETE FROM "_TaskToTool"`;

    // Then delete the jobs and tasks
    await prisma.job.deleteMany({});
    await prisma.task.deleteMany({});

    console.log('  ✅ Cleared existing jobs and tasks\n');

    // Step 2: Create all jobs
    console.log('👔 Creating 50 job categories...');
    let jobsCreated = 0;

    for (const job of jobsData) {
        await prisma.job.create({
            data: {
                name: job.name,
                slug: job.slug,
                description: job.description,
                icon: job.icon,
                featured: job.featured,
            },
        });
        jobsCreated++;
    }
    console.log(`  ✅ Created ${jobsCreated} job categories\n`);

    // Step 3: Create all tasks
    console.log('📋 Creating 50 task categories...');
    let tasksCreated = 0;

    for (const task of tasksData) {
        await prisma.task.create({
            data: {
                name: task.name,
                slug: task.slug,
                description: task.description,
                icon: task.icon,
                featured: task.featured,
            },
        });
        tasksCreated++;
    }
    console.log(`  ✅ Created ${tasksCreated} task categories\n`);

    // Summary
    console.log('✅ Seeding complete!');
    console.log(`   - Jobs: ${jobsCreated} categories`);
    console.log(`   - Tasks: ${tasksCreated} categories`);
    console.log('\n📌 Next steps:');
    console.log('   1. Assign tools to jobs/tasks via admin panel');
    console.log('   2. Each page will show 10-15 top tools per category');
}

main()
    .catch((e) => {
        console.error('Error seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
