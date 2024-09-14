"use server"
// services/geminiService.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-pro-vision";
const API_KEY = process.env.GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzeContentWithGemini(contentBuffer: Buffer, contentType: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = "Analyze this media content for factual accuracy and potential misinformation. Provide a detailed report on your findings.";

  const imagePart = {
    inlineData: {
      data: contentBuffer.toString("base64"),
      mimeType: contentType
    }
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error in Gemini API analysis:", error);
    throw new Error("Failed to analyze content with Gemini API");
  }
}