// server/services/clsp.js
// Very simple in-memory CLSP/CLSG stub

const sessions = {};

exports.clspUpdate = async function clspUpdate(sessionId, asrResult) {
  if (!sessions[sessionId]) sessions[sessionId] = { history: [] };
  sessions[sessionId].history.push(asrResult);
  // Return a tiny semantic object for downstream
  return { sessionId, lastText: asrResult.text, lang: asrResult.lang };
};

exports.getSession = function getSession(sessionId) {
  return sessions[sessionId];
};
