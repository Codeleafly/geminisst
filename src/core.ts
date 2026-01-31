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

  // Initialize the AI client according to documentation: new GoogleGenAI({ apiKey })
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const modelName = options.model || "gemini-2.5-flash-lite";
  
  // Configure thinking mode as per Gemini 2.5 specifications in documentation
  const config: any = {
      thinkingConfig: {
        includeThoughts: true, // Enabled to allow monitoring thoughts if needed
        thinkingBudget: -1    // Dynamic thinking enabled (-1)
      },
      // Fixed System Instruction: Users cannot override this as it is the core STT logic.
      systemInstruction: DEFAULT_SYSTEM_INSTRUCTION
  };

  if (options.verbose) {
    console.log(`[SSTLibrary] Model: ${modelName}`);
    console.log(`[SSTLibrary] Thinking: Dynamic (-1)`);
    console.log(`[SSTLibrary] System Instruction: Locked (Core)`);
  }

  const promptText = options.prompt || "Transcribe this audio.";
  const startTime = Date.now();

  try {
    /**
     * Using the syntax from the provided documentation:
     * ai.models.generateContent({ model, contents, config })
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

    // Handle the response according to the documentation structure
    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    
    // Combine text parts and thought parts separately
    const transcriptText = textParts
      .filter((p: any) => !p.thought)
      .map((p: any) => p.text)
      .join('') || "";

    const thoughtText = textParts
      .filter((p: any) => p.thought)
      .map((p: any) => p.text)
      .join('') || "";
    
    // Extract usage details
    const usage = response.usageMetadata ? {
      inputTokens: response.usageMetadata.promptTokenCount || 0,
      outputTokens: response.usageMetadata.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata.totalTokenCount || 0,
      processingTimeSec: processingTimeSec
    } : undefined;

    return {
      text: transcriptText,
      thoughts: thoughtText,
      model: modelName,
      usage: usage
    };

  } catch (error) {
    // If the newer ai.models.generateContent syntax is not available in the installed SDK version,
    // fallback to the widely supported getGenerativeModel method while keeping logic consistent.
    if (options.verbose) console.warn("[SSTLibrary] Newer syntax failed, trying fallback...");
    
    try {
        const model = (ai as any).getGenerativeModel({ model: modelName }, config);
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { text: promptText },
                    { inlineData: { mimeType, data: audioData } }
                ]
            }]
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
                processingTimeSec: processingTimeSec
            } : undefined
        };
    } catch (fallbackError: any) {
        console.error("[SSTLibrary] Transcription failed:", fallbackError);
        throw fallbackError;
    }
  }
}