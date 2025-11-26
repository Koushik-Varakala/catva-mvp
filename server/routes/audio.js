import { createWriteStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';
import { runASRChunk, processSession } from '../services/asr.js';
import { clspUpdate } from '../services/clsp.js';
import { decideLanguage } from '../services/multilingual_manager.js';

export default function wsAudioHandler(ws) {
  const sessionId = uuidv4();
  console.log('ws connected', sessionId);

  const chunks = [];

  ws.on('message', async (data) => {
    // data is binary blob (webm). Save to buffer list.
    chunks.push(data);
    // Optionally: every N chunks, run partial ASR.
    if (chunks.length >= 4) {
      const chunkBuf = Buffer.concat(chunks.splice(0));
      try {
        const partial = await runASRChunk(chunkBuf); // placeholder
        // partial => { text, lang, tokens }
        if (partial?.text) {
          const sem = await clspUpdate(sessionId, partial);
          const langDecision = decideLanguage(sessionId, sem);
          // send transcript to client
          ws.send(JSON.stringify({ type: 'transcript', text: partial.text, lang: partial.lang }));
          // if business logic needs to synthesize reply, you can call TTS service endpoint to generate, then send tts_url back
        }
      } catch (e) {
        console.error('ASR error', e);
      }
    }
  });

  ws.on('close', () => console.log('ws closed', sessionId));
}
