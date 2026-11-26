# Files, Linux and Windows

Generated from `entries/` in https://github.com/willor16/caniundo. Do not edit by hand.

- `cp new.txt old.txt`: NO
- `dd if=image.iso of=/dev/sdb`: NO
- `find . -name "*.log" -delete`: NO
- `mv draft.txt final.txt`: PARTLY
- `echo hello > notes.txt`: NO
- `rm -rf dist`: PARTLY
- `rm -rf .git`: NO
- `rm -rf __pycache__`: YES
- `rm -rf /tmp/build-1234`: NO
- `rm -rf folder`: NO
- `rsync -a --delete source/ backup/`: NO
- `sed -i "s/old/new/g" config.txt`: NO
- `shred -u secret.txt`: NO
- `truncate -s 0 app.log`: NO
- `rm -rf node_modules`: YES
- `crontab -r`: PARTLY
- `mkfs.ext4 /dev/sdb1`: NO
- `Clear-Content app.log`: NO
- `Clear-RecycleBin -Force`: NO
- `cmd /c "rd /s /q folder"`: NO
- `Remove-Item -Recurse folder`: NO
- `Set-Content notes.txt hello`: NO

## cp new.txt old.txt

**NO** · Copy over a file · id `cp`

- **Matches:** `cp`, not with `-n`, `--no-clobber`, `-i`, `--interactive`, `-b`, `--backup`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** What the destination had, if it already existed.
- **Instead:** cp -n never replaces a file.
- **Before:** Keep a copy of the destination.

    ```sh
    cp <file> <copy>
    ```

  To go back:

    ```sh
    cp <copy> <file>
    ```
- **Evidence:** Tested: GNU coreutils 8.32, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/cp/ (Spanish: https://willor16.github.io/caniundo/es/c/cp/)

## dd if=image.iso of=/dev/sdb

**NO** · Write over a file or a disk · id `dd`

- **Matches:** `dd`, with an argument like `of=*`, unless an argument is like `of=/dev/null`, `of=/dev/stdout`
- **Lost:** What was there. With a disk, every partition on it.
- **Before:** Check the name of the destination twice, and keep a copy of a file.

    ```sh
    cp <file> <copy>
    ```

  To go back:

    ```sh
    cp <copy> <file>
    ```
- **Evidence:** Tested: GNU coreutils 8.32, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/dd/ (Spanish: https://willor16.github.io/caniundo/es/c/dd/)

## find . -name "*.log" -delete

**NO** · Delete everything a search finds · id `find-delete`

- **Matches:** `find`, with `-delete`
- **Lost:** The files it finds. They do not go to the trash.
- **Instead:** Look at the list first: the same search with -print.

    ```sh
    find . -name <pattern> -print
    ```
- **Evidence:** Tested: GNU coreutils 8.32, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/find-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/find-delete/)

## mv draft.txt final.txt

**PARTLY** · Move or rename a file · id `mv`

- **Matches:** `mv`, not with `-n`, `--no-clobber`, `-i`, `--interactive`, `-b`, `--backup`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** The file that was already there with the new name, if there was one.
- **Kept:** The file that you moved.
- **Instead:** mv -n never replaces a file.
- **To undo:** The old name.

    ```sh
    mv <new> <old>
    ```
- **Evidence:** Tested: GNU coreutils 8.32, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/mv/ (Spanish: https://willor16.github.io/caniundo/es/c/mv/)

## echo hello > notes.txt

**NO** · Write over a file with > · id `redirect`

- **Matches:** `>` into a file (not `>>`, and not into /dev/null)
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** What the file had, if it already existed, even when the command fails.
- **Instead:** >> adds to the end and deletes nothing.
- **Before:** Keep a copy.

    ```sh
    cp <file> <copy>
    ```

  To go back:

    ```sh
    cp <copy> <file>
    ```
- **Evidence:** Tested: GNU coreutils 8.32, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/redirect/ (Spanish: https://willor16.github.io/caniundo/es/c/redirect/)

## rm -rf dist

**PARTLY** · Delete the result of a build · id `rm-build-output`

- **Matches:** `rm`, when every argument is like `dist`, `*/dist`, `dist/*`, `build`, `*/build`, `build/*`, `out`, `*/out`, `out/*`, `target`…, unless an argument is like `/*`, `~*`, `*..*`, `*:*`; or `rimraf`, when every argument is like `dist`, `*/dist`, `dist/*`, `build`, `*/build`, `build/*`, `out`, `*/out`, `out/*`, `target`…, unless an argument is like `/*`, `~*`, `*..*`, `*:*`; or `del-cli`, when every argument is like `dist`, `*/dist`, `dist/*`, `build`, `*/build`, `build/*`, `out`, `*/out`, `out/*`, `target`…, unless an argument is like `/*`, `~*`, `*..*`, `*:*`; or `remove-item`, when every argument is like `dist`, `*/dist`, `dist/*`, `build`, `*/build`, `build/*`, `out`, `*/out`, `out/*`, `target`…, unless an argument is like `/*`, `~*`, `*..*`, `*:*`
- **More specific than:** `rm -rf folder`, `Remove-Item -Recurse folder`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** Anything in there that was put by hand.
- **Kept:** What the build makes.
- **To undo:** The result of the build. Use the command of your project.

    ```sh
    npm run build
    ```
- **Evidence:** Tested: npm 11.6.2, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/rm-build-output/ (Spanish: https://willor16.github.io/caniundo/es/c/rm-build-output/)

## rm -rf .git

**NO** · Delete a git repository · id `rm-git`

- **Matches:** `rm`, with an argument like `.git`, `*/.git`; or `remove-item`, with an argument like `.git`, `*/.git`
- **More specific than:** `rm -rf folder`, `Remove-Item -Recurse folder`
- **Lost:** The whole history, the branches and the stashes that were not on a server.
- **Instead:** Move it out of the way.

    ```sh
    mv .git <elsewhere>
    ```

  To go back:

    ```sh
    mv <elsewhere> .git
    ```
- **Evidence:** Tested: git 2.45.2.windows.1, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/rm-git/ (Spanish: https://willor16.github.io/caniundo/es/c/rm-git/)

## rm -rf __pycache__

**YES** · Delete Python's compiled files · id `rm-pycache`

- **Matches:** `rm`, when every argument is like `__pycache__`, `*/__pycache__`, `*.pyc`, `.pytest_cache`, `*/.pytest_cache`, `.mypy_cache`, `*/.mypy_cache`, `.ruff_cache`, `*/.ruff_cache`
- **More specific than:** `rm -rf folder`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** Nothing. Python writes them again.
- **To undo:** They come back on their own the next time the program runs.
- **Evidence:** Documented, not tested
- **Source:** https://docs.python.org/3/tutorial/modules.html#compiled-python-files (checked 2026-11-25)
- **Source:** https://docs.pytest.org/en/stable/how-to/cache.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/rm-pycache/ (Spanish: https://willor16.github.io/caniundo/es/c/rm-pycache/)

## rm -rf /tmp/build-1234

**NO** · Delete temporary files · id `rm-temporary`

- **Matches:** `rm`, when every argument is like `/tmp/*`, `/var/tmp/*`, `*/AppData/Local/Temp/*`, unless an argument is like `*..*`
- **More specific than:** `rm -rf folder`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** The temporary files.
- **Evidence:** Tested: GNU coreutils 8.32, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/rm-temporary/ (Spanish: https://willor16.github.io/caniundo/es/c/rm-temporary/)

## rm -rf folder

**NO** · Delete files · id `rm`

- **Matches:** `rm`; or `unlink`
- **Lost:** The files. They do not go to the trash.
- **Instead:** Move it somewhere else, and delete it when you are sure. In a git repository, what was committed comes back with git restore.

    ```sh
    mv <path> <elsewhere>
    ```

  To go back:

    ```sh
    mv <elsewhere> <path>
    ```
- **Evidence:** Tested: GNU coreutils 8.32, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/rm/ (Spanish: https://willor16.github.io/caniundo/es/c/rm/)

## rsync -a --delete source/ backup/

**NO** · Copy a folder and delete what is extra · id `rsync-delete`

- **Matches:** `rsync`, with `--delete` or `--del` or `--delete-before` or `--delete-during` or `--delete-delay` or `--delete-after` or `--delete-excluded`, not with `-n`, `--dry-run`, `--backup-dir`
- **Lost:** The files in the destination that are not in the source, and the old version of the ones that changed.
- **Before:** Add --dry-run to see the list, or --backup --backup-dir to keep what it would delete.
- **Evidence:** Documented, not tested
- **Source:** https://download.samba.org/pub/rsync/rsync.1 (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/rsync-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/rsync-delete/)

## sed -i "s/old/new/g" config.txt

**NO** · Edit files in place · id `sed-in-place`

- **Matches:** `sed`, with `-i` or `--in-place`, not with `-i.bak`, `-i.orig`, `-i.old`, `-i~`, `--in-place=.bak`, `--in-place=.orig`; or `gsed`, with `-i` or `--in-place`, not with `-i.bak`, `-i.orig`, `-i.old`, `-i~`, `--in-place=.bak`, `--in-place=.orig`; or `perl`, with `-i`, not with `-i.bak`, `-i.orig`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** The text that was replaced. Running the opposite also changes what was already like that.
- **Instead:** Ask sed to keep a copy.

    ```sh
    sed -i.bak <change> <file>
    ```

  To go back:

    ```sh
    mv <file>.bak <file>
    ```
- **Evidence:** Tested: GNU coreutils 8.32, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/sed-in-place/ (Spanish: https://willor16.github.io/caniundo/es/c/sed-in-place/)

## shred -u secret.txt

**NO** · Destroy a file on purpose · id `shred`

- **Matches:** `shred`; or `gshred`; or `srm`
- **Lost:** The file. It is overwritten so that nobody can recover it.
- **Evidence:** Tested: GNU coreutils 8.32, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/shred/ (Spanish: https://willor16.github.io/caniundo/es/c/shred/)

## truncate -s 0 app.log

**NO** · Empty a file · id `truncate`

- **Matches:** `truncate`; or `gtruncate`
- **Lost:** What the file had.
- **Before:** Keep a copy.

    ```sh
    cp <file> <copy>
    ```

  To go back:

    ```sh
    cp <copy> <file>
    ```
- **Evidence:** Tested: GNU coreutils 8.32, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/truncate/ (Spanish: https://willor16.github.io/caniundo/es/c/truncate/)

## rm -rf node_modules

**YES** · Delete installed packages · id `rm-node-modules`

- **Matches:** `rm`, when every argument is like `node_modules`, `*/node_modules`, `node_modules/*`, `*/node_modules/*`; or `rimraf`, when every argument is like `node_modules`, `*/node_modules`; or `remove-item`, when every argument is like `node_modules`, `*/node_modules`, `node_modules/*`, `*/node_modules/*`
- **More specific than:** `rm -rf folder`, `Remove-Item -Recurse folder`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** Only changes made by hand inside that folder.
- **To undo:** The packages, with the same versions, if the project has a package-lock.json.

    ```sh
    npm ci
    ```
- **Evidence:** Tested: npm 11.6.2, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/rm-node-modules/ (Spanish: https://willor16.github.io/caniundo/es/c/rm-node-modules/)

## crontab -r

**PARTLY** · Delete all your scheduled tasks · id `crontab-remove`

- **Matches:** `crontab`, with `-r`, not with `-i`
- **Lost:** All of them, with no question. Some systems keep no copy.
- **Kept:** With cronie, the last version is saved in ~/.cache/crontab/crontab.bak.
- **Before:** Save the output of crontab -l.
- **To undo:** The tasks, on systems with cronie.

    ```sh
    crontab <backup-file>
    ```
- **Evidence:** Documented, not tested
- **Source:** https://man7.org/linux/man-pages/man1/crontab.1.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/crontab-remove/ (Spanish: https://willor16.github.io/caniundo/es/c/crontab-remove/)

## mkfs.ext4 /dev/sdb1

**NO** · Format a disk · id `mkfs`

- **Matches:** `mkfs`, not with `-n`; or `mke2fs`, not with `-n`; or `mkfs.ext2`, not with `-n`; or `mkfs.ext3`, not with `-n`; or `mkfs.ext4`, not with `-n`; or `mkfs.xfs`, not with `-n`; or `mkfs.btrfs`, not with `-n`; or `mkfs.fat`, not with `-n`; or `mkfs.vfat`, not with `-n`; or `mkfs.ntfs`, not with `-n`; or `mkfs.exfat`, not with `-n`; or `mkswap`, not with `-n`; or `wipefs`, with `-a` or `--all`
- **Lost:** The files on that disk. The new file system replaces the old one.
- **Before:** Check the device with lsblk. mke2fs -n shows what it would do.
- **Evidence:** Documented, not tested
- **Source:** https://man7.org/linux/man-pages/man8/mke2fs.8.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/mkfs/ (Spanish: https://willor16.github.io/caniundo/es/c/mkfs/)

## Clear-Content app.log

**NO** · Empty a file in PowerShell · id `clear-content`

- **Matches:** `clear-content`, not with `-WhatIf`
- **Lost:** What the file had.
- **Before:** Keep a copy.

    ```sh
    Copy-Item <file> <copy>
    ```

  To go back:

    ```sh
    Copy-Item <copy> <file>
    ```
- **Evidence:** Tested: PowerShell 5.1.26100.9818, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/clear-content/ (Spanish: https://willor16.github.io/caniundo/es/c/clear-content/)

## Clear-RecycleBin -Force

**NO** · Empty the Recycle Bin · id `clear-recyclebin`

- **Matches:** `clear-recyclebin`, not with `-WhatIf`
- **Lost:** Everything in the Recycle Bin.
- **Evidence:** Documented, not tested
- **Source:** https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/clear-recyclebin (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/clear-recyclebin/ (Spanish: https://willor16.github.io/caniundo/es/c/clear-recyclebin/)

## cmd /c "rd /s /q folder"

**NO** · Delete files in the Windows command prompt · id `cmd-delete`

- **Matches:** `rd`, with `/s` or `/S`; or `rmdir`, with `/s` or `/S`; or `del`; or `erase`
- **Lost:** The files. They do not go to the Recycle Bin.
- **Evidence:** Tested: PowerShell 5.1.26100.9818, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/cmd-delete/ (Spanish: https://willor16.github.io/caniundo/es/c/cmd-delete/)

## Remove-Item -Recurse folder

**NO** · Delete files in PowerShell · id `remove-item`

- **Matches:** `remove-item`, not with `-WhatIf`
- **Lost:** The files. They do not go to the Recycle Bin.
- **Instead:** Move it somewhere else, and delete it when you are sure.

    ```sh
    Move-Item <path> <elsewhere>
    ```

  To go back:

    ```sh
    Move-Item <elsewhere> <path>
    ```
- **Evidence:** Tested: PowerShell 5.1.26100.9818, Windows, 2026-11-25
- **Source:** https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/remove-item (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/remove-item/ (Spanish: https://willor16.github.io/caniundo/es/c/remove-item/)

## Set-Content notes.txt hello

**NO** · Write over a file in PowerShell · id `set-content`

- **Matches:** `set-content`, not with `-WhatIf`; or `out-file`, not with `-WhatIf`, `-Append`, `-NoClobber`
- **Everyday command:** mention it only when asked, or when it matters.
- **Lost:** What the file had, if it already existed.
- **Before:** Keep a copy. Add-Content adds to the end and deletes nothing.

    ```sh
    Copy-Item <file> <copy>
    ```

  To go back:

    ```sh
    Copy-Item <copy> <file>
    ```
- **Evidence:** Tested: PowerShell 5.1.26100.9818, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/set-content/ (Spanish: https://willor16.github.io/caniundo/es/c/set-content/)
