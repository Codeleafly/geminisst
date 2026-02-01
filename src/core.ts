/**
 * Core business logic using Google GenAI SDK
 */
import { GoogleGenAI } from '@google/genai';
import { SSTOptions, TranscriptionResult } from './types.js';
import { DEFAULT_SYSTEM_INSTRUCTION } from './constants.js';

/**
 * Processes audio using the Gemini Files API and GenerateContent API.
 * Automatically handles model-specific configurations (thinking budget vs level).
 * Supports both local file paths and existing File URIs.
 * 
 * @param audioInput - Path to the audio file OR an existing File URI
 * @param mimeType - MIME type of the audio
 * @param apiKey - Google Gemini API Key
 * @param options - Configuration options
 * @returns Promise resolving to the transcription result
 */
export async function processAudio(
  audioInput: string,
  mimeType: string,
  apiKey: string,
  options: SSTOptions
): Promise<TranscriptionResult> {
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const modelName = options.model || "gemini-2.5-flash-lite";

  // Determine Thinking Configuration based on Model Series
  const isGemini3 = modelName.includes("gemini-3");
  const isGemini2_5 = modelName.includes("gemini-2.5") || modelName.includes("gemini-2.0");

  let thinkingConfig: any = {
    includeThoughts: true
  };

  if (isGemini3) {
    if (options.thinkingLevel) {
      thinkingConfig.thinkingLevel = options.thinkingLevel;
    } 
  } else if (isGemini2_5) {
    thinkingConfig.thinkingBudget = options.thinkingBudget !== undefined ? options.thinkingBudget : -1;
  } else {
       thinkingConfig.thinkingBudget = options.thinkingBudget !== undefined ? options.thinkingBudget : -1;
  }

  const config: any = {
    thinkingConfig: thinkingConfig,
    systemInstruction: DEFAULT_SYSTEM_INSTRUCTION
  };

  if (options.verbose) {
    console.log(`[SSTLibrary] Model: ${modelName}`);
    console.log(`[SSTLibrary] Strategy: Files API (Universal)`);
    if (isGemini3) {
       console.log(`[SSTLibrary] Thinking Level: ${thinkingConfig.thinkingLevel || 'Default (High)'}`);
    } else {
       console.log(`[SSTLibrary] Thinking Budget: ${thinkingConfig.thinkingBudget}`);
    }
  }

  const promptText = options.prompt || "Transcribe this audio.";
  const startTime = Date.now();

  try {
    let fileUri = audioInput;
    
    // 1. Upload File (if it's not already a URI)
    if (!audioInput.startsWith("https://")) {
        if (options.verbose) console.log(`[SSTLibrary] Uploading file to Gemini Files API...`);
        const uploadResult = await (ai as any).files.upload({
          file: audioInput,
          config: { mimeType: mimeType }
        });
        fileUri = uploadResult.uri;
        if (options.verbose) console.log(`[SSTLibrary] File uploaded: ${fileUri}`);
    } else {
        if (options.verbose) console.log(`[SSTLibrary] Using existing File URI: ${fileUri}`);
    }

    // 2. Generate Content with File URI
    const response = await (ai as any).models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            {
              fileData: {
                fileUri: fileUri,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: config
    });

    const endTime = Date.now();
    const processingTimeSec = parseFloat(((endTime - startTime) / 1000).toFixed(2));

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];

    // Separate thoughts from transcript
    const transcriptText = textParts
      .filter((p: any) => !p.thought)
      .map((p: any) => p.text)
      .join('') || "";

    const thoughtText = textParts
      .filter((p: any) => p.thought)
      .map((p: any) => p.text)
      .join('') || "";

    return {
      text: transcriptText,
      thoughts: thoughtText,
      model: modelName,
      fileUri: fileUri, // Return the URI for reuse
      usage: response.usageMetadata ? {
        inputTokens: response.usageMetadata.promptTokenCount || 0,
        outputTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0,
        thoughtsTokenCount: response.usageMetadata.thoughtsTokenCount || 0,
        processingTimeSec: processingTimeSec
      } : undefined
    };

  } catch (error: any) {
    console.error("[SSTLibrary] Processing failed:", error);
    throw error;
  }
}