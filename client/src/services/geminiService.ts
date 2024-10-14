import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import axios from 'axios';
import { pipeline } from 'stream/promises';

const IMAGE_MODEL_NAME = "gemini-1.5-flash";
const VIDEO_MODEL_NAME = "gemini-1.5-pro";

const API_KEY = process.env.GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

const SPECIALIZED_PROMPT = `As an AI media analyst, your task is to provide a clear, actionable analysis of the given image or video. Focus on delivering concrete insights that a user can immediately understand and act upon. Structure your response as follows:

1. Content Summary (2-3 sentences):
   Briefly describe what you see in the media.

2. Key Entities (bullet points):
   - List main people, objects, or brands visible
   - For each, note their relevance or significance

3. Context Analysis (2-3 sentences):
   Explain the situation or event depicted, if apparent. Also tell is this event factually correct or spreads misinformation.

4. Potential Concerns (choose relevant, explain briefly):
   - Privacy: Any visible personal information?
   - Security: Any potential security risks shown?
   - Authenticity: Signs of manipulation or AI generation?
   - Sensitivity: Content that might be disturbing or controversial?
   - Copyright: Visible trademarks or copyrighted material?

5. Main Takeaway (1 sentence):
   What's the most important thing a viewer should understand from this media?

6. Suggested Actions (2-3 bullet points):
   Based on your analysis, what should the user consider doing next?

Be specific and confident in your observations. If you can't determine something with high confidence, clearly state that it's uncertain. Aim to provide information that helps the user make informed decisions about using or sharing the media.`;

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
    throw new Error("Failed to analyze image content with Gemini API");
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
      throw new Error("Video processing failed.");
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
    throw new Error("Failed to analyze video content with Gemini API");
  }
}