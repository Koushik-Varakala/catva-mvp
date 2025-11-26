// frontend/widget.js
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const speakBackBtn = document.getElementById('speakBackBtn');
const transcriptEl = document.getElementById('transcript');
const playback = document.getElementById('playback');

let ws;
let mediaRecorder;

function getWsUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.host}/ws/audio`;
}

startBtn.onclick = async () => {
  ws = new WebSocket(getWsUrl());
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => {
    transcriptEl.innerText = 'Connected to server. Speak now...';
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'transcript') {
        transcriptEl.innerText = msg.text;
      }
    } catch (e) {
      console.error('ws parse', e);
    }
  };

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

  mediaRecorder.ondataavailable = (e) => {
    if (ws && ws.readyState === 1 && e.data && e.data.size > 0) {
      e.data.arrayBuffer().then(ab => ws.send(ab)).catch(console.error);
    }
  };

  mediaRecorder.start(250); // chunk every 250ms
};

stopBtn.onclick = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  if (ws && ws.readyState === 1) ws.close();
  startBtn.disabled = false;
  stopBtn.disabled = true;
  transcriptEl.innerText = 'Stopped';
};

// quick TTS test: speak a sample text via server-side ElevenLabs proxy
speakBackBtn.onclick = async () => {
  const sample = 'Hello — this is CATVA demo. మీరు ఎలా ఉన్నారు?';
  try {
    const resp = await fetch('/v1/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sample })
    });
    if (!resp.ok) {
      const t = await resp.text();
      console.error('tts resp', t);
      alert('TTS failed: ' + t);
      return;
    }
    const ab = await resp.arrayBuffer();
    const blob = new Blob([ab], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    playback.src = url;
    playback.play();
  } catch (e) {
    console.error(e);
    alert('TTS request failed (see console)');
  }
};
