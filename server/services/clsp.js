// Simple in-memory CLSP storage
const sessions = {};

export async function clspUpdate(sessionId, asrResult) {
  if (!sessions[sessionId]) sessions[sessionId] = { history: [] };
  sessions[sessionId].history.push(asrResult);
  // produce a simple semantic object
  return { sessionId, lastText: asrResult.text, lang: asrResult.lang };
}

export function getSession(sessionId) {
  return sessions[sessionId];
}
