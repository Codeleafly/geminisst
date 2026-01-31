# geminisst 🎙️

**geminisst** is a revolutionary, professional-grade Node.js library for high-accuracy **Audio-to-Text** conversion. Powered by **Google's Gemini 2.5 Flash Lite**, it offers a massive **1 Million+ context window** and next-gen multimodal understanding that suns traditional STT engines.

Whether it's a 3-second voice clip or a multi-hour podcast, `geminisst` processes it with lightning speed, incredible cost-efficiency, and deep reasoning capabilities.

---

## 🚀 Key Features

*   **Gemini 2.5 Flash Lite Engine:** Optimized for the latest AI architecture, ensuring ultra-fast response times.
*   **1M+ Context Window:** Process massive audio files (up to several hours) in a single request.
*   **Dynamic Thinking (Reasoning):** Uses `thinkingBudget: -1` to allow the AI to reason about the audio (accents, context, noise) before transcribing.
*   **AI Thought Summaries:** Access the AI's internal reasoning process (`thoughts`) to understand *how* it arrived at the transcript.
*   **Locked Core Logic:** Built-in, unoverrideable system instructions ensure the AI acts as a pure transcription engine (no summaries, no opinions, 100% verbatim).
*   **Automatic Language Detection:** Seamlessly handles Hindi, English, Hinglish, and many other languages without manual configuration.
*   **Processing Metadata:** Real-time tracking of token usage and exact processing time in seconds.
*   **TypeScript Native:** Full type safety and IntelliSense support for a superior developer experience.

---

## 📦 Installation

```bash
npm install geminisst
```

*Note: You need a Google Gemini API Key. Get one for free at [Google AI Studio](https://aistudio.google.com/).*

---

## 🛠️ Quick Start

### 1. Simple Transcription
The most basic way to use `geminisst`.

```javascript
import { audioToText } from 'geminisst';

const apiKey = "YOUR_GEMINI_API_KEY";
const result = await audioToText('./meeting.mp3', apiKey);

console.log("Transcript:", result.text);
```

### 2. Advanced Usage (With Thoughts & Metadata)
Get deeper insights into the transcription process.

```javascript
import { audioToText } from 'geminisst';

async function transcribeWithInsights() {
  const result = await audioToText('./interview.wav', 'YOUR_API_KEY', {
    prompt: "The audio is in a mix of Hindi and English. Please use Devanagari for Hindi parts.",
    verbose: true
  });

  // Access the AI's "Internal Monologue"
  if (result.thoughts) {
    console.log("AI Reasoning:", result.thoughts);
  }

  // Exact spoken words
  console.log("Transcript:", result.text);

  // Performance metrics
  console.log(`Finished in ${result.usage.processingTimeSec}s`);
  console.log(`Total Tokens used: ${result.usage.totalTokens}`);
}

transcribeWithInsights();
```

---

## 📖 API Reference

### `audioToText(filePath, apiKey, options?)`

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `filePath` | `string` | Absolute or relative path to the audio file. |
| `apiKey` | `string` | Your Google Gemini API Key. |
| `options` | `SSTOptions` | (Optional) Advanced configuration. |

### `SSTOptions`

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `prompt` | `string` | `undefined` | Style/Language guidance (e.g., "Transcribe in English letters"). |
| `model` | `string` | `"gemini-2.5-flash-lite"` | Override default model. |
| `verbose` | `boolean` | `false` | Log internal steps for debugging. |

### `TranscriptionResult`

| Property | Type | Description |
| :--- | :--- | :--- |
| `text` | `string` | The 100% accurate, verbatim transcript. |
| `thoughts` | `string` | AI's thought summary explaining the reasoning/language detection. |
| `model` | `string` | The specific model version used. |
| `usage` | `object` | Stats: `inputTokens`, `outputTokens`, `totalTokens`, `processingTimeSec`. |

---

## 🛡️ Transcription Rules (Locked Logic)

This library is hardcoded with professional transcription rules that **cannot be overridden**, ensuring reliability:
1.  **Verbatim Content:** Captures stutters, hesitations, and repetitions exactly.
2.  **Noise Suppression:** Automatically ignores background noise and focuses on speech.
3.  **No Interpretation:** Forbidden from adding opinions, interpretations, or extra content.
4.  **Style Integrity:** Maintains the natural flow and pronunciation matching of the spoken words.

---

## 📄 License

ISC - Distributed under the ISC License. See `LICENSE` for more information.

Copyright (c) 2026, **Smart Tell Line**.
