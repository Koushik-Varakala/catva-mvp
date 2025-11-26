import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

// IMPORTANT: set ELEVENLABS_API_KEY in env before running
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY || 'REPLACE_ME';
const ELEVEN_VOICE_ID = process.env.ELEVEN_VOICE_ID || 'YOUR_VOICE_ID';

router.post('/', async (req, res) => {
  // request body: { text, language, prosody }
  const { text } = req.body;
  if (!text) return res.status(400).send({ error: 'text required' });

  // Example ElevenLabs API call (pseudo — check API docs for exact endpoint)
  try {
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        voice_settings: { stability: 0.7, similarity_boost: 0.75 }
      })
    });
    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // return audio as base64 data URL for simplicity
    const dataUrl = `data:audio/mpeg;base64,${buffer.toString('base64')}`;
    return res.json({ dataUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'tts failed' });
  }
});

export default router;
