"use server"
// services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const IMAGE_MODEL_NAME = "gemini-1.5-flash";
const VIDEO_MODEL_NAME = "gemini-1.5-pro";

const API_KEY = process.env.GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzeImageWithGemini(contentBuffer: Buffer, contentType: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: IMAGE_MODEL_NAME });

  const prompt = "Analyze this media content for factual accuracy and identify any instances of misinformation. Provide a clear, concise summary of your findings.";

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
    console.error("Error in Gemini API image analysis:", error);
    throw new Error("Failed to analyze image content with Gemini API");
  }
}

export async function analyzeVideoWithGemini(contentBuffer: Buffer, contentType: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: VIDEO_MODEL_NAME });

  const prompt = "Analyze this media content for factual accuracy and identify any instances of misinformation. Provide a clear, concise summary of your findings.";

  const videoPart = {
    inlineData: {
      data: contentBuffer.toString("base64"),
      mimeType: contentType
    }
  };

  try {
    const result = await model.generateContent([prompt, videoPart]);
    const response = await result.response;
    const text = response.text();
    console.log(response);
    console.log(text);

    return text;
  } catch (error) {
    console.error("Error in Gemini API video analysis:", error);
    throw new Error("Failed to analyze video content with Gemini API");
  }
}