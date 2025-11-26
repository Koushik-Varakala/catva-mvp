// server/services/multilingual_manager.js
// Simple heuristic ACE (Adaptive Code-switching Engine) stub

exports.decideLanguage = function decideLanguage(sessionId, semantic) {
  // Heuristic: check tokens / language tag
  if (semantic && semantic.lang) {
    if (semantic.lang.includes('en')) return 'en';
    if (semantic.lang.includes('te')) return 'te';
    if (semantic.lang.includes('hi')) return 'hi';
  }
  return 'en';
};
