// Append to existing claude.ts file

import Anthropic from '@anthropic-ai/sdk';
import { getClaudeClient } from './claude';

export interface SEOContentRequest {
    type: 'category' | 'tool';
    categoryName?: string;
    categorySlug?: string;
    toolName?: string;
    toolDescription?: string;
    toolCount?: number; // For category, number of tools in category
}

export interface SEOContentResponse {
    seo_title: string;
    seo_description: string;
    seo_h1: string;
    seo_content: string;
}

/**
 * SEO PROMPT TEMPLATE
 * 
 * This prompt generates search-engine optimized content for categories or tools.
 * It ensures:
 * - SEO title is exactly 50-60 characters
 * - Meta description is 145-155 characters
 * - H1 is compelling and keyword-rich
 * - Content is 250-400 words with 2-3 paragraphs
 */
const SEO_PROMPT_TEMPLATE = `You are an expert SEO copywriter specializing in AI tools and technology.

Your task is to create highly optimized, compelling SEO content that will rank well in search engines and convert visitors.

REQUIREMENTS:
1. SEO Title: Exactly 50-60 characters, include primary keyword, make it click-worthy
2. Meta Description: Exactly 145-155 characters, include primary keyword, include a call-to-action
3. H1: Compelling headline with primary keyword, different from SEO title
4. Content: 250-400 words, 2-3 paragraphs
   - First paragraph: Hook + value proposition (what users will find/learn)
   - Second paragraph: Key benefits or features
   - Third paragraph (optional): Call-to-action or social proof

GUIDELINES:
- Use natural language, avoid keyword stuffing
- Be specific and data-driven when possible
- Include emotional triggers (efficiency, innovation, save time/money)
- Write in active voice
- Target both beginners and professionals
- Make content skimmable with strong topic sentences

OUTPUT FORMAT:
Return ONLY a valid JSON object with these exact keys:
{
  "seo_title": "...",
  "seo_description": "...",
  "seo_h1": "...",
  "seo_content": "..."
}

Do NOT include any markdown, code blocks, or extra text. Just the raw JSON.`;

/**
 * Generate SEO content using Claude
 */
export async function generateSEOContent(
    request: SEOContentRequest
): Promise<SEOContentResponse> {
    const client = getClaudeClient();

    if (!client) {
        throw new Error('Claude API not configured');
    }

    // Build context based on type
    let contextPrompt = '';

    if (request.type === 'category') {
        contextPrompt = `
CATEGORY INFO:
- Category: ${request.categoryName}
- Slug: ${request.categorySlug}
- Number of tools: ${request.toolCount || 'Multiple'}

TARGET AUDIENCE: People searching for AI tools in the "${request.categoryName}" category

PRIMARY KEYWORD: "${request.categoryName}"
SECONDARY KEYWORDS: "best ${request.categoryName}", "${request.categoryName} tools", "AI for ${request.categoryName?.toLowerCase()}"

Create SEO content for a category page that lists ${request.categoryName} tools.
Focus on helping users discover and compare the best tools in this category.`;
    } else {
        contextPrompt = `
TOOL INFO:
- Tool Name: ${request.toolName}
- Description: ${request.toolDescription}

TARGET AUDIENCE: People searching for "${request.toolName}" or solutions it provides

PRIMARY KEYWORD: "${request.toolName}"
SECONDARY KEYWORDS: "${request.toolName} review", "${request.toolName} features", "${request.toolName} pricing"

Create SEO content for a tool detail page that showcases this specific AI tool.
Focus on helping users understand what the tool does and why they should try it.`;
    }

    try {
        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1500,
            temperature: 0.7,
            system: SEO_PROMPT_TEMPLATE,
            messages: [
                {
                    role: 'user',
                    content: contextPrompt
                }
            ],
        });

        const content = response.content[0];
        if (content.type !== 'text') {
            throw new Error('Unexpected response type from Claude');
        }

        // Parse JSON response
        const seoData = JSON.parse(content.text);

        // Validate response
        if (!seoData.seo_title || !seoData.seo_description || !seoData.seo_h1 || !seoData.seo_content) {
            throw new Error('Invalid SEO content structure from Claude');
        }

        // Validate lengths
        if (seoData.seo_title.length > 60) {
            throw new Error(`SEO title too long: ${seoData.seo_title.length} chars`);
        }
        if (seoData.seo_description.length > 160) {
            throw new Error(`Meta description too long: ${seoData.seo_description.length} chars`);
        }

        return seoData;
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            throw new Error('Failed to parse JSON from Claude response');
        }
        throw error;
    }
}
