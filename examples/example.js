import { audioToText } from '../dist/index.js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Resolve path to .env in the parent directory (root of geminisst)
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

// ANSI Color Codes
const reset = "\x1b[0m";
const bold = "\x1b[1m";
const blue = "\x1b[34m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const cyan = "\x1b[36m";
const magenta = "\x1b[35m";
const red = "\x1b[31m";

function white(str) { return `\x1b[37m${str}\x1b[0m`; }

async function runTranscriptionLog(name, result, options) {
    console.log(`${bold}${cyan}─────────────────────────────────────────────────────────────────${reset}`);
    console.log(`${yellow}⚡ Completed: ${name}...${reset}`);
    console.log(`${blue}⚙️  Model: ${reset}${options.model || 'Default'}`);
    console.log(`${bold}${cyan}─────────────────────────────────────────────────────────────────${reset}\n`);

    // 1. Display Thoughts if available
    if (result.thoughts) {
        console.log(`${bold}${magenta}🧠 AI REASONING (THOUGHTS):${reset}`);
        console.log(`${cyan}${result.thoughts}${reset}\n`);
    }

    // 2. Display Final Transcript
    console.log(`${bold}${green}📝 RESULT:${reset}`);
    console.log(`${bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
    console.log(result.text);
    console.log(`${bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}\n`);

    // 3. Display Metadata
    console.log(`${bold}${yellow}📊 METADATA:${reset}`);
    console.log(`${blue}├─ Model:${reset} ${result.model}`);
    console.log(`${blue}├─ File URI:${reset} ${result.fileUri || 'N/A'}`);
    if (result.usage) {
        console.log(`${blue}├─ Time Taken:${reset} ${result.usage.processingTimeSec}s`);
        console.log(`${blue}├─ Input Tokens:${reset} ${result.usage.inputTokens}`);
        console.log(`${blue}├─ Output Tokens:${reset} ${result.usage.outputTokens}`);
        console.log(`${blue}├─ Thoughts Tokens:${reset} ${result.usage.thoughtsTokenCount || 0}`);
        console.log(`${blue}└─ Total Tokens:${reset}  ${result.usage.totalTokens}`);
    }
    console.log(`\n${bold}${green}✅ Process Completed Successfully!${reset}\n`);
}

/**
 * Enhanced Transcription Test
 */
async function runTest() {
    const apiKey = process.env.GEMINI_API_KEY;
    const audioFile = resolve(__dirname, '../sample.mp3');

    console.clear();
    if (!apiKey) {
        console.log(`${red}${bold}ERROR:${reset} GEMINI_API_KEY is missing in your .env file!`);
        return;
    }

    try {
        // Test 1: Upload and Transcribe (Gemini 2.5)
        console.log(`${yellow}🚀 Test 1: Upload & Transcribe (Gemini 2.5)...${reset}`);
        const result1 = await audioToText(audioFile, apiKey, {
            prompt: "Transcribe exactly.",
            verbose: true
        });
        
        runTranscriptionLog("Test 1 Result", result1, { model: "gemini-2.5-flash-lite" });

        // Test 2: Reuse URI (Gemini 3)
        if (result1.fileUri) {
            console.log(`${bold}${cyan}─────────────────────────────────────────────────────────────────${reset}`);
            console.log(`${yellow}⚡ Test 2: Reusing File URI (Skip Upload) + Gemini 3...${reset}`);
            console.log(`${blue}   Target URI: ${result1.fileUri}${reset}`);
            
            const result2 = await audioToText(result1.fileUri, apiKey, {
                prompt: "Summarize this audio briefly.",
                model: "gemini-3-flash-preview",
                thinkingLevel: "high",
                verbose: true
            });
            runTranscriptionLog("Test 2 Result", result2, { model: "gemini-3-flash-preview", thinkingLevel: "high" });
        }

    } catch (err) {
        console.log(`\n${red}${bold}✖ ERROR:${reset} ${err.message}`);
    }
}

runTest();