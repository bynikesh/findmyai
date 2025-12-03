import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function enrichToolData(name: string, description: string) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not found, skipping enrichment');
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
        You are an AI tool expert. Analyze this tool:
        Name: ${name}
        Description: ${description}

        Task:
        1. Write a 2-sentence user-friendly description.
        2. Classify into one of: ['Chatbots','Image Tools','Music','Video','Code','Productivity','Developer AI','Writing','SEO','Education','Other'].
        3. Generate 3-7 relevant tags.

        Output JSON only:
        {
            "description": "...",
            "category": "...",
            "tags": ["tag1", "tag2"]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('AI Enrichment failed:', error);
        return null;
    }
}
