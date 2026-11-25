/**
 * Commands can come from anywhere, so they never reach a terminal or a prompt
 * with control codes or invisible characters in them.
 */
const UNSAFE = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Cs}\p{Co}]/gu;

export function clean(text: string, max = 160): string {
  const visible = text
    .slice(0, 20_000)
    .replace(/\s*\n\s*/g, ' ⏎ ')
    .replace(/\t/g, ' ')
    .replace(UNSAFE, (c) => `<U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}>`)
    .trim();
  const chars = [...visible];
  if (chars.length <= max) return visible;
  // Both ends, because what matters can be at the end of a long line.
  const tail = Math.floor(max / 3);
  return `${chars.slice(0, max - tail - 3).join('')} … ${chars.slice(-tail).join('')}`;
}

/** JSON that is safe to print on a terminal: plain ASCII. */
export function safeJson(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/[^ -~\n]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
}
