import { processAudio } from './core.js';
import { SSTOptions, TranscriptionResult } from './types.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Node.js entry point for geminisst
 * @param audioInput Path to the audio file OR an existing File URI (https://...)
 * @param apiKey Google Gemini API Key
 * @param options Configuration options
 * @returns The transcription result object containing text, thoughts, and fileUri
 */
export async function audioToText(audioInput: string, apiKey: string, options: SSTOptions = {}): Promise<TranscriptionResult> {
  let mimeType = 'audio/mp3'; // Default

  // Check if input is a URI or a File Path
  const isUri = audioInput.startsWith("https://");

  if (!isUri) {
      // 1. Validate Audio File if it's a path
      if (!fs.existsSync(audioInput)) {
        throw new Error(`File not found at: ${audioInput}`);
      }

      const stats = fs.statSync(audioInput);
      if (!stats.isFile()) {
        throw new Error(`The path provided is not a file: ${audioInput}`);
      }

      // Simple mime type detection based on extension
      const ext = path.extname(audioInput).toLowerCase().replace('.', '');
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
      mimeType = mimeMap[ext] || 'audio/mp3';
  } else {
      // If it's a URI, we assume the user knows what they are doing, 
      // OR we could try to infer mime type if possible, but usually the API handles it or needs explicit mime.
      // For now, let's assume default or try to detect from URI extension if present.
      if (options.verbose) console.log(`[SSTLibrary] Input is a URI, skipping file checks.`);
      // Try to guess mime from URI end
      const ext = path.extname(audioInput.split('?')[0]).toLowerCase().replace('.', ''); 
      if (ext) {
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
          if (mimeMap[ext]) mimeType = mimeMap[ext];
      }
  }

  if (options.verbose) {
      console.log(`[SSTLibrary] Processing input: ${audioInput}`);
      console.log(`[SSTLibrary] Using MIME: ${mimeType}`);
  }

  // 2. Process using Files API (Universal for all sizes)
  return await processAudio(audioInput, mimeType, apiKey, options);
}

export * from './types.js';