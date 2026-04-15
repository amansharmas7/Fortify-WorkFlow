import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ProcessStep {
  title: string;
  description: string;
  role: string;
  tools?: string[];
}

export interface ProcessTemplate {
  title: string;
  description: string;
  targetAudience: string;
  steps: ProcessStep[];
}

export async function generateProcessTemplate(prompt: string): Promise<ProcessTemplate> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a detailed, standardized process documentation template for: ${prompt}. 
    The documentation should be clear and user-friendly for non-technical team members at Fortify Health.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                role: { type: Type.STRING },
                tools: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["title", "description", "role"],
            },
          },
        },
        required: ["title", "description", "targetAudience", "steps"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate process template");
  }

  return JSON.parse(response.text);
}
