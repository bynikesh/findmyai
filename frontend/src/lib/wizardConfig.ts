// Wizard configuration and types for "Help Me Choose" recommendation engine

// ============ TYPES ============

export interface WizardAnswer {
    roles: string[];
    tasks: string[];
    budget: string;
    skillLevel: string;
}

export interface ToolMatch {
    id: number;
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    logo_url?: string | null;
    website?: string;
    pricing: string;
    pricing_type?: string[];
    categories: { name: string; slug: string }[];
    tags?: string[];
    difficulty?: string;
    verified?: boolean;
    score: number;
    badges: string[];
}

// ============ CONFIGURATION ============

export const ROLES = [
    { id: 'founder', label: 'Founder / Entrepreneur', icon: '🚀' },
    { id: 'student', label: 'Student', icon: '📚' },
    { id: 'marketer', label: 'Marketer', icon: '📈' },
    { id: 'developer', label: 'Developer', icon: '💻' },
    { id: 'content-creator', label: 'Content Creator', icon: '🎬' },
    { id: 'freelancer', label: 'Freelancer', icon: '💼' },
    { id: 'researcher', label: 'Researcher', icon: '🔬' },
    { id: 'designer', label: 'Designer', icon: '🎨' },
    { id: 'other', label: 'Other', icon: '✨' },
];

export const TASK_CATEGORIES = [
    {
        id: 'writing',
        label: 'Writing',
        icon: '✍️',
        tasks: [
            { id: 'emails', label: 'Emails & Communication' },
            { id: 'blogs', label: 'Blog Posts & Articles' },
            { id: 'social', label: 'Social Media Content' },
            { id: 'scripts', label: 'Scripts & Copy' },
            { id: 'documentation', label: 'Documentation' },
        ],
    },
    {
        id: 'visual',
        label: 'Visual',
        icon: '🖼️',
        tasks: [
            { id: 'images', label: 'Image Generation' },
            { id: 'logos', label: 'Logos & Branding' },
            { id: 'videos', label: 'Video Creation' },
            { id: 'editing', label: 'Photo/Video Editing' },
            { id: 'presentations', label: 'Presentations' },
        ],
    },
    {
        id: 'productivity',
        label: 'Productivity',
        icon: '⚡',
        tasks: [
            { id: 'automation', label: 'Workflow Automation' },
            { id: 'agents', label: 'AI Agents' },
            { id: 'summarization', label: 'Summarization' },
            { id: 'research', label: 'Research & Analysis' },
            { id: 'scheduling', label: 'Scheduling & Planning' },
        ],
    },
    {
        id: 'developer',
        label: 'Developer',
        icon: '🛠️',
        tasks: [
            { id: 'code-generation', label: 'Code Generation' },
            { id: 'debugging', label: 'Debugging & Review' },
            { id: 'api', label: 'API Integration' },
            { id: 'testing', label: 'Testing & QA' },
            { id: 'deployment', label: 'DevOps & Deployment' },
        ],
    },
    {
        id: 'audio',
        label: 'Audio',
        icon: '🎵',
        tasks: [
            { id: 'voice', label: 'Voice Generation' },
            { id: 'music', label: 'Music Creation' },
            { id: 'transcription', label: 'Transcription' },
            { id: 'podcasts', label: 'Podcast Production' },
        ],
    },
];

export const BUDGET_OPTIONS = [
    { id: 'free', label: 'Free only', icon: '🆓', description: 'No budget for paid tools' },
    { id: 'under-10', label: 'Under $10/month', icon: '💵', description: 'Light spending' },
    { id: 'under-30', label: 'Under $30/month', icon: '💰', description: 'Moderate budget' },
    { id: 'unlimited', label: 'No budget limit', icon: '💎', description: 'Best tool regardless of cost' },
];

export const SKILL_LEVELS = [
    { id: 'beginner', label: 'Beginner', icon: '🌱', description: 'New to AI tools, prefer simple interfaces' },
    { id: 'intermediate', label: 'Intermediate', icon: '🌿', description: 'Comfortable with most tools' },
    { id: 'advanced', label: 'Advanced', icon: '🌳', description: 'Can handle complex setups and APIs' },
];

// ============ SCORING WEIGHTS ============

export const SCORING_WEIGHTS = {
    role: 0.30,      // 30%
    task: 0.40,      // 40%
    budget: 0.20,    // 20%
    skill: 0.10,     // 10%
};

// ============ ROLE TO CATEGORY MAPPING ============

export const ROLE_CATEGORY_MAPPING: Record<string, string[]> = {
    'founder': ['productivity', 'writing', 'analytics', 'marketing'],
    'student': ['writing', 'research', 'productivity', 'education'],
    'marketer': ['marketing', 'writing', 'social-media', 'analytics', 'seo'],
    'developer': ['developer', 'code', 'productivity', 'api'],
    'content-creator': ['visual', 'video', 'audio', 'writing', 'social-media'],
    'freelancer': ['productivity', 'writing', 'visual', 'automation'],
    'researcher': ['research', 'writing', 'productivity', 'analytics'],
    'designer': ['visual', 'design', 'images', 'graphics'],
    'other': [],
};

// ============ TASK TO TAG MAPPING ============

export const TASK_TAG_MAPPING: Record<string, string[]> = {
    // Writing
    'emails': ['email', 'writing', 'communication', 'copywriting'],
    'blogs': ['blog', 'writing', 'content', 'articles', 'seo'],
    'social': ['social media', 'content', 'marketing', 'posts'],
    'scripts': ['copywriting', 'scripts', 'writing', 'ads'],
    'documentation': ['documentation', 'writing', 'technical'],
    // Visual
    'images': ['image generation', 'ai art', 'images', 'graphics', 'midjourney', 'dalle'],
    'logos': ['logo', 'branding', 'design', 'graphics'],
    'videos': ['video', 'video generation', 'video editing'],
    'editing': ['editing', 'photo editing', 'video editing'],
    'presentations': ['presentations', 'slides', 'design'],
    // Productivity
    'automation': ['automation', 'workflow', 'zapier', 'productivity'],
    'agents': ['ai agents', 'agents', 'autonomous', 'auto-gpt'],
    'summarization': ['summarization', 'summary', 'tldr', 'reading'],
    'research': ['research', 'analysis', 'data', 'insights'],
    'scheduling': ['scheduling', 'calendar', 'planning', 'productivity'],
    // Developer
    'code-generation': ['code', 'coding', 'programming', 'copilot', 'code generation'],
    'debugging': ['debugging', 'code review', 'testing'],
    'api': ['api', 'integration', 'developer'],
    'testing': ['testing', 'qa', 'quality'],
    'deployment': ['devops', 'deployment', 'ci/cd'],
    // Audio
    'voice': ['voice', 'text-to-speech', 'tts', 'voice generation'],
    'music': ['music', 'audio', 'music generation'],
    'transcription': ['transcription', 'speech-to-text', 'stt'],
    'podcasts': ['podcast', 'audio', 'recording'],
};

// ============ BADGE ASSIGNMENT LOGIC ============

export function assignBadges(tools: ToolMatch[]): ToolMatch[] {
    if (tools.length === 0) return tools;

    const badgedTools = tools.map(tool => ({ ...tool, badges: [] as string[] }));

    // Best Free Option - highest scoring free tool
    const freeTools = badgedTools.filter(t =>
        t.pricing?.toLowerCase().includes('free') ||
        t.pricing_type?.some(p => p.toLowerCase() === 'free')
    );
    if (freeTools.length > 0) {
        const bestFree = freeTools.reduce((a, b) => a.score > b.score ? a : b);
        const idx = badgedTools.findIndex(t => t.id === bestFree.id);
        if (idx !== -1) badgedTools[idx].badges.push('Best Free Option');
    }

    // Best Value - freemium or under $10 with high score
    const valueTools = badgedTools.filter(t =>
        t.pricing?.toLowerCase().includes('freemium') ||
        t.pricing_type?.some(p => ['freemium', 'trial'].includes(p.toLowerCase()))
    );
    if (valueTools.length > 0) {
        const bestValue = valueTools.reduce((a, b) => a.score > b.score ? a : b);
        const idx = badgedTools.findIndex(t => t.id === bestValue.id);
        if (idx !== -1 && !badgedTools[idx].badges.includes('Best Free Option')) {
            badgedTools[idx].badges.push('Best Value');
        }
    }

    // Most Powerful - highest scoring tool overall
    const mostPowerful = badgedTools.reduce((a, b) => a.score > b.score ? a : b);
    const powerIdx = badgedTools.findIndex(t => t.id === mostPowerful.id);
    if (powerIdx !== -1 && badgedTools[powerIdx].badges.length === 0) {
        badgedTools[powerIdx].badges.push('Most Powerful');
    }

    // Easiest to Use - beginner-friendly
    const easyTools = badgedTools.filter(t =>
        t.difficulty?.toLowerCase() === 'beginner' ||
        t.tags?.some(tag => ['easy', 'simple', 'beginner', 'no-code'].includes(tag.toLowerCase()))
    );
    if (easyTools.length > 0) {
        const easiest = easyTools.reduce((a, b) => a.score > b.score ? a : b);
        const easyIdx = badgedTools.findIndex(t => t.id === easiest.id);
        if (easyIdx !== -1 && badgedTools[easyIdx].badges.length === 0) {
            badgedTools[easyIdx].badges.push('Easiest to Use');
        }
    }

    return badgedTools;
}

// ============ SCORING FUNCTION ============

export function scoreTools(
    tools: any[],
    answers: WizardAnswer
): ToolMatch[] {
    const scoredTools = tools.map(tool => {
        let score = 0;

        // 1. Role Match (30%)
        const roleScore = calculateRoleScore(tool, answers.roles);
        score += roleScore * SCORING_WEIGHTS.role;

        // 2. Task Match (40%)
        const taskScore = calculateTaskScore(tool, answers.tasks);
        score += taskScore * SCORING_WEIGHTS.task;

        // 3. Budget Match (20%)
        const budgetScore = calculateBudgetScore(tool, answers.budget);
        score += budgetScore * SCORING_WEIGHTS.budget;

        // 4. Skill Level Match (10%)
        const skillScore = calculateSkillScore(tool, answers.skillLevel);
        score += skillScore * SCORING_WEIGHTS.skill;

        return {
            ...tool,
            score: Math.round(score * 100),
            badges: [],
        } as ToolMatch;
    });

    // Sort by score (highest first)
    const sortedTools = scoredTools.sort((a, b) => b.score - a.score);

    // Filter to only tools with meaningful scores
    const relevantTools = sortedTools.filter(t => t.score > 10);

    // Take top 5 and assign badges
    const topTools = relevantTools.slice(0, 5);
    return assignBadges(topTools);
}

function calculateRoleScore(tool: any, roles: string[]): number {
    if (roles.length === 0) return 0.5; // Neutral if no role selected

    const toolCategories = tool.categories?.map((c: any) => c.slug.toLowerCase()) || [];
    const toolTags = tool.tags?.map((t: string) => t.toLowerCase()) || [];
    const toolName = tool.name?.toLowerCase() || '';
    const toolDesc = tool.description?.toLowerCase() || '';

    let matches = 0;
    for (const role of roles) {
        const relevantCategories = ROLE_CATEGORY_MAPPING[role] || [];
        for (const cat of relevantCategories) {
            if (toolCategories.some((tc: string) => tc.includes(cat))) matches++;
            if (toolTags.some((tt: string) => tt.includes(cat))) matches++;
            if (toolName.includes(cat) || toolDesc.includes(cat)) matches += 0.5;
        }
    }

    return Math.min(matches / (roles.length * 2), 1);
}

function calculateTaskScore(tool: any, tasks: string[]): number {
    if (tasks.length === 0) return 0.5;

    const toolTags = tool.tags?.map((t: string) => t.toLowerCase()) || [];
    const toolCategories = tool.categories?.map((c: any) => c.name.toLowerCase()) || [];
    const toolName = tool.name?.toLowerCase() || '';
    const toolDesc = tool.description?.toLowerCase() || '';

    let matches = 0;
    for (const task of tasks) {
        const relevantTags = TASK_TAG_MAPPING[task] || [];
        for (const tag of relevantTags) {
            if (toolTags.some((tt: string) => tt.includes(tag))) matches++;
            if (toolCategories.some((tc: string) => tc.includes(tag))) matches++;
            if (toolName.includes(tag)) matches += 0.5;
            if (toolDesc.includes(tag)) matches += 0.3;
        }
    }

    return Math.min(matches / (tasks.length * 3), 1);
}

function calculateBudgetScore(tool: any, budget: string): number {
    const pricing = tool.pricing?.toLowerCase() || '';
    const pricingTypes = tool.pricing_type?.map((p: string) => p.toLowerCase()) || [];

    const isFree = pricing.includes('free') || pricingTypes.includes('free');
    const isFreemium = pricing.includes('freemium') || pricingTypes.includes('freemium');
    const hasTrial = pricingTypes.includes('trial');

    switch (budget) {
        case 'free':
            return isFree ? 1 : (isFreemium || hasTrial) ? 0.5 : 0;
        case 'under-10':
            return isFree || isFreemium ? 1 : hasTrial ? 0.8 : 0.5;
        case 'under-30':
            return isFree || isFreemium || hasTrial ? 1 : 0.7;
        case 'unlimited':
            return 1; // All tools are acceptable
        default:
            return 0.5;
    }
}

function calculateSkillScore(tool: any, skillLevel: string): number {
    const toolDifficulty = tool.difficulty?.toLowerCase() || 'intermediate';
    const toolTags = tool.tags?.map((t: string) => t.toLowerCase()) || [];

    const isNoCode = toolTags.some((t: string) => ['no-code', 'easy', 'simple', 'beginner-friendly'].includes(t));
    const isAdvanced = toolTags.some((t: string) => ['api', 'developer', 'advanced', 'technical'].includes(t));

    switch (skillLevel) {
        case 'beginner':
            if (toolDifficulty === 'beginner' || isNoCode) return 1;
            if (toolDifficulty === 'intermediate') return 0.6;
            return 0.3;
        case 'intermediate':
            if (toolDifficulty === 'intermediate') return 1;
            return 0.7;
        case 'advanced':
            if (isAdvanced || toolDifficulty === 'advanced') return 1;
            return 0.8; // Advanced users can use any tool
        default:
            return 0.5;
    }
}
