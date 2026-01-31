/**
 * Common types for the SST Library
 */

export type AudioInput = string | File;

export interface SSTOptions {
  /**
   * The text prompt to guide the audio processing (e.g., "Transcribe in Hindi", "In English letters").
   */
  prompt?: string;
  /**
   * Model to use. Defaults to "gemini-2.5-flash-lite".
   */
  model?: string;
  /**
   * Verbose logging.
   */
  verbose?: boolean;
}

export interface TranscriptionResult {
  text: string;
  thoughts?: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    processingTimeSec: number;
  };
}