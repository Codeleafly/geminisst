import { processAudioWithGemini } from './core.js';
import { SSTOptions, TranscriptionResult } from './types.js';
import * as fs from 'fs';
import * as path from 'path';
import { bufferToBase64 } from './utils.js';

/**
 * Node.js entry point
 * @param audioFile Path to the audio file
 * @param apiKey Google Gemini API Key
 * @param options Configuration options
 * @returns The transcription result object containing text and thoughts
 */
export async function audioToText(audioFile: string, apiKey: string, options: SSTOptions = {}): Promise<TranscriptionResult> {
  // 1. Read Audio File
  if (!fs.existsSync(audioFile)) {
    throw new Error(`Audio file not found: ${audioFile}`);
  }

  // Simple mime type detection based on extension
  const ext = path.extname(audioFile).toLowerCase().replace('.', '');
  // Default map
  const mimeMap: Record<string, string> = {
    'mp3': 'audio/mp3',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    'm4a': 'audio/m4a', // often parsed as mp4/aac
    'mp4': 'audio/mp4'
  };
  const mimeType = mimeMap[ext] || 'audio/mp3'; // Default to mp3 if unknown

  const fileBuffer = fs.readFileSync(audioFile);
  const base64Audio = bufferToBase64(fileBuffer);

  // 2. Process
  return await processAudioWithGemini(base64Audio, mimeType, apiKey, options);
}

export * from './types.js';