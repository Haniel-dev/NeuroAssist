import { GoogleGenAI } from "@google/genai";
import { Resource } from '../types';

// Initialize Gemini
// Note: API_KEY is assumed to be in process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a compassionate, clear, and supportive assistant designed to help neurodivergent individuals (ADHD, Autism, Dyslexia, etc.). 
Your goal is to answer questions and connect users with specific resources found in the provided context.

Tone Guidelines:
1. Direct and literal. Avoid metaphors unless explained.
2. Use clear, simple structure. Bullet points are excellent.
3. Be non-judgmental and validating.
4. If the user mentions being overwhelmed, prioritize short, actionable steps.

Instructions for RAG (Retrieval Augmented Generation):
- You will be provided with a list of "Relevant Resources" in JSON format.
- You MUST use these resources to answer the user's question if they are relevant.
- When you mention a resource from the list, explicitly refer to it by name.
- If no resources are relevant, answer from your general knowledge but mention you don't have specific database entries for it.
`;

export const generateGeminiResponse = async (
  userQuery: string,
  contextResources: Resource[]
): Promise<string> => {
  try {
    const resourceContextString = contextResources.length > 0
      ? `Here are some resources from our database that might help:\n${JSON.stringify(contextResources, null, 2)}`
      : "No specific database resources matched this query.";

    const prompt = `
    Context Information:
    ${resourceContextString}

    User Question:
    ${userQuery}

    Please provide a helpful response based on the context and the user's needs.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Lower temperature for more factual, less hallucinatory responses
      }
    });

    return response.text || "I'm sorry, I had trouble thinking of a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my brain right now. Please check your connection or try again later.";
  }
};