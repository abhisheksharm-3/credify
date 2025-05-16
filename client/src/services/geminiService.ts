import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import axios from 'axios';
import { pipeline } from 'stream/promises';

const IMAGE_MODEL_NAME = "gemini-2.0-flash";
const VIDEO_MODEL_NAME = "gemini-1.5-pro";

const API_KEY = process.env.GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

const SPECIALIZED_PROMPT = `As a seasoned media fact-checker with journalism experience, share your analysis of this content in a conversational yet thorough manner.

Give me your immediate assessment - what are we looking at here and what's the apparent context?

Focus your expert analysis on:

Truth assessment: Look for signs this media accurately represents reality. Note any inconsistencies with known facts, manipulated elements, or contextual clues that suggest misrepresentation. If something seems potentially misleading, explain why.

Contextual understanding: What's the full picture here? Is there important context missing that would change how someone interprets this? Is this media being presented in its original context?

Source credibility: Any indicators of where this content originated? Do recognizable people or institutions appear, and are they accurately represented?

Technical evaluation: Notice any visual artifacts, unnatural elements, or signs of digital manipulation that affect authenticity.

When you spot potential misinformation, clearly explain your reasoning with specific examples from the content. Use phrases like "I'm noticing that..." or "What raises questions for me is..." to frame your observations.

If the content appears authentic, note that too: "From what I can see, this appears to be an accurate representation of..."

Conclude with practical advice for someone encountering this content - should they treat it as reliable, verify specific aspects, or be cautious about sharing it?

Throughout your analysis, maintain a conversational tone while prioritizing factual accuracy above all else.`;

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