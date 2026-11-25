# Contributing

Issues and pull requests are welcome in English or Spanish.

## The most useful contributions

1. A command that is missing.
2. A proof for an entry that is only documented.
3. A way to write a command that caniundo does not recognise.
4. A warning where nothing can be lost.

## Set up

```sh
npm ci --ignore-scripts
npm run check
```

Node 24 runs the TypeScript sources directly: `node src/cli.ts "git clean -fd"`.

## Write an entry

One file in `entries/<tool>/<id>.yml`. [git-clean.yml](entries/git/git-clean.yml) is a good one to copy.

| Field | Contains |
| --- | --- |
| `example` | The command as people write it |
| `match` | How to recognise it: `run` (program and subcommands), `with` and `without` (flags, with `\|` between spellings), `operands`, `sql` or `redirect` |
| `verdict` | `"yes"`, `partly` or `"no"` |
| `loses`, `keeps` | What is gone and what is not, in plain words |
| `recover` | Recipes to get it back, with `until` when they expire and `risk` when they can overwrite something |
| `instead`, `before` | A safer way, with the commands to go back |
| `interrupt` | `false` for commands that people use all day long |
| `overrides` | More general entries that this one replaces |
| `sources`, `checked` | Official documentation, and the day you read it |
| `proof` | How to test it |

`no` means that nothing comes back unless there was a copy. When in doubt, choose the worse verdict.

A recipe is one plain command: no pipes, no redirections and no variables. Use `<name>` for what the reader has to fill in. A new program goes in the list in `scripts/entries.ts`.

## Write a proof

Each case starts in an empty folder:

| `shows` | Has to be true |
| --- | --- |
| `restored` | After the command the `check` fails, and after the recipe it passes |
| `lost` | After the command the `check` fails |
| `before` | The preparation, the command and the way back leave the `check` passing |
| `instead` | The safer commands and the way back leave the `check` passing |

The recipes in the proof are the ones that the reader sees, with the placeholders filled in by `fill`.

```sh
npm run prove -- git-clean            # run it
npm run prove -- git-clean --record   # and keep the result in evidence.json
```

Labs: `git`, `files`, `npm`, `sqlite`, `postgres`, `docker` and `powershell`. The ones that are missing on your computer are skipped, and the CI runs them all.

Read a proof before you run it: it executes what the entry says. In pull requests it runs without secrets.

Run `npm run build` before committing, because `dist/caniundo.js` is what the plugin uses.
