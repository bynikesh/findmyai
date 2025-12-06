// ---------------------------------------------------------------
// autoImportService.ts – AI Tools Auto-Importer
// Fetches tools from public APIs, enriches with AI, saves to DB
// ---------------------------------------------------------------

import prisma from '../lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { fetchUrlMetadata } from './metadataService';

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------

interface RawTool {
    name: string;
    description?: string;
    url?: string;
    category?: string;
    tags?: string[];
    logo?: string;
    coverImage?: string;
    priceType?: 'Free' | 'Freemium' | 'Paid';
    [key: string]: any;
}

interface NormalizedTool {
    name: string;
    description: string;
    short_description?: string;
    website: string;
    category?: string;
    tags: string[];
    logo_url?: string;
    screenshots: string[];
    pricing_type?: string;
    pricing?: string;
    price_range?: string;
    free_trial?: boolean;
    open_source?: boolean;
    repo_url?: string;
    key_features?: string[];
    pros?: string[];
    cons?: string[];
    ideal_for?: string;
    use_cases?: string[];
    platforms?: string[];
    models_used?: string[];
    integrations?: string[];
    api_available?: boolean;
    api_docs_url?: string;
    source: string;
    externalId: string;
    website_url?: string;
}

interface ImportResult {
    source: string;
    fetched: number;
    imported: number;
    skipped: number;
    errors: string[];
}

// ---------------------------------------------------------------
// Category Mapping
// ---------------------------------------------------------------

const VALID_CATEGORIES = [
    'Chatbots',
    'Image Tools',
    'Music',
    'Video',
    'Code',
    'Productivity',
    'Developer AI',
    'Writing',
    'SEO',
    'Education',
    'Other',
];

// ---------------------------------------------------------------
// 1️⃣ FETCH FROM HUGGING FACE
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// Global Stop Flag
// ---------------------------------------------------------------

let shouldStop = false;

export function stopImport() {
    shouldStop = true;
    console.log('🛑 Import stop requested...');
}

export function resetStopFlag() {
    shouldStop = false;
}

// ---------------------------------------------------------------
// 1️⃣ FETCH FROM HUGGING FACE
// ---------------------------------------------------------------

export async function fetchFromHuggingFace(): Promise<ImportResult> {
    resetStopFlag();

    // Create initial log entry
    const logEntry = await prisma.importLog.create({
        data: {
            source: 'huggingface',
            fetched: 0,
            imported: 0,
            skipped: 0,
            timestamp: new Date(),
        },
    });

    const result: ImportResult = {
        source: 'huggingface',
        fetched: 0,
        imported: 0,
        skipped: 0,
        errors: [],
    };

    try {
        console.log('🤗 Fetching from Hugging Face...');

        // Fetch models from Hugging Face API
        const response = await fetch('https://huggingface.co/api/models?limit=50&sort=downloads');

        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.status}`);
        }

        const models = await response.json();
        result.fetched = models.length;

        console.log(`   Found ${models.length} models`);

        for (const model of models) {
            if (shouldStop) {
                console.log('🛑 Import stopped by user.');
                break;
            }

            try {
                // Normalize the model data
                const normalized = await normalizeTool({
                    name: model.modelId || model.id,
                    description: model.description,
                    url: `https://huggingface.co/${model.modelId || model.id}`,
                    tags: model.tags || [],
                    downloads: model.downloads,
                    likes: model.likes,
                }, 'huggingface');

                // Check for duplicates
                const isDuplicate = await dedupeTool(normalized);
                if (isDuplicate) {
                    result.skipped++;
                    continue;
                }

                // Enrich with AI
                const enriched = await enrichTool(normalized);

                // Save to database
                await saveTool(enriched);
                result.imported++;

                console.log(`   ✓ Imported: ${enriched.name}`);
            } catch (error: any) {
                result.errors.push(`Error importing ${model.modelId}: ${error.message}`);
                console.error(`   ✗ Error: ${model.modelId}`, error.message);
            }
        }
    } catch (error: any) {
        result.errors.push(`Hugging Face fetch error: ${error.message}`);
        console.error('❌ Hugging Face error:', error.message);
    }

    // Update log entry with final stats
    await prisma.importLog.update({
        where: { id: logEntry.id },
        data: {
            fetched: result.fetched,
            imported: result.imported,
            skipped: result.skipped,
            errors: result.errors.length > 0 ? (result.errors as any) : [],
        },
    });

    return result;
}

// ---------------------------------------------------------------
// 2️⃣ FETCH FROM OPENROUTER
// ---------------------------------------------------------------

export async function fetchFromOpenRouter(): Promise<ImportResult> {
    const result: ImportResult = {
        source: 'openrouter',
        fetched: 0,
        imported: 0,
        skipped: 0,
        errors: [],
    };

    try {
        console.log('🔀 Fetching from OpenRouter...');

        const response = await fetch('https://openrouter.ai/api/v1/models');

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const models = data.data || [];
        result.fetched = models.length;

        console.log(`   Found ${models.length} models`);

        for (const model of models) {
            try {
                const normalized = await normalizeTool({
                    name: model.name || model.id,
                    description: model.description,
                    url: `https://openrouter.ai/models/${model.id}`,
                    priceType: model.pricing?.prompt === '0' ? 'Free' : 'Paid',
                    context_length: model.context_length,
                }, 'openrouter');

                const isDuplicate = await dedupeTool(normalized);
                if (isDuplicate) {
                    result.skipped++;
                    continue;
                }

                const enriched = await enrichTool(normalized);
                await saveTool(enriched);
                result.imported++;

                console.log(`   ✓ Imported: ${enriched.name}`);
            } catch (error: any) {
                result.errors.push(`Error importing ${model.id}: ${error.message}`);
                console.error(`   ✗ Error: ${model.id}`, error.message);
            }
        }
    } catch (error: any) {
        result.errors.push(`OpenRouter fetch error: ${error.message}`);
        console.error('❌ OpenRouter error:', error.message);
    }

    return result;
}

// ---------------------------------------------------------------
// 3️⃣ FETCH FROM RAPIDAPI (Placeholder - requires specific endpoint)
// ---------------------------------------------------------------

export async function fetchFromRapidAPI(): Promise<ImportResult> {
    const result: ImportResult = {
        source: 'rapidapi',
        fetched: 0,
        imported: 0,
        skipped: 0,
        errors: [],
    };

    try {
        console.log('⚡ Fetching from RapidAPI...');

        // Note: This is a placeholder. You'll need to find a specific free RapidAPI endpoint
        // For now, we'll skip this and return empty results
        console.log('   ⚠️  RapidAPI integration requires specific endpoint configuration');
        console.log('   Skipping for now - add your RapidAPI endpoint here');

    } catch (error: any) {
        result.errors.push(`RapidAPI fetch error: ${error.message}`);
        console.error('❌ RapidAPI error:', error.message);
    }

    return result;
}

// ---------------------------------------------------------------
// 4️⃣ NORMALIZE TOOL DATA
// ---------------------------------------------------------------

export async function normalizeTool(raw: RawTool, source: string): Promise<NormalizedTool> {
    // Generate a slug-friendly external ID
    const externalId = raw.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    return {
        name: raw.name,
        description: raw.description || '',
        website: '', // Official website will be found by AI
        category: raw.category,
        tags: Array.isArray(raw.tags) ? raw.tags.slice(0, 7) : [],
        logo_url: raw.logo || '/default/tool.png',
        screenshots: raw.coverImage ? [raw.coverImage] : ['/default/cover.png'],
        pricing_type: raw.priceType || 'Free',
        // Optional fields with sensible defaults
        pricing: raw.pricing || undefined,
        price_range: raw.priceRange || undefined,
        free_trial: raw.freeTrial ?? false,
        open_source: raw.openSource ?? false,
        repo_url: raw.url || undefined, // Store source URL here
        key_features: raw.keyFeatures || [],
        pros: raw.pros || [],
        cons: raw.cons || [],
        ideal_for: raw.idealFor || undefined,
        use_cases: raw.useCases || [],
        platforms: raw.platforms || [],
        models_used: raw.modelsUsed || [],
        integrations: raw.integrations || [],
        api_available: raw.apiAvailable ?? false,
        api_docs_url: raw.apiDocsUrl || undefined,
        source,
        externalId,
    };
}

// ---------------------------------------------------------------
// 5️⃣ ENRICH TOOL WITH AI (FULL METADATA)
// ---------------------------------------------------------------

export async function enrichTool(tool: NormalizedTool): Promise<NormalizedTool> {
    try {
        console.log(`   ✨ Enriching ${tool.name} with AI...`);
        // Use repo_url as the primary link for AI analysis
        const metadata = await generateFullMetadata(tool.name, tool.description, tool.repo_url || tool.website);

        // Use AI-found website if available and different
        let finalWebsite = tool.website;
        if (metadata.website_url && metadata.website_url.startsWith('http')) {
            finalWebsite = metadata.website_url;
            console.log(`   🌐 AI found official website: ${finalWebsite}`);
        }

        // Fetch logo if missing or default
        let finalLogo = tool.logo_url;
        if ((!finalLogo || finalLogo.includes('default')) && finalWebsite) {
            try {
                console.log(`   🖼️  Fetching logo from: ${finalWebsite}`);
                const meta = await fetchUrlMetadata(finalWebsite);
                if (meta.icon) {
                    finalLogo = meta.icon;
                    console.log(`   ✓ Found logo: ${finalLogo}`);
                } else {
                    console.log(`   ⚠️  No logo found for ${finalWebsite}`);
                }
            } catch (e: any) {
                console.error(`   ❌ Failed to fetch logo from ${finalWebsite}:`, e.message);
            }
        }

        return {
            ...tool,
            ...metadata,
            website: finalWebsite,
            logo_url: finalLogo,
            // Keep original values if AI returns empty/null and we have them
            description: metadata.description || tool.description,
            category: VALID_CATEGORIES.includes(metadata.category || '') ? metadata.category : 'Other',
            tags: (metadata.tags && metadata.tags.length > 0) ? metadata.tags : tool.tags,
        };
    } catch (error: any) {
        console.error(`   ⚠️  AI enrichment error for ${tool.name}:`, error.message);
        return tool;
    }
}

// ---------------------------------------------------------------
// AI Helper: Generate Full Metadata
// ---------------------------------------------------------------

async function generateFullMetadata(name: string, description: string, url: string): Promise<Partial<NormalizedTool>> {
    try {
        const prompt = `
You are an expert AI tool analyst. Analyze the following AI tool and generate a comprehensive JSON profile for it.

Tool Name: ${name}
Initial Description: ${description}
Link: ${url}

Please generate a valid JSON object with the following fields. Do not include any markdown formatting, just the raw JSON.

Fields required:
- description: A detailed, engaging description (2-3 paragraphs).
- short_description: A concise 1-2 sentence summary (max 160 chars).
- category: Choose ONE from: [${VALID_CATEGORIES.join(', ')}].
- tags: Array of 5-10 relevant tags.
- key_features: Array of 3-6 key features.
- pros: Array of 3-5 pros.
- cons: Array of 1-3 potential limitations.
- ideal_for: Target audience (e.g., "Content Creators, Developers").
- use_cases: Array of 3-5 specific use cases.
- pricing_type: One of ["Free", "Freemium", "Paid", "One-time", "Open Source"].
- pricing: Short text describing pricing (e.g., "$10/mo", "Free tier available").
- price_range: Estimated range (e.g., "$0 - $50/mo").
- free_trial: boolean.
- open_source: boolean.
- api_available: boolean.
- website_url: The official website URL of the tool (NOT the huggingface/openrouter link). If unknown, leave empty.
- platforms: Array of platforms (e.g., ["Web", "iOS", "Android", "Mac", "Windows", "Linux"]).

If you are unsure about a specific field, make a reasonable inference based on the tool's nature or leave it as a generic default. Ensure the JSON is valid.
`;

        const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1500,
            messages: [{
                role: 'user',
                content: prompt,
            }],
        });

        const content = message.content[0];
        if (content.type === 'text') {
            try {
                // Clean up potential markdown code blocks
                const jsonStr = content.text.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(jsonStr);
            } catch (e) {
                console.error('Failed to parse AI JSON response');
                return {};
            }
        }
        return {};
    } catch (error) {
        console.error('Full metadata generation error:', error);
        return {};
    }
}

// ---------------------------------------------------------------
// 6️⃣ DEDUPLICATE TOOL
// ---------------------------------------------------------------

export async function dedupeTool(tool: NormalizedTool): Promise<boolean> {
    // Check by external ID and source
    const existingByExternal = await prisma.tool.findFirst({
        where: {
            source: tool.source,
            externalId: tool.externalId,
        },
    });

    if (existingByExternal) {
        return true; // Duplicate found
    }

    // Check by name (case-insensitive)
    const existingByName = await prisma.tool.findFirst({
        where: {
            name: {
                equals: tool.name,
                mode: 'insensitive',
            },
        },
    });

    if (existingByName) {
        return true; // Duplicate found
    }

    return false; // Not a duplicate
}

// ---------------------------------------------------------------
// 7️⃣ SAVE TOOL TO DATABASE
// ---------------------------------------------------------------

export async function saveTool(tool: NormalizedTool): Promise<void> {
    // Generate slug
    const slug = tool.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Math.random().toString(36).substring(2, 7);

    // Find or create category
    let category;
    if (tool.category) {
        category = await prisma.category.findFirst({
            where: { name: tool.category },
        });

        if (!category) {
            const categorySlug = tool.category
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-');

            category = await prisma.category.create({
                data: {
                    name: tool.category,
                    slug: categorySlug,
                },
            });
        }
    }

    // Find or create tags
    const tagRecords = [];
    for (const tagName of tool.tags) {
        let tag = await prisma.tag.findFirst({
            where: { name: tagName },
        });

        if (!tag) {
            tag = await prisma.tag.create({
                data: { name: tagName },
            });
        }

        tagRecords.push(tag);
    }

    // Create the tool
    await prisma.tool.create({
        data: {
            name: tool.name,
            slug,
            description: tool.description,
            short_description: tool.short_description || tool.description.substring(0, 160),
            website: tool.website,
            logo_url: tool.logo_url,
            screenshots: tool.screenshots,

            // Pricing
            pricing_type: tool.pricing_type,
            pricing: tool.pricing,
            price_range: tool.price_range,
            free_trial: tool.free_trial || false,
            open_source: tool.open_source || false,
            repo_url: tool.repo_url,

            // Detailed Info
            key_features: tool.key_features || [],
            pros: tool.pros || [],
            cons: tool.cons || [],
            ideal_for: tool.ideal_for,
            use_cases: tool.use_cases || [],

            // Technical
            platforms: tool.platforms || [],
            models_used: tool.models_used || [],
            integrations: tool.integrations || [],
            api_available: tool.api_available || false,
            api_docs_url: tool.api_docs_url,

            // Admin
            source: tool.source,
            externalId: tool.externalId,
            verified: false,
            featured: false,
            still_active: true,

            categories: category ? {
                connect: [{ id: category.id }],
            } : undefined,
            tags: {
                connect: tagRecords.map(tag => ({ id: tag.id })),
            },
        },
    });
}

// ---------------------------------------------------------------
// 8️⃣ RUN FULL IMPORT
// ---------------------------------------------------------------

export async function runImportAll(): Promise<ImportResult[]> {
    console.log('🚀 Starting full import from all sources...\n');

    const results: ImportResult[] = [];

    // Import from Hugging Face
    const hfResult = await fetchFromHuggingFace();
    results.push(hfResult);
    await logImport(hfResult);

    // Import from OpenRouter
    const orResult = await fetchFromOpenRouter();
    results.push(orResult);
    await logImport(orResult);

    // Import from RapidAPI
    const raResult = await fetchFromRapidAPI();
    results.push(raResult);
    await logImport(raResult);

    // Create summary log
    const summary: ImportResult = {
        source: 'all',
        fetched: results.reduce((sum, r) => sum + r.fetched, 0),
        imported: results.reduce((sum, r) => sum + r.imported, 0),
        skipped: results.reduce((sum, r) => sum + r.skipped, 0),
        errors: results.flatMap(r => r.errors),
    };
    await logImport(summary);

    console.log('\n✅ Import complete!');
    console.log(`   Total fetched: ${summary.fetched}`);
    console.log(`   Total imported: ${summary.imported}`);
    console.log(`   Total skipped: ${summary.skipped}`);
    console.log(`   Total errors: ${summary.errors.length}`);

    return results;
}

// ---------------------------------------------------------------
// 9️⃣ LOG IMPORT TO DATABASE
// ---------------------------------------------------------------

async function logImport(result: ImportResult): Promise<void> {
    await prisma.importLog.create({
        data: {
            source: result.source,
            fetched: result.fetched,
            imported: result.imported,
            skipped: result.skipped,
            errors: result.errors.length > 0 ? (result.errors as any) : [],
        },
    });
}

// ---------------------------------------------------------------
// 🔟 GET IMPORT LOGS
// ---------------------------------------------------------------

export async function getImportLogs(limit: number = 20) {
    return await prisma.importLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
    });
}
