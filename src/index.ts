import { processAudio } from './core.js';
import { SSTOptions, TranscriptionResult } from './types.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Node.js entry point for geminisst
 * @param audioFile Path to the audio file
 * @param apiKey Google Gemini API Key
 * @param options Configuration options
 * @returns The transcription result object containing text and thoughts
 */
export async function audioToText(audioFile: string, apiKey: string, options: SSTOptions = {}): Promise<TranscriptionResult> {
  // 1. Validate Audio File
  if (!fs.existsSync(audioFile)) {
    throw new Error(`File not found at: ${audioFile}`);
  }

  const stats = fs.statSync(audioFile);
  if (!stats.isFile()) {
    throw new Error(`The path provided is not a file: ${audioFile}`);
  }

  // Simple mime type detection based on extension
  const ext = path.extname(audioFile).toLowerCase().replace('.', '');
  // Default map according to documentation supported formats
  const mimeMap: Record<string, string> = {
    'mp3': 'audio/mp3',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    'aiff': 'audio/aiff',
    'm4a': 'audio/mp4',
    'mp4': 'audio/mp4'
  };
  const mimeType = mimeMap[ext] || 'audio/mp3';

  if (options.verbose) {
      console.log(`[SSTLibrary] Processing file: ${audioFile}`);
      console.log(`[SSTLibrary] Detected MIME: ${mimeType}`);
  }

  // 2. Process using Files API (Universal for all sizes)
  return await processAudio(audioFile, mimeType, apiKey, options);
}

export * from './types.js';
