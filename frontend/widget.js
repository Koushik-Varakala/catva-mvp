// Simple recorder + websocket sender
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const transcriptEl = document.getElementById('transcript');
const playback = document.getElementById('playback');

let ws;
let mediaRecorder;

startBtn.onclick = async () => {
  ws = new WebSocket('ws://localhost:4000/ws/audio');
  ws.onmessage = (ev) => {
    // JSON messages: {type:'transcript'|'audio', data:...}
    const msg = JSON.parse(ev.data);
    if (msg.type === 'transcript') {
      transcriptEl.innerText = msg.text;
    }
    if (msg.type === 'tts_url') {
      // play TTS audio blob (base64)
      playback.src = msg.url;
      playback.play();
    }
  };

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

  mediaRecorder.ondataavailable = (e) => {
    if (ws && ws.readyState === 1) {
      // send raw binary
      ws.send(e.data);
    }
  };

  mediaRecorder.start(250); // chunk every 250ms
  startBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  ws.close();
  startBtn.disabled = false;
  stopBtn.disabled = true;
};
