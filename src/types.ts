/**
 * Common types for the SST Library
 */

export type AudioInput = string | File;

export type ThinkingLevel = "minimal" | "low" | "medium" | "high";

export interface SSTOptions {
  /**
   * The text prompt to guide the audio processing (e.g., "Transcribe in Hindi", "In English letters").
   */
  prompt?: string;
  /**
   * Model to use. Defaults to "gemini-2.5-flash-lite".
   * Supports Gemini 2.5 series (thinkingBudget) and Gemini 3 series (thinkingLevel).
   */
  model?: string;
  /**
   * Verbose logging.
   */
  verbose?: boolean;
  /**
   * Optional thinking budget for Gemini 2.5 models.
   * -1 for dynamic (default), 0 to disable, or a value between 512 and 24576 for Flash Lite.
   * Note: This is ignored if a Gemini 3 model is used.
   */
  thinkingBudget?: number;
  /**
   * Optional thinking level for Gemini 3 models.
   * "low", "high" for Pro.
   * "minimal", "low", "medium", "high" for Flash.
   * Note: This is ignored if a Gemini 2.5 model is used.
   */
  thinkingLevel?: ThinkingLevel;
}

export interface TranscriptionResult {
  text: string;
  thoughts?: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    thoughtsTokenCount?: number;
    processingTimeSec: number;
  };
}