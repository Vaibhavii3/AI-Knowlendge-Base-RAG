// all-MiniLM-L6-v2 has a 256-token input limit (~190 words), so chunks must
// stay well under that or HF silently truncates them.
const CHUNK_WORDS = 120;
const OVERLAP_WORDS = 25;
const MIN_CHUNK_WORDS = 10;

exports.chunkText = (text, chunkSize = CHUNK_WORDS, overlap = OVERLAP_WORDS) => {
  if (!text || !text.trim()) return [];

  const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const words = [];
  const sentenceStarts = new Set();

  for (const sentence of sentences) {
    sentenceStarts.add(words.length);
    for (const word of sentence.split(/\s+/)) words.push(word);
  }

  const step = Math.max(chunkSize - overlap, 1);
  const chunks = [];

  for (let start = 0; start < words.length; start += step) {
    // align chunk start to the nearest sentence boundary within the first
    // `overlap` words, so chunks begin mid-sentence as rarely as possible
    let from = start;
    const alignLimit = Math.min(start + overlap, words.length);
    for (let j = start; j < alignLimit; j++) {
      if (sentenceStarts.has(j)) {
        from = j;
        break;
      }
    }

    const chunk = words.slice(from, from + chunkSize).join(" ");
    if (chunk) chunks.push(chunk);
  }

  const kept = chunks.filter((c) => c.split(/\s+/).length >= MIN_CHUNK_WORDS);
  // very short documents: one tiny chunk beats no chunks
  return kept.length > 0 ? kept : [words.join(" ")];
};
