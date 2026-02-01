# geminisst 🎙️

**geminisst** is a revolutionary, professional-grade Node.js library for high-accuracy **Audio-to-Text** conversion. Powered by **Google's Gemini 2.5 Flash Lite** (default) and compatible with the newest **Gemini 3** series, it offers a massive **1 Million+ context window** and next-gen multimodal understanding.

Unlike traditional STT engines, `geminisst` leverages the **Files API** for all requests, ensuring stability and accuracy whether you are processing a 3-second voice note or a multi-hour lecture.

---

## 🚀 Key Features

*   **Gemini 2.5 Flash Lite (Default):** Optimized for cost-efficiency and speed, pre-configured with `thinkingBudget: -1` (Dynamic Thinking).
*   **Gemini 3 Ready:** Full support for the latest **Gemini 3 Flash** and **Pro** models using `thinkingLevel`.
*   **Universal Files API:** All audio is processed via the robust Files API, eliminating size limits and base64 overhead.
*   **Intelligent Reasoning:**
    *   **Gemini 2.5:** Controls reasoning via `thinkingBudget` (Default: Dynamic).
    *   **Gemini 3:** Controls reasoning via `thinkingLevel` (minimal, low, medium, high).
*   **Locked Core Logic:** Built-in system instructions ensure 100% verbatim transcription (no summaries, no opinions).
*   **Automatic Language Detection:** Seamlessly handles Hindi, English, Hinglish, and mixed languages.
*   **Rich Metadata:** Real-time tracking of token usage, thoughts, and processing time.
*   **TypeScript Native:** Full type safety and IntelliSense.

---

## 📦 Installation

```bash
npm install geminisst
```

*Note: You need a Google Gemini API Key. Get one for free at [Google AI Studio](https://aistudio.google.com/).*

---

## 🛠️ Quick Start

### 1. Simple Transcription (Default)
Uses **Gemini 2.5 Flash Lite** with Dynamic Thinking.

```javascript
import { audioToText } from 'geminisst';

const apiKey = "YOUR_GEMINI_API_KEY";
const result = await audioToText('./meeting.mp3', apiKey);

console.log("Transcript:", result.text);
```

### 2. Using Gemini 3 (Advanced)
Switch to **Gemini 3 Flash** and use `thinkingLevel`.

```javascript
import { audioToText } from 'geminisst';

async function transcribeWithGemini3() {
  const result = await audioToText('./interview.wav', 'YOUR_API_KEY', {
    model: "gemini-3-flash-preview", // Switch model
    thinkingLevel: "high",           // Gemini 3 specific config
    verbose: true
  });

  if (result.thoughts) {
    console.log("Gemini 3 Thoughts:", result.thoughts);
  }
  console.log("Transcript:", result.text);
}

transcribeWithGemini3();
```

---

## 📖 API Reference

### `audioToText(filePath, apiKey, options?)`

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `filePath` | `string` | Absolute path to the audio file. |
| `apiKey` | `string` | Your Google Gemini API Key. |
| `options` | `SSTOptions` | (Optional) Configuration for models and thinking. |

### `SSTOptions`

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `prompt` | `string` | `undefined` | Guidance (e.g., "Transcribe in Hindi"). |
| `model` | `string` | `"gemini-2.5-flash-lite"` | The model to use. Supports both 2.5 and 3 series. |
| `verbose` | `boolean` | `false` | Log upload and processing steps. |
| `thinkingBudget` | `number` | `-1` | **(Gemini 2.5 Only)** Token budget for reasoning (-1 = dynamic). |
| `thinkingLevel` | `string` | `undefined` | **(Gemini 3 Only)** "minimal", "low", "medium", "high". |

### `TranscriptionResult`

| Property | Type | Description |
| :--- | :--- | :--- |
| `text` | `string` | The verbatim transcript. |
| `thoughts` | `string` | AI's internal reasoning process. |
| `model` | `string` | The specific model version used. |
| `usage` | `object` | Stats: `inputTokens`, `outputTokens`, `thoughtsTokenCount`, etc. |

---

## 🛡️ Transcription Rules (Locked Logic)

This library is hardcoded with professional transcription rules ensuring:
1.  **Verbatim Content:** Captures stutters, hesitations, and repetitions.
2.  **Noise Suppression:** Ignores background noise, focuses on speech.
3.  **No Interpretation:** No summaries or translations (unless requested via prompt).
4.  **Style Integrity:** Matches the natural flow and pronunciation.

---

## 📄 License

ISC - Distributed under the ISC License. See `LICENSE` for more information.

Copyright (c) 2026, **Smart Tell Line**.