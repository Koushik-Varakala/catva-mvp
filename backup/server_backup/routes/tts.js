// server/routes/tts.js
const express = require('express');
const fetch = require('node-fetch'); // v2
const router = express.Router();

const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVEN_VOICE_ID = process.env.ELEVEN_VOICE_ID;

if (!ELEVEN_KEY || !ELEVEN_VOICE_ID) {
  console.warn('Warning: ELEVENLABS_API_KEY or ELEVEN_VOICE_ID not set in env');
}

router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  try {
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        voice_settings: { stability: 0.7, similarity_boost: 0.75 }
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('ElevenLabs error', resp.status, errText);
      return res.status(502).json({ error: 'TTS provider error', details: errText });
    }

    // Stream the audio body directly to client (audio/mpeg)
    res.setHeader('Content-Type', 'audio/mpeg');
    resp.body.pipe(res);
  } catch (err) {
    console.error('tts failed', err);
    res.status(500).json({ error: 'tts failed' });
  }
});

module.exports = router;
