import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import wsAudioHandler from './routes/audio.js';
import ttsRouter from './routes/tts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// REST TTS endpoint
app.use('/v1/tts', ttsRouter);

// start websocket server
const wss = new WebSocketServer({ server, path: '/ws/audio' });
wss.on('connection', (socket) => wsAudioHandler(socket));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening ${PORT}`));
