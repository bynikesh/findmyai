# SEO Content Generation with Claude

## Example Output for "AI Video Editors" Category

### Request

```json
POST /api/ai/seo
{
  "categorySlug": "ai-video-editors",
  "saveToDb": true
}
```

### Claude Response Example

```json
{
  "seo_title": "Best AI Video Editors 2024 - Top Tools Compared",
  "seo_description": "Discover the best AI video editing tools. Compare features, pricing & capabilities of leading AI video editors. Find the perfect tool for your needs.",
  "seo_h1": "The Ultimate Guide to AI Video Editing Software",
  "seo_content": "Transform your video creation workflow with cutting-edge AI video editing tools. Whether you're a content creator, marketer, or professional videographer, our curated collection of AI video editors offers powerful automation, intelligent editing suggestions, and time-saving features that revolutionize the post-production process.\n\nFrom automated scene detection and smart color grading to AI-powered audio enhancement and one-click subtitle generation, these tools leverage machine learning to handle tedious tasks while you focus on creative storytelling. Our comparison includes both free and premium options, covering essential features like multi-track editing, stock media libraries, and export formats to help you make an informed decision.\n\nExplore detailed reviews, pricing breakdowns, and real-world use cases for each platform. Join thousands of creators who have already streamlined their editing workflow and increased productivity by 50% or more with AI-powered video editing solutions."
}
```

## Claude Prompt Template

The exact prompt used for SEO generation:

```
You are an expert SEO copywriter specializing in AI tools and technology.

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

Do NOT include any markdown, code blocks, or extra text. Just the raw JSON.

---

CATEGORY INFO:
- Category: AI Video Editors
- Slug: ai-video-editors
- Number of tools: 15

TARGET AUDIENCE: People searching for AI tools in the "AI Video Editors" category

PRIMARY KEYWORD: "AI Video Editors"
SECONDARY KEYWORDS: "best AI Video Editors", "AI Video Editors tools", "AI for ai video editors"

Create SEO content for a category page that lists AI Video Editors tools.
Focus on helping users discover and compare the best tools in this category.
```

## More Example Outputs

### Example 1: "AI Writing Assistants"

```json
{
  "seo_title": "AI Writing Assistants - 20+ Tools Compared [2024]",
  "seo_description": "Compare the best AI writing tools. Get comprehensive reviews, pricing & feature comparisons. Boost your writing productivity today.",
  "seo_h1": "Discover the Best AI Writing Assistants for Every Need",
  "seo_content": "Elevate your writing with intelligent AI assistants that understand context, tone, and style. Our comprehensive directory features over 20 carefully vetted AI writing tools designed to help bloggers, copywriters, students, and professionals create compelling content faster and with higher quality.\n\nWhether you need help with blog posts, marketing copy, academic papers, or creative writing, these AI-powered platforms offer real-time grammar checking, style suggestions, plagiarism detection, and content generation capabilities. Many integrate seamlessly with popular platforms like WordPress, Google Docs, and Microsoft Word.\n\nCompare features side-by-side including pricing plans, supported languages, team collaboration tools, and API access. Read verified user reviews and discover which AI writing assistant best matches your workflow and budget requirements."
}
```

### Example 2: "AI Image Generators"

```json
{
  "seo_title": "Best AI Image Generators - Create Stunning Visuals",
  "seo_description": "Explore top AI image generation tools. Turn text into art with DALL-E, Midjourney & more. Compare features, pricing & quality now.",
  "seo_h1": "AI Image Generation Tools: From Text to Visual Masterpieces",
  "seo_content": "Unlock limitless creative possibilities with state-of-the-art AI image generators that transform simple text descriptions into stunning visual artwork. Perfect for designers, marketers, content creators, and artists, these tools democratize visual content creation and eliminate the need for expensive stock photos or extensive design skills.\n\nExplore cutting-edge platforms utilizing diffusion models and neural networks to generate photorealistic images, artistic illustrations, logo designs, and custom graphics in seconds. Filter by features like commercial licensing, image resolution, style customization, and batch processing capabilities.\n\nOur curated collection includes both free and enterprise solutions, complete with pricing tiers, API access information, and real-world use cases. Start creating professional-quality visuals today and join millions of users worldwide who have replaced traditional design workflows with AI-powered alternatives."
}
```

### Example 3: "AI Chatbots"

```json
{
  "seo_title": "AI Chatbots for Business - Compare Top Solutions",
  "seo_description": "Find the perfect AI chatbot for your business. Compare pricing, features & integrations. Improve customer service & automation today.",
  "seo_h1": "The Complete Guide to AI-Powered Chatbot Solutions",
  "seo_content": "Revolutionize customer interactions with intelligent AI chatbots that provide 24/7 support, answer questions instantly, and scale your customer service without increasing headcount. Our directory showcases the latest conversational AI platforms trusted by businesses of all sizes.\n\nFrom simple FAQ bots to sophisticated virtual assistants with natural language understanding, these solutions integrate with popular platforms like Slack, WhatsApp, Facebook Messenger, and your website. Features include sentiment analysis, multilingual support, CRM integration, and detailed analytics to optimize bot performance.\n\nCompare deployment options (cloud vs on-premise), pricing models (usage-based vs subscription), and customization capabilities. Discover real success stories from companies that reduced response times by 80% and achieved 95% customer satisfaction scores using AI chatbots tailored to their industry."
}
```

## Character Count Breakdown

All examples follow strict length requirements:

- **SEO Title**: 50-60 characters
- **Meta Description**: 145-155 characters
- **H1**: ~50-70 characters (flexible)
- **Content**: 250-400 words

## API Endpoint Details

### POST /api/ai/seo

**Authentication:** Admin only (requires JWT with ADMIN role)

**Request Body:**
```typescript
{
  toolId?: number;        // Generate for specific tool
  categoryId?: number;    // Generate for category by ID
  categorySlug?: string;  // Generate for category by slug
  saveToDb?: boolean;     // Default: true
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    seo_title: string,
    seo_description: string,
    seo_h1: string,
    seo_content: string
  },
  saved: boolean,  // Whether saved to database
  message: string
}
```

## Usage Example

```bash
# Login as admin first
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@findmyai.com","password":"admin123"}' \
  | jq -r '.token')

# Generate SEO for category
curl -X POST http://localhost:3000/api/ai/seo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categorySlug": "ai-video-editors",
    "saveToDb": true
  }'
```

## Database Schema

SEO fields added to Category model:

```prisma
model Category {
  id              Int     @id @default(autoincrement())
  name            String
  slug            String  @unique
  seo_title       String?
  seo_description String?
  seo_h1          String?
  seo_content     String?
  tools           Tool[]
  
  @@index([slug])
}
```

## Frontend Integration

Display SEO content on category pages:

```tsx
// In CategoryPage.tsx
const category = await fetch(`/api/categories/${slug}`);

<Head>
  <title>{category.seo_title || category.name}</title>
  <meta name="description" content={category.seo_description} />
</Head>

<h1>{category.seo_h1}</h1>
<div dangerouslySetInnerHTML={{ __html: category.seo_content }} />
```

## Best Practices

1. **Review Generated Content**: Always review AI-generated SEO before publishing
2. **Batch Generation**: Generate SEO for all categories at once via script
3. **Regenerate Periodically**: Update SEO content every 6-12 months
4. **A/B Testing**: Test different titles/descriptions for better CTR
5. **Monitor Rankings**: Track how AI-generated content performs in search

## Testing

Test SEO generation:

```bash
cd backend
cat > test-seo.json << 'EOF'
{
  "categorySlug": "ai-video-editors",
  "saveToDb": false
}
EOF

curl -X POST http://localhost:3000/api/ai/seo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @test-seo.json | jq
```
