import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyze, analyzeWords, like } from '../src/analyze.ts';
import { parse } from '../src/shell.ts';
import { ENTRIES, POWERSHELL, ids, stops } from './helpers.ts';

const argv = (command: string): string[][] => parse(command).invocations.map((i) => i.words.map((w) => w.text));

test('reads words as a shell does', () => {
  const cases: [string, string[][]][] = [
    ['git  reset\t--hard', [['git', 'reset', '--hard']]],
    [`echo 'a b' "c d" e\\ f`, [['echo', 'a b', 'c d', 'e f']]],
    ['echo "a \\"b\\" \\n"', [['echo', 'a "b" \\n']]],
    ['a && b || c; d | e & f', [['a'], ['b'], ['c'], ['d'], ['e'], ['f']]],
    ['rm \\\n  -rf x', [['rm', '-rf', 'x']]],
    ['ls # rm -rf x', [['ls']]],
    ['echo a#b', [['echo', 'a#b']]],
    ['(cd x && rm y)', [['cd', 'x'], ['rm', 'y']]],
    ['if true; then rm y; fi', [['true'], ['rm', 'y']]],
    ['{ rm y; }', [['rm', 'y']]],
    ['! rm y', [['rm', 'y']]],
    ["r''m x", [['rm', 'x']]],
    ['"rm" x', [['rm', 'x']]],
    ['\\rm x', [['rm', 'x']]],
    ["$'rm' x", [['rm', 'x']]],
    ["$'\\x72\\x6d' x", [['rm', 'x']]],
    ['echo $(rm x)', [['rm', 'x'], ['echo', '']]],
    ['echo `rm x`', [['rm', 'x'], ['echo', '']]],
    ['echo "$(rm x)"', [['rm', 'x'], ['echo', '']]],
    ['echo $((1 + 2))', [['echo', '']]],
    ['diff <(rm x) y', [['rm', 'x'], ['diff', '', 'y']]],
    ['cmd 2>&1 >/dev/null', [['cmd']]],
    ['git push origin main:main', [['git', 'push', 'origin', 'main:main']]],
  ];
  for (const [command, expected] of cases) assert.deepEqual(argv(command), expected, command);
});

test('says when it could not read something', () => {
  for (const command of ['echo "a', "echo 'a", 'echo $(rm x', 'cat <<EOF\nrm x', '`rm', 'echo ${a', 'x'.repeat(100_001)]) {
    assert.equal(parse(command).unreadable, true, command.slice(0, 40));
  }
  assert.equal(parse('cat <<EOF\nhello "world\nEOF\n').unreadable, false);
});

test('every entry finds its own example, and nothing more general', () => {
  for (const e of ENTRIES) {
    const options = /^[A-Z][a-z]+-[A-Z]/.test(e.example) ? POWERSHELL : {};
    const found = ids(e.example, options);
    assert.ok(found.includes(e.id), e.example);
    for (const o of e.overrides) assert.ok(!found.includes(o), `${e.example} also matches ${o}`);
  }
});

test('finds a command inside others', () => {
  const same = [
    'sudo git clean -fd', 'sudo -u deploy git clean -fd', 'env A=1 git clean -fd', 'A=1 git clean -fd', 'nohup git clean -fd &',
    'timeout 5 git clean -fd', 'timeout -s KILL 5m git clean -fd', 'nice -n 10 git clean -fd', 'time git clean -fd', 'command git clean -fd', 'exec git clean -fd',
    "bash -c 'git clean -fd'", 'sh -c "git clean -fd"', "bash -lc 'cd x && git clean -fd'", "sudo bash -c 'sudo git clean -fd'", 'eval "git clean -fd"', "eval git clean -fd",
    'cd x && git clean -fd', 'true; git clean -fd', 'ls | xargs git clean -fd', "ssh host 'git clean -fd'", 'ssh -p 22 -i key user@host git clean -fd',
    'docker exec -it app git clean -fd', 'docker compose exec -T app git clean -fd', 'kubectl exec pod -n x -- git clean -fd', 'kubectl -n x exec pod -- git clean -fd',
    "cmd /c 'git clean -fd'", 'powershell -NoProfile -Command "git clean -fd"', 'pwsh -c "git clean -fd"', 'npx git clean -fd',
    '/usr/bin/git clean -fd', 'C:/Git/bin/git.exe clean -fd', 'GIT clean -fd', 'git -C repo clean -fd', 'git -c a.b=c clean -fd', 'git --git-dir=x clean -fd', 'git --no-pager clean -fd',
    'git clean -f -d', 'git clean -df', 'git clean --force -d', 'git clean --forc -d', 'git clean -d -f -e keep', 'bash <<EOF\ngit clean -fd\nEOF', "echo 'git clean -fd' | bash",
    'for i in a b; do git clean -fd; done', 'if git clean -fd; then echo; fi', 'watch "git clean -fd"', 'aws-vault exec prod -- git clean -fd', 'op run --env-file=.env -- git clean -fd',
    'x=$(git clean -fd)', 'function f { git clean -fd; }', 'f() { git clean -fd; }',
  ];
  for (const command of same) assert.deepEqual(stops(command), ['git-clean'], command);
  const encoded = Buffer.from('git clean -fd', 'utf16le').toString('base64');
  assert.deepEqual(stops(`powershell -NoP -enc ${encoded}`), ['git-clean']);
});

test('leaves alone what loses nothing', () => {
  const harmless = [
    'git clean -n', 'git clean -fdn', 'git clean -fd --dry-run', 'git clean', 'git status', 'git reset', 'git reset --soft HEAD~1', 'git log --hard', 'echo "git clean -fd"', "echo 'rm -rf x'",
    'grep -r "rm -rf" .', 'git commit -m "git clean -fd"', 'git checkout main', 'git checkout -b feature', 'git switch main', 'git stash', 'git push', 'git push origin main', 'git fetch --force',
    'git branch', 'git branch feature', 'git tag v1', 'docker compose down', 'docker compose up -d', 'docker ps -a', 'docker run --rm -v a:/b image', 'docker volume ls',
    'kubectl get pods', 'kubectl delete pod x --dry-run=client', 'terraform plan -destroy', 'terraform apply', 'aws s3 ls', 'aws s3 rm s3://b --recursive --dryrun',
    'psql -c "SELECT 1"', 'psql -c "BEGIN; DROP TABLE users; ROLLBACK"', 'psql -c "DELETE FROM users WHERE id = 1"', `psql -c "SELECT 'DROP TABLE users'"`, 'psql -c "-- DROP TABLE users"',
    'psql -c "SELECT * FROM a FOR UPDATE"', 'psql -c "INSERT INTO a VALUES (1) ON CONFLICT (id) DO UPDATE SET n = 2"', 'npm publish --dry-run', 'npm install', 'rm -rf node_modules', 'rm -rf dist', 'rm -rf ./build',
    'mv a b', 'cp a b', 'echo a > b', 'find . -name x -print', 'sed -n 1p x', 'dd if=x of=/dev/null', 'command -v rm', 'man rm', 'which rm', 'crontab -l', 'rsync -a a b', 'redis-cli GET flushall-count',
    'kubectl config delete-context x', 'git remote rm origin', 'git lfs prune --dry-run', 'rm -rf /tmp/build-1234',
  ];
  for (const command of harmless) assert.deepEqual(stops(command), [], command);
});

test('finds each variant', () => {
  const cases: [string, string[]][] = [
    ['git reset --hard', ['git-reset-hard']],
    ['git reset --har origin/main', ['git-reset-hard']],
    ['git checkout .', ['git-checkout-files']],
    ['git checkout HEAD -- src', ['git-checkout-files']],
    ['git checkout HEAD~2 src/app.ts', ['git-checkout-files']],
    ['git checkout -f main', ['git-checkout-force']],
    ['git switch --discard-changes main', ['git-checkout-force']],
    ['git restore .', ['git-restore']],
    ['git restore -S -W a.txt', ['git-restore']],
    ['git push -f', ['git-push-force']],
    ['git push origin +main', ['git-push-force']],
    ['git push --force --force-with-lease', ['git-push-force']],
    ['git push origin :feature', ['git-push-delete']],
    ['git push -d origin feature', ['git-push-delete']],
    ['git reflog expire --expire=now --all && git gc --prune=now', ['git-prune', 'git-prune']],
    ['rm a.txt', ['rm']],
    ['rm -rf -- -x', ['rm']],
    ['rm -rf $DIR', ['rm']],
    ['rm -rf /', ['rm']],
    ['rm -rf ../dist', ['rm']],
    ['rm -rf /srv/dist', ['rm']],
    ['rm -rf dist src', ['rm']],
    ['rm -rf /tmp/../home', ['rm']],
    ['rm -rf project/.git', ['rm-git']],
    ['find . -name x -exec rm {} +', ['rm']],
    ['find . -type f -exec rm -f {} \\;', ['rm']],
    ['find . -delete', ['find-delete']],
    ['dd if=/dev/zero of=/dev/sda bs=1M', ['dd']],
    ['docker compose -f a.yml down --volumes', ['docker-compose-down-volumes']],
    ['docker compose -p x down -t 5 -v', ['docker-compose-down-volumes']],
    ['docker-compose down -v --remove-orphans', ['docker-compose-down-volumes']],
    ['docker --context prod volume rm a b', ['docker-volume-rm']],
    ['docker rm -fv a', ['docker-rm']],
    ['docker rm $(docker ps -aq)', ['docker-rm']],
    ['kubectl -n shop delete deploy/web', ['kubectl-delete']],
    ['kubectl delete ns shop', ['kubectl-delete-namespace']],
    ['kubectl delete namespace/shop', ['kubectl-delete-namespace']],
    ['kubectl delete pvc --all -n shop', ['kubectl-delete-volume']],
    ['terraform -chdir=infra destroy -auto-approve', ['terraform-destroy']],
    ['terraform apply -destroy -auto-approve', ['terraform-destroy']],
    ['aws --profile prod s3 rm s3://b/k', ['aws-s3-delete']],
    ['aws s3 sync . s3://b --delete', ['aws-s3-delete']],
    ['aws rds delete-db-instance --db-instance-identifier x --skip-final-snapshot', ['aws-rds-delete-no-snapshot']],
    ['psql -h db -U me -c "DROP TABLE users CASCADE;"', ['postgres-drop-table']],
    ['psql -c"DROP TABLE users"', ['postgres-drop-table']],
    ['psql --command="drop table if exists users"', ['postgres-drop-table']],
    ['psql <<SQL\nDELETE FROM users;\nSQL', ['postgres-delete-all']],
    ['psql <<< "TRUNCATE users"', ['postgres-truncate']],
    ["echo 'DROP TABLE users' | psql shop", ['postgres-drop-table']],
    ['cat <<EOF | psql shop\nDROP TABLE users;\nEOF', ['postgres-drop-table']],
    ['docker exec -i db psql -U me -c "DELETE FROM users"', ['postgres-delete-all']],
    ['psql -c "DELETE FROM users WHERE 1=1"', ['postgres-delete-all']],
    ['psql -c "WITH x AS (DELETE FROM users RETURNING *) SELECT * FROM x"', ['postgres-delete-all']],
    ['psql -c "BEGIN; DROP TABLE users; COMMIT"', ['postgres-drop-table']],
    ['psql -c "BEGIN; DROP DATABASE shop; ROLLBACK"', ['postgres-drop-database']],
    ['mysql -e "START TRANSACTION; DROP TABLE users; ROLLBACK"', ['mysql-drop']],
    ['mysql shop -e "UPDATE users SET a = 1"', ['mysql-every-row']],
    ["sqlite3 app.db 'DROP TABLE users'", ['sqlite-drop-table']],
    ['redis-cli -h db -p 6379 flushall', ['redis-flush']],
    ['mongosh "mongodb://db/shop" --eval "db.getSiblingDB(\'x\').dropDatabase()"', ['mongo-drop']],
    ['npm publish --access public', ['npm-publish']],
    ['gh repo delete me/x --yes', ['gh-repo-delete']],
    ['railway volume delete --volume x', ['railway-volume-delete']],
    ['git stash clear', ['git-stash-clear']],
  ];
  for (const [command, expected] of cases) assert.deepEqual(stops(command), expected, command);
});

test('reads PowerShell', () => {
  const cases: [string, string[]][] = [
    ['Remove-Item -Recurse -Force folder', ['remove-item']],
    ['remove-item folder -r -fo', ['remove-item']],
    ['rm -r folder', ['remove-item']],
    ['del folder', ['remove-item']],
    ['ri x; git clean -fd', ['git-clean', 'remove-item']],
    ['Get-ChildItem *.log | Remove-Item', ['remove-item']],
    ['if (Test-Path x) { Remove-Item x }', ['remove-item']],
    ['& git clean -fd', ['git-clean']],
    ['& "C:\\Program Files\\Git\\bin\\git.exe" clean -fd', ['git-clean']],
    ["Invoke-Expression 'git clean -fd'", ['git-clean']],
    ['git clean `\n  -fd', ['git-clean']],
    ['Clear-Content a.log', ['clear-content']],
    ['Remove-Item .git -Recurse', ['rm-git']],
    ["cmd /c 'rd /s /q folder'", ['cmd-delete']],
    ['Remove-Item x -WhatIf', []],
    ['Remove-Item -Recurse node_modules', []],
    ["Write-Output 'Remove-Item x'", []],
    ['Get-Content a | Set-Content b', []],
    ['npm run build > $null', []],
  ];
  for (const [command, expected] of cases) assert.deepEqual(stops(command, POWERSHELL), expected, command);
});

test('sees redirections, but not to nowhere', () => {
  for (const c of ['echo a > b', 'echo a >| b', 'cmd &> b', '> b', 'cmd 2> errors.txt']) assert.ok(ids(c).includes('redirect'), c);
  for (const c of ['echo a >> b', 'cmd > /dev/null', 'cmd 2>&1', 'cmd > /dev/null 2>&1', 'cmd 2>/dev/null', 'cat < b', 'cmd >&2']) assert.ok(!ids(c).includes('redirect'), c);
});

test('unknown is never an approval', () => {
  const a = analyze('frobnicate --all && git commit -m x', ENTRIES);
  assert.deepEqual(a.unknown, ['frobnicate']);
  assert.deepEqual(analyzeWords(['git', 'reset', '--hard'], ENTRIES).findings.map((f) => f.entry.id), ['git-reset-hard']);
  // One text with spaces is a file name here, not a command.
  assert.deepEqual(analyzeWords(['cat', 'rm -rf x'], ENTRIES).findings, []);
});

test('SQL on its own can belong to any database', () => {
  assert.deepEqual(ids('DROP TABLE users'), ['mysql-drop', 'postgres-drop-table', 'sqlite-drop-table']);
  assert.deepEqual(ids('BEGIN; DELETE FROM users; ROLLBACK'), []);
  assert.deepEqual(stops('truncate -s 0 a.log'), ['truncate']);
});

test('patterns have only one wildcard', () => {
  for (const [text, pattern, expected] of [
    ['dist', 'dist', true], ['dist/', 'dist', true], ['a/dist', '*/dist', true], ['A\\DIST', '*/dist', true], ['distribution', 'dist', false],
    ['of=x', 'of=*', true], ['aXbXc', 'a*b*c', true], ['ab', 'a*b*b', false], ['', '*', true],
  ] as const) assert.equal(like(text, pattern), expected, `${text} ${pattern}`);
});

test('hostile text is read quickly and never breaks it', () => {
  const pieces = ['$(', '`', '"', "'", '\\', '<<', '>', '(', ')', '{', '}', '|', '&', ';', '\n', ' ', 'rm', 'bash -c ', 'git', '-', '--', '$', '*', 'psql -c ', 'DROP TABLE ', 'é', '\u{1F600}', '\ud800', '=', ':', '@', '#'];
  let seed = 7;
  const next = (n: number): number => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  for (let n = 0; n < 3000; n++) {
    let s = '';
    for (let k = next(25); k >= 0; k--) s += pieces[next(pieces.length)]!;
    analyze(s, ENTRIES);
    analyze(s, ENTRIES, POWERSHELL);
  }
  const started = performance.now();
  for (const piece of pieces) analyze(piece.repeat(Math.floor(90_000 / piece.length)), ENTRIES);
  analyze('sudo '.repeat(15_000) + 'rm x', ENTRIES);
  analyze(`psql -c "${'BEGIN; DROP TABLE a; '.repeat(4000)}"`, ENTRIES);
  assert.ok(performance.now() - started < 20_000, `${performance.now() - started} ms`);
});
