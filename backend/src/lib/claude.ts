import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

export function getClaudeClient(): Anthropic | null {
    if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('ANTHROPIC_API_KEY not configured. AI features disabled.');
        return null;
    }

    if (!anthropicClient) {
        anthropicClient = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }

    return anthropicClient;
}

export interface ToolSummaryRequest {
    toolId?: number;
    toolData?: {
        name: string;
        description: string;
        features?: string[];
    };
}

export interface ToolSummaryResponse {
    summary: string;
    pros: string[];
    cons: string[];
    whoFor: string;
}

/**
 * Generate a tool summary using Claude AI
 */
export async function generateToolSummary(
    request: ToolSummaryRequest
): Promise<ToolSummaryResponse> {
    const client = getClaudeClient();

    if (!client) {
        throw new Error('Claude AI is not configured');
    }

    // Build the prompt based on available data
    const { toolData } = request;

    if (!toolData) {
        throw new Error('toolData is required');
    }

    const featuresText = toolData.features?.length
        ? `\n\nKey Features:\n${toolData.features.map(f => `- ${f}`).join('\n')}`
        : '';

    const prompt = `You are an AI expert reviewing software tools. Analyze the following AI tool and provide a structured summary.

Tool Name: ${toolData.name}
Description: ${toolData.description}${featuresText}

Please provide a JSON response with the following structure:
{
  "summary": "A 100-150 word overview of what this tool does and its main value proposition",
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2", "con3"],
  "whoFor": "A 3-sentence description of the ideal user or use case for this tool"
}

Keep your response concise, objective, and helpful. Focus on practical insights.`;

    try {
        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        // Extract text from Claude's response
        const content = response.content[0];
        if (content.type !== 'text') {
            throw new Error('Unexpected response type from Claude');
        }

        // Parse the JSON response
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse JSON from Claude response');
        }

        const parsed = JSON.parse(jsonMatch[0]) as ToolSummaryResponse;

        return parsed;
    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw new Error('Failed to generate AI summary');
    }
}

// ============================================================================
// TOOL COMPARISON
// ============================================================================

export interface ToolComparisonRequest {
    toolIds: number[];
    focus?: string; // e.g., "best for speed", "best for beginners"
}

export interface ComparisonRow {
    key: string;
    [toolName: string]: string; // Dynamic keys for each tool
}

export interface ToolComparisonResponse {
    comparisonTable: ComparisonRow[];
    recommendation: string;
}

interface ToolComparisonData {
    id: number;
    name: string;
    description: string;
    pricing: string;
    website: string;
    platforms?: string[];
    models_used?: string[];
}

/**
 * Generate a side-by-side comparison of multiple tools using Claude AI
 * 
 * PROMPT TEMPLATE:
 * The following multi-step prompt is sent to Claude to ensure structured output:
 * 
 * Step 1: Context Setting
 * - Introduce the comparison task
 * - Specify the focus area (if provided)
 * 
 * Step 2: Tool Data Presentation
 * - Present each tool with key details
 * - Include pricing, features, integrations
 * 
 * Step 3: Analysis Request
 * - Request side-by-side comparison table
 * - Request final recommendation for the specific focus
 * 
 * Step 4: Output Format
 * - Enforce strict JSON structure
 * - Define comparison row schema
 */
export async function generateToolComparison(
    request: ToolComparisonRequest,
    toolsData: ToolComparisonData[]
): Promise<ToolComparisonResponse> {
    const client = getClaudeClient();

    if (!client) {
        throw new Error('Claude AI is not configured');
    }

    if (toolsData.length < 2) {
        throw new Error('At least 2 tools are required for comparison');
    }

    if (toolsData.length > 5) {
        throw new Error('Maximum 5 tools can be compared at once');
    }

    const { focus = 'general comparison' } = request;

    // Build tool descriptions
    const toolDescriptions = toolsData
        .map((tool, idx) => {
            const platforms = tool.platforms?.length ? tool.platforms.join(', ') : 'Web';
            const models = tool.models_used?.length ? tool.models_used.join(', ') : 'N/A';
            
            return `
Tool ${idx + 1}: ${tool.name}
- Description: ${tool.description}
- Pricing: ${tool.pricing || 'Not specified'}
- Platforms: ${platforms}
- AI Models: ${models}
- Website: ${tool.website}`.trim();
        })
        .join('\n\n');

    // Tool names for table headers
    const toolNames = toolsData.map(t => t.name);
    const toolNamesJson = JSON.stringify(toolNames);

    // The exact multi-step prompt sent to Claude
    const prompt = `You are an expert AI consultant comparing software tools for clients. Your task is to create a comprehensive, objective comparison.

FOCUS: ${focus}

=== TOOLS TO COMPARE ===

${toolDescriptions}

=== YOUR TASK ===

1. Create a side-by-side comparison table covering these aspects:
   - Key Features
   - Pricing Model
   - Ease of Use (rate 1-5)
   - Integrations Available
   - Best Use Case
   - Performance/Speed
   - Learning Curve

2. Based on the focus "${focus}", provide a final recommendation identifying which tool(s) are most suitable and why.

=== OUTPUT FORMAT ===

Respond ONLY with valid JSON in this exact structure:

{
  "comparisonTable": [
    {
      "key": "Key Features",
      "${toolNames[0]}": "description for tool 1",
      "${toolNames[1]}": "description for tool 2"
      ${toolNames.length > 2 ? `, "${toolNames[2]}": "description for tool 3"` : ''}
    },
    {
      "key": "Pricing Model",
      "${toolNames[0]}": "pricing info",
      "${toolNames[1]}": "pricing info"
      ${toolNames.length > 2 ? `, "${toolNames[2]}": "pricing info"` : ''}
    }
    // ... continue for all comparison aspects
  ],
  "recommendation": "A 2-3 sentence recommendation identifying the best tool(s) for the specific focus: '${focus}'. Be specific about which tool excels and why."
}

IMPORTANT:
- Keep each cell concise (max 50 words)
- Use the exact tool names as shown: ${toolNamesJson}
- Be objective and fact-based
- Include 7-10 comparison rows
- Make the recommendation actionable`;

    try {
        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        // Extract text from Claude's response
        const content = response.content[0];
        if (content.type !== 'text') {
            throw new Error('Unexpected response type from Claude');
        }

        // Parse the JSON response
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse JSON from Claude response');
        }

        const parsed = JSON.parse(jsonMatch[0]) as ToolComparisonResponse;

        // Validate response structure
        if (!parsed.comparisonTable || !Array.isArray(parsed.comparisonTable)) {
            throw new Error('Invalid comparison table in response');
        }

        if (!parsed.recommendation) {
            throw new Error('Missing recommendation in response');
        }

        return parsed;
    } catch (error) {
        console.error('Error calling Claude API for comparison:', error);
        throw new Error('Failed to generate tool comparison');
    }
}

// ============================================================================
// CHAT ASSISTANT
// ============================================================================

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatRequest {
    sessionId: string;
    messages: ChatMessage[];
    userProfile?: {
        industry?: string;
        teamSize?: string;
        budget?: string;
    };
}

export interface ToolRecommendation {
    name: string;
    reason: string;
    link: string;
}

export interface ChatResponse {
    message: string;
    recommendations?: ToolRecommendation[];
    suggestedActions?: string[];
}

/**
 * SYSTEM PROMPT TEMPLATE for FindMyAI Assistant
 * 
 * This prompt configures Claude to act as a helpful AI tool recommendation assistant
 */
const ASSISTANT_SYSTEM_PROMPT = `You are the FindMyAI Assistant, an expert AI consultant helping users discover the perfect AI tools for their needs.

YOUR ROLE:
- Ask clarifying questions (max 3) to understand user requirements
- Recommend relevant AI tools from the directory
- Provide actionable next steps (compare tools, save favorites, etc.)

CONVERSATION GUIDELINES:
1. Be conversational and friendly, not robotic
2. Ask ONE question at a time if clarification is needed
3. Focus on understanding: use case, budget, technical expertise, team size
4. Maximum 3 clarifying questions before making recommendations
5. Recommend 3-5 tools maximum per response

RECOMMENDATION FORMAT:
When recommending tools, use this structure:
"I recommend the following tools:

1. **[Tool Name]** - [One-sentence reason why it fits their needs]
2. **[Tool Name]** - [One-sentence reason]
...

Would you like to:
- Compare these tools side-by-side
- Learn more about any specific tool
- See pricing details"

AVAILABLE TOOLS DATABASE:
You have access to a directory of AI tools. When the user describes their needs, match them to appropriate tools based on:
- Category (chatbots, image generation, coding, writing, productivity, etc.)
- Pricing (Free, Freemium, Paid)
- Use case fit
- Technical complexity

FEW-SHOT EXAMPLES:

Example 1:
User: "I need an AI tool for my startup"
Assistant: "I'd be happy to help you find the right AI tool! To give you the best recommendations, could you tell me what specific task you're looking to accomplish? For example, are you interested in content creation, customer support, coding assistance, or something else?"

Example 2:
User: "I want to automate customer support with AI"
Assistant: "Great! AI-powered customer support can save a lot of time. A few quick questions:

1. What size is your support team currently?
2. What's your approximate budget (free tools only, up to $100/month, or enterprise)?
3. Do you need integration with specific platforms like Zendesk or Slack?"

Example 3:
User: "We're a team of 5, budget around $50/month, and we use Intercom"
Assistant: "Perfect! Based on your needs, I recommend:

1. **Zendesk AI** - Integrates with Intercom, AI-powered ticket routing and responses, $49/month
2. **Ada** - Freemium chatbot with Intercom integration, great for small teams
3. **Tidio** - AI chatbot starting at $29/month, easy setup, Intercom-compatible

Would you like to:
- Compare these three tools side-by-side
- See detailed pricing breakdowns
- Learn about implementation complexity"

IMPORTANT RULES:
- Never make up tool names - only recommend tools from the provided database
- If you don't have enough information, ask clarifying questions first
- Keep responses concise (under 150 words)
- Always end with suggested next actions`;

/**
 * Generate chat response with tool recommendations
 */
export async function generateChatResponse(
    request: ChatRequest,
    availableTools: any[]
): Promise<ChatResponse> {
    const client = getClaudeClient();

    if (!client) {
        throw new Error('Claude AI is not configured');
    }

    const { messages, userProfile } = request;

    // Build context about user profile if available
    let profileContext = '';
    if (userProfile) {
        const parts = [];
        if (userProfile.industry) parts.push(`Industry: ${userProfile.industry}`);
        if (userProfile.teamSize) parts.push(`Team Size: ${userProfile.teamSize}`);
        if (userProfile.budget) parts.push(`Budget: ${userProfile.budget}`);
        
        if (parts.length > 0) {
            profileContext = `\n\nUSER PROFILE:\n${parts.join('\n')}`;
        }
    }

    // Build tools database context (top 20 most relevant tools to keep token count manageable)
    const toolsContext = `\n\nAVAILABLE TOOLS DATABASE:\n${availableTools
        .slice(0, 20)
        .map((tool, idx) => {
            return `${idx + 1}. ${tool.name} (${tool.pricing || 'N/A'})
   - ${tool.description}
   - Categories: ${tool.categories?.map((c: any) => c.name).join(', ') || 'N/A'}
   - Link: /tools/${tool.slug}`;
        })
        .join('\n\n')}`;

    // Format conversation history for Claude
    const conversationMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
    }));

    try {
        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: ASSISTANT_SYSTEM_PROMPT + profileContext + toolsContext,
            messages: conversationMessages as any,
        });

        const content = response.content[0];
        if (content.type !== 'text') {
            throw new Error('Unexpected response type from Claude');
        }

        const messageText = content.text;

        // Parse tool recommendations from response
        const recommendations: ToolRecommendation[] = [];
        const toolMentionRegex = /\*\*([^*]+)\*\*\s*-\s*([^\\n]+)/g;
        let match;

        while ((match = toolMentionRegex.exec(messageText)) !== null) {
            const toolName = match[1].trim();
            const reason = match[2].trim();
            
            // Find the tool in our database
            const tool = availableTools.find(
                t => t.name.toLowerCase() === toolName.toLowerCase()
            );

            if (tool) {
                recommendations.push({
                    name: tool.name,
                    reason: reason,
                    link: `/tools/${tool.slug}`,
                });
            }
        }

        // Detect suggested actions
        const suggestedActions: string[] = [];
        if (messageText.toLowerCase().includes('compare')) {
            suggestedActions.push('compare_tools');
        }
        if (messageText.toLowerCase().includes('learn more')) {
            suggestedActions.push('view_details');
        }
        if (messageText.toLowerCase().includes('pricing')) {
            suggestedActions.push('view_pricing');
        }

        return {
            message: messageText,
            recommendations: recommendations.length > 0 ? recommendations : undefined,
            suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
        };
    } catch (error) {
        console.error('Error calling Claude API for chat:', error);
        throw new Error('Failed to generate chat response');
    }
}
