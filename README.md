# CATVA MVP

This is a minimal MVP for the CATVA project (Contextually Adaptive Trilingual Voice Agent).

## Quickstart (local)

1. Install Node.js (>=16 recommended)
2. Start server:
   - cd server
   - npm install
   - set env: export ELEVENLABS_API_KEY="your_key" && export ELEVEN_VOICE_ID="voice_id"
   - node server.js
3. Open browser at http://localhost:4000 and open the widget (index.html served from server).
4. Click Start and allow microphone. The widget will stream audio to the backend and receive transcripts.

Notes:
- ASR is a placeholder. Replace `server/services/asr.js` with Whisper or your chosen ASR.
- TTS endpoint proxies ElevenLabs; provide your ElevenLabs API key.
