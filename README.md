LOCAL RUN (quick)

1) Ensure Node 18 is active:
   - If you use nvm:
     nvm install 18
     nvm use 18
   - Verify:
     node -v    # should be v18.x

2) Server install & run:
   cd server
   rm -rf node_modules package-lock.json
   npm install
   # Set environment variables (do not share keys)
   export ELEVENLABS_API_KEY="your_key_here"
   export ELEVEN_VOICE_ID="your_voice_id_here"
   node server.js

3) Open browser:
   http://localhost:4000
   Click Start, allow microphone, speak.
   Use "Speak back sample" to request server-side TTS (ElevenLabs proxy).

SECURITY:
 - NEVER put your API key in frontend or commit it.
 - For production, set env vars in your host (Render, Heroku, etc).
