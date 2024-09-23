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

export async function analyzeVideoWithGemini(videoUrl: string, contentType: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: VIDEO_MODEL_NAME });
  const prompt = "Analyze this media content for factual accuracy and identify any instances of misinformation. Provide a clear, concise summary of your findings.";

  try {
    // Create a temporary file to store the video
    const tempFilePath = path.join('/tmp', `temp_video_${Date.now()}.mp4`);

    // Download the video as a stream and save it to the temporary file
    await pipeline(
      (await axios.get(videoUrl, { responseType: 'stream' })).data,
      fs.createWriteStream(tempFilePath)
    );

    // Upload the video using the File API
    const uploadResponse = await fileManager.uploadFile(tempFilePath, {
      mimeType: contentType,
      displayName: "Uploaded Video",
    });

    // Delete the temporary file
    await fs.promises.unlink(tempFilePath);

    // Wait for video processing
    let file = await fileManager.getFile(uploadResponse.file.name);
    while (file.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      file = await fileManager.getFile(uploadResponse.file.name);
    }

    if (file.state === FileState.FAILED) {
      throw new Error("Video processing failed.");
    }

    // Generate content using the processed video URI
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri
        }
      },
      { text: prompt },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in Gemini API video analysis:", error);
    throw new Error("Failed to analyze video content with Gemini API");
  }
}