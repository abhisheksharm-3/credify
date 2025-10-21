import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import axios from 'axios';
import { pipeline } from 'stream/promises';

const IMAGE_MODEL_NAME = "gemini-2.5-flash-lite";
const VIDEO_MODEL_NAME = "gemini-2.5-flash";

const API_KEY = process.env.GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

const SPECIALIZED_PROMPT = `You are a professional fact-checker. Analyze this media content and provide a clear, direct assessment.

**Content Overview:**
Describe what you see in 1-2 sentences. Be specific and factual.

**Authenticity Check:**
• Identify any signs of manipulation, editing, or artificial generation
• Note specific visual inconsistencies, artifacts, or technical anomalies if present
• Check if text, objects, or people appear genuine and consistent
• Verify if metadata or context seems accurate

**Red Flags (if any):**
List specific concerns that indicate potential misinformation:
- Manipulated/altered elements
- Missing or suspicious context
- Inconsistent details
- Misleading presentation

**Verification Status:**
☑ Appears Authentic - No obvious signs of manipulation detected
⚠ Questionable - Contains elements that need verification
❌ Likely Manipulated - Clear signs of editing or artificial generation

**Recommendation:**
Provide one clear action the user should take (e.g., "Safe to trust and share", "Verify with additional sources before sharing", "Do not share - likely misinformation")

**Key Details to Verify:**
List 2-3 specific facts or claims that should be independently verified if applicable.

Keep your response concise, factual, and helpful. Avoid speculation. Focus on observable evidence. If content appears authentic, say so clearly without over-explaining.`;

export async function analyzeImageWithGemini(contentBuffer: Buffer, contentType: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: IMAGE_MODEL_NAME });

  const imagePart = {
    inlineData: {
      data: contentBuffer.toString("base64"),
      mimeType: contentType
    }
  };

  try {
    const result = await model.generateContent([SPECIALIZED_PROMPT, imagePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in Gemini API image analysis:", error);
    return "Gemini verification service is currently unavailable. Our team is working on resolving this issue. Please try again later or contact support if this persists.";
  }
}

export async function analyzeVideoWithGemini(videoUrl: string, contentType: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: VIDEO_MODEL_NAME });

  try {
    const tempFilePath = path.join('/tmp', `temp_video_${Date.now()}.mp4`);

    await pipeline(
      (await axios.get(videoUrl, { responseType: 'stream' })).data,
      fs.createWriteStream(tempFilePath)
    );

    const uploadResponse = await fileManager.uploadFile(tempFilePath, {
      mimeType: contentType,
      displayName: "Uploaded Video",
    });

    await fs.promises.unlink(tempFilePath);

    let file = await fileManager.getFile(uploadResponse.file.name);
    while (file.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      file = await fileManager.getFile(uploadResponse.file.name);
    }

    if (file.state === FileState.FAILED) {
      console.error("Video processing failed in Gemini API");
      return "Gemini verification service is currently unavailable. Our team is working on resolving this issue. Please try again later or contact support if this persists.";
    }

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri
        }
      },
      { text: SPECIALIZED_PROMPT },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in Gemini API video analysis:", error);
    return "Gemini verification service is currently unavailable. Our team is working on resolving this issue. Please try again later or contact support if this persists.";
  }
}