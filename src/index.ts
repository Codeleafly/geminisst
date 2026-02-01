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
  // 1. Validate Audio File
  if (!fs.existsSync(audioFile)) {
    throw new Error(`Only files are supported. File not found at: ${audioFile}`);
  }

  const stats = fs.statSync(audioFile);
  if (!stats.isFile()) {
    throw new Error(`Only files are supported. The path provided is not a file: ${audioFile}`);
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

  // 2. Handle Upload (Files API for > 20MB, Inline for smaller)
  const fileSizeMB = stats.size / (1024 * 1024);
  
  if (fileSizeMB > 20) {
    if (options.verbose) console.log(`[SSTLibrary] File size (${fileSizeMB.toFixed(2)}MB) > 20MB. Using Files API...`);
    return await processAudioWithFilesAPI(audioFile, mimeType, apiKey, options);
  }

  const fileBuffer = fs.readFileSync(audioFile);
  const base64Audio = bufferToBase64(fileBuffer);

  // 3. Process Inline
  return await processAudioWithGemini(base64Audio, mimeType, apiKey, options);
}

/**
 * Internal helper for Files API (for files > 20MB)
 */
async function processAudioWithFilesAPI(filePath: string, mimeType: string, apiKey: string, options: SSTOptions): Promise<TranscriptionResult> {
    const { processAudioWithGeminiFileUri } = await import('./core.js');
    return await processAudioWithGeminiFileUri(filePath, mimeType, apiKey, options);
}

export * from './types.js';