# Git

Generated from `entries/` in https://github.com/willor16/caniundo. Do not edit by hand.

- `git merge --abort`: NO
- `git branch -D feature`: YES
- `git branch -f feature main`: YES
- `git checkout -- src/app.js`: NO
- `git checkout -f main`: NO
- `git cherry-pick a1b2c3d`: YES
- `git clean -fd`: NO
- `git commit --amend`: YES
- `git commit -m "message"`: YES
- `git filter-branch --tree-filter "rm -f secret.txt" HEAD`: YES
- `git filter-repo --path secret.txt --invert-paths`: NO
- `git merge feature`: YES
- `git gc --prune=now`: NO
- `git push origin --delete feature`: PARTLY
- `git push --force`: PARTLY
- `git push --force-with-lease`: YES
- `git rebase main`: YES
- `git reset --hard HEAD~1`: PARTLY
- `git restore src/app.js`: NO
- `git rm -f old.txt`: PARTLY
- `git rm old.txt`: YES
- `git stash clear`: YES
- `git stash drop`: YES
- `git tag -d v1.0`: YES
- `git restore --staged src/app.js`: PARTLY
- `git worktree remove ../feature`: PARTLY

## git merge --abort

**NO** · Give up a merge or a rebase halfway · id `git-abort`

- **Matches:** `git merge`, with `--abort`; or `git rebase`, with `--abort`; or `git cherry-pick`, with `--abort`; or `git revert`, with `--abort`; or `git am`, with `--abort`
- **Lost:** The conflicts that you had already resolved.
- **Before:** Copy the files that you resolved outside the repository.

    ```sh
    cp <file> <copy>
    ```

  To go back:

    ```sh
    cp <copy> <file>
    ```
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-abort/ (Spanish: https://willor16.github.io/caniundo/es/c/git-abort/)

## git branch -D feature

**YES** · Delete a branch · id `git-branch-delete`

- **Matches:** `git branch`, with `-D` or `-d` or `--delete`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** The name of the branch and its settings. The commits stay.
- **To undo:** The branch. Git prints its commit when it deletes it, and the first command also lists it.

    ```sh
    git reflog
    git branch <name> <commit>
    ```
  - Until: 30 days by default, if you had that branch checked out in this copy.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Source:** https://git-scm.com/docs/git-gc (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/git-branch-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/git-branch-delete/)

## git branch -f feature main

**YES** · Move a branch to another commit · id `git-branch-force`

- **Matches:** `git branch`, with `-f` or `--force`, not with `-D`, `-d`, `--delete`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** The branch stops pointing to its commits. They stay.
- **To undo:** The position the branch had.

    ```sh
    git branch --force <name> <name>@{1}
    ```
  - Until: 30 days by default. The 1 means one move ago.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Source:** https://git-scm.com/docs/git-gc (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/git-branch-force/ (Spanish: https://willor16.github.io/caniundo/es/c/git-branch-force/)

## git checkout -- src/app.js

**NO** · Replace files with an older version · id `git-checkout-files`

- **Matches:** `git checkout`, not with `-b`, `-B`, with paths after `--`; or `git checkout`, not with `-b`, `-B`, with an argument like `.`, `./*`, `../*`, `:/`, `*.js`, `*.ts`, `*.jsx`, `*.tsx`…
- **Lost:** The changes in those files that were not staged or committed.
- **Instead:** Put them away instead of discarding them.

    ```sh
    git stash push -- <file>
    ```

  To go back:

    ```sh
    git stash pop
    ```
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-checkout-files/ (Spanish: https://willor16.github.io/caniundo/es/c/git-checkout-files/)

## git checkout -f main

**NO** · Change branch and discard changes · id `git-checkout-force`

- **Matches:** `git checkout`, with `-f` or `--force`; or `git switch`, with `-f` or `--force` or `--discard-changes`
- **More specific than:** `git checkout -- src/app.js`
- **Lost:** Every change that was not committed.
- **Instead:** Put the changes away, then change branch. The way back needs both steps.

    ```sh
    git stash push --include-untracked
    git switch <branch>
    ```

  To go back:

    ```sh
    git switch -
    git stash pop
    ```
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-checkout-force/ (Spanish: https://willor16.github.io/caniundo/es/c/git-checkout-force/)

## git cherry-pick a1b2c3d

**YES** · Copy a commit from another branch · id `git-cherry-pick`

- **Matches:** `git cherry-pick`, not with `--abort`, `--continue`, `--quit`, `--skip`, `-n`, `--no-commit`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** Nothing.
- **To undo:** The branch without the copied commit. Repeat it once for each commit you copied.

    ```sh
    git reset --keep HEAD~1
    ```
  - Until: Right after, and before you push it.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-cherry-pick/ (Spanish: https://willor16.github.io/caniundo/es/c/git-cherry-pick/)

## git clean -fd

**NO** · Delete files that git does not track · id `git-clean`

- **Matches:** `git clean`, with `-f` or `--force`, not with `-n`, `--dry-run`
- **Lost:** The files git does not track. With -x, also the ignored ones, such as .env.
- **Instead:** Put them away instead. Add --all if you were going to use -x.

    ```sh
    git stash push --include-untracked
    ```

  To go back:

    ```sh
    git stash pop
    ```
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-clean/ (Spanish: https://willor16.github.io/caniundo/es/c/git-clean/)

## git commit --amend

**YES** · Replace the last commit · id `git-commit-amend`

- **Matches:** `git commit`, with `--amend`, not with `--dry-run`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** Nothing. The old commit stays outside the branch.
- **To undo:** The commit as it was. What you added stays staged.

    ```sh
    git reset --soft HEAD@{1}
    ```
  - Until: 30 days by default. The 1 means one move ago, so check git reflog if you did something else after.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Source:** https://git-scm.com/docs/git-gc (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/git-commit-amend/ (Spanish: https://willor16.github.io/caniundo/es/c/git-commit-amend/)

## git commit -m "message"

**YES** · Save a commit · id `git-commit`

- **Matches:** `git commit`, not with `--amend`, `--dry-run`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** Nothing.
- **To undo:** The changes, staged as they were before the commit.

    ```sh
    git reset --soft HEAD~1
    ```
  - Until: Before you push it. After that, use git revert.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-commit/ (Spanish: https://willor16.github.io/caniundo/es/c/git-commit/)

## git filter-branch --tree-filter "rm -f secret.txt" HEAD

**YES** · Rewrite all the history · id `git-filter-branch`

- **Matches:** `git filter-branch`
- **Lost:** Nothing yet. Git keeps the old history under refs/original.
- **To undo:** The branch with its old history.

    ```sh
    git reset --keep refs/original/refs/heads/<branch>
    ```
  - Until: Until refs/original is deleted or another filter-branch replaces it.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-filter-branch/ (Spanish: https://willor16.github.io/caniundo/es/c/git-filter-branch/)

## git filter-repo --path secret.txt --invert-paths

**NO** · Rewrite all the history with filter-repo · id `git-filter-repo`

- **Matches:** `git filter-repo`, not with `--analyze`, `--dry-run`, `-n`; or `git-filter-repo`, not with `--analyze`, `--dry-run`, `-n`
- **Lost:** The old history. It deletes the old commits and the reflog as soon as it finishes.
- **Before:** Work on a fresh clone and keep the original until you have checked the result.
- **Evidence:** Documented, not tested
- **Source:** https://raw.githubusercontent.com/newren/git-filter-repo/main/Documentation/git-filter-repo.txt (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/git-filter-repo/ (Spanish: https://willor16.github.io/caniundo/es/c/git-filter-repo/)

## git merge feature

**YES** · Join another branch · id `git-merge`

- **Matches:** `git merge`, not with `--abort`, `--continue`, `--quit`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** Nothing.
- **To undo:** The branch as it was before the merge.

    ```sh
    git reset --keep ORIG_HEAD
    ```
  - Until: Until another reset, merge or rebase, and before you push it.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-merge/ (Spanish: https://willor16.github.io/caniundo/es/c/git-merge/)

## git gc --prune=now

**NO** · Clean up what git was keeping · id `git-prune`

- **Matches:** `git gc`, with `--prune=now` or `--prune=all`; or `git prune`, not with `-n`, `--dry-run`; or `git reflog expire`, not with `-n`, `--dry-run`; or `git reflog delete`, not with `-n`, `--dry-run`
- **Lost:** Deleted commits, branches and stashes. The recipes that bring them back stop working.
- **Instead:** git gc on its own keeps the last 2 weeks.

    ```sh
    git gc
    ```
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Source:** https://git-scm.com/docs/git-gc (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/git-prune/ (Spanish: https://willor16.github.io/caniundo/es/c/git-prune/)

## git push origin --delete feature

**PARTLY** · Delete a branch on the server · id `git-push-delete`

- **Matches:** `git push`, with `-d` or `--delete`; or `git push`, with an argument like `:*`; or `git push`, with `--prune`
- **Lost:** The commits on that branch that you never downloaded.
- **Kept:** The commits that you have in this copy.
- **To undo:** The branch, from the last commit of it that you have. Look for it in git reflog or in your local branch.

    ```sh
    git push origin <commit>:refs/heads/<branch>
    ```
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-push-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/git-push-delete/)

## git push --force

**PARTLY** · Replace a branch on the server · id `git-push-force`

- **Matches:** `git push`, with `-f` or `--force`; or `git push`, with an argument like `+*`; or `git push`, with `--mirror`
- **Lost:** The commits on the server that you never downloaded, such as someone else's.
- **Kept:** The commits that you had downloaded.
- **Instead:** git push --force-with-lease refuses when the server has commits you have not seen.
- **To undo:** The branch as it was on the server the last time you downloaded it.

    ```sh
    git reflog show origin/<branch>
    git push --force-with-lease origin origin/<branch>@{1}:refs/heads/<branch>
    ```
  - Until: 30 days by default, in this copy. The 1 means one move ago.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Source:** https://git-scm.com/docs/git-gc (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/git-push-force/ (Spanish: https://willor16.github.io/caniundo/es/c/git-push-force/)

## git push --force-with-lease

**YES** · Replace a branch on the server, if nobody else changed it · id `git-push-lease`

- **Matches:** `git push`, with `--force-with-lease`, not with `-f`, `--force`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** The old commits leave the branch. You have them, because git checks that you had seen them.
- **To undo:** The branch as it was on the server.

    ```sh
    git push --force-with-lease origin origin/<branch>@{1}:refs/heads/<branch>
    ```
  - Until: 30 days by default, in this copy. The 1 means one move ago.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Source:** https://git-scm.com/docs/git-gc (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/git-push-lease/ (Spanish: https://willor16.github.io/caniundo/es/c/git-push-lease/)

## git rebase main

**YES** · Rewrite the commits of a branch · id `git-rebase`

- **Matches:** `git rebase`, not with `--abort`, `--continue`, `--skip`, `--quit`, `--edit-todo`, `--show-current-patch`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** Nothing. The old commits stay outside the branch.
- **To undo:** The branch as it was before the rebase.

    ```sh
    git reset --keep <branch>@{1}
    ```
  - Until: 30 days by default. The 1 means one move ago.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Source:** https://git-scm.com/docs/git-gc (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/git-rebase/ (Spanish: https://willor16.github.io/caniundo/es/c/git-rebase/)

## git reset --hard HEAD~1

**PARTLY** · Move a branch and discard changes · id `git-reset-hard`

- **Matches:** `git reset`, with `--hard`
- **Lost:** Changes that were never committed or staged, in every file git tracks.
- **Kept:** The commits. Git remembers where the branch was.
- **Before:** Put the changes away first.

    ```sh
    git stash push --include-untracked
    ```

  To go back:

    ```sh
    git stash pop
    ```
- **To undo:** The commits that the branch lost.

    ```sh
    git reset --keep ORIG_HEAD
    ```
  - Until: Works until another reset, merge or rebase. After that, the commit is still in git reflog, for 30 days by default.
- **To undo:** Files that were staged with git add. The first command leaves them in that folder with other names.

    ```sh
    git fsck --lost-found
    cp .git/lost-found/other/<hash> <file>
    ```
  - Until: Until git cleans up, 2 weeks by default.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Source:** https://git-scm.com/docs/git-gc (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/git-reset-hard/ (Spanish: https://willor16.github.io/caniundo/es/c/git-reset-hard/)

## git restore src/app.js

**NO** · Discard changes in files · id `git-restore`

- **Matches:** `git restore`, not with `-S`, `--staged`; or `git restore`, with `-W` or `--worktree`
- **Lost:** The changes in those files that were not staged or committed.
- **Instead:** Put them away instead of discarding them.

    ```sh
    git stash push -- <file>
    ```

  To go back:

    ```sh
    git stash pop
    ```
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-restore/ (Spanish: https://willor16.github.io/caniundo/es/c/git-restore/)

## git rm -f old.txt

**PARTLY** · Delete a file even if it has changes · id `git-rm-force`

- **Matches:** `git rm`, with `-f` or `--force`, not with `--cached`, `-n`, `--dry-run`
- **Lost:** The changes in the file that were not committed.
- **Kept:** The file as it was in the last commit.
- **Instead:** Without -f, git refuses when something would be lost.
- **To undo:** The file, as in the last commit.

    ```sh
    git restore --staged --worktree -- <file>
    ```
  - Careful: Replaces a new file with the same name.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-rm-force/ (Spanish: https://willor16.github.io/caniundo/es/c/git-rm-force/)

## git rm old.txt

**YES** · Delete a file and stage its deletion · id `git-rm`

- **Matches:** `git rm`, not with `-f`, `--force`, `--cached`, `-n`, `--dry-run`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** Nothing. Git refuses when the file has changes that were not committed.
- **To undo:** The file, as in the last commit.

    ```sh
    git restore --staged --worktree -- <file>
    ```
  - Careful: Replaces a new file with the same name.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-rm/ (Spanish: https://willor16.github.io/caniundo/es/c/git-rm/)

## git stash clear

**YES** · Delete every stash · id `git-stash-clear`

- **Matches:** `git stash clear`
- **Lost:** The list of stashes. Git keeps them for a while, but without names or order.
- **To undo:** Each stash, one at a time. They are commits in the first list, and their message usually starts with "WIP on".

    ```sh
    git fsck --unreachable --no-reflogs
    git stash store <hash>
    ```
  - Until: Until git cleans up, 2 weeks by default.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Source:** https://git-scm.com/docs/git-gc (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/git-stash-clear/ (Spanish: https://willor16.github.io/caniundo/es/c/git-stash-clear/)

## git stash drop

**YES** · Delete a stash · id `git-stash-drop`

- **Matches:** `git stash drop`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** The stash leaves the list, but git keeps it for a while.
- **To undo:** The stash. Git prints its hash when it drops it. Otherwise, it is one of the commits in the first list, and its message usually starts with "WIP on".

    ```sh
    git fsck --unreachable --no-reflogs
    git stash apply <hash>
    ```
  - Until: Until git cleans up, 2 weeks by default.
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Source:** https://git-scm.com/docs/git-gc (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/git-stash-drop/ (Spanish: https://willor16.github.io/caniundo/es/c/git-stash-drop/)

## git tag -d v1.0

**YES** · Delete a tag · id `git-tag-delete`

- **Matches:** `git tag`, with `-d` or `--delete`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** The name. The commit stays, and so does the text of an annotated tag.
- **To undo:** An annotated tag, with its message. Git prints the hash when it deletes it, and the first command also lists it.

    ```sh
    git fsck --no-reflogs
    git tag <name> <hash>
    ```
  - Until: Until git cleans up, 2 weeks by default.
- **To undo:** A simple tag, which is only a name for a commit.

    ```sh
    git tag <name> <commit>
    ```
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Source:** https://git-scm.com/docs/git-gc (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/git-tag-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/git-tag-delete/)

## git restore --staged src/app.js

**PARTLY** · Take files out of the next commit · id `git-unstage`

- **Matches:** `git restore`, with `-S` or `--staged`, not with `-W`, `--worktree`; or `git reset`, not with `--hard`, `--soft`, `--keep`, `--merge`, with paths after `--`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** The staged version, if you edited the file after staging it.
- **Kept:** The file in your folder.
- **To undo:** The file in the next commit, as it is now.

    ```sh
    git add <file>
    ```
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-unstage/ (Spanish: https://willor16.github.io/caniundo/es/c/git-unstage/)

## git worktree remove ../feature

**PARTLY** · Delete a worktree · id `git-worktree-remove`

- **Matches:** `git worktree remove`
- **Lost:** The ignored files in it, such as .env, without any warning. With --force, also the changes that were not committed.
- **Kept:** The branch and its commits.
- **To undo:** The folder, with what was committed.

    ```sh
    git worktree add <folder> <branch>
    ```
- **Evidence:** Tested: git 2.56.1, macOS, 2026-11-26; git 2.56.1, Linux, 2026-11-26; git 2.56.1.windows.1, Windows, 2026-11-26
- **Page:** https://willor16.github.io/caniundo/c/git-worktree-remove/ (Spanish: https://willor16.github.io/caniundo/es/c/git-worktree-remove/)
