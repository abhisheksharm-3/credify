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

const SPECIALIZED_PROMPT = `You are a highly specialized AI privacy and content analyst. Your task is to meticulously examine the provided media and report on potential privacy and security concerns. Avoid general observations or casual language. Provide a professional, detailed analysis focusing on:

1. Personal Data Exposure: Identify any visible personally identifiable information (PII) such as faces, names, addresses, ID numbers, or biometric data.
2. Security Vulnerabilities: Detect potential security risks like visible passwords, confidential documents, or sensitive location data.
3. Content Authenticity: Analyze for signs of digital manipulation, AI-generated elements, or deepfake technology.
4. Privacy Implications: Assess the overall privacy impact, considering data protection regulations like GDPR or CCPA.
5. Intellectual Property: Identify any visible copyrighted or trademarked material that may pose legal risks.
6. Sensitive Content: Flag any material that could be considered adult, violent, or otherwise inappropriate.

Provide your findings in this structured format:
1. PII Detected: [List specific items, if any]
2. Security Risks: [Enumerate potential vulnerabilities]
3. Authenticity Assessment: [Detailed analysis of potential manipulations]
4. Privacy Impact: [Specific concerns related to data protection laws]
5. IP Considerations: [Any copyright or trademark issues]
6. Content Advisories: [Specific warnings about sensitive material]

Conclusion: Summarize the key privacy and security implications in 2-3 sentences. This is your hard limit.

Be precise and technical in your analysis. If you cannot determine something with high confidence, state "Unable to conclusively determine" for that specific point.`;

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