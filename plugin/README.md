# Can I undo?

A skill that tells Claude whether a command can be undone, what it would destroy, a safer way to do it and how to recover afterwards. It comes from an open database of destructive commands: git, files, PowerShell, SQL, Docker, Kubernetes, Terraform and cloud tools. Most recipes were proved by running them on Linux, macOS and Windows.

Ask in your own words, before a command or after something went wrong: "I ran git stash drop by mistake, can I get it back?"

The version with a hook, which stops Claude Code before a command that cannot be undone, is in the main repository:

```
/plugin install caniundo --marketplace willor16/caniundo
```

## Privacy

This plugin is only text and an icon. It collects, stores and sends nothing: no network, no telemetry, no account. Claude reads the files in this folder and answers in your conversation, and nothing leaves it because of this plugin.

This folder is generated from willor16.github.io/caniundo and https://github.com/willor16/caniundo, where the entries, their tests and a version with a hook live.
