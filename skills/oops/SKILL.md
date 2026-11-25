---
name: oops
description: Recover from a command that destroyed something, or check whether a command can be undone before running it. Use when the user says that something was deleted, overwritten, reset, force-pushed or dropped by mistake, or asks whether something is reversible. Covers git, files, Docker, Kubernetes, SQL databases, Terraform and cloud commands.
---

# Something was lost

1. Stop. Run nothing that writes, cleans or restarts anything: what was deleted may still be there until something takes its place.
2. Look it up, with the command that did it or a few words about what happened:

   ```sh
   node "${CLAUDE_PLUGIN_ROOT}/dist/caniundo.js" oops "git stash drop"
   ```

3. Find out what is still there with commands that only read, such as `git reflog` or `git status`.
4. Show the user the recipe that fits: what it brings back, until when it works and what it can overwrite. Run it only after they agree.
5. Check the result, and say plainly what did not come back.

# Before a command

```sh
node "${CLAUDE_PLUGIN_ROOT}/dist/caniundo.js" "docker compose down -v"
```

- `Tested` means that the command and its recipe were run in a test. `Documented` means that only the manual says so.
- `NOT KNOWN` means that nobody has written about it yet. Never present it as safe.
- If the database has nothing, say so. Do not invent a recipe.
