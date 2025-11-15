import { GoogleGenAI } from "@google/genai";
import { Resource } from '../types';

// Initialize Gemini
// Note: API_KEY is assumed to be in process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a compassionate, clear, and supportive assistant designed to help neurodivergent individuals (ADHD, Autism, Dyslexia, etc.). 
Your goal is to answer questions and connect users with specific resources.

Tone Guidelines:
1. Direct and literal. Avoid metaphors unless explained.
2. Use clear, simple structure. Bullet points are excellent.
3. Be non-judgmental and validating.
4. If the user mentions being overwhelmed, prioritize short, actionable steps.

Resource Guidelines:
- You have access to Google Search to find real-time information.
- PRIORITIZE resources from reputable health organizations (e.g., NIH, Mayo Clinic), academic institutions (.edu), and established neurodiversity advocacy groups.
- When referencing a resource found via Google Search, ensure the link is provided in the "grounding chunks" so the UI can display it.
- You may also be provided with "Internal Database Resources". Use them if relevant.
`;

export const generateGeminiResponse = async (
  userQuery: string,
  contextResources: Resource[]
): Promise<{ text: string; webResources: Resource[] }> => {
  try {
    const resourceContextString = contextResources.length > 0
      ? `INTERNAL DATABASE RESOURCES (Prioritize these if relevant):\n${JSON.stringify(contextResources, null, 2)}`
      : "No internal database resources matched this query.";

    const prompt = `
    Context Information:
    ${resourceContextString}

    User Question:
    ${userQuery}

    Please search for additional reputable resources (health, academic, advocacy) if the internal database is insufficient.
    Provide a helpful response based on the context, web search results, and the user's needs.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "I'm sorry, I had trouble thinking of a response. Please try again.";
    
    // Extract web resources from grounding metadata
    const webResources: Resource[] = [];
    
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any, index: number) => {
        if (chunk.web) {
          webResources.push({
            id: `web-${Date.now()}-${index}`,
            title: chunk.web.title || 'Web Resource',
            description: 'Resource found via Google Search',
            category: 'Web Resource',
            url: chunk.web.uri,
            tags: ['web-search']
          });
        }
      });
    }

    return { text, webResources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      text: "I'm having trouble connecting to my brain right now. Please check your connection or try again later.",
      webResources: []
    };
  }
};