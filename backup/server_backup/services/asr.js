// server/services/asr.js
// Minimal ASR stub for MVP. Replace with real ASR (Whisper or cloud) later.

exports.runASRChunk = async function runASRChunk(buffer) {
  // This is a placeholder. For an MVP return a fake transcript.
  // In production, save buffer to a file and run a streaming ASR inference.
  return {
    text: '[partial transcript placeholder]',
    lang: 'te+en',
    tokens: []
  };
};
