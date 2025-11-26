// Minimal ASR stub. Replace with Whisper or cloud ASR
export async function runASRChunk(buffer) {
  // For MVP return placeholder text; in production call Whisper or cloud ASR
  const text = '[partial transcript placeholder]';
  const lang = 'tel+en'; // inferred
  return { text, lang, tokens: [] };
}
