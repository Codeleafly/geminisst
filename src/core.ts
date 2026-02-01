/**
 * Core business logic using Google GenAI SDK
 */
import { GoogleGenAI } from '@google/genai';
import { SSTOptions, TranscriptionResult } from './types.js';
import { DEFAULT_SYSTEM_INSTRUCTION } from './constants.js';

/**
 * Processes audio using the Gemini API.
 * @param audioData - Base64 encoded audio string
 * @param mimeType - MIME type of the audio
 * @param apiKey - Google Gemini API Key
 * @param options - Configuration options
 * @returns Promise resolving to the transcription result
 */
export async function processAudioWithGemini(
  audioData: string,
  mimeType: string,
  apiKey: string,
  options: SSTOptions
): Promise<TranscriptionResult> {
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  // Initialize the AI client according to documentation
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const modelName = options.model || "gemini-2.5-flash-lite";
  
  // Configure thinking mode as per Gemini specifications in documentation
  // For Gemini 2.5 series, we use thinkingBudget.
  const config: any = {
      thinkingConfig: {
        includeThoughts: true,
        thinkingBudget: options.thinkingBudget !== undefined ? options.thinkingBudget : -1 // Default to dynamic
      },
      systemInstruction: DEFAULT_SYSTEM_INSTRUCTION
  };

  if (options.verbose) {
    console.log(`[SSTLibrary] Model: ${modelName}`);
    console.log(`[SSTLibrary] Thinking Budget: ${config.thinkingConfig.thinkingBudget}`);
    console.log(`[SSTLibrary] System Instruction: Locked (Core)`);
  }

  const promptText = options.prompt || "Transcribe this audio.";
  const startTime = Date.now();

  try {
    /**
     * Using the latest syntax from the documentation
     */
    const response = await (ai as any).models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: mimeType,
                data: audioData
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
    
    // According to documentation, thoughts are in parts where part.thought is true
    const transcriptText = textParts
      .filter((p: any) => !p.thought)
      .map((p: any) => p.text)
      .join('') || "";

    const thoughtText = textParts
      .filter((p: any) => p.thought)
      .map((p: any) => p.text)
      .join('') || "";
    
    // Extract usage details including thoughtsTokenCount
    const usage = response.usageMetadata ? {
      inputTokens: response.usageMetadata.promptTokenCount || 0,
      outputTokens: response.usageMetadata.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata.totalTokenCount || 0,
      thoughtsTokenCount: response.usageMetadata.thoughtsTokenCount || 0,
      processingTimeSec: processingTimeSec
    } : undefined;

    return {
      text: transcriptText,
      thoughts: thoughtText,
      model: modelName,
      usage: usage
    };

  } catch (error) {
    if (options.verbose) console.warn("[SSTLibrary] Primary method failed, attempting fallback with getGenerativeModel...");
    
    try {
        const model = (ai as any).getGenerativeModel({ model: modelName }, { systemInstruction: DEFAULT_SYSTEM_INSTRUCTION });
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { text: promptText },
                    { inlineData: { mimeType, data: audioData } }
                ]
            }],
            generationConfig: {
                thinkingConfig: config.thinkingConfig
            }
        });
        
        const endTime = Date.now();
        const processingTimeSec = parseFloat(((endTime - startTime) / 1000).toFixed(2));
        const resp = result.response;
        const candidate = resp.candidates?.[0];
        const parts = candidate?.content?.parts || [];

        return {
            text: parts.filter((p: any) => !p.thought).map((p: any) => p.text).join(''),
            thoughts: parts.filter((p: any) => p.thought).map((p: any) => p.text).join(''),
            model: modelName,
            usage: resp.usageMetadata ? {
                inputTokens: resp.usageMetadata.promptTokenCount,
                outputTokens: resp.usageMetadata.candidatesTokenCount,
                totalTokens: resp.usageMetadata.totalTokenCount,
                thoughtsTokenCount: resp.usageMetadata.thoughtsTokenCount,
                processingTimeSec: processingTimeSec
            } : undefined
        };
    } catch (fallbackError: any) {
        console.error("[SSTLibrary] Transcription failed:", fallbackError);
        throw fallbackError;
    }
  }
}

/**
 * Processes audio using the Gemini Files API (recommended for files > 20MB).
 */
export async function processAudioWithGeminiFileUri(
  filePath: string,
  mimeType: string,
  apiKey: string,
  options: SSTOptions
): Promise<TranscriptionResult> {
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const modelName = options.model || "gemini-2.5-flash-lite";

  const config: any = {
    thinkingConfig: {
      includeThoughts: true,
      thinkingBudget: options.thinkingBudget !== undefined ? options.thinkingBudget : -1
    },
    systemInstruction: DEFAULT_SYSTEM_INSTRUCTION
  };

  const promptText = options.prompt || "Transcribe this audio.";
  const startTime = Date.now();

  try {
    // 1. Upload File using Files API
    if (options.verbose) console.log(`[SSTLibrary] Uploading file to Gemini Files API...`);
    const uploadResult = await (ai as any).files.upload({
      file: filePath,
      config: { mimeType: mimeType }
    });

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
                fileUri: uploadResult.uri,
                mimeType: uploadResult.mimeType
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

    return {
      text: textParts.filter((p: any) => !p.thought).map((p: any) => p.text).join(''),
      thoughts: textParts.filter((p: any) => p.thought).map((p: any) => p.text).join(''),
      model: modelName,
      usage: response.usageMetadata ? {
        inputTokens: response.usageMetadata.promptTokenCount || 0,
        outputTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0,
        thoughtsTokenCount: response.usageMetadata.thoughtsTokenCount || 0,
        processingTimeSec: processingTimeSec
      } : undefined
    };

  } catch (error: any) {
    console.error("[SSTLibrary] Files API processing failed:", error);
    throw error;
  }
}