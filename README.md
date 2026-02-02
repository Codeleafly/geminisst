# geminisst 🎙️

**geminisst** is a professional-grade Node.js library for high-accuracy **Audio-to-Text** conversion. Powered by **Google's Gemini 2.5 Flash Lite** (default) and **Gemini 3** series, it offers a massive **1 Million+ context window** and next-gen multimodal understanding.

Unlike traditional STT engines, `geminisst` leverages the **Files API** for all requests, ensuring stability and accuracy whether you are processing a 3-second voice note or a multi-hour lecture.

---

## 🚀 Key Features

*   **Gemini 2.5 Flash Lite (Default):** Optimized for cost-efficiency and speed.
*   **Gemini 3 Ready:** Full support for **Gemini 3 Flash** and **Pro** models.
*   **Universal Files API:** No base64 overhead. Supports large files seamlessly.
*   **Intelligent Reasoning:** Detailed "thoughts" explaining the transcription process.
*   **Locked Core Logic:** Built-in instructions ensure 100% verbatim transcription.
*   **Multilingual:** Native support for English, Hindi, Hinglish, and mixed languages.
*   **Usage Tracking:** Complete metadata including token counts and processing time.

---

## 📦 Installation

```bash
npm install geminisst
```

### Supported Formats
The library automatically detects the following formats:
- **Audio:** `.mp3`, `.wav`, `.ogg`, `.flac`, `.aac`, `.aiff`, `.m4a`
- **Video:** `.mp4` (extracted audio)

### Setup Environment
It is recommended to use a `.env` file for your API key:
```env
GEMINI_API_KEY=your_api_key_here
```

---

## 🛠️ Complete Examples

### 1. Simple Transcription (Quick Start)
The simplest way to convert audio to text using the default model (**Gemini 2.5 Flash Lite**).

```javascript
import { audioToText } from 'geminisst';

const apiKey = "YOUR_GEMINI_API_KEY";

async function main() {
  try {
    const result = await audioToText('./sample.mp3', apiKey);
    
    console.log("--- Transcript ---");
    console.log(result.text);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
```

### 2. Using Gemini 3 (High Reasoning)
Configure **Gemini 3** with specific `thinkingLevel` for complex audio or specific formatting.

```javascript
import { audioToText } from 'geminisst';

const apiKey = "YOUR_GEMINI_API_KEY";

async function transcribeWithGemini3() {
  const options = {
    model: "gemini-3-flash-preview", // Use Gemini 3 model
    thinkingLevel: "high",           // Gemini 3 specific: minimal, low, medium, high
    prompt: "Transcribe this interview and format it with speaker labels.",
    verbose: true                    // Show upload progress in console
  };

  const result = await audioToText('./interview.wav', apiKey, options);

  console.log("AI Thoughts:", result.thoughts); // View the AI's reasoning
  console.log("Transcript:", result.text);
}

transcribeWithGemini3();
```

### 3. Reusing File URIs (Performance Optimization)
The Files API saves your audio for 48 hours. You can reuse the `fileUri` to perform multiple operations (like different prompts) on the same file without re-uploading.

> **💡 Pro Tip:** When you pass a `https://` URI as the first argument, the library **automatically skips the upload process** and goes straight to transcription. This saves significant time and bandwidth for large files.

```javascript
import { audioToText } from 'geminisst';

const apiKey = "YOUR_GEMINI_API_KEY";

async function reuseFile() {
  // First Call: Uploads and transcribes
  const firstPass = await audioToText('./meeting.mp3', apiKey, {
    prompt: "Give me the full verbatim transcript."
  });
  
  const uri = firstPass.fileUri; // Store this URI
  console.log("File URI stored for reuse:", uri);

  // Second Call: Uses the URI (Instant - no upload time)
  const secondPass = await audioToText(uri, apiKey, {
    prompt: "Now summarize the main action items from the same audio.",
    model: "gemini-3-flash-preview"
  });

  console.log("Summary:", secondPass.text);
}

reuseFile();
```

### 4. Advanced Metadata & Token Usage
Track exactly how many tokens were used and how long the processing took.

```javascript
import { audioToText } from 'geminisst';

async function trackUsage() {
  const result = await audioToText('./lecture.mp3', 'API_KEY', {
    thinkingBudget: 1024 // Gemini 2.5 specific: Control reasoning tokens
  });

  if (result.usage) {
    console.log(`Model: ${result.model}`);
    console.log(`Processing Time: ${result.usage.processingTimeSec}s`);
    console.log(`Input Tokens: ${result.usage.inputTokens}`);
    console.log(`Output Tokens: ${result.usage.outputTokens}`);
    console.log(`Thoughts Tokens: ${result.usage.thoughtsTokenCount}`);
    console.log(`Total Tokens: ${result.usage.totalTokens}`);
  }
}

trackUsage();
```

---

## 📖 API Reference

### `audioToText(audioInput, apiKey, options?)`

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `audioInput` | `string` | Local path (e.g., `./audio.mp3`) **OR** File URI (`https://...`). |
| `apiKey` | `string` | Your Google Gemini API Key. |
| `options` | `SSTOptions` | Optional configuration object. |

#### `SSTOptions` Object

```typescript
{
  prompt?: string;          // Specific instructions (e.g., "Output in JSON")
  model?: string;           // "gemini-2.5-flash-lite" (default) or "gemini-3-flash-preview"
  verbose?: boolean;        // Logs upload and API status to console
  thinkingBudget?: number;  // (Gemini 2.5) -1 for dynamic, or specific token count
  thinkingLevel?: string;   // (Gemini 3) "minimal" | "low" | "medium" | "high"
}
```

#### `TranscriptionResult` Object

```typescript
{
  text: string;             // The generated transcript
  thoughts?: string;        // AI's internal reasoning/thoughts
  model: string;            // The model version used
  fileUri: string;          // URI for reusing the uploaded file (valid for 48h)
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    thoughtsTokenCount: number;
    processingTimeSec: number;
  }
}
```

---

## 🛡️ Transcription Rules (Locked Core)

The library enforces strict rules via system instructions to ensure professional quality:
1.  **Verbatim:** Captures stutters, fillers ("um", "ah"), and repetitions.
2.  **Accuracy:** Focuses on speaker clarity while ignoring background noise.
3.  **No Hallucinations:** Does not add opinions or information not present in the audio.
4.  **Formatting:** Respects natural pauses and grammar.

---

## 📄 License

ISC - Copyright (c) 2026 **Smart Tell Line**.
