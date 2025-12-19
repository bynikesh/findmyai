/**
 * Seed Script: 100 Popular AI Tools
 * 
 * This script seeds the database with 100 curated AI tools across various categories.
 * All descriptions, features, pros, cons, and use cases are auto-generated.
 * 
 * Run with: npx ts-node prisma/seed-100-tools.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// CATEGORY DEFINITIONS
// ============================================================================

const categoryDefinitions = [
    { name: 'AI Chat & Assistant', slug: 'ai-chat-assistant', featured: true },
    { name: 'Image Generators', slug: 'image-generators', featured: true },
    { name: 'Video Generators', slug: 'video-generators', featured: true },
    { name: 'Text To Speech', slug: 'text-to-speech', featured: true },
    { name: 'Writing & Web SEO', slug: 'writing-web-seo', featured: true },
    { name: 'Productivity', slug: 'productivity', featured: true },
    { name: 'Project Management', slug: 'project-management', featured: false },
    { name: 'SEO', slug: 'seo', featured: true },
    { name: 'AI Detection', slug: 'ai-detection', featured: true },
    { name: 'Storytelling Generator', slug: 'storytelling-generator', featured: false },
    { name: 'Face Swap', slug: 'face-swap', featured: false },
    { name: 'Video Edition', slug: 'video-edition', featured: false },
    { name: 'Image Editing', slug: 'image-editing', featured: true },
    { name: 'Websites & Design', slug: 'websites-design', featured: true },
    { name: 'E-mail', slug: 'email', featured: false },
    { name: 'Logo Creation', slug: 'logo-creation', featured: false },
    { name: 'E-commerce', slug: 'e-commerce', featured: true },
    { name: 'Human Resources', slug: 'human-resources', featured: true },
    { name: 'Memory', slug: 'memory', featured: false },
    { name: 'Life Assistants', slug: 'life-assistants', featured: false },
    { name: 'Assistant Code', slug: 'assistant-code', featured: true },
    { name: 'Design', slug: 'design', featured: true },
    { name: 'Advertising', slug: 'advertising', featured: false },
    { name: 'Video', slug: 'video', featured: false },
    { name: 'Marketing', slug: 'marketing', featured: true },
    { name: 'LLM Models', slug: 'llm-models', featured: true },
    { name: 'Healthcare', slug: 'healthcare', featured: false },
    { name: 'Avatars', slug: 'avatars', featured: false },
    { name: 'Games', slug: 'games', featured: false },
    { name: 'Art', slug: 'art', featured: false },
    { name: 'Audio Editing', slug: 'audio-editing', featured: false },
];

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

interface ToolDefinition {
    name: string;
    category: string;
    briefDescription: string;
    website?: string;
}

const toolsData: ToolDefinition[] = [
    { name: 'ChatGPT', category: 'AI Chat & Assistant', briefDescription: "OpenAI's versatile chatbot for conversation, writing, and tasks.", website: 'https://chat.openai.com' },
    { name: 'Grok 4', category: 'AI Chat & Assistant', briefDescription: "xAI's advanced model for reasoning and queries.", website: 'https://grok.x.ai' },
    { name: 'Claude 4', category: 'AI Chat & Assistant', briefDescription: "Anthropic's safe, helpful AI assistant.", website: 'https://claude.ai' },
    { name: 'Gemini AI', category: 'AI Chat & Assistant', briefDescription: "Google's multimodal AI for search and creation.", website: 'https://gemini.google.com' },
    { name: 'Microsoft Copilot', category: 'AI Chat & Assistant', briefDescription: 'Integrated AI for productivity in Microsoft apps.', website: 'https://copilot.microsoft.com' },
    { name: 'Stable Diffusion 3.5', category: 'Image Generators', briefDescription: 'Open-source AI for generating high-quality images from text.', website: 'https://stability.ai' },
    { name: 'Leonardo AI', category: 'Image Generators', briefDescription: 'AI art generator with fine-tuned models.', website: 'https://leonardo.ai' },
    { name: 'Adobe Firefly 3', category: 'Image Generators', briefDescription: "Adobe's ethical AI for image creation and editing.", website: 'https://firefly.adobe.com' },
    { name: 'Ideogram 3.0', category: 'Image Generators', briefDescription: 'Text-to-image AI with creative styles.', website: 'https://ideogram.ai' },
    { name: 'Luma Dream Machine', category: 'Video Generators', briefDescription: 'AI for generating dream-like videos from prompts.', website: 'https://lumalabs.ai/dream-machine' },
    { name: 'Sora 2', category: 'Video Generators', briefDescription: "OpenAI's text-to-video model for realistic clips.", website: 'https://openai.com/sora' },
    { name: 'Runway Gen-4', category: 'Video Generators', briefDescription: 'Advanced AI video generation and editing.', website: 'https://runway.com' },
    { name: 'Kling 2.6', category: 'Video Generators', briefDescription: "Kwai's high-resolution video AI.", website: 'https://klingai.com' },
    { name: 'ElevenLabs', category: 'Text To Speech', briefDescription: 'Realistic AI voice generation with cloning.', website: 'https://elevenlabs.io' },
    { name: 'Murf.AI', category: 'Text To Speech', briefDescription: 'Professional voiceovers with natural tones.', website: 'https://murf.ai' },
    { name: 'Uberduck', category: 'Text To Speech', briefDescription: 'Fun AI voices for music and speech.', website: 'https://uberduck.ai' },
    { name: 'QuillBot', category: 'Writing & Web SEO', briefDescription: 'AI paraphraser and grammar checker.', website: 'https://quillbot.com' },
    { name: 'Jasper', category: 'Writing & Web SEO', briefDescription: 'AI content writer for marketing and blogs.', website: 'https://jasper.ai' },
    { name: 'Rytr', category: 'Writing & Web SEO', briefDescription: 'Affordable AI for generating copy.', website: 'https://rytr.me' },
    { name: 'WriteSonic', category: 'Writing & Web SEO', briefDescription: 'Versatile AI writer with SEO tools.', website: 'https://writesonic.com' },
    { name: 'Notion AI', category: 'Productivity', briefDescription: 'Integrated AI for notes, summaries, and organization.', website: 'https://notion.so' },
    { name: 'ClickUp', category: 'Project Management', briefDescription: 'AI-enhanced task management and automation.', website: 'https://clickup.com' },
    { name: 'Semrush One', category: 'SEO', briefDescription: 'AI for visibility optimization on search and AI engines.', website: 'https://semrush.com' },
    { name: 'GPTZero', category: 'AI Detection', briefDescription: 'Detector for AI-generated content.', website: 'https://gptzero.me' },
    { name: 'Undetectable AI', category: 'AI Detection', briefDescription: 'Tool to humanize AI text.', website: 'https://undetectable.ai' },
    { name: 'Character AI', category: 'AI Chat & Assistant', briefDescription: 'Create and chat with custom AI characters.', website: 'https://character.ai' },
    { name: 'AI Dungeon', category: 'Storytelling Generator', briefDescription: 'Interactive AI storytelling game.', website: 'https://aidungeon.com' },
    { name: 'Deep Swap AI', category: 'Face Swap', briefDescription: 'AI for swapping faces in media.', website: 'https://deepswap.ai' },
    { name: 'CapCut', category: 'Video Edition', briefDescription: 'AI-powered video editor with effects.', website: 'https://capcut.com' },
    { name: 'Photoshop AI', category: 'Image Editing', briefDescription: "Adobe's generative fill and edits.", website: 'https://adobe.com/photoshop' },
    { name: 'Canva AI', category: 'Websites & Design', briefDescription: 'Magic Studio for AI design assistance.', website: 'https://canva.com' },
    { name: 'Framer AI', category: 'Websites & Design', briefDescription: 'AI for building interactive sites.', website: 'https://framer.com' },
    { name: 'Klaviyo', category: 'E-mail', briefDescription: 'AI email automation for e-commerce.', website: 'https://klaviyo.com' },
    { name: 'HoppyCopy', category: 'E-mail', briefDescription: 'AI copywriter for emails.', website: 'https://hoppycopy.co' },
    { name: 'Looka', category: 'Logo Creation', briefDescription: 'Instant AI logo design.', website: 'https://looka.com' },
    { name: 'Namelix', category: 'E-commerce', briefDescription: 'AI business name generator.', website: 'https://namelix.com' },
    { name: 'AIApply', category: 'Human Resources', briefDescription: 'AI for job applications.', website: 'https://aiapply.co' },
    { name: 'Teal Resume Builder', category: 'Human Resources', briefDescription: 'AI-optimized resumes.', website: 'https://tealhq.com' },
    { name: 'PimEyes', category: 'AI Detection', briefDescription: 'Reverse image search for faces.', website: 'https://pimeyes.com' },
    { name: 'Copyleaks', category: 'AI Detection', briefDescription: 'Plagiarism and AI detector.', website: 'https://copyleaks.com' },
    { name: 'Veo 3.1', category: 'Video Generators', briefDescription: "Google's advanced video AI.", website: 'https://deepmind.google/veo' },
    { name: 'Hailuo AI', category: 'Video Generators', briefDescription: 'Text-to-video with high fidelity.', website: 'https://hailuoai.com' },
    { name: 'OpenVoice AI', category: 'Text To Speech', briefDescription: 'Instant voice cloning.', website: 'https://openvoice.ai' },
    { name: 'LanguageTool', category: 'Writing & Web SEO', briefDescription: 'Multilingual grammar AI.', website: 'https://languagetool.org' },
    { name: 'Mem AI', category: 'Memory', briefDescription: 'AI note-taking and recall.', website: 'https://mem.ai' },
    { name: 'QuizLet', category: 'Memory', briefDescription: 'AI flashcards for learning.', website: 'https://quizlet.com' },
    { name: 'Tattoos AI', category: 'Life Assistants', briefDescription: 'Generate tattoo designs.', website: 'https://tattoos.ai' },
    { name: 'AI HairStyles', category: 'Life Assistants', briefDescription: 'Try virtual hairstyles.', website: 'https://aihairstyles.com' },
    { name: 'Replit AI', category: 'Assistant Code', briefDescription: 'AI coding help in Replit.', website: 'https://replit.com' },
    { name: 'Visily AI', category: 'Design', briefDescription: 'AI UI/UX design tool.', website: 'https://visily.ai' },
    { name: 'Aimy Ads', category: 'Advertising', briefDescription: 'AI campaign manager for ads.', website: 'https://aimyads.com' },
    { name: 'Vidmage', category: 'Face Swap', briefDescription: 'Multi-face swap in media.', website: 'https://vidmage.com' },
    { name: 'Lip Sync Studio', category: 'Video', briefDescription: 'AI lip syncing for videos.', website: 'https://lipsyncstudio.com' },
    { name: 'Dechecker', category: 'AI Detection', briefDescription: 'Content authenticity checker.', website: 'https://dechecker.io' },
    { name: 'AdMakeAI', category: 'Marketing', briefDescription: 'AI ad creation tool.', website: 'https://admakeai.com' },
    { name: 'HitPaw VikPea', category: 'Image Editing', briefDescription: 'AI photo enhancer.', website: 'https://hitpaw.com' },
    { name: 'GPT-5.2', category: 'LLM Models', briefDescription: 'Advanced OpenAI model.', website: 'https://openai.com' },
    { name: 'PixPretty AI Photo Editor', category: 'Image Editing', briefDescription: 'Easy AI edits.', website: 'https://pixpretty.com' },
    { name: 'Freudly AI Therapist', category: 'Healthcare', briefDescription: 'AI mental health support.', website: 'https://freudly.ai' },
    { name: 'Product Link To Video', category: 'Video', briefDescription: 'AI videos from product URLs.', website: 'https://productlinktovideo.com' },
    { name: 'Seedream 4.5', category: 'Image Generators', briefDescription: 'Dream-like image AI.', website: 'https://seedream.ai' },
    { name: 'Live Avatar Alibaba', category: 'Avatars', briefDescription: 'Real-time AI avatars.', website: 'https://alibaba.com/avatar' },
    { name: 'Meta Movie Gen', category: 'Video Generators', briefDescription: "Meta's film-style video AI.", website: 'https://meta.com/moviegen' },
    { name: 'Human or Not 2', category: 'Games', briefDescription: 'AI vs. human detection game.', website: 'https://humanornot.ai' },
    { name: 'ArtFlow AI', category: 'Art', briefDescription: 'Creative AI art flows.', website: 'https://artflow.ai' },
    { name: 'Wan2.5', category: 'Video Generators', briefDescription: 'Fast AI video generation.', website: 'https://wan.video' },
    { name: 'DeepFakesWeb', category: 'Face Swap', briefDescription: 'Web-based deepfake tool.', website: 'https://deepfakesweb.com' },
    { name: 'ATS Resume Checker', category: 'Human Resources', briefDescription: 'AI resume optimizer for ATS.', website: 'https://atsresumechecker.com' },
    { name: 'Semrush Content Toolkit', category: 'Writing & Web SEO', briefDescription: 'SEO-focused content AI.', website: 'https://semrush.com/content' },
    { name: 'Free AI Content Writer', category: 'Writing & Web SEO', briefDescription: "HubSpot's free writer.", website: 'https://hubspot.com/ai-writer' },
    { name: 'Qwen 3', category: 'AI Chat & Assistant', briefDescription: "Alibaba's open LLM.", website: 'https://qwen.alibaba.com' },
    { name: 'DeepSeek-R1', category: 'AI Chat & Assistant', briefDescription: 'Efficient AI model.', website: 'https://deepseek.com' },
    { name: 'Kimi.ai', category: 'AI Chat & Assistant', briefDescription: 'Multimodal Chinese AI.', website: 'https://kimi.ai' },
    { name: 'Le Chat by Mistral AI', category: 'AI Chat & Assistant', briefDescription: "Mistral's conversational AI.", website: 'https://chat.mistral.ai' },
    { name: 'Amazon Nova', category: 'AI Chat & Assistant', briefDescription: "Amazon's enterprise AI.", website: 'https://aws.amazon.com/nova' },
    { name: 'InVideo', category: 'Video Generators', briefDescription: 'Easy AI video maker.', website: 'https://invideo.io' },
    { name: 'FreeTTS', category: 'Text To Speech', briefDescription: 'Open-source TTS.', website: 'https://freetts.com' },
    { name: 'Hailuo AI Audio', category: 'Text To Speech', briefDescription: 'Audio generation AI.', website: 'https://hailuoai.audio' },
    { name: 'Audiobox by Meta', category: 'Audio Editing', briefDescription: "Meta's sound design AI.", website: 'https://audiobox.meta.com' },
    { name: 'Speech Synthesis', category: 'Text To Speech', briefDescription: 'Custom voice synthesis.', website: 'https://speechsynthesis.ai' },
    { name: 'Play HT', category: 'Text To Speech', briefDescription: 'High-quality AI voices.', website: 'https://play.ht' },
    { name: 'Hostinger AI Hub', category: 'E-commerce', briefDescription: 'AI tools for hosting/e-com.', website: 'https://hostinger.com/ai' },
    { name: 'Adcreative AI by Semrush', category: 'E-commerce', briefDescription: 'AI ad creatives.', website: 'https://adcreative.ai' },
    { name: 'Magic by Shopify', category: 'E-commerce', briefDescription: "Shopify's AI enhancements.", website: 'https://shopify.com/magic' },
    { name: 'Free AI Chatbot Builder', category: 'E-commerce', briefDescription: 'HubSpot chatbot.', website: 'https://hubspot.com/chatbot' },
    { name: 'Leffa', category: 'E-commerce', briefDescription: 'Virtual try-on for clothes.', website: 'https://leffa.ai' },
    { name: 'Pokecut', category: 'E-commerce', briefDescription: 'AI background remover.', website: 'https://pokecut.com' },
    { name: 'Waymark', category: 'E-commerce', briefDescription: 'AI video ads for marketing.', website: 'https://waymark.com' },
    { name: 'PhotoG', category: 'E-commerce', briefDescription: 'Product photo AI.', website: 'https://photog.ai' },
    { name: 'FaceCheck ID', category: 'AI Detection', briefDescription: 'Face verification AI.', website: 'https://facecheck.id' },
    { name: 'DeepFake Detector', category: 'AI Detection', briefDescription: 'Spot deepfakes.', website: 'https://deepfakedetector.ai' },
    { name: 'Humanize AI Tools', category: 'AI Detection', briefDescription: 'Make AI text human-like.', website: 'https://humanize.ai' },
    { name: 'Clever AI Humanizer', category: 'AI Detection', briefDescription: 'Advanced text humanizer.', website: 'https://cleveraihumanizer.com' },
    { name: 'ZeroGPT', category: 'AI Detection', briefDescription: 'Free AI detector.', website: 'https://zerogpt.com' },
    { name: 'JobCopilot', category: 'Human Resources', briefDescription: 'AI job search assistant.', website: 'https://jobcopilot.com' },
    { name: 'RemotePeople', category: 'Human Resources', briefDescription: 'AI for remote hiring.', website: 'https://remotepeople.io' },
    { name: 'Workleap', category: 'Human Resources', briefDescription: 'HR process AI.', website: 'https://workleap.com' },
    { name: 'Leet Resumes', category: 'Human Resources', briefDescription: 'AI resume writing.', website: 'https://leetresumes.com' },
    { name: 'AI Career Coach', category: 'Human Resources', briefDescription: 'Personalized career advice.', website: 'https://aicareercoach.com' },
    { name: 'Resume Worded', category: 'Human Resources', briefDescription: 'Score and improve resumes.', website: 'https://resumeworded.com' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function generateKeyFeatures(name: string, category: string, brief: string): string[] {
    const categoryFeatures: Record<string, string[]> = {
        'AI Chat & Assistant': ['Natural language understanding', 'Context-aware responses', 'Multi-turn conversations', 'Task automation', 'Code generation'],
        'Image Generators': ['Text-to-image generation', 'Multiple art styles', 'High-resolution output', 'Style customization', 'Batch generation'],
        'Video Generators': ['Text-to-video creation', 'Motion synthesis', 'Scene generation', 'Video editing', 'HD/4K output'],
        'Text To Speech': ['Natural voice synthesis', 'Multiple languages', 'Voice cloning', 'Emotion control', 'Audio export'],
        'Writing & Web SEO': ['Content generation', 'Grammar checking', 'SEO optimization', 'Tone adjustment', 'Plagiarism detection'],
        'AI Detection': ['AI content detection', 'Authenticity scoring', 'Detailed reports', 'Batch analysis', 'API integration'],
        'Human Resources': ['Resume optimization', 'ATS compatibility', 'Interview prep', 'Job matching', 'Career insights'],
        'E-commerce': ['Product descriptions', 'Marketing copy', 'Visual generation', 'Analytics', 'Automation'],
    };

    return categoryFeatures[category] || [
        'AI-powered automation',
        'User-friendly interface',
        'Fast processing',
        'Cloud-based access',
        'Regular updates'
    ];
}

function generatePros(name: string, category: string): string[] {
    const basePros = [
        `Excellent ${category.toLowerCase()} capabilities`,
        'Easy to use interface',
        'Fast output generation',
        'Regular feature updates',
        'Good documentation'
    ];
    return basePros.slice(0, 4);
}

function generateCons(name: string, category: string): string[] {
    const baseCons = [
        'May require learning curve',
        'Premium features need subscription',
        'Results may vary',
        'Internet connection required'
    ];
    return baseCons.slice(0, 3);
}

function generateUseCases(name: string, category: string): string[] {
    const categoryUseCases: Record<string, string[]> = {
        'AI Chat & Assistant': ['Customer support automation', 'Content brainstorming', 'Code debugging', 'Research assistance', 'Personal productivity'],
        'Image Generators': ['Marketing visuals', 'Social media content', 'Concept art', 'Product mockups', 'Creative projects'],
        'Video Generators': ['Marketing videos', 'Social media clips', 'Explainer videos', 'Product demos', 'Educational content'],
        'Text To Speech': ['Audiobook narration', 'Video voiceovers', 'Podcast production', 'E-learning content', 'Accessibility'],
        'Writing & Web SEO': ['Blog post creation', 'Product descriptions', 'Email marketing', 'Social media posts', 'Website content'],
        'AI Detection': ['Academic integrity', 'Content verification', 'Publishing quality control', 'Hiring verification'],
        'Human Resources': ['Resume building', 'Job applications', 'Interview preparation', 'Career planning', 'Skills assessment'],
        'E-commerce': ['Product listings', 'Ad creation', 'Email campaigns', 'Customer engagement', 'Sales optimization'],
    };

    return categoryUseCases[category] || [
        'Business automation',
        'Creative projects',
        'Personal productivity',
        'Team collaboration'
    ];
}

function generateDescription(name: string, category: string, brief: string): string {
    return `${name} is a powerful AI tool in the ${category} category. ${brief} 

This tool leverages advanced artificial intelligence to help users achieve their goals more efficiently. Whether you're a professional, creator, or hobbyist, ${name} offers intuitive features designed to streamline your workflow.

Key benefits include time savings, improved output quality, and access to cutting-edge AI technology. The tool is designed with user experience in mind, making it accessible to both beginners and experts.

${name} continues to be updated with new features and improvements, ensuring users always have access to the latest AI capabilities.`;
}

function generateTagline(name: string, category: string): string {
    const taglines: Record<string, string> = {
        'AI Chat & Assistant': 'Your intelligent AI companion',
        'Image Generators': 'Create stunning visuals with AI',
        'Video Generators': 'Transform ideas into videos',
        'Text To Speech': 'Give your text a voice',
        'Writing & Web SEO': 'Write smarter, rank higher',
        'AI Detection': 'Verify authenticity with AI',
        'Human Resources': 'AI-powered career success',
        'E-commerce': 'Boost sales with AI',
    };
    return taglines[category] || `AI-powered ${category.toLowerCase()}`;
}

function getPricingType(name: string): string[] {
    // Randomly assign pricing types based on tool name hash
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const types = [
        ['Free', 'Freemium'],
        ['Freemium'],
        ['Paid'],
        ['Free'],
        ['Freemium', 'Paid'],
    ];
    return types[hash % types.length];
}

function getPricing(pricingType: string[]): string {
    if (pricingType.includes('Free') && pricingType.length === 1) {
        return 'Free';
    }
    if (pricingType.includes('Freemium')) {
        return 'Free tier available, Pro from $12/month';
    }
    return 'Starting at $19/month';
}

function getPlatforms(): string[] {
    return ['Web', 'iOS', 'Android', 'API'].slice(0, Math.floor(Math.random() * 3) + 2);
}

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function main() {
    console.log('🌱 Starting to seed 100 AI tools...\n');

    // Step 1: Create all categories
    console.log('📁 Creating categories...');
    const categoryMap: Record<string, number> = {};

    for (const cat of categoryDefinitions) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, featured: cat.featured },
            create: { name: cat.name, slug: cat.slug, featured: cat.featured },
        });
        categoryMap[cat.name] = created.id;
    }
    console.log(`  ✅ Created ${categoryDefinitions.length} categories\n`);

    // Step 2: Create all tools
    console.log('🔧 Creating tools...');
    let created = 0;
    let updated = 0;

    for (const toolDef of toolsData) {
        const slug = slugify(toolDef.name);
        const pricingType = getPricingType(toolDef.name);
        const pricing = getPricing(pricingType);
        const categoryId = categoryMap[toolDef.category];

        if (!categoryId) {
            console.log(`  ⚠️ Category not found for ${toolDef.name}: ${toolDef.category}`);
            continue;
        }

        const toolData = {
            name: toolDef.name,
            slug,
            tagline: generateTagline(toolDef.name, toolDef.category),
            short_description: toolDef.briefDescription,
            description: generateDescription(toolDef.name, toolDef.category, toolDef.briefDescription),
            website: toolDef.website || `https://${slug}.com`,
            pricing_type: pricingType,
            pricing,
            price_range: pricingType.includes('Free') ? 'Free' : '$10-50/month',
            free_trial: pricingType.includes('Freemium') || pricingType.includes('Free'),
            key_features: generateKeyFeatures(toolDef.name, toolDef.category, toolDef.briefDescription),
            pros: generatePros(toolDef.name, toolDef.category),
            cons: generateCons(toolDef.name, toolDef.category),
            use_cases: generateUseCases(toolDef.name, toolDef.category),
            platforms: getPlatforms(),
            verified: true,
            still_active: true,
            featured: toolDef.name.includes('ChatGPT') || toolDef.name.includes('Claude') || toolDef.name.includes('Gemini'),
            seo_title: `${toolDef.name} - ${toolDef.category} | FindMyAI`,
            seo_meta_description: `${toolDef.briefDescription} Compare features, pricing, and alternatives on FindMyAI.`,
        };

        try {
            const existing = await prisma.tool.findUnique({ where: { slug } });

            if (existing) {
                await prisma.tool.update({
                    where: { slug },
                    data: {
                        ...toolData,
                        categories: {
                            connect: [{ id: categoryId }],
                        },
                    },
                });
                updated++;
            } else {
                await prisma.tool.create({
                    data: {
                        ...toolData,
                        categories: {
                            connect: [{ id: categoryId }],
                        },
                    },
                });
                created++;
            }
        } catch (error) {
            console.log(`  ❌ Error with ${toolDef.name}:`, error);
        }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   - Created: ${created} new tools`);
    console.log(`   - Updated: ${updated} existing tools`);
    console.log(`   - Categories: ${categoryDefinitions.length}`);
}

main()
    .catch((e) => {
        console.error('Error seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
