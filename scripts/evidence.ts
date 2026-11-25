/** Adds the evidence of other computers, such as the files that the CI leaves: npm run evidence -- file.json ... */
import { readFileSync, writeFileSync } from 'node:fs';
import { EVIDENCE_FILE, digest, loadEntries, readEvidence, type EvidenceFile } from './entries.ts';

const all = readEvidence();
const entries = new Map(loadEntries().map((e) => [e.id, e]));
for (const file of process.argv.slice(2)) {
  for (const [id, record] of Object.entries(JSON.parse(readFileSync(file, 'utf8')) as EvidenceFile)) {
    const entry = entries.get(id);
    if (!entry || digest(entry) !== record.digest) { console.log(`skipped, it is not of the current entry: ${id}`); continue; }
    const mine = all[id]?.digest === record.digest ? all[id].runs : [];
    const platforms = new Set(record.runs.map((r) => r.platform));
    const newest = record.runs.map((r) => mine.find((m) => m.platform === r.platform && m.date > r.date) ?? r);
    all[id] = { digest: record.digest, runs: [...mine.filter((m) => !platforms.has(m.platform)), ...newest].sort((a, b) => (a.platform < b.platform ? -1 : 1)) };
  }
}
writeFileSync(EVIDENCE_FILE, `${JSON.stringify(Object.fromEntries(Object.entries(all).sort(([a], [b]) => (a < b ? -1 : 1))), null, 2)}\n`);
