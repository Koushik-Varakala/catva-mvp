// server/server.js
const express = require('express');
const http = require('http');
const path = require('path');
const wsAudioHandler = require('./routes/audio');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// TTS REST proxy endpoint
app.use('/v1/tts', require('./routes/tts'));

// Start websocket server for audio chunks
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server, path: '/ws/audio' });

wss.on('connection', (socket) => {
  try {
    wsAudioHandler(socket);
  } catch (e) {
    console.error('ws handler error', e);
    socket.close();
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
