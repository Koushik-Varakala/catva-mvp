// server/routes/audio.js
const { v4: uuidv4 } = require('uuid');
const { runASRChunk } = require('../services/asr');
const { clspUpdate } = require('../services/clsp');
const { decideLanguage } = require('../services/multilingual_manager');

module.exports = function wsAudioHandler(ws) {
  const sessionId = uuidv4();
  console.log('ws connected', sessionId);

  const chunks = [];

  ws.on('message', async (data) => {
    // data may be Buffer or ArrayBuffer; ensure Buffer
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    chunks.push(buf);

    // Every 4 chunks do a quick ASR pass (adjust as needed)
    if (chunks.length >= 4) {
      const chunkBuf = Buffer.concat(chunks.splice(0));
      try {
        const partial = await runASRChunk(chunkBuf); // { text, lang, tokens }
        if (partial && partial.text) {
          const sem = await clspUpdate(sessionId, partial);
          const langDecision = decideLanguage(sessionId, sem);
          // send transcript back to client
          ws.send(JSON.stringify({ type: 'transcript', text: partial.text, lang: partial.lang }));
          // OPTIONAL: you could call TTS and send audio URL or a signal
        }
      } catch (e) {
        console.error('ASR error', e);
      }
    }
  });

  ws.on('close', () => console.log('ws closed', sessionId));
};
