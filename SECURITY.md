# Security

Please report these in private, through **Security > Report a vulnerability** on GitHub:

- A command or an input that makes `caniundo` execute something, write a file or use the network.
- A way to make the hook approve a command, or to control the terminal or the prompt through its output.
- A way to put a harmful recipe in an entry that the checks accept.

Please open a public issue for these, since there is no one to protect by waiting:

- A destructive command that is not recognised.
- A verdict, a recipe or a time limit that is wrong. If the recipe makes things worse, say so in the title.

Only the latest version receives fixes.

## What it protects from

Mistakes. The hook reads the command, so whoever wants to get around it can, for example by writing a script first. Use a sandbox and limited credentials for that.
