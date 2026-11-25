// A small `psql` for the proofs, on PostgreSQL compiled to WebAssembly.
// It keeps its data in ./.pg and supports only -A, -t, -X, -q and -c.
import { PGlite } from '@electric-sql/pglite';

const commands = [];
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-c') commands.push(args[++i]);
  else if (/^-[AtXq]+$/.test(args[i])) continue;
  else if (/^-[AtXq]*c$/.test(args[i])) commands.push(args[++i]);
  else if (args[i].startsWith('-')) throw new Error(`unsupported option: ${args[i]}`);
}

const db = await PGlite.create('./.pg');
try {
  for (const command of commands) {
    const results = await db.exec(command);
    const rows = results.at(-1)?.rows ?? [];
    for (const row of rows) console.log(Object.values(row).join('|'));
  }
} catch (e) {
  console.error(`ERROR:  ${e.message}`);
  process.exitCode = 1;
} finally {
  await db.close();
}
