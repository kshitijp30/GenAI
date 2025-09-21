
import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, GroundingSource } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonMarkdown = <T,>(text: string): T | null => {
  const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(codeBlockRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]) as T;
    } catch (error) {
      console.error("Failed to parse JSON from markdown:", error);
      return null;
    }
  }
  return null;
};

export const analyzeText = async (text: string): Promise<{ result: AnalysisResult | null; sources: GroundingSource[] }> => {
  const prompt = `
    Analyze the following text for misinformation. Your task is to act as an expert fact-checker.

    Text to analyze:
    ---
    ${text}
    ---

    Perform the following steps:
    1.  Identify the main claims made in the text.
    2.  Use your search capabilities to find credible, neutral sources to verify these claims.
    3.  Based on your findings, provide a single, overall verdict for the text. The verdict must be one of the following exact strings: "VERIFIED_TRUE", "MISLEADING", "PARTIALLY_TRUE", "POTENTIALLY_FALSE", "UNVERIFIABLE".
    4.  Provide a confidence score as an integer between 0 and 100 for your verdict.
    5.  Write a concise, neutral explanation for your verdict, explaining which claims are true, false, or misleading and why. Mention the evidence you found.

    Your final output must be a single JSON object inside a markdown code block. The JSON object must have the following structure: { "verdict": "...", "confidenceScore": ..., "explanation": "..." }. Do not include any text outside of the JSON markdown block.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const resultText = response.text;
    const analysisResult = parseJsonMarkdown<AnalysisResult>(resultText);
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = (groundingMetadata?.groundingChunks ?? []) as GroundingSource[];

    return { result: analysisResult, sources };

  } catch (error) {
    console.error("Error analyzing text with Gemini:", error);
    throw new Error("Failed to get analysis from AI. Please check your API key and network connection.");
  }
};
