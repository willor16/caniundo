import { analyze } from './analyze.ts';
import type { Entry } from './types.ts';

/** Words that say nothing about what happened. */
const STOP = new Set(['the', 'my', 'in', 'of', 'to', 'and', 'by', 'mistake', 'accident', 'accidentally', 'el', 'la', 'los', 'las', 'un', 'una', 'mi', 'mis', 'de', 'del', 'en', 'por', 'error', 'sin', 'querer', 'con', 'que', 'se', 'me', 'lo', 'was', 'have', 'has', 'he', 'ha', 'command', 'comando']);

/** "Borré" and "borrar", or "deleted" and "delete", are the same word here. */
function stems(text: string): string[] {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1)
    .map((w) => (w.length > 4 ? w.slice(0, 4) : w.replace(/s$/, '')));
}

/** Entries about a command, or about some words that describe what happened. */
export function search(text: string, entries: Entry[], max = 5): Entry[] {
  const direct = [...new Set(analyze(text, entries).findings.map((f) => f.entry))];
  if (direct.length > 0) return direct.slice(0, max);
  const said = text.split(/\s+/).filter((w) => !STOP.has(w.toLowerCase())).join(' ');
  const words = [...new Set(stems(said))];
  const scored = entries.map((entry) => {
    const title = new Set(stems(`${entry.title.en} ${entry.title.es}`));
    const name = new Set(stems(`${entry.id} ${entry.tool} ${entry.example}`));
    const rest = new Set(stems(`${entry.loses.en} ${entry.loses.es} ${entry.recover.map((r) => `${r.gives.en} ${r.gives.es}`).join(' ')}`));
    let score = 0;
    for (const w of words) score += (title.has(w) ? 5 : 0) + (name.has(w) ? 4 : 0) + (rest.has(w) ? 1 : 0);
    // Between two that fit the same, the one that can help.
    if (score > 0 && entry.recover.length > 0) score += 0.5;
    return { entry, score };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  // Far from the best one, the rest is only noise.
  const best = scored[0]?.score ?? 0;
  return scored.filter((s) => s.score >= best * 0.6).slice(0, max).map((s) => s.entry);
}
