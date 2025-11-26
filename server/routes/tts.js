// server/routes/tts.js
const express = require('express');
const fetch = require('node-fetch'); // v2
const fs = require('fs');
const path = require('path');
const router = express.Router();

const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVEN_VOICE_ID = process.env.ELEVEN_VOICE_ID;

// Optional local TTS endpoint if you set one up later (e.g. Coqui TTS server)
const LOCAL_TTS_ENDPOINT = process.env.LOCAL_TTS_ENDPOINT || null; // e.g. "http://localhost:5002/api/tts"

function streamFileToRes(filePath, res) {
  const stat = fs.statSync(filePath);
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Length', stat.size);
  const read = fs.createReadStream(filePath);
  read.pipe(res);
}

async function callElevenLabs(text) {
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
  return resp;
}

async function callLocalTts(text) {
  if (!LOCAL_TTS_ENDPOINT) throw new Error('No local TTS endpoint configured');
  const resp = await fetch(LOCAL_TTS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return resp;
}

router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  // First, attempt ElevenLabs (if configured)
  if (ELEVEN_KEY && ELEVEN_VOICE_ID) {
    try {
      const resp = await callElevenLabs(text);

      // If OK, stream straight to client
      if (resp.ok) {
        res.setHeader('Content-Type', 'audio/mpeg');
        resp.body.pipe(res);
        return;
      }

      // Not OK: get JSON detail (ElevenLabs returns JSON error)
      let bodyText = '';
      try { bodyText = await resp.text(); } catch (e) { bodyText = ''; }
      console.warn('ElevenLabs returned non-ok:', resp.status, bodyText);

      // Try to parse JSON to inspect reason
      let parsed;
      try { parsed = JSON.parse(bodyText); } catch (e) { parsed = null; }

      // If exception indicates unusual activity, fall back
      const unusual = parsed && parsed.detail && parsed.detail.status === 'detected_unusual_activity';
      if (unusual) {
        console.warn('ElevenLabs flagged unusual activity. Fallback will be used.');
      }
      // otherwise we'll also fallback for any error

    } catch (err) {
      console.error('ElevenLabs call failed (network or exception):', err);
      // continue to fallback
    }
  } else {
    console.warn('ELEVENLABS not configured; using fallback.');
  }

  // FALLBACK STRATEGY:
  // 1) If there is a LOCAL_TTS_ENDPOINT, try that.
  // 2) Else, serve a static fallback audio file stored at ./frontend/fallback.mp3

  // Try local TTS if configured
  if (LOCAL_TTS_ENDPOINT) {
    try {
      const local = await callLocalTts(text);
      if (local.ok) {
        res.setHeader('Content-Type', local.headers.get('content-type') || 'audio/mpeg');
        local.body.pipe(res);
        return;
      } else {
        console.warn('Local TTS returned non-ok; status:', local.status);
      }
    } catch (e) {
      console.error('Local TTS call failed:', e);
    }
  }

  // Final fallback: static file
  const fallbackPath = path.join(__dirname, '..', '..', 'frontend', 'fallback.mp3');
  if (fs.existsSync(fallbackPath)) {
    console.warn('Using static fallback audio:', fallbackPath);
    return streamFileToRes(fallbackPath, res);
  }

  // If nothing works
  res.status(503).json({ error: 'tts_unavailable', message: 'TTS provider unavailable and no fallback configured.' });
});

module.exports = router;
