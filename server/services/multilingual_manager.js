export function decideLanguage(sessionId, semantic) {
  // heuristic: if asrResult.lang contains 'en' use English for technical terms
  if (semantic.lang && semantic.lang.includes('en')) return 'en';
  if (semantic.lang && semantic.lang.includes('te')) return 'te';
  return 'hi';
}
